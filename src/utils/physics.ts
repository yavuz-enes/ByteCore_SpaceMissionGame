import {
  MissionState,
  TelemetryMetrics,
} from '../types/mission';
import {
  MISSION_SCENARIOS,
  LAUNCH_VEHICLES,
  SPACECRAFT_BUSES,
  PROPULSION_SYSTEMS,
  POWER_SYSTEMS,
  BATTERY_SYSTEMS,
  SCIENTIFIC_INSTRUMENTS,
  ANTENNA_SYSTEMS,
  GROUND_STATIONS,
  ORBIT_PROFILES,
} from '../data/missions';
import { Locale } from '../i18n/translations';

export function calculateMissionTelemetry(state: MissionState, locale: Locale = 'en'): TelemetryMetrics {
  const scenario = MISSION_SCENARIOS.find((s) => s.id === state.scenarioId) || MISSION_SCENARIOS[0];
  const vehicle = LAUNCH_VEHICLES.find((v) => v.id === state.launchVehicleId) || LAUNCH_VEHICLES[1];
  const bus = SPACECRAFT_BUSES.find((b) => b.id === state.busId) || SPACECRAFT_BUSES[1];
  const prop = PROPULSION_SYSTEMS.find((p) => p.id === state.propulsionId) || PROPULSION_SYSTEMS[1];
  const power = POWER_SYSTEMS.find((p) => p.id === state.powerId) || POWER_SYSTEMS[1];
  const batt = BATTERY_SYSTEMS.find((b) => b.id === state.batteryId) || BATTERY_SYSTEMS[0];
  const ant = ANTENNA_SYSTEMS.find((a) => a.id === state.antennaId) || ANTENNA_SYSTEMS[1];
  const ground = GROUND_STATIONS.find((g) => g.id === state.groundStationId) || GROUND_STATIONS[0];
  const orbit = ORBIT_PROFILES.find((o) => o.id === state.orbitId) || ORBIT_PROFILES[0];

  const selectedInstruments = SCIENTIFIC_INSTRUMENTS.filter((i) =>
    state.selectedInstrumentIds.includes(i.id)
  );

  // 1. Mass calculation
  const instrumentsMass = selectedInstruments.reduce((sum, inst) => sum + inst.massKg, 0);
  const dryMassKg = bus.dryMassKg + prop.dryMassKg + power.massKg + batt.massKg + ant.massKg + instrumentsMass;
  const totalMassKg = dryMassKg + prop.fuelMassKg;

  // 2. Cost calculation
  const instrumentsCost = selectedInstruments.reduce((sum, inst) => sum + inst.costM, 0);
  const totalCostM =
    vehicle.costM +
    bus.costM +
    prop.costM +
    power.costM +
    batt.costM +
    ant.costM +
    ground.costM +
    instrumentsCost;

  const remainingBudgetM = scenario.initialBudget - totalCostM;
  const budgetValid = remainingBudgetM >= 0;

  // 3. Power calculation
  let generatedPowerW = 0;
  if (power.worksInDeepSpace) {
    generatedPowerW = power.basePowerW; // RTG is constant
  } else {
    // Solar drops with distance squared and sunlight fraction
    const distanceFactor = Math.min(1.2, scenario.solarIntensity);
    const sunFraction = orbit.sunlightExposurePercent / 100;
    generatedPowerW = power.basePowerW * distanceFactor * sunFraction;
  }

  const baseAvionicsPowerW = 35;
  const instrumentsPowerW = selectedInstruments.reduce((sum, inst) => sum + inst.powerDrawW, 0);
  const totalPowerConsumptionW = baseAvionicsPowerW + ant.powerDrawW + instrumentsPowerW;
  const netPowerW = Math.round(generatedPowerW - totalPowerConsumptionW);
  const powerPositive = netPowerW >= 0;

  // 4. Delta-V (Tsiolkovsky Rocket Equation)
  const g0 = 9.80665;
  const massRatio = (dryMassKg + prop.fuelMassKg) / Math.max(1, dryMassKg);
  const spacecraftDeltaV = prop.ispSeconds * g0 * Math.log(massRatio);
  const availableDeltaVMps = Math.round(spacecraftDeltaV + vehicle.maxDeltaVBonus);

  const requiredDeltaV = orbit.deltaVRequiredMps;
  const deltaVSufficient = availableDeltaVMps >= requiredDeltaV;
  const deltaVMarginPercent = Math.round(((availableDeltaVMps - requiredDeltaV) / requiredDeltaV) * 100);

  // 5. Communications throughput
  const distAU = Math.max(0.001, scenario.commDistanceAU);
  const distanceAttenuation = distAU < 0.1 ? 1.0 : 1 / Math.pow(distAU, 1.8);
  const effectiveDownlinkKbps = Math.round(
    ant.maxThroughputKbps * distanceAttenuation * (ground.coveragePercent / 100)
  );

  const totalDataRateDemandedKbps = selectedInstruments.reduce((sum, inst) => sum + inst.dataRateKbps, 0);

  // 6. Science return
  const rawSciencePoints = selectedInstruments.reduce((sum, inst) => sum + inst.scienceValue, 0);
  const sciencePoints = Math.round(rawSciencePoints * orbit.observationResolutionMultiplier);

  // 7. Payload Mass Compatibility
  const payloadOnlyKg = instrumentsMass;
  const launchCompatibility = totalMassKg <= vehicle.maxPayloadKg && payloadOnlyKg <= bus.maxPayloadCapacityKg;

  // 8. Radiation Shielding
  const radiationReqMap: Record<string, number> = {
    Low: 1,
    Moderate: 2,
    Severe: 3,
    Extreme: 5,
  };
  const reqShielding = radiationReqMap[scenario.radiationLevel] || 1;
  const radiationSafe = bus.radiationShieldingRating >= reqShielding;

  // 9. Validation Errors & Warnings
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  const isTr = locale === 'tr';

  if (totalMassKg > vehicle.maxPayloadKg) {
    validationErrors.push(
      isTr
        ? `Kütle sınırı aşıldı: ${totalMassKg.toLocaleString()} / ${vehicle.maxPayloadKg.toLocaleString()} kg`
        : `Mass limit exceeded: ${totalMassKg.toLocaleString()} / ${vehicle.maxPayloadKg.toLocaleString()} kg`
    );
  }

  if (payloadOnlyKg > bus.maxPayloadCapacityKg) {
    validationErrors.push(
      isTr
        ? `Gövde kapasitesi aşıldı: ${payloadOnlyKg} / ${bus.maxPayloadCapacityKg} kg`
        : `Bus capacity exceeded: ${payloadOnlyKg} / ${bus.maxPayloadCapacityKg} kg`
    );
  }

  if (!budgetValid) {
    validationErrors.push(
      isTr
        ? `Bütçe aşıldı: -$${Math.abs(remainingBudgetM).toFixed(1)}M`
        : `Budget deficit: -$${Math.abs(remainingBudgetM).toFixed(1)}M`
    );
  }

  if (!deltaVSufficient) {
    validationErrors.push(
      isTr
        ? `Yetersiz Delta-V (${availableDeltaVMps.toLocaleString()} / ${requiredDeltaV.toLocaleString()} m/s)`
        : `Insufficient Delta-V (${availableDeltaVMps.toLocaleString()} / ${requiredDeltaV.toLocaleString()} m/s)`
    );
  }

  if (!powerPositive) {
    validationErrors.push(
      isTr
        ? `Güç açığı: -${Math.abs(netPowerW)}W`
        : `Power deficit: -${Math.abs(netPowerW)}W`
    );
  }

  if (!radiationSafe) {
    validationWarnings.push(
      isTr
        ? `Yetersiz radyasyon kalkanı (${bus.radiationShieldingRating}/5 < ${reqShielding}/5)`
        : `Insufficient radiation shield (${bus.radiationShieldingRating}/5 < ${reqShielding}/5)`
    );
  }

  if (effectiveDownlinkKbps < totalDataRateDemandedKbps * 0.4) {
    validationWarnings.push(
      isTr
        ? `İletişim darboğazı (${effectiveDownlinkKbps} / ${totalDataRateDemandedKbps} kbps)`
        : `Comms bottleneck (${effectiveDownlinkKbps} / ${totalDataRateDemandedKbps} kbps)`
    );
  }

  if (selectedInstruments.length === 0) {
    validationWarnings.push(
      isTr
        ? 'Bilimsel aygıt takılmadı (0 puan)'
        : 'No scientific payload installed (0 pts)'
    );
  }

  // 10. Success Rate Calculation (0 - 100%)
  let successRate = vehicle.reliability;

  if (validationErrors.length > 0) {
    successRate = Math.max(5, successRate - validationErrors.length * 28);
  } else {
    if (deltaVMarginPercent > 15) successRate += 2;
    if (netPowerW > 100) successRate += 2;
    if (!radiationSafe) successRate -= 20;
    if (effectiveDownlinkKbps < totalDataRateDemandedKbps) successRate -= 8;
  }

  const overallSuccessRate = Math.min(99, Math.max(0, Math.round(successRate)));

  return {
    totalMassKg,
    totalCostM: Number(totalCostM.toFixed(1)),
    remainingBudgetM: Number(remainingBudgetM.toFixed(1)),
    netPowerW,
    availableDeltaVMps,
    deltaVMarginPercent,
    dataThroughputKbps: effectiveDownlinkKbps,
    sciencePoints,
    launchCompatibility,
    powerPositive,
    deltaVSufficient,
    budgetValid,
    radiationSafe,
    overallSuccessRate,
    validationErrors,
    validationWarnings,
  };
}
