import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { MISSION_SCENARIOS, LAUNCH_VEHICLES, ORBIT_PROFILES } from '../../data/missions';
import { TRANSLATIONS } from '../../i18n/translations';

export const TelemetryBar: React.FC = () => {
  const { missionState, telemetry, locale } = useMissionStore();
  const t = TRANSLATIONS[locale].telemetry;
  const isTr = locale === 'tr';

  const scenario = MISSION_SCENARIOS.find((s) => s.id === missionState.scenarioId) || MISSION_SCENARIOS[0];
  const vehicle = LAUNCH_VEHICLES.find((v) => v.id === missionState.launchVehicleId) || LAUNCH_VEHICLES[1];
  const orbit = ORBIT_PROFILES.find((o) => o.id === missionState.orbitId) || ORBIT_PROFILES[0];

  return (
    <div className="relative z-10 w-full max-w-full overflow-x-clip bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/10 font-mono text-xs">
      <div className="max-w-[1360px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {/* Metric 1: Budget */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-between space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[10px] tracking-wider uppercase truncate">
            <span>{isTr ? 'BÜTÇE' : 'BUDGET'}</span>
            <span className="text-slate-500">${scenario.initialBudget}M</span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tabular-nums tracking-tight truncate">
              ${telemetry.remainingBudgetM}M
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-[2px] overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.remainingBudgetM >= 0 ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, (telemetry.totalCostM / scenario.initialBudget) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 2: Spacecraft Mass */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-between space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[10px] tracking-wider uppercase truncate">
            <span>{isTr ? 'KÜTLE' : 'MASS'}</span>
            <span className="text-slate-500">{vehicle.maxPayloadKg.toLocaleString()}kg</span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tabular-nums tracking-tight truncate">
              {telemetry.totalMassKg.toLocaleString()} kg
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-[2px] overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.launchCompatibility ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(100, (telemetry.totalMassKg / vehicle.maxPayloadKg) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 3: Net Power */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-between space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[10px] tracking-wider uppercase truncate">
            <span>{isTr ? 'GÜÇ' : 'POWER'}</span>
            <span className="text-slate-500">{orbit.sunlightExposurePercent}% {isTr ? 'GÜNEŞ' : 'SUN'}</span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tabular-nums tracking-tight truncate">
              {telemetry.netPowerW > 0 ? `+${telemetry.netPowerW}` : telemetry.netPowerW} W
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-[2px] overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.powerPositive ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, telemetry.netPowerW + 50))}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Delta-V */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-between space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[10px] tracking-wider uppercase truncate">
            <span>DELTA-V</span>
            <span className="text-slate-500">{orbit.deltaVRequiredMps.toLocaleString()}m/s</span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tabular-nums tracking-tight truncate">
              {telemetry.availableDeltaVMps.toLocaleString()} m/s
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-[2px] overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.deltaVSufficient ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(100, (telemetry.availableDeltaVMps / orbit.deltaVRequiredMps) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 5: Science Points */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-between space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[10px] tracking-wider uppercase truncate">
            <span>{isTr ? 'BİLİM' : 'SCIENCE'}</span>
            <span className="text-slate-500">{scenario.minScienceThreshold} {isTr ? 'PUAN' : 'PTS'}</span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tabular-nums tracking-tight truncate">
              {telemetry.sciencePoints} {isTr ? 'PUAN' : 'PTS'}
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-[2px] overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.sciencePoints >= scenario.minScienceThreshold ? 'bg-emerald-400' : 'bg-sky-400'
              }`}
              style={{
                width: `${Math.min(100, (telemetry.sciencePoints / scenario.minScienceThreshold) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 6: Success Probability */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 flex flex-col justify-between space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400 text-[9px] sm:text-[10px] tracking-wider uppercase truncate">
            <span>{isTr ? 'BAŞARI' : 'SUCCESS'}</span>
            <span className="text-slate-500">
              {telemetry.overallSuccessRate >= 80 ? (isTr ? 'YÜKSEK' : 'HIGH') : (isTr ? 'KRİTİK' : 'RISK')}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tabular-nums tracking-tight truncate">
              {telemetry.overallSuccessRate}%
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-[2px] overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                telemetry.overallSuccessRate >= 80
                  ? 'bg-emerald-400'
                  : telemetry.overallSuccessRate >= 60
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${telemetry.overallSuccessRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
