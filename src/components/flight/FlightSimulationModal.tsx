import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Flame,
  ArrowRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import {
  getLocalizedScenarios,
  getLocalizedLaunchVehicles,
  getLocalizedOrbitProfiles,
} from '../../i18n/missionsLocale';
import { TRANSLATIONS } from '../../i18n/translations';
import { FlightStage } from '../../types/mission';
import { DsnFrequencyMiniGame } from '../minigames/DsnFrequencyMiniGame';
import { PowerGridMiniGame } from '../minigames/PowerGridMiniGame';
import { SpectrometerLockMiniGame } from '../minigames/SpectrometerLockMiniGame';
import { GimbalTrimMiniGame } from '../minigames/GimbalTrimMiniGame';

const getAnomalyArtwork = (anomalyId: string, anomalyType: string): string => {
  const key = `${anomalyId} ${anomalyType}`.toLowerCase();
  if (key.includes('solar') || key.includes('cosmic') || key.includes('radiation') || key.includes('flare')) {
    return '/flight-kit/anomaly-solar-flare.webp';
  }
  if (key.includes('thruster') || key.includes('wheel') || key.includes('gimbal') || key.includes('vector')) {
    return '/flight-kit/anomaly-thruster-failure.webp';
  }
  if (key.includes('leak') || key.includes('cryo') || key.includes('tank') || key.includes('eclipse') || key.includes('thermal')) {
    return '/flight-kit/anomaly-cryo-leak.webp';
  }
  if (key.includes('dsn') || key.includes('blackout') || key.includes('comm') || key.includes('radio') || key.includes('carrier')) {
    return '/flight-kit/anomaly-dsn-blackout.webp';
  }
  if (key.includes('meteor') || key.includes('debris') || key.includes('star-tracker') || key.includes('impact')) {
    return '/flight-kit/anomaly-micrometeoroid.webp';
  }
  return '/flight-kit/anomaly-solar-flare.webp';
};

interface FlightSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlightSimulationModal: React.FC<FlightSimulationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    flightStage,
    countdownSeconds,
    setFlightStage,
    startCountdown,
    resetToDesign,
    missionState,
    telemetry,
    simAltitudeKm,
    simVelocityMps,
    simDownlinkPercent,
    simScienceCollected,
    updateSimTelemetry,
    locale,
    burnExecution,
    executeInsertionBurn,
    activeAnomaly,
    anomalyCountdown,
    anomalyVotes,
    triggerAnomaly,
    voteAnomalyChoice,
    tallyAndResolveAnomaly,
    resolveAnomaly,
    environmentalTests,
    isMultiplayer,
    isHost,
    players,
    myPlayerInfo,
    triggerAsymmetricAnomaly,
  } = useMissionStore();

  const isTr = locale === 'tr';
  const t = TRANSLATIONS[locale].simulation;
  const scenarios = getLocalizedScenarios(locale);
  const vehicles = getLocalizedLaunchVehicles(locale);
  const orbits = getLocalizedOrbitProfiles(locale);

  const currentScenario = scenarios.find((s) => s.id === missionState.scenarioId) || scenarios[0];
  const currentVehicle = vehicles.find((v) => v.id === missionState.launchVehicleId) || vehicles[1];
  const currentOrbit = orbits.find((o) => o.id === missionState.orbitId) || orbits[0];

  const [ticker, setTicker] = useState(10);
  const [cursorPos, setCursorPos] = useState(50);
  const [anomalyTimer, setAnomalyTimer] = useState(15);
  const hasTriggeredAnomalyRef = useRef(false);

  const isCommander = !isMultiplayer || myPlayerInfo.role === 'commander' || myPlayerInfo.secondaryRole === 'commander';

  // Role-tailored active mini-game selector
  const defaultMiniGame = !isMultiplayer
    ? flightStage === 'science-pass'
      ? 'spectrometer'
      : flightStage === 'orbital-burn' || flightStage === 'stage-sep'
      ? 'gimbal'
      : flightStage === 'transfer-cruise'
      ? 'power'
      : 'dsn'
    : myPlayerInfo.role === 'comms'
    ? 'dsn'
    : myPlayerInfo.role === 'engineer'
    ? 'power'
    : myPlayerInfo.role === 'scientist'
    ? 'spectrometer'
    : 'gimbal';

  const [activeMiniGame, setActiveMiniGame] = useState<'dsn' | 'power' | 'spectrometer' | 'gimbal'>(defaultMiniGame);

  useEffect(() => {
    setActiveMiniGame(defaultMiniGame);
  }, [defaultMiniGame]);

  // 1. Terminal Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (flightStage === 'countdown') {
      timer = setInterval(() => {
        setTicker((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (telemetry.validationErrors.length > 0 && !telemetry.launchCompatibility) {
              setFlightStage('mission-failed');
            } else {
              setFlightStage('liftoff');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTicker(10);
    }

    return () => clearInterval(timer);
  }, [flightStage, telemetry.validationErrors.length, telemetry.launchCompatibility, setFlightStage]);

  // 2. Automated Ascents & Stage Transitions
  useEffect(() => {
    let stageTimer: NodeJS.Timeout;

    if (flightStage === 'liftoff') {
      stageTimer = setTimeout(() => {
        updateSimTelemetry(45, 1800, 5, 0);
        setFlightStage('max-q');
      }, 3500);
    } else if (flightStage === 'max-q') {
      stageTimer = setTimeout(() => {
        updateSimTelemetry(110, 4200, 10, 0);
        setFlightStage('stage-sep');
      }, 3500);
    } else if (flightStage === 'stage-sep') {
      stageTimer = setTimeout(() => {
        if (!telemetry.deltaVSufficient) {
          setFlightStage('mission-failed');
        } else {
          updateSimTelemetry(Math.round(currentOrbit.altitudeKm * 0.45), 6400, 15, 0);
          setFlightStage('transfer-cruise');
        }
      }, 3500);
    } else if (flightStage === 'solar-deploy') {
      stageTimer = setTimeout(() => {
        updateSimTelemetry(0, 0, 30, Math.round(telemetry.sciencePoints * 0.5));
        setFlightStage('science-pass');
      }, 3500);
    } else if (flightStage === 'science-pass') {
      stageTimer = setTimeout(() => {
        updateSimTelemetry(0, 0, 40, Math.round(telemetry.sciencePoints * 0.5));
        setFlightStage('mission-complete');
        try {
          confetti({
            particleCount: 130,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#38BDF8', '#818CF8', '#10B981', '#ffffff'],
          });
        } catch (e) {}
      }, 4000);
    }

    return () => clearTimeout(stageTimer);
  }, [flightStage, telemetry.deltaVSufficient, currentOrbit.altitudeKm, telemetry.sciencePoints, updateSimTelemetry, setFlightStage]);

  // 3. Module 2: Trigger Anomaly during Transfer Cruise (Randomized pseudo-interval)
  useEffect(() => {
    if (flightStage === 'transfer-cruise' && !hasTriggeredAnomalyRef.current) {
      if (isMultiplayer && !isHost) return;

      const randomDelay = Math.floor(Math.random() * 2200) + 1000;
      const triggerTimeout = setTimeout(() => {
        if (!activeAnomaly) {
          triggerAnomaly();
          hasTriggeredAnomalyRef.current = true;
        }
      }, randomDelay);

      return () => clearTimeout(triggerTimeout);
    }
  }, [flightStage, activeAnomaly, triggerAnomaly, isMultiplayer, isHost]);

  // Anomaly 15-second Urgency Countdown with Consensus Tally
  useEffect(() => {
    if (!activeAnomaly) {
      setAnomalyTimer(15);
      return;
    }

    setAnomalyTimer(activeAnomaly.urgencySeconds || 15);
    const interval = setInterval(() => {
      setAnomalyTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (activeAnomaly) {
            tallyAndResolveAnomaly();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAnomaly, tallyAndResolveAnomaly]);

  // 4. Module 1: Insertion Burn Cursor Oscillation Loop
  useEffect(() => {
    if (flightStage !== 'orbital-burn' || burnExecution) return;

    let frameId: number;
    const cycleDuration = 2400;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) % cycleDuration;
      const progress = elapsed / cycleDuration;
      const pos = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setCursorPos(Math.round(pos * 100));
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [flightStage, burnExecution]);

  if (!isOpen) return null;

  const handleLaunchClick = () => {
    setTicker(10);
    hasTriggeredAnomalyRef.current = false;
    startCountdown();
  };

  const handleReset = () => {
    resetToDesign();
    setTicker(10);
    hasTriggeredAnomalyRef.current = false;
  };

  const handleExecuteBurn = () => {
    if (!isCommander || burnExecution) return;
    executeInsertionBurn(cursorPos);
  };

  const handleProceedToBurn = () => {
    updateSimTelemetry(Math.round(currentOrbit.altitudeKm * 0.4), 1200, 10, 0);
    setFlightStage('orbital-burn');
  };

  const handleProceedToSolarDeploy = () => {
    const achievedAlt = burnExecution?.achievedAltitudeKm || currentOrbit.altitudeKm;
    updateSimTelemetry(Math.max(0, achievedAlt - simAltitudeKm), 200, 20, 10);
    setFlightStage('solar-deploy');
  };

  const budgetScore = Math.max(
    0,
    Math.min(100, Math.round((telemetry.remainingBudgetM / currentScenario.initialBudget) * 100))
  );
  const scienceScore = Math.min(
    100,
    Math.round((telemetry.sciencePoints / currentScenario.minScienceThreshold) * 100)
  );
  const overallGrade =
    scienceScore >= 100 && budgetScore >= 20
      ? t.grades.excellence
      : scienceScore >= 90
      ? t.grades.nominal
      : scienceScore >= 70
      ? t.grades.qualified
      : t.grades.marginal;

  // Stepper Stage Items
  const stageSteps: { id: FlightStage; label: string }[] = [
    { id: 'liftoff', label: t.steppers.liftoff },
    { id: 'max-q', label: t.steppers.maxQ },
    { id: 'stage-sep', label: t.steppers.stageSep },
    { id: 'transfer-cruise', label: t.steppers.transferCruise },
    { id: 'orbital-burn', label: t.steppers.orbitalBurn },
    { id: 'solar-deploy', label: t.steppers.solarDeploy },
    { id: 'science-pass', label: t.steppers.sciencePass },
  ];

  const currentStageIndex = stageSteps.findIndex((s) => s.id === flightStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0E1422] border border-white/10 rounded-2xl overflow-hidden w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header HUD */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B0F17]">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              {t.flightTele}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.reset}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {flightStage === 'design' ? (
            /* Pre-Launch Verification Deck */
            <div className="space-y-6">
              <div className="border border-slate-800 rounded-2xl overflow-hidden p-6 text-center space-y-5 bg-[#0B0F17]">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {t.lockedTitle}
                  </h3>
                  <p className="text-slate-400 text-xs max-w-lg mx-auto mt-1 leading-relaxed font-mono">
                    {t.lockedDesc}
                  </p>
                </div>

                {/* Validation Warnings / Nominal Banner */}
                {telemetry.validationErrors.length > 0 ? (
                  <div className="border border-amber-500/30 rounded-2xl overflow-hidden p-4 text-left max-w-xl mx-auto space-y-2 bg-[#0E1422]">
                    <div className="text-amber-400 font-mono text-xs font-semibold uppercase">
                      {telemetry.validationErrors.length} {t.warningsDetected}:
                    </div>
                    <ul className="text-xs font-mono text-slate-300 list-disc list-inside space-y-1">
                      {telemetry.validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="border border-emerald-500/30 rounded-2xl overflow-hidden p-4 text-left max-w-xl mx-auto bg-[#0E1422]">
                    <div className="text-xs font-mono">
                      <div className="text-emerald-400 font-semibold uppercase">{t.allSystemsNominal}</div>
                      <div className="text-slate-300 mt-1 leading-relaxed">
                        {t.allSystemsNominalDesc}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-Flight Environmental Test Lab Verification */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 max-w-xl mx-auto text-left bg-[#0E1422] space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-mono tracking-wider text-white font-semibold uppercase">
                      {t.environmentalStatus}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">NASA-STD-7001B</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    {/* Vibration Shake Table */}
                    <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">{t.vibrationTest}</span>
                        <span className="text-slate-500 text-xs">Akustik Rezonans & Kütle Yükü</span>
                      </div>
                      <div>
                        {environmentalTests.vibrationTested ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                              environmentalTests.vibrationPassed
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                            }`}
                          >
                            {environmentalTests.vibrationPassed ? `${t.testPassed} (${environmentalTests.vibrationScore}%)` : `${t.testFailed} (${environmentalTests.vibrationScore}%)`}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] text-slate-400 border border-slate-700">
                            {t.testPending}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TVAC Chamber */}
                    <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">{t.tvacTest}</span>
                        <span className="text-slate-500 text-xs">Isıl Döngü (-115°C / +128°C)</span>
                      </div>
                      <div>
                        {environmentalTests.tvacTested ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                              environmentalTests.tvacPassed
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                            }`}
                          >
                            {environmentalTests.tvacPassed ? `${t.testPassed} (${environmentalTests.tvacScore}%)` : `${t.testFailed} (${environmentalTests.tvacScore}%)`}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] text-slate-400 border border-slate-700">
                            {t.testPending}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Launch CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleLaunchClick}
                    className="px-8 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs tracking-wider shadow-sm mx-auto transition-all cursor-pointer font-mono"
                  >
                    {t.startCountdown}
                  </button>
                </div>
              </div>
            </div>
          ) : flightStage === 'countdown' ? (
            /* Countdown Phase */
            <div className="text-center py-12 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                {t.countdownSub}
              </span>
              <div className="font-mono text-7xl md:text-8xl font-black text-white tabular-nums">
                T-{ticker}
              </div>
            </div>
          ) : flightStage === 'mission-complete' ? (
            /* Mission Complete & Debrief Report */
            <div className="space-y-6">
              <div className="border border-emerald-500/30 rounded-2xl overflow-hidden p-6 text-center space-y-4 bg-[#0B0F17]">
                <div className="w-20 h-20 mx-auto">
                  <img
                    src="/flight-kit/seal-nasa-flight-ready.png"
                    alt="Flight Ready Qualification Seal"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_14px_rgba(16,185,129,0.4)]"
                  />
                </div>
                <h3 className="font-display font-bold text-xl text-white">
                  {t.successTitle}
                </h3>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-3">
                  <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs bg-[#0E1422]">
                    <span className="text-slate-400 block">{t.rating}</span>
                    <strong className="text-emerald-400 text-sm font-bold mt-1 block">
                      {overallGrade}
                    </strong>
                  </div>
                  <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs bg-[#0E1422]">
                    <span className="text-slate-400 block">{t.harvest}</span>
                    <strong className="text-white text-sm font-bold tabular-nums mt-1 block">
                      {telemetry.sciencePoints} {t.pts}
                    </strong>
                  </div>
                  <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs bg-[#0E1422]">
                    <span className="text-slate-400 block">{t.margin}</span>
                    <strong className="text-white text-sm font-bold tabular-nums mt-1 block">
                      ${telemetry.remainingBudgetM}M
                    </strong>
                  </div>
                  <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs bg-[#0E1422]">
                    <span className="text-slate-400 block">{t.deltaVSurplus}</span>
                    <strong className="text-emerald-400 text-sm font-bold tabular-nums mt-1 block">
                      +{telemetry.deltaVMarginPercent}%
                    </strong>
                  </div>
                </div>

                {/* Post-flight Telemetry Debrief */}
                <div className="mt-4 border border-slate-800 rounded-2xl overflow-hidden p-4 text-left font-mono text-xs space-y-2 max-w-2xl mx-auto bg-[#0E1422]">
                  <div className="text-emerald-400 font-semibold uppercase">
                    {t.debriefSummary}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 tabular-nums text-center">
                    <div className="p-2 border border-slate-800 rounded-xl bg-[#0B0F17]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'ROKET' : 'VEHICLE'}</span>
                      <strong className="text-white">{currentVehicle.name}</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-xl bg-[#0B0F17]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'TOPLAM KÜTLE' : 'WET MASS'}</span>
                      <strong className="text-white">{telemetry.totalMassKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-xl bg-[#0B0F17]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'ATEŞLEME' : 'BURN RATING'}</span>
                      <strong className="text-emerald-400">{burnExecution ? burnExecution.rating.toUpperCase() : 'NOMINAL'}</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-xl bg-[#0B0F17]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'BİLİM HASADI' : 'SCIENCE'}</span>
                      <strong className="text-sky-300">{telemetry.sciencePoints} PTS</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer font-mono shadow-sm"
                  >
                    {t.designAnother}
                  </button>
                </div>
              </div>
            </div>
          ) : flightStage === 'mission-failed' ? (
            /* Mission Failed / Aborted */
            <div className="space-y-6">
              <div className="border border-rose-500/30 rounded-2xl overflow-hidden p-6 text-center space-y-4 bg-[#0B0F17]">
                <h3 className="font-display font-bold text-xl text-white">
                  {t.failTitle}
                </h3>
                <p className="text-slate-400 text-xs max-w-xl mx-auto leading-relaxed font-mono">
                  {t.failDesc}
                </p>

                <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 text-left font-mono text-xs space-y-2 max-w-xl mx-auto bg-[#0E1422]">
                  <div className="text-white font-semibold uppercase">{t.analysisReport}:</div>
                  <ul className="text-slate-300 list-disc list-inside space-y-1">
                    {telemetry.validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {telemetry.validationErrors.length === 0 && (
                      <li>
                        {isTr
                          ? 'Yörünge ateşlemesi stabil yörüngeye girmeden önce itki yakıtını tüketti veya hiperbolik kaçış vektörüne girdi.'
                          : 'Trajectory burn depleted propulsion fuel or drifted into a hyperbolic escape flyby trajectory.'}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer font-mono shadow-sm"
                  >
                    {t.returnArchitect}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active In-Flight Telemetry Dashboard */
            <div className="space-y-6">
              {/* Flight Stages Stepper Bar */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0B0F17]">
                <div className="flex items-center justify-between text-xs font-mono overflow-x-auto pb-1 gap-2">
                  {stageSteps.map((st, i) => {
                    const isActive = flightStage === st.id;
                    const isDone = currentStageIndex > i;

                    return (
                      <div
                        key={st.id}
                        className={`flex items-center space-x-1.5 whitespace-nowrap px-3 py-1 rounded-full ${
                          isActive
                            ? 'bg-white text-slate-950 font-semibold shadow-sm'
                            : isDone
                            ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10'
                            : 'text-slate-400 border border-slate-800'
                        }`}
                      >
                        <span>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Telemetry Readouts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-slate-800 rounded-2xl overflow-hidden p-3.5 font-mono text-xs bg-[#0B0F17]">
                  <span className="text-slate-400 block uppercase text-[10px]">{t.altitude}</span>
                  <strong className="text-white text-lg font-bold mt-1 block tabular-nums">
                    {simAltitudeKm.toLocaleString()} km
                  </strong>
                  <span className="text-slate-500 text-[10px]">{t.targetLabel}: {currentOrbit.altitudeKm} km</span>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden p-3.5 font-mono text-xs bg-[#0B0F17]">
                  <span className="text-slate-400 block uppercase text-[10px]">{t.velocity}</span>
                  <strong className="text-white text-lg font-bold mt-1 block tabular-nums">
                    {simVelocityMps.toLocaleString()} m/s
                  </strong>
                  <span className="text-slate-500 text-[10px]">MACH {(simVelocityMps / 343).toFixed(1)}</span>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden p-3.5 font-mono text-xs bg-[#0B0F17]">
                  <span className="text-slate-400 block uppercase text-[10px]">{t.downlinkBuffer}</span>
                  <strong className="text-white text-lg font-bold mt-1 block tabular-nums">
                    {simDownlinkPercent}%
                  </strong>
                  <span className="text-emerald-400 text-[10px] font-medium">{t.dsnLock}</span>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden p-3.5 font-mono text-xs bg-[#0B0F17]">
                  <span className="text-slate-400 block uppercase text-[10px]">{t.scienceCollected}</span>
                  <strong className="text-sky-300 text-lg font-bold mt-1 block tabular-nums">
                    {Math.round(simScienceCollected)} {t.pts}
                  </strong>
                  <span className="text-slate-500 text-[10px]">{t.goal}: {currentScenario.minScienceThreshold} {t.pts}</span>
                </div>
              </div>

              {/* In-Flight Anomaly Crisis Alert Modal / Card with Consensus Voting */}
              {activeAnomaly && (
                <div className="border border-rose-500/40 bg-[#0B0F17] rounded-2xl overflow-hidden p-5 shadow-lg relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                        {t.anomalyAlertTitle}
                      </span>
                      {isMultiplayer && (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                            {isTr ? 'MÜRETTEBAT OYLAMASI' : 'CREW CONSENSUS VOTE'}
                          </span>
                          <button
                            onClick={triggerAsymmetricAnomaly}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span>{isTr ? 'Şifre Failsafe' : 'Asymmetric Failsafe'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="text-slate-400">{t.anomalyUrgency}:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold tabular-nums">
                        {anomalyTimer}s
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-full md:w-44 h-24 rounded-xl overflow-hidden border border-rose-500/30 shrink-0 bg-[#080C14]">
                      <img
                        src={getAnomalyArtwork(activeAnomaly.id, activeAnomaly.type)}
                        alt={activeAnomaly.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-display font-bold text-base text-white">
                        {activeAnomaly.title}
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-mono">
                        {activeAnomaly.description}
                      </p>
                    </div>
                  </div>

                  {/* Remediation Engineering Choices with Live Voting */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {activeAnomaly.choices.map((choice) => {
                      const votesForChoice = Object.entries(anomalyVotes).filter(([_, cId]) => cId === choice.id);
                      const myVote = anomalyVotes[myPlayerInfo.peerId] === choice.id;

                      return (
                        <button
                          key={choice.id}
                          onClick={() => voteAnomalyChoice(choice.id)}
                          className={`text-left p-3.5 border rounded-2xl overflow-hidden transition-all group flex flex-col justify-between cursor-pointer ${
                            myVote
                              ? 'border-sky-400 bg-[#111827] shadow-sm'
                              : 'border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between font-mono text-xs">
                              <span className="text-white font-semibold group-hover:text-sky-300 transition-colors">
                                {choice.label}
                              </span>
                              <div className="flex items-center space-x-1.5">
                                {isMultiplayer && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 tabular-nums">
                                    {votesForChoice.length} {isTr ? 'OY' : 'VOTE'}
                                  </span>
                                )}
                                {myVote && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500 text-white font-semibold">
                                    {isTr ? 'SEÇİMİNİZ' : 'YOUR VOTE'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-mono">
                              {choice.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                            <div className="flex flex-wrap gap-1.5">
                              {choice.deltaVCostMps > 0 && (
                                <span className="px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                                  -{choice.deltaVCostMps} m/s Δv
                                </span>
                              )}
                              {choice.scienceDelta !== 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    choice.scienceDelta > 0
                                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold'
                                      : 'border border-rose-500/30 text-rose-300'
                                  }`}
                                >
                                  {choice.scienceDelta > 0 ? '+' : ''}{choice.scienceDelta} {t.pts}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full border border-slate-800 text-slate-400">
                                {choice.effectDescription}
                              </span>
                            </div>

                            {/* Crew vote pills */}
                            {isMultiplayer && votesForChoice.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {votesForChoice.map(([voterPeerId]) => {
                                  const voter = players.find((p) => p.peerId === voterPeerId);
                                  const roleCode = (voter?.role || 'crewed').substring(0, 3).toUpperCase();
                                  return (
                                    <span
                                      key={voterPeerId}
                                      className="px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[9px] uppercase font-bold"
                                      title={voter?.name || voterPeerId}
                                    >
                                      {roleCode}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Orbital Timing Burn Mechanic */}
              {flightStage === 'orbital-burn' ? (
                <div className="border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4 bg-[#0B0F17]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        {t.insertionBurnTitle}
                      </h4>
                      <p className="text-slate-400 text-xs max-w-lg mt-0.5 font-mono">
                        {t.insertionBurnDesc}
                      </p>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      THRUSTERS: <strong className="text-emerald-400 font-semibold">HOT STANDBY</strong>
                    </div>
                  </div>

                  {/* Timing Burn Track Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>{isTr ? 'ERKEN (-%50)' : 'EARLY (-50%)'}</span>
                      <span className="text-emerald-400 font-semibold">{t.targetWindowNotice}</span>
                      <span>{isTr ? 'GEÇ (+%50)' : 'LATE (+50%)'}</span>
                    </div>

                    <div className="relative w-full h-8 bg-[#080C14] border border-slate-700/80 rounded-full overflow-hidden flex items-center">
                      {/* Sub-nominal Early Zone */}
                      <div className="absolute left-0 top-0 bottom-0 w-[41%] border-r border-slate-800" />

                      {/* Optimal Nominal Target Window (41% - 59%) */}
                      <div className="absolute left-[41%] right-[41%] top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/50 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                          NOMINAL
                        </span>
                      </div>

                      {/* Late Overshoot Zone */}
                      <div className="absolute right-0 top-0 bottom-0 w-[41%] border-l border-slate-800" />

                      {/* Moving Needle / Cursor */}
                      <div
                        className="absolute top-0 bottom-0 w-2.5 bg-white shadow-md transition-transform pointer-events-none rounded-full flex items-center justify-center"
                        style={{
                          left: `${cursorPos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <div className="w-0.5 h-4 bg-slate-900 rounded-full" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono pt-1 text-slate-400">
                      <span>
                        {isTr ? 'Zamanlama Kayması' : 'Timing Offset'}:{' '}
                        <strong className="text-white tabular-nums">
                          {cursorPos - 50 > 0 ? `+${cursorPos - 50}%` : `${cursorPos - 50}%`}
                        </strong>
                      </span>
                      <span>
                        {Math.abs(cursorPos - 50) <= 9 ? (
                          <span className="text-emerald-400 font-semibold uppercase">{isTr ? 'NOMİNAL ARALIKTA' : 'NOMINAL WINDOW'}</span>
                        ) : (
                          <span className="text-slate-400 uppercase">{isTr ? 'ARALIK DIŞI' : 'OFF NOMINAL'}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Burn Execution Result Banner */}
                  {burnExecution ? (
                    <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-slate-400">{isTr ? 'ATEŞLEME SONUCU' : 'BURN RESULT'}:</span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            burnExecution.rating === 'perfect' || burnExecution.rating === 'nominal'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : 'border border-slate-700 text-slate-300'
                          }`}
                        >
                          {burnExecution.rating.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-slate-300 text-xs font-mono leading-relaxed">
                        {burnExecution.message}
                      </p>

                      <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-slate-400 text-[10px] block">{isTr ? 'DELTA-V KAYBI' : 'DELTA-V PENALTY'}</span>
                          <strong className="text-white tabular-nums">-{burnExecution.deltaVPenaltyMps} m/s</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">{isTr ? 'ULAŞILAN İRTİFA' : 'ACHIEVED ALTITUDE'}</span>
                          <strong className="text-white tabular-nums">{burnExecution.achievedAltitudeKm} km</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">{isTr ? 'KALAN İTKİ' : 'PROPELLANT RESERVE'}</span>
                          <strong className="text-emerald-400 tabular-nums">{burnExecution.fuelRemainingPercent}%</strong>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleProceedToSolarDeploy}
                          className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all flex items-center space-x-1.5 cursor-pointer font-mono shadow-sm"
                        >
                          <span>{t.proceedToDeploy}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Burn Trigger Action Button */
                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs font-mono text-slate-400">
                        {isCommander
                          ? isTr
                            ? 'Uçuş Komutanı: Hedef yeşil pencereye ulaştığında butona basın.'
                            : 'Flight Commander: Execute ignition burn when needle hits target window.'
                          : t.awaitingCommanderBurn}
                      </div>

                      <button
                        onClick={handleExecuteBurn}
                        disabled={!isCommander}
                        className={`px-6 py-2.5 rounded-full font-semibold text-xs font-mono tracking-wider transition-all flex items-center justify-center space-x-2 ${
                          isCommander
                            ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-sm cursor-pointer'
                            : 'border border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Flame className="w-4 h-4" />
                        <span>{t.executeBurnBtn}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : flightStage === 'transfer-cruise' ? (
                /* Transfer Cruise Phase - Raw Telemetry Status */
                <div className="border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 bg-[#0B0F17] text-center font-mono">
                  <div className="flex items-center justify-center text-xs border-b border-slate-800 pb-2">
                    <span className="text-white font-bold uppercase tracking-wider">
                      {isTr ? 'HOHMANN GEÇİŞ ROTASI' : 'HOHMANN TRANSFER CRUISE'}
                    </span>
                  </div>

                  <div className="w-20 h-20 mx-auto opacity-75">
                    <img
                      src="/flight-kit/hud-navball.png"
                      alt="Navball Flight Director"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.3)] animate-pulse"
                    />
                  </div>

                  {!activeAnomaly && (
                    <div className="pt-2">
                      <button
                        onClick={handleProceedToBurn}
                        className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all inline-flex items-center space-x-1.5 cursor-pointer font-mono shadow-sm"
                      >
                        <span>{t.proceedToBurn}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Launch & Staging Sequence - Raw Telemetry Status */
                <div className="border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-3 bg-[#0B0F17] text-center font-mono">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-white font-bold uppercase tracking-wider">
                      {isTr
                        ? ({
                            liftoff: 'KADEME 1: HAVALANMA',
                            'max-q': 'AZAMİ BASINÇ (MAX-Q)',
                            'stage-sep': 'KADEME AYRILMASI',
                            'solar-deploy': 'GÜNEŞ PANELİ AÇILIMI',
                            'science-pass': 'BİLİM VERİSİ GEÇİŞİ',
                          } as Record<string, string>)[flightStage] || flightStage.replace('-', ' ').toUpperCase()
                        : ({
                            liftoff: 'STAGE 1: LIFTOFF',
                            'max-q': 'MAX-Q: PEAK DYNAMIC PRESSURE',
                            'stage-sep': 'STAGE SEPARATION',
                            'solar-deploy': 'SOLAR ARRAY DEPLOYMENT',
                            'science-pass': 'SCIENCE PAYLOAD PASS',
                          } as Record<string, string>)[flightStage] || flightStage.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-emerald-400 font-semibold text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      ACTIVE BURN
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 tabular-nums">
                    <div className="p-2 border border-slate-800/80 rounded-xl bg-[#0E1422]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'İRTİFA' : 'ALTITUDE'}</span>
                      <strong className="text-white">{simAltitudeKm.toLocaleString()} km</strong>
                    </div>
                    <div className="p-2 border border-slate-800/80 rounded-xl bg-[#0E1422]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'HIZ' : 'VELOCITY'}</span>
                      <strong className="text-white">{simVelocityMps.toLocaleString()} m/s</strong>
                    </div>
                    <div className="p-2 border border-slate-800/80 rounded-xl bg-[#0E1422]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'DELTA-V' : 'DELTA-V'}</span>
                      <strong className="text-sky-300">{telemetry.availableDeltaVMps.toLocaleString()} m/s</strong>
                    </div>
                    <div className="p-2 border border-slate-800/80 rounded-xl bg-[#0E1422]">
                      <span className="text-slate-400 text-[10px] block">{isTr ? 'DURUM' : 'STATUS'}</span>
                      <strong className="text-emerald-400">NOMINAL</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Station Interactive Mini-Game Deck */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                      {isTr ? 'İSTASYON ETKİLEŞİMLİ OPERASYONLARI' : 'INTERACTIVE STATION OPERATIONS'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      LIVE CONSOLE
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'gimbal', label: isTr ? 'Vektör Trimi' : 'Gimbal Trim', role: 'CMD' },
                      { id: 'power', label: isTr ? 'Güç Hattı' : 'Power Bus', role: 'ENG' },
                      { id: 'spectrometer', label: isTr ? 'Spektrometre' : 'Spectrometer', role: 'SCI' },
                      { id: 'dsn', label: isTr ? 'DSN Frekansı' : 'DSN Carrier', role: 'COM' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveMiniGame(tab.id as any)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                          activeMiniGame === tab.id
                            ? 'bg-white text-slate-950 shadow-sm'
                            : 'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="opacity-60 mr-1">[{tab.role}]</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {activeMiniGame === 'dsn' && <DsnFrequencyMiniGame />}
                {activeMiniGame === 'power' && <PowerGridMiniGame />}
                {activeMiniGame === 'spectrometer' && (
                  <SpectrometerLockMiniGame
                    onComplete={(bonus) => {
                      updateSimTelemetry(0, 0, 0, bonus);
                    }}
                  />
                )}
                {activeMiniGame === 'gimbal' && <GimbalTrimMiniGame />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
