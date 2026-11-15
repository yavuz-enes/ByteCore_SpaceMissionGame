import React, { useEffect, useState, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Flame,
  ArrowRight,
  ShieldAlert,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  Users,
  Radio,
  Zap,
  Shield,
  Sun,
  Satellite,
  Compass,
  Activity,
  Lock,
  Unlock,
  Check,
  ChevronRight,
  Gauge,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import {
  getLocalizedScenarios,
  getLocalizedLaunchVehicles,
  getLocalizedOrbitProfiles,
} from '../../i18n/missionsLocale';
import { TRANSLATIONS } from '../../i18n/translations';
import { FlightStage, MissionStationRole } from '../../types/mission';
import { multiplayerService } from '../../services/multiplayerService';

interface FlightSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getAnomalyArtwork = (anomalyId: string, anomalyType: string): string => {
  const id = (anomalyId || '').toLowerCase();
  const type = (anomalyType || '').toLowerCase();

  if (id.includes('solar-storm') || type.includes('geomagnetic')) {
    return './flight-kit/crisis-solar-storm.webp';
  }
  if (id.includes('reaction-wheel') || id.includes('attitude') || type.includes('reaction')) {
    return './flight-kit/crisis-reaction-wheel.webp';
  }
  if (id.includes('battery-thermal') || id.includes('freeze') || id.includes('eclipse') || id.includes('thermal')) {
    return './flight-kit/crisis-umbral-freeze.webp';
  }
  if (id.includes('array-jam') || id.includes('solar-array') || type.includes('deployment') || type.includes('actuator')) {
    return './flight-kit/crisis-array-jam.webp';
  }
  if (id.includes('thruster') || id.includes('cavitation') || type.includes('propulsion') || type.includes('overheat')) {
    return './flight-kit/crisis-thruster-overheat.webp';
  }
  if (id.includes('seu') || id.includes('bitflip') || type.includes('cosmic') || type.includes('radiation')) {
    return './flight-kit/crisis-cosmic-seu.webp';
  }
  if (id.includes('star-tracker') || type.includes('optical') || type.includes('sensor')) {
    return './flight-kit/crisis-startracker-blind.webp';
  }
  if (id.includes('dsn') || id.includes('carrier') || type.includes('telecom') || type.includes('loss-of-signal')) {
    return './flight-kit/anomaly-dsn-blackout.webp';
  }
  if (id.includes('micrometeoroid') || id.includes('debris') || type.includes('hull')) {
    return './flight-kit/anomaly-micrometeoroid.webp';
  }
  if (id.includes('harness') || id.includes('electrical') || type.includes('power')) {
    return './flight-kit/anomaly-cryo-leak.webp';
  }

  return './flight-kit/crisis-solar-storm.webp';
};

export const FlightSimulationModal: React.FC<FlightSimulationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    flightStage,
    setFlightStage,
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
    anomalyVotes,
    triggerAnomaly,
    voteAnomalyChoice,
    tallyAndResolveAnomaly,
    environmentalTests,
    isMultiplayer,
    isHost,
    players,
    myPlayerInfo,
  } = useMissionStore();

  const isTr = locale === 'tr';
  const t = TRANSLATIONS[locale].simulation;
  const scenarios = getLocalizedScenarios(locale);
  const vehicles = getLocalizedLaunchVehicles(locale);
  const orbits = getLocalizedOrbitProfiles(locale);

  const currentScenario = scenarios.find((s) => s.id === missionState.scenarioId) || scenarios[0];
  const currentVehicle = vehicles.find((v) => v.id === missionState.launchVehicleId) || vehicles[1];
  const currentOrbit = orbits.find((o) => o.id === missionState.orbitId) || orbits[0];

  // -------------------------------------------------------------------------
  // STEP 0: PRE-LAUNCH SYSTEMS GO / NO-GO STATE
  // -------------------------------------------------------------------------
  const [preLaunchConfirmed, setPreLaunchConfirmed] = useState(false);

  // -------------------------------------------------------------------------
  // IN-FLIGHT SYSTEM COLLAPSE / CRASH MONITOR STATE
  // -------------------------------------------------------------------------
  const [isCrashing, setIsCrashing] = useState(false);
  const [crashReason, setCrashReason] = useState<string>('');
  const hasTriggeredCrashRef = useRef(false);

  // -------------------------------------------------------------------------
  // TELEMETRY LIVE TICKER ACCUMULATORS
  // -------------------------------------------------------------------------
  const [liveAltM, setLiveAltM] = useState(0);
  const [liveVelMps, setLiveVelMps] = useState(0);
  const [liveQPressureKPa, setLiveQPressureKPa] = useState(0);
  const [liveGForce, setLiveGForce] = useState(1.0);
  const [liveFuelPercent, setLiveFuelPercent] = useState(100);

  // -------------------------------------------------------------------------
  // MINI-GAME 1: LIFT-OFF PITCH GIMBAL ALIGNMENT
  // Starts with initial deflection tilt so player must steer rocket upright
  const [pitchAngleDeg, setPitchAngleDeg] = useState(17.0);
  const pitchAngleDegRef = useRef(17.0);
  pitchAngleDegRef.current = pitchAngleDeg;
  const hasTriggeredLiftoffAdvanceRef = useRef(false);
  const [pitchHoldProgress, setPitchHoldProgress] = useState(0);
  const [pitchCountdown, setPitchCountdown] = useState<number | null>(null);

  // -------------------------------------------------------------------------
  // MINI-GAME 2: MAX-Q THROTTLE CONTROL
  // -------------------------------------------------------------------------
  const [throttlePercent, setThrottlePercent] = useState(100);
  const [maxQHoldSeconds, setMaxQHoldSeconds] = useState(0);
  const [maxQPassed, setMaxQPassed] = useState(false);

  // -------------------------------------------------------------------------
  // MINI-GAME 3: STAGE SEPARATION & INTERLOCKS
  // -------------------------------------------------------------------------
  const [stageLocksReleased, setStageLocksReleased] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);
  const [boosterJettisoned, setBoosterJettisoned] = useState(false);
  const [vacuumIgnited, setVacuumIgnited] = useState(false);

  // -------------------------------------------------------------------------
  // MINI-GAME 4: HOHMANN INJECTION BURN
  // -------------------------------------------------------------------------
  const [hohmannProgress, setHohmannProgress] = useState(25);
  const [hohmannLocked, setHohmannLocked] = useState(false);

  // -------------------------------------------------------------------------
  // MINI-GAME 5: ORBITAL CAPTURE BURN TIMING
  // -------------------------------------------------------------------------
  const [burnNeedlePos, setBurnNeedlePos] = useState(50);

  // -------------------------------------------------------------------------
  // MINI-GAME 6: SOLAR ARRAY DEPLOYMENT & SUN TRACKING
  // -------------------------------------------------------------------------
  const [solarPanelsUnfolded, setSolarPanelsUnfolded] = useState(false);
  const [sunTrackingAngle, setSunTrackingAngle] = useState(45);
  const [solarVoltageLocked, setSolarVoltageLocked] = useState(false);

  // -------------------------------------------------------------------------
  // MINI-GAME 7: SCIENCE TELEMETRY DOWNLINK
  // -------------------------------------------------------------------------
  const [dsnCarrierTuned, setDsnCarrierTuned] = useState(false);
  const [downlinkTransferPercent, setDownlinkTransferPercent] = useState(0);

  // -------------------------------------------------------------------------
  // ANOMALY TIMER
  // -------------------------------------------------------------------------
  const [anomalyTimer, setAnomalyTimer] = useState(15);
  const hasTriggeredAnomalyRef = useRef(false);

  // Resolve which operator owns the current stage
  const currentOperatorInfo = useMemo(() => {
    let requiredRole: MissionStationRole = 'commander';
    let roleLabel = isTr ? 'Uçuş Komutanı' : 'Flight Commander';
    let taskName = isTr ? 'İtki Gimbal Vektörü Dengeleme' : 'Thrust Gimbal Vectoring';

    if (flightStage === 'max-q') {
      requiredRole = 'engineer';
      roleLabel = isTr ? 'Baş Mühendis' : 'Chief Flight Engineer';
      taskName = isTr ? 'Max-Q İtki Kısma & Rezonans Sönümleme' : 'Max-Q Throttle & Resonance Damping';
    } else if (flightStage === 'stage-sep') {
      requiredRole = 'engineer';
      roleLabel = isTr ? 'Baş Mühendis' : 'Chief Flight Engineer';
      taskName = isTr ? 'Kademe Ayrılma & Piroteknik Kilitler' : 'Stage Separation & Interlocks';
    } else if (flightStage === 'transfer-cruise') {
      requiredRole = 'commander';
      roleLabel = isTr ? 'Uçuş Komutanı' : 'Flight Commander';
      taskName = isTr ? 'Hohmann Yörünge Geçiş Enjeksiyonu' : 'Hohmann Prograde Transfer Injection';
    } else if (flightStage === 'orbital-burn') {
      requiredRole = 'commander';
      roleLabel = isTr ? 'Uçuş Komutanı' : 'Flight Commander';
      taskName = isTr ? 'Yörünge Yakalama Ateşlemesi & RCS Dengesi' : 'Orbital Capture Burn & RCS Alignment';
    } else if (flightStage === 'solar-deploy') {
      requiredRole = 'scientist';
      roleLabel = isTr ? 'Bilim İnsanı & Yük Uzmanı' : 'Payload Scientist';
      taskName = isTr ? 'Güneş Paneli Açılımı & Fotovoltaik Kilit' : 'Solar Array Deployment & Sun Tracking';
    } else if (flightStage === 'science-pass') {
      requiredRole = 'comms';
      roleLabel = isTr ? 'Haberleşme Subayı' : 'Telecommunications Officer';
      taskName = isTr ? 'DSN Taşıyıcı Kilidi & Bilim Veri Aktarımı' : 'DSN Carrier Frequency Lock & Downlink';
    }

    let assignedPlayer = players.find((p) => p.role === requiredRole || p.secondaryRole === requiredRole);
    if (!assignedPlayer) {
      assignedPlayer = players.find((p) => p.role === 'commander') || players[0];
    }

    const isMe = !isMultiplayer || (assignedPlayer ? assignedPlayer.peerId === myPlayerInfo.peerId : true);
    const operatorName = assignedPlayer ? assignedPlayer.name : myPlayerInfo.name;

    return {
      role: requiredRole,
      roleLabel,
      taskName,
      operatorName,
      isMe,
    };
  }, [flightStage, isMultiplayer, players, myPlayerInfo, isTr]);

  // Reset mini-game states on stage transition
  useEffect(() => {
    if (flightStage === 'design') {
      setPreLaunchConfirmed(false);
      setIsCrashing(false);
      setCrashReason('');
      hasTriggeredCrashRef.current = false;
      setLiveAltM(0);
      setLiveVelMps(0);
      setLiveQPressureKPa(0);
      setLiveGForce(1.0);
      setLiveFuelPercent(100);
      setPitchAngleDeg(17.0);
      setPitchHoldProgress(0);
      setPitchCountdown(null);
      setMaxQHoldSeconds(0);
      setMaxQPassed(false);
      setStageLocksReleased([false, false, false, false]);
      setBoosterJettisoned(false);
      setVacuumIgnited(false);
      setHohmannProgress(25);
      setHohmannLocked(false);
      setSolarPanelsUnfolded(false);
      setSunTrackingAngle(45);
      setSolarVoltageLocked(false);
      setDsnCarrierTuned(false);
      setDownlinkTransferPercent(0);
    }
  }, [flightStage]);

  // -------------------------------------------------------------------------
  // CONTINUOUS SECOND-BY-SECOND FLIGHT TELEMETRY SIMULATOR
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (flightStage === 'design' || flightStage === 'countdown' || flightStage === 'mission-complete' || flightStage === 'mission-failed') {
      return;
    }

    const interval = setInterval(() => {
      setLiveAltM((prev) => {
        if (isCrashing) return Math.max(0, prev - 450);
        let delta = 40;
        if (flightStage === 'liftoff') delta = 180;
        else if (flightStage === 'max-q') delta = 850;
        else if (flightStage === 'stage-sep') delta = 2200;
        else if (flightStage === 'transfer-cruise') delta = 4500;
        else if (flightStage === 'orbital-burn') delta = 1200;
        else if (flightStage === 'solar-deploy' || flightStage === 'science-pass') delta = 50;
        return prev + delta;
      });

      setLiveVelMps((prev) => {
        if (isCrashing) return Math.max(0, prev - 140);
        let delta = 15;
        if (flightStage === 'liftoff') delta = 45;
        else if (flightStage === 'max-q') delta = 120;
        else if (flightStage === 'stage-sep') delta = 280;
        else if (flightStage === 'transfer-cruise') delta = 50;
        else if (flightStage === 'orbital-burn') delta = -40; // Braking capture burn
        return Math.max(0, Math.min(11200, prev + delta));
      });

      // Dynamic pressure curve (Peaks around 35-40 kPa at ~12-14 km altitude)
      setLiveQPressureKPa(() => {
        if (isCrashing) return 58.4 + Math.random() * 4.0;
        if (flightStage === 'liftoff') return Math.min(28, 12 + Math.random() * 4);
        if (flightStage === 'max-q') return 35.8 + Math.random() * 2.2;
        if (flightStage === 'stage-sep') return Math.max(2, 14 - Math.random() * 3);
        return 0.0;
      });

      // G-force
      setLiveGForce(() => {
        if (isCrashing) return 4.5 + Math.random() * 2.0;
        if (flightStage === 'liftoff') return 1.4 + Math.random() * 0.2;
        if (flightStage === 'max-q') return 2.8 + Math.random() * 0.4;
        if (flightStage === 'stage-sep') return 1.2 + Math.random() * 0.2;
        if (flightStage === 'orbital-burn') return 2.1 + Math.random() * 0.3;
        return 0.0; // Microgravity
      });

      // Fuel burn
      setLiveFuelPercent((prev) => {
        if (isCrashing) return Math.max(0, prev - 1.2);
        return Math.max(12, prev - 0.25);
      });
    }, 250);

    return () => clearInterval(interval);
  }, [flightStage, isCrashing]);

  // -------------------------------------------------------------------------
  // IN-FLIGHT DEFICIENCY CRASH TRIGGER (Catastrophic collapse if flaws exist)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (
      flightStage === 'design' ||
      flightStage === 'countdown' ||
      flightStage === 'mission-complete' ||
      flightStage === 'mission-failed'
    ) {
      return;
    }

    if (telemetry.validationErrors.length > 0 && !hasTriggeredCrashRef.current) {
      hasTriggeredCrashRef.current = true;

      // After 3.5 seconds of climbing, the flaw triggers emergency alarm & dive
      const timer = setTimeout(() => {
        setIsCrashing(true);

        const firstError = telemetry.validationErrors[0] || '';
        let detailedReason = firstError;

        if (firstError.includes('İletişim') || firstError.includes('Comms')) {
          detailedReason = isTr
            ? 'İletişim Darboğazı: Bilim yükünün ürettiği veri akışı yer istasyonu indirme kapasitesini aştı; telemetri ve rota kontrol sinyali koptu, roket rotadan çıkarak yere çakıldı.'
            : 'Comms Bottleneck: Scientific payload data stream exceeded ground downlink throughput; telemetry and guidance lock severed, vehicle deflected into catastrophic crash.';
        } else if (firstError.includes('Delta-V')) {
          detailedReason = isTr
            ? 'Yetersiz İtki (Delta-V): Roketin yakıt ve itki rezervi yörünge hızına ulaşmaya yetmedi; yerçekimine yenik düşerek balistik düşüşle atmosfere çakıldı.'
            : 'Insufficient Delta-V: Vehicle propellant reserve unable to achieve orbital insertion velocity; sub-orbital re-entry and impact.';
        } else if (firstError.includes('Güç') || firstError.includes('Power')) {
          detailedReason = isTr
            ? 'Güç Açığı & Avionik Kararması: Güneş panelleri ve bataryalar uçuş bilgisayarlarını besleyemedi; tüm avionikler karardı ve motor yönlendirmesi kilitlendi.'
            : 'Power Deficit: Solar arrays and batteries unable to power flight computers; avionics blackout resulted in total loss of control.';
        } else if (firstError.includes('Kütle') || firstError.includes('Mass')) {
          detailedReason = isTr
            ? 'Aşırı Yük / Kütle Aşımı: Roketin fırlatma ağırlığı yapısal sınırları aştığı için azami dinamik basınç altında gövde aerodinamik parçalanmaya uğradı.'
            : 'Mass Limit Exceeded: Spacecraft mass exceeded launch vehicle structural rating; aerodynamic breakup under dynamic load.';
        } else if (firstError.includes('Bütçe') || firstError.includes('Budget')) {
          detailedReason = isTr
            ? 'Bütçe Yetersizliği: Yetersiz kaynak nedeniyle alt sistem entegrasyonu tamamlanamadı ve kritik fırlatma aşamasında sensörler kilitlendi.'
            : 'Budget Deficit: Subsystems lacked complete qualification; guidance sensors locked during critical ascent.';
        }

        setCrashReason(detailedReason);

        // Crash dive sequence lasts 2.8 seconds, then transitions cleanly to mission-failed screen
        setTimeout(() => {
          setIsCrashing(false);
          setFlightStage('mission-failed');
        }, 2800);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [flightStage, telemetry.validationErrors, isTr, setFlightStage]);

  // -------------------------------------------------------------------------
  // MINI-GAME 1 LOGIC: PITCH GIMBAL ATTITUDE CORRIDOR
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (flightStage !== 'liftoff') {
      hasTriggeredLiftoffAdvanceRef.current = false;
      return;
    }

    // Wind drift perturbance
    const windInterval = setInterval(() => {
      setPitchAngleDeg((prev) => {
        const drift = (Math.random() - 0.5) * 4.0;
        return Math.max(-25, Math.min(25, Number((prev + drift).toFixed(1))));
      });
    }, 450);

    // Corridor hold timer (uses ref for zero cascading re-render overhead)
    const holdInterval = setInterval(() => {
      const currentAngle = pitchAngleDegRef.current;
      if (Math.abs(currentAngle) <= 5.5) {
        setPitchHoldProgress((p) => {
          if (p >= 100) return 100;
          return p + 6;
        });
      } else {
        setPitchHoldProgress((p) => Math.max(0, p - 3));
      }
    }, 200);

    return () => {
      clearInterval(windInterval);
      clearInterval(holdInterval);
    };
  }, [flightStage]);

  // Trigger countdown when pitch is fully aligned (once)
  useEffect(() => {
    if (flightStage === 'liftoff' && pitchHoldProgress >= 100 && !hasTriggeredLiftoffAdvanceRef.current && !isCrashing) {
      hasTriggeredLiftoffAdvanceRef.current = true;
      setPitchCountdown(3);
    }
  }, [flightStage, pitchHoldProgress, isCrashing]);

  // Clean decrement countdown timer and stage transition
  useEffect(() => {
    if (pitchCountdown === null || pitchCountdown <= 0) return;
    const timer = setTimeout(() => {
      if (pitchCountdown <= 1) {
        setPitchCountdown(null);
        setFlightStage('max-q');
      } else {
        setPitchCountdown((prev) => (prev !== null ? prev - 1 : null));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pitchCountdown, setFlightStage]);

  // Terminal Countdown Auto-Advance to Liftoff
  useEffect(() => {
    if (flightStage === 'countdown') {
      const timer = setTimeout(() => {
        const initialTilt = Math.random() > 0.5 ? 17.5 : -17.5;
        setPitchAngleDeg(initialTilt);
        setPitchHoldProgress(0);
        setPitchCountdown(null);
        setFlightStage('liftoff');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [flightStage, setFlightStage]);

  // -------------------------------------------------------------------------
  // MINI-GAME 2 LOGIC: MAX-Q THROTTLE
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (flightStage !== 'max-q') return;

    const timer = setInterval(() => {
      // Nominal throttle sector is between 60% and 75%
      if (throttlePercent >= 58 && throttlePercent <= 76) {
        setMaxQHoldSeconds((prev) => {
          if (prev >= 4) {
            setMaxQPassed(true);
            setTimeout(() => {
              setFlightStage('stage-sep');
            }, 1200);
            return 4;
          }
          return prev + 1;
        });
      } else {
        setMaxQHoldSeconds((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flightStage, throttlePercent, setFlightStage]);

  // -------------------------------------------------------------------------
  // MINI-GAME 4 LOGIC: HOHMANN ORBIT CURSOR OSCILLATION
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (flightStage !== 'transfer-cruise' || hohmannLocked) return;

    let frameId: number;
    let forward = true;

    const animate = () => {
      setHohmannProgress((prev) => {
        if (prev >= 85) forward = false;
        if (prev <= 15) forward = true;
        return forward ? prev + 0.6 : prev - 0.6;
      });
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [flightStage, hohmannLocked]);

  // Random Anomaly Trigger during Transfer Cruise
  useEffect(() => {
    if (flightStage === 'transfer-cruise' && !hasTriggeredAnomalyRef.current) {
      if (isMultiplayer && !isHost) return;

      const randomDelay = Math.floor(Math.random() * 2000) + 1500;
      const timeout = setTimeout(() => {
        if (!activeAnomaly) {
          triggerAnomaly();
          hasTriggeredAnomalyRef.current = true;
        }
      }, randomDelay);

      return () => clearTimeout(timeout);
    }
  }, [flightStage, activeAnomaly, triggerAnomaly, isMultiplayer, isHost]);

  // -------------------------------------------------------------------------
  // MINI-GAME 5 LOGIC: ORBITAL BURN CURSOR OSCILLATION
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (flightStage !== 'orbital-burn' || burnExecution) return;

    let frameId: number;
    const cycleDuration = 2200;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) % cycleDuration;
      const progress = elapsed / cycleDuration;
      const pos = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setBurnNeedlePos(Math.round(pos * 100));
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [flightStage, burnExecution]);

  // -------------------------------------------------------------------------
  // MINI-GAME 7 LOGIC: SCIENCE TELEMETRY DOWNLINK STREAM
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (flightStage !== 'science-pass' || !dsnCarrierTuned) return;

    const streamInterval = setInterval(() => {
      setDownlinkTransferPercent((prev) => {
        if (prev >= 100) {
          clearInterval(streamInterval);
          setTimeout(() => {
            setFlightStage('mission-complete');
            try {
              confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#38BDF8', '#818CF8', '#10B981', '#ffffff'],
              });
            } catch (e) {}
          }, 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 120);

    return () => clearInterval(streamInterval);
  }, [flightStage, dsnCarrierTuned, setFlightStage]);

  // Anomaly 45s Countdown & Multiplayer Fast-Forward
  useEffect(() => {
    if (!activeAnomaly) {
      setAnomalyTimer(45);
      return;
    }

    setAnomalyTimer(activeAnomaly.urgencySeconds || 45);
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

  // Fast-forward anomaly when all crew members have voted in multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && activeAnomaly) {
      const totalCrew = Math.max(1, players.length);
      if (Object.keys(anomalyVotes).length >= totalCrew) {
        tallyAndResolveAnomaly();
      }
    }
  }, [anomalyVotes, isMultiplayer, isHost, activeAnomaly, players.length, tallyAndResolveAnomaly]);

  if (!isOpen) return null;

  // Handlers
  const handleConfirmPreLaunch = () => {
    setPreLaunchConfirmed(true);
    hasTriggeredAnomalyRef.current = false;
    const initialTilt = Math.random() > 0.5 ? 17.5 : -17.5;
    setPitchAngleDeg(initialTilt);
    setPitchHoldProgress(0);
    setPitchCountdown(null);
    setFlightStage('liftoff');
  };

  const handleResetFlight = () => {
    resetToDesign();
    setPreLaunchConfirmed(false);
    setIsCrashing(false);
    setCrashReason('');
    hasTriggeredAnomalyRef.current = false;
    hasTriggeredCrashRef.current = false;
    setPitchAngleDeg(17.5);
    setPitchHoldProgress(0);
    setPitchCountdown(null);
  };

  const handleAdjustPitch = (deltaDeg: number) => {
    if (!currentOperatorInfo.isMe) return;
    setPitchAngleDeg((prev) => Math.max(-25, Math.min(25, Number((prev + deltaDeg).toFixed(1)))));
  };

  const handleMouseMovePitch = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentOperatorInfo.isMe) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const norm = (mouseX / rect.width) * 2 - 1; // -1 to +1
    setPitchAngleDeg(Number((norm * 22).toFixed(1)));
  };

  const handleTouchMovePitch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!currentOperatorInfo.isMe || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const norm = (touchX / rect.width) * 2 - 1; // -1 to +1
    setPitchAngleDeg(Number((Math.max(-1, Math.min(1, norm)) * 22).toFixed(1)));
  };

  const handleToggleLock = (idx: number) => {
    if (!currentOperatorInfo.isMe) return;
    setStageLocksReleased((prev) => {
      const next = [...prev] as [boolean, boolean, boolean, boolean];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleJettisonBooster = () => {
    if (!currentOperatorInfo.isMe) return;
    setBoosterJettisoned(true);
  };

  const handleIgniteVacuum = () => {
    if (!currentOperatorInfo.isMe) return;
    setVacuumIgnited(true);
    setTimeout(() => {
      setFlightStage('transfer-cruise');
    }, 1200);
  };

  const handleLockHohmann = () => {
    if (!currentOperatorInfo.isMe) return;
    setHohmannLocked(true);
    setTimeout(() => {
      setFlightStage('orbital-burn');
    }, 1200);
  };

  const handleExecuteBurnClick = () => {
    if (!currentOperatorInfo.isMe || burnExecution) return;
    executeInsertionBurn(burnNeedlePos);
  };

  const handleProceedFromBurn = () => {
    setFlightStage('solar-deploy');
  };

  const handleDeploySolar = () => {
    if (!currentOperatorInfo.isMe) return;
    setSolarPanelsUnfolded(true);
  };

  const handleLockSolarAngle = () => {
    if (!currentOperatorInfo.isMe) return;
    if (Math.abs(sunTrackingAngle - 90) <= 8) {
      setSolarVoltageLocked(true);
      setTimeout(() => {
        setFlightStage('science-pass');
      }, 1200);
    }
  };

  const stageSteps: { id: FlightStage; label: string }[] = [
    { id: 'design', label: isTr ? '1. Sistem Doğrulama' : '1. Pre-Check' },
    { id: 'liftoff', label: isTr ? '2. Fırlatma & Vektör' : '2. Liftoff Vector' },
    { id: 'max-q', label: isTr ? '3. Max-Q Basınç' : '3. Max-Q Limit' },
    { id: 'stage-sep', label: isTr ? '4. Kademe Ayrılma' : '4. Staging' },
    { id: 'transfer-cruise', label: isTr ? '5. Hohmann Geçişi' : '5. Hohmann Arc' },
    { id: 'orbital-burn', label: isTr ? '6. Yörünge Ateşleme' : '6. Capture Burn' },
    { id: 'solar-deploy', label: isTr ? '7. Güneş Paneli' : '7. Solar Deploy' },
    { id: 'science-pass', label: isTr ? '8. Bilim İletimi' : '8. Science Pass' },
  ];

  const currentStepIdx = stageSteps.findIndex((s) => s.id === flightStage);

  return (
    <div className="fixed inset-0 z-50 bg-[#070B14]/85 w-screen h-screen flex flex-col text-white select-none overflow-hidden font-sans">
      {/* Dynamic Deep Space Cockpit Backdrops */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-30 mix-blend-screen -z-20"
        style={{ backgroundImage: `url('./flight-kit/bg-hero-deepspace.webp')` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay -z-10"
        style={{ backgroundImage: `url('./flight-kit/bg-cockpit-overlay.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/60 via-transparent to-[#070B14]/90 pointer-events-none -z-10" />

      {/* Dynamic Red Emergency Crash Alarm Effects (Pure lightweight CSS, zero lag) */}
      {isCrashing && (
        <>
          <div className="fixed inset-0 pointer-events-none z-50 border-[8px] border-rose-600 shadow-[inset_0_0_160px_rgba(225,29,72,0.85)] animate-pulse" />
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-mono font-bold px-5 sm:px-8 py-2.5 rounded-full border-2 border-white shadow-[0_0_35px_rgba(225,29,72,0.95)] flex items-center space-x-3 animate-bounce">
            <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            <span className="text-xs sm:text-sm tracking-wider uppercase">
              {isTr
                ? '🚨 KRİTİK SİSTEM ARIZASI: TELEMETRİ KOPTU // ARAÇ DÜŞÜYOR!'
                : '🚨 CRITICAL SYSTEM FAILURE: TELEMETRY LOST // VEHICLE CRASHING!'}
            </span>
          </div>
        </>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP GLOBAL FLIGHT BRIDGE HEADER                                   */}
      {/* --------------------------------------------------------------------- */}
      <header className="w-full bg-[#070B14]/75 border-b border-white/10 px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md z-40">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
            <span className="font-display font-bold text-sm sm:text-base tracking-wide text-white">
              BYTECORE FLIGHT BRIDGE
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-300">
            <span className="text-sky-400 font-semibold">{currentScenario.target}:</span>
            <span>{currentScenario.name}</span>
          </div>
        </div>

        {/* Stepper Progress Bar across Header */}
        <div className="hidden xl:flex items-center space-x-1 font-mono text-[11px]">
          {stageSteps.map((st, i) => {
            const isCurrent = flightStage === st.id;
            const isDone = currentStepIdx > i;
            return (
              <div
                key={st.id}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center space-x-1 ${
                  isCurrent
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                    : isDone
                    ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 font-medium'
                    : 'text-slate-500 border border-slate-800'
                }`}
              >
                <span>{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Actions: Reset & Close / Abort */}
        <div className="flex items-center space-x-2">
          {flightStage !== 'design' && (
            <button
              onClick={handleResetFlight}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-700/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isTr ? 'Uçuşu Başa Sar' : 'Reset Simulation'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isTr ? 'Başa Dön' : 'Reset'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
            title={isTr ? 'Uçuş Köprüsünden Çık' : 'Exit Flight Deck'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 2. ACTIVE OPERATOR & ASSIGNED CREW BANNER (In-Flight)                 */}
      {/* --------------------------------------------------------------------- */}
      {flightStage !== 'design' && flightStage !== 'mission-complete' && (
        <div className="bg-[#0B0F17]/90 border-b border-sky-500/20 px-4 md:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
              {currentOperatorInfo.roleLabel}
            </span>
            <span className="text-white font-semibold">
              {currentOperatorInfo.operatorName}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              {isTr ? 'Görev' : 'Operation'}: <strong className="text-sky-300">{currentOperatorInfo.taskName}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {currentOperatorInfo.isMe ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                <Check className="w-3.5 h-3.5" />
                <span>{isTr ? 'KONTROL SİZDE' : 'OPERATOR ACCESS ACTIVE'}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full">
                <Users className="w-3.5 h-3.5" />
                <span>{isTr ? 'GÖZLEMCİ MODU (CANLI TELEMETRİ İZLENİYOR)' : 'SPECTATOR MODE (LIVE STREAM)'}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. MAIN COCKPIT VIEWPORT (Fills available screen space)              */}
      {/* --------------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center relative">
        {/* ================================================================= */}
        {/* SCREEN 0: PRE-LAUNCH CHECKLIST & CONFIRMATION DECK                */}
        {/* ================================================================= */}
        {flightStage === 'design' && (
          <div className="max-w-4xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Cinematic Launchpad Banner */}
            <div className="relative w-full h-36 sm:h-48 rounded-xl overflow-hidden border border-white/10 bg-[#080C14]">
              <img
                src="./flight-kit/sim-launchpad-night.webp"
                alt="Cape Canaveral Launch Complex at Night"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/30 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider drop-shadow-md">
                  {currentVehicle.name} · {currentScenario.name}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold">
                  {isTr ? 'UÇUŞ ÖNCESİ SİSTEM MÜHENDİSLİĞİ ONAY MASASI' : 'PRE-LAUNCH SYSTEMS VERIFICATION DECK'}
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">
                  {isTr ? 'Görevi Fırlatmaya Onayla (GO / NO-GO)' : 'Flight Readiness Review (GO / NO-GO)'}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold self-start sm:self-auto">
                NASA-STD-7001B CERTIFIED
              </span>
            </div>

            {/* Subsystems Readiness Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  !telemetry.deltaVSufficient
                    ? 'border-rose-500/60 bg-rose-950/25'
                    : 'border-slate-800 bg-[#0B0F17]'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold">{isTr ? 'İTKİ & DELTA-V' : 'PROPULSION & ΔV'}</span>
                  <Flame className={`w-3.5 h-3.5 ${!telemetry.deltaVSufficient ? 'text-rose-400' : 'text-amber-400'}`} />
                </div>
                <div className={`text-lg font-bold tabular-nums ${!telemetry.deltaVSufficient ? 'text-rose-400' : 'text-white'}`}>
                  {telemetry.availableDeltaVMps.toLocaleString()} m/s
                </div>
                <span className={`text-[10px] block font-medium ${!telemetry.deltaVSufficient ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                  {isTr ? 'Gerekli' : 'Req'}: {currentScenario.requiredDeltaV.toLocaleString()} m/s ({telemetry.deltaVMarginPercent > 0 ? `+${telemetry.deltaVMarginPercent}%` : `${telemetry.deltaVMarginPercent}%`})
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  !telemetry.powerPositive
                    ? 'border-rose-500/60 bg-rose-950/25'
                    : 'border-slate-800 bg-[#0B0F17]'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold">{isTr ? 'GÜÇ & TERMAL' : 'POWER & THERMAL'}</span>
                  <Zap className={`w-3.5 h-3.5 ${!telemetry.powerPositive ? 'text-rose-400' : 'text-sky-400'}`} />
                </div>
                <div className={`text-lg font-bold tabular-nums ${!telemetry.powerPositive ? 'text-rose-400' : 'text-white'}`}>
                  {telemetry.netPowerW > 0 ? `+${telemetry.netPowerW} W` : `${telemetry.netPowerW} W`}
                </div>
                <span className={`text-[10px] block font-medium ${!telemetry.powerPositive ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                  TVAC Skoru: {environmentalTests.tvacScore}% {environmentalTests.tvacScore >= 70 ? 'Nominal' : 'Kritik'}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  !telemetry.launchCompatibility
                    ? 'border-rose-500/60 bg-rose-950/25'
                    : 'border-slate-800 bg-[#0B0F17]'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold">{isTr ? 'YAPISAL TİTREŞİM' : 'VIBRATION LIMIT'}</span>
                  <Activity className={`w-3.5 h-3.5 ${!telemetry.launchCompatibility ? 'text-rose-400' : 'text-purple-400'}`} />
                </div>
                <div className={`text-lg font-bold tabular-nums ${!telemetry.launchCompatibility ? 'text-rose-400' : 'text-white'}`}>
                  {telemetry.totalMassKg.toLocaleString()} kg
                </div>
                <span className={`text-[10px] block font-medium ${!telemetry.launchCompatibility ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                  Rezonans Skoru: {environmentalTests.vibrationScore}% Geçti
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  telemetry.validationErrors.some((e) => e.includes('İletişim') || e.includes('Comms'))
                    ? 'border-rose-500/60 bg-rose-950/25'
                    : 'border-slate-800 bg-[#0B0F17]'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold">{isTr ? 'DSN & BİLİM' : 'DSN & SCIENCE'}</span>
                  <Radio className={`w-3.5 h-3.5 ${telemetry.validationErrors.some((e) => e.includes('İletişim') || e.includes('Comms')) ? 'text-rose-400' : 'text-emerald-400'}`} />
                </div>
                <div className="text-lg font-bold text-sky-300 tabular-nums">
                  {telemetry.sciencePoints} {isTr ? 'Puan' : 'PTS'}
                </div>
                <span className={`text-[10px] block font-medium ${telemetry.validationErrors.some((e) => e.includes('İletişim') || e.includes('Comms')) ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {telemetry.dataThroughputKbps} kbps Link {telemetry.validationErrors.some((e) => e.includes('İletişim') || e.includes('Comms')) && '(Darboğaz)'}
                </span>
              </div>
            </div>

            {/* Critical Deficiencies List / Risk Overview */}
            {telemetry.validationErrors.length > 0 && (
              <div className="p-4 rounded-xl border border-rose-500/60 bg-rose-950/40 font-mono text-xs space-y-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <div className="flex items-center space-x-2 text-rose-400 font-bold uppercase text-[11px]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                  <span>
                    {isTr
                      ? `MÜHENDİSLİK RİSK UYARISI (${telemetry.validationErrors.length} KRİTİK EKSİKLİK TESPİT EDİLDİ)`
                      : `ENGINEERING RISK ALERT (${telemetry.validationErrors.length} CRITICAL DEFICIENCIES DETECTED)`}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-rose-200/90 pl-6">
                  {telemetry.validationErrors.map((err, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-amber-300 font-semibold pl-6 pt-1.5 border-t border-rose-500/20 flex items-center space-x-1.5">
                  <span>⚠️</span>
                  <span>
                    {isTr
                      ? 'Fırlatmayı yine de onaylayabilirsiniz. Ancak fırlatmadan kısa süre sonra sistem çöküşü yaşanacak ve araç düşecektir!'
                      : 'You may still authorize launch. However, critical system collapse will trigger shortly after liftoff causing loss of vehicle!'}
                  </span>
                </div>
              </div>
            )}

            {/* Launch Vehicle & Payload Overview */}
            <div className="border border-slate-800 rounded-xl p-4 bg-[#080C14] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left font-mono">
                <span className="text-xs text-white font-bold block">
                  {currentVehicle.name} ({currentVehicle.manufacturer})
                </span>
                <p className="text-[11px] text-slate-400">
                  {telemetry.validationErrors.length > 0
                    ? isTr
                      ? 'Araçta kritik eksiklikler olmasına rağmen fırlatma komutası açık tutulmaktadır. Onay verildiğinde telemetri simülasyonu başlatılır.'
                      : 'Launch controls remain operational despite deficiencies. Authorizing initiates active flight telemetry.'
                    : isTr
                    ? 'Tüm alt sistem kontrolleri tamamlandı. Fırlatma onaylandığında görev kontrolü aşamalı kokpit mini oyunlarına devredilecektir.'
                    : 'All subsystems validated. Confirming launch hands control over to interactive multi-stage flight operations.'}
                </p>
              </div>

              <button
                onClick={handleConfirmPreLaunch}
                className={`px-8 py-3.5 rounded-full font-display font-bold text-xs sm:text-sm tracking-wider shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 group ${
                  telemetry.validationErrors.length > 0
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl'
                }`}
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>
                  {telemetry.validationErrors.length > 0
                    ? isTr
                      ? 'RİSKLİ FIRLATMA İÇİN ONAY VER (GO FOR LAUNCH)'
                      : 'AUTHORIZE LAUNCH DESPITE RISKS (GO FOR LAUNCH)'
                    : isTr
                    ? 'FIRLATMA İÇİN ONAY VER (GO FOR LAUNCH)'
                    : 'GO FOR LAUNCH (START EXPEDITION)'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* COUNTDOWN STAGE: TERMINAL COUNTDOWN HUD                           */}
        {/* ================================================================= */}
        {flightStage === 'countdown' && (
          <div className="max-w-xl w-full border border-sky-500/40 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-8 space-y-6 shadow-2xl text-center font-mono animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center space-x-2 text-sky-400 text-xs uppercase tracking-widest font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{isTr ? 'NİHAİ GERİ SAYIM BAŞLADI' : 'TERMINAL COUNTDOWN INITIATED'}</span>
            </div>
            <div className="text-6xl sm:text-7xl font-mono font-bold text-white tracking-wider animate-pulse tabular-nums">
              T-00:03
            </div>
            <p className="text-xs text-slate-300">
              {isTr
                ? 'Ana motor ateşleme dizisi devrede. İtki gimbal mini oyunu yükleniyor...'
                : 'Main engine ignition sequence start. Launch attitude mini-game engaging...'}
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 1: LIFT-OFF PITCH GIMBAL MINI-GAME                          */}
        {/* ================================================================= */}
        {flightStage === 'liftoff' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 1: ROKET İTKİ AÇISI & GİMBAL DENGELEME' : 'STAGE 1: THRUST GIMBAL VECTOR STABILIZATION'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? 'Roket Yükselirken Açısını Merkezde Tutun' : 'Stabilize Rocket Attitude Inside Flight Corridor'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? 'Aerodinamik rüzgar kuvvetleri roketi saptırıyor. Fareyi sağa-sola kaydırarak veya butonlarla roketi yeşil koridorda tutun.'
                    : 'Cross-winds are deflecting the rocket. Move your cursor left/right to keep the rocket attitude within the green safe corridor.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün roket itki açısını düzeltmesi canlı izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} stabilize the rocket gimbal attitude...`}
              </p>
            </div>

            {/* Interactive Rocket Pitch Display Canvas/Box (Mouse & Touch Enabled) */}
            <div
              onMouseMove={handleMouseMovePitch}
              onTouchStart={handleTouchMovePitch}
              onTouchMove={handleTouchMovePitch}
              className={`relative h-64 border rounded-xl overflow-hidden bg-[#080C14] flex flex-col items-center justify-center transition-all touch-none select-none ${
                currentOperatorInfo.isMe ? 'cursor-ew-resize border-sky-500/50 shadow-[inset_0_0_20px_rgba(56,189,248,0.15)]' : 'border-slate-800'
              }`}
            >
              {/* HUD Frame Brackets */}
              <img src="./flight-kit/hud-corner-bracket.svg" alt="" className="absolute top-2 left-2 w-4 h-4 opacity-40 pointer-events-none" />
              <img src="./flight-kit/hud-corner-bracket.svg" alt="" className="absolute top-2 right-2 w-4 h-4 opacity-40 rotate-90 pointer-events-none" />
              <img src="./flight-kit/hud-corner-bracket.svg" alt="" className="absolute bottom-2 left-2 w-4 h-4 opacity-40 -rotate-90 pointer-events-none" />
              <img src="./flight-kit/hud-corner-bracket.svg" alt="" className="absolute bottom-2 right-2 w-4 h-4 opacity-40 rotate-180 pointer-events-none" />

              {/* Green Safe Flight Corridor Indicator (Center Area) */}
              <div className="absolute inset-y-0 w-24 bg-emerald-500/15 border-x border-emerald-500/40 flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold opacity-75">
                  KORİDOR (±5°)
                </span>
              </div>

              {/* Angle Readout Overlay */}
              <div className="absolute top-3 left-4 font-mono text-xs text-left">
                <span className="text-slate-500 text-[10px] block">AÇI SAPMASI (PITCH)</span>
                <strong className={`text-base font-bold tabular-nums ${Math.abs(pitchAngleDeg) <= 5.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pitchAngleDeg > 0 ? `+${pitchAngleDeg}°` : `${pitchAngleDeg}°`}
                </strong>
              </div>

              <div className="absolute top-3 right-4 font-mono text-xs text-right">
                <span className="text-slate-500 text-[10px] block">KİLİT İLERLEMESİ</span>
                <strong className="text-sky-300 text-base font-bold tabular-nums">
                  {pitchHoldProgress}%
                </strong>
              </div>

              {/* Aerospace Navball Indicator (Bottom-Right) */}
              <div className="absolute bottom-3 right-3 hidden sm:flex items-center space-x-1.5 opacity-70 pointer-events-none bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/60">
                <img src="./flight-kit/hud-navball.png" alt="Navball" className="w-5 h-5 object-contain" />
                <span className="text-[9px] font-mono text-slate-300 font-bold">FD-ATT 0°</span>
              </div>

              {/* Rocket Model SVG with Transform Rotation */}
              <div
                className="transition-transform duration-100 ease-out flex flex-col items-center pointer-events-none"
                style={{
                  transform: isCrashing ? 'rotate(68deg) scale(0.92)' : `rotate(${pitchAngleDeg}deg)`,
                }}
              >
                {/* Rocket Nose Cone & Body */}
                <div className="w-10 h-28 relative flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-slate-200" />
                  <div className="w-7 h-20 bg-slate-200 border-x border-slate-300 relative rounded-sm flex items-center justify-center">
                    <span className="text-[8px] font-mono font-bold text-slate-800 rotate-90 tracking-widest">
                      BYTE
                    </span>
                  </div>
                  {/* Fins */}
                  <div className="w-12 h-4 flex justify-between">
                    <div className="w-2.5 h-4 bg-sky-500 clip-triangle-left" />
                    <div className="w-5 h-2 bg-slate-400" />
                    <div className="w-2.5 h-4 bg-sky-500 clip-triangle-right" />
                  </div>
                </div>

                {/* Animated Exhaust Flame */}
                <div className="w-4 h-12 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent rounded-b-full animate-pulse shadow-[0_0_16px_rgba(251,146,60,0.8)]" />
              </div>

              {/* Countdown Splash when Locked */}
              {pitchCountdown !== null && (
                <div className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 animate-in fade-in">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    ✓ İTKİ VEKTÖRÜ KİLİTLENDİ
                  </span>
                  <div className="text-6xl font-black font-mono text-white tabular-nums">
                    T-{pitchCountdown}
                  </div>
                </div>
              )}
            </div>

            {/* Manual Left/Right Steering Trim Controls (Responsive Touch & Desktop) */}
            {currentOperatorInfo.isMe && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAdjustPitch(-3)}
                    className="flex-1 sm:flex-initial px-4 py-3 sm:py-2 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 active:scale-95 font-mono text-xs sm:text-sm text-sky-200 cursor-pointer min-h-[44px] flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <span>◀</span>
                    <span>{isTr ? 'Sola Düzelt (-3°)' : 'Left Trim (-3°)'}</span>
                  </button>
                  <button
                    onClick={() => handleAdjustPitch(+3)}
                    className="flex-1 sm:flex-initial px-4 py-3 sm:py-2 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 active:scale-95 font-mono text-xs sm:text-sm text-sky-200 cursor-pointer min-h-[44px] flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <span>{isTr ? 'Sağa Düzelt (+3°)' : 'Right Trim (+3°)'}</span>
                    <span>▶</span>
                  </button>
                </div>
                <div className="w-full sm:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="bg-sky-400 h-full transition-all duration-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    style={{ width: `${pitchHoldProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 2: MAX-Q THROTTLE CONTROL MINI-GAME                         */}
        {/* ================================================================= */}
        {flightStage === 'max-q' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 2: AZAMİ DİNAMİK BASINÇ (MAX-Q)' : 'STAGE 2: PEAK DYNAMIC PRESSURE (MAX-Q)'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? 'Yapısal Yükü Korumak İçin Motor İtkisini Kısın' : 'Throttle Engine Down to Protect Structure'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? 'Ses duvarı aşılırken atmosferik basınç pik noktasına ulaştı. Motor kolunu yeşil sektöre (%65-%75) çekin ve 4 saniye sabit tutun.'
                    : 'Transonic pressure peak reached. Throttle engine down into the green sector (65%-75%) and hold for 4 seconds.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün motor itkisini kısarak Max-Q yu geçmesi izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} throttle down through Max-Q...`}
              </p>
            </div>

            {/* Throttle Gauge & Slider Component */}
            <div className="border border-slate-800 rounded-xl p-6 bg-[#080C14] space-y-5">
              <div className="flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">DİNAMİK BASINÇ (Q)</span>
                  <strong className="text-rose-400 text-lg font-bold tabular-nums">
                    {liveQPressureKPa.toFixed(1)} kPa
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">GÜVENLİ HOLD SÜRESİ</span>
                  <strong className="text-emerald-400 text-lg font-bold tabular-nums">
                    {maxQHoldSeconds} / 4 sn
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">MOTOR İTKİSİ</span>
                  <strong className="text-white text-lg font-bold tabular-nums">
                    {throttlePercent}%
                  </strong>
                </div>
              </div>

              {/* Throttle Range Slider */}
              <div className="space-y-2">
                <div className="relative w-full h-8 bg-slate-900 rounded-full border border-slate-700 overflow-hidden flex items-center">
                  <div className="absolute left-[60%] right-[25%] top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-500 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-widest">
                      NOMINAL (%60-%75)
                    </span>
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-md transition-transform"
                    style={{ left: `${throttlePercent}%`, transform: 'translateX(-50%)' }}
                  />
                </div>

                <input
                  type="range"
                  min="40"
                  max="100"
                  disabled={!currentOperatorInfo.isMe || maxQPassed}
                  value={throttlePercent}
                  onChange={(e) => setThrottlePercent(Number(e.target.value))}
                  className="w-full cursor-pointer accent-sky-400 disabled:opacity-50"
                />
              </div>

              {maxQPassed && (
                <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono text-xs font-bold animate-in fade-in">
                  {isTr ? '✓ MAX-Q BAŞARIYLA AŞILDI! TAM GÜÇ YETKİSİ VERİLDİ.' : '✓ MAX-Q CLEARED! FULL THROTTLE AUTHORIZED.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 3: STAGE SEPARATION & INTERLOCKS MINI-GAME                  */}
        {/* ================================================================= */}
        {flightStage === 'stage-sep' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 3: KADEME AYRILMASI & PİROTEKNİK KİLİTLER' : 'STAGE 3: STAGE SEPARATION & INTERLOCK RELEASE'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? '1. Kademeyi Ayırın ve Vakum Motorunu Ateşleyin' : 'Jettison Booster & Ignite Vacuum Stage 2'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? '1. Kademe yakıtı tükendi (MECO). 4 adet pnömatik kilidi açın, ardından kademe ayrılmasını tetikleyin.'
                    : 'Stage 1 propellant depleted. Release all 4 pneumatic interlocks, decouple the booster, then ignite vacuum engine.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün kademe ayrılmasını gerçekleştirmesi izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} complete stage separation...`}
              </p>
            </div>

            {/* 4 Interlock Pins Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stageLocksReleased.map((isUnlocked, idx) => (
                <button
                  key={idx}
                  disabled={!currentOperatorInfo.isMe || boosterJettisoned}
                  onClick={() => handleToggleLock(idx)}
                  className={`p-3 rounded-xl border font-mono text-xs flex flex-col items-center space-y-1.5 transition-all cursor-pointer disabled:cursor-not-allowed ${
                    isUnlocked
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-[#0B0F17] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lock className={`w-4 h-4 ${isUnlocked ? 'hidden' : 'inline'}`} />
                  <Unlock className={`w-4 h-4 ${isUnlocked ? 'inline text-emerald-400' : 'hidden'}`} />
                  <span className="font-bold text-[10px]">KİLİT 0{idx + 1}</span>
                  <span className="text-[9px] uppercase">{isUnlocked ? 'AÇIK (RELEASED)' : 'KİLİTLİ'}</span>
                </button>
              ))}
            </div>

            {/* Decouple & Ignite Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!boosterJettisoned ? (
                <button
                  disabled={!currentOperatorInfo.isMe || !stageLocksReleased.every(Boolean)}
                  onClick={handleJettisonBooster}
                  className="px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  {isTr ? '1. KADEMEYİ AYIR (STAGE DECOUPLER)' : 'FIRE STAGE DECOUPLER'}
                </button>
              ) : !vacuumIgnited ? (
                <button
                  disabled={!currentOperatorInfo.isMe}
                  onClick={handleIgniteVacuum}
                  className="px-8 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer shadow-md animate-bounce"
                >
                  {isTr ? '2. KADEME VAKUM MOTORUNU ATEŞLE (IGNITION)' : 'IGNITE VACUUM ENGINE'}
                </button>
              ) : (
                <div className="text-emerald-400 font-mono text-xs font-bold">
                  {isTr ? '✓ VAKUM MOTORU ATEŞLENDİ - YÖRÜNGE TRANSFERİ BAŞLADI' : '✓ VACUUM ENGINE ACTIVE - TRANSFER ORBIT ENGAGED'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 4: HOHMANN INJECTION BURN MINI-GAME                         */}
        {/* ================================================================= */}
        {flightStage === 'transfer-cruise' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 4: HOHMANN TRANSFER YÖRÜNGESİNE GİRİŞ' : 'STAGE 4: HOHMANN TRANSFER INJECTION ARC'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? 'Prograde Ateşleme Penceresini Zamanlayın' : 'Time the Prograde Transfer Injection Burn'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? 'Apoapsis noktasına yaklaşıldığında hedef yeşil pencerede butona basarak rotayı hedef gezegene kilitleyin.'
                    : 'Execute prograde injection burn when spacecraft indicator reaches the target orbital window.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün Hohmann geçişini ateşlemesi izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} inject into Hohmann transfer arc...`}
              </p>
            </div>

            {/* Orbit Diagram Animation Canvas */}
            <div className="border border-slate-800 rounded-xl p-6 bg-[#080C14] space-y-4">
              <div className="relative h-20 bg-slate-950 rounded-full border border-slate-800 overflow-hidden flex items-center">
                <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-sky-500/25 border-x border-sky-400 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-widest">
                    HEDEF PENCERE (%40-%60)
                  </span>
                </div>
                <div
                  className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-lg transition-transform"
                  style={{ left: `${hohmannProgress}%`, transform: 'translateX(-50%)' }}
                />
              </div>

              {!hohmannLocked ? (
                <button
                  disabled={!currentOperatorInfo.isMe}
                  onClick={handleLockHohmann}
                  className="px-8 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-40 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  {isTr ? 'PROGRADE ATEŞLEMEYİ BAŞLAT' : 'EXECUTE PROGRADE INJECTION'}
                </button>
              ) : (
                <div className="text-emerald-400 font-mono text-xs font-bold">
                  {isTr ? '✓ HOHMANN GEÇİŞ ROTASI KİLİTLENDİ - DERİN UZAY SEYRİ NOMİNAL' : '✓ HOHMANN INJECTION LOCKED - DEEP SPACE CRUISE NOMINAL'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 5: ORBITAL CAPTURE BURN MINI-GAME                           */}
        {/* ================================================================= */}
        {flightStage === 'orbital-burn' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 5: YÖRÜNGE YAKALAMA ATEŞLEMESİ' : 'STAGE 5: ORBITAL CAPTURE INSERTION BURN'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? 'Retrograde İtki ile Hedef Yörüngeye Girin' : 'Retrograde Burn to Capture into Stable Orbit'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? 'İbre yeşil hedef bölgeye (%42 - %58) geldiğinde motoru ateşleyin. Kaçış hızını düşürüp yörüngeye oturun.'
                    : 'Fire retro-burn when the needle oscillates inside the nominal green gate to achieve circular orbit.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün yörünge ateşlemesini yapması izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} execute orbital capture burn...`}
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-6 bg-[#080C14] space-y-4">
              <div className="relative h-10 bg-slate-950 rounded-full border border-slate-700 overflow-hidden flex items-center">
                <div className="absolute left-[42%] right-[42%] top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-400 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-widest">
                    NOMINAL
                  </span>
                </div>
                <div
                  className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-lg"
                  style={{ left: `${burnNeedlePos}%`, transform: 'translateX(-50%)' }}
                />
              </div>

              {!burnExecution ? (
                <button
                  disabled={!currentOperatorInfo.isMe}
                  onClick={handleExecuteBurnClick}
                  className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  {isTr ? 'YÖRÜNGE ATEŞLEMESİNİ KİLİTLE' : 'LOCK INSERTION BURN'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-emerald-400 font-mono text-xs font-bold">
                    {burnExecution.message}
                  </div>
                  <button
                    onClick={handleProceedFromBurn}
                    className="px-6 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-mono font-bold text-xs transition-all cursor-pointer"
                  >
                    {isTr ? 'Güneş Paneli Açılımına İlerle →' : 'Proceed to Solar Deploy →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 6: SOLAR ARRAY DEPLOYMENT & SUN TRACKING MINI-GAME          */}
        {/* ================================================================= */}
        {flightStage === 'solar-deploy' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 6: GÜNEŞ PANELİ AÇILIMI & GÜNEŞ TAKİBİ' : 'STAGE 6: SOLAR ARRAY DEPLOYMENT & SUN TRACKING'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? 'Panelleri Açın ve Güneş Açısını 90° ye Kilitleyin' : 'Deploy Arrays & Lock Sun Incidence Angle to 90°'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? 'Kanatları açın ve güneş takip motoruyla panelleri dik açıya (90°) getirerek tam güç üretin.'
                    : 'Release array latches, then rotate the solar gimbal to 90° incidence angle for peak photovoltaic power.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün güneş panellerini açıp yönlendirmesi izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} deploy and track solar arrays...`}
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-6 bg-[#080C14] space-y-5">
              {!solarPanelsUnfolded ? (
                <button
                  disabled={!currentOperatorInfo.isMe}
                  onClick={handleDeploySolar}
                  className="px-8 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer shadow-lg animate-pulse"
                >
                  {isTr ? 'PANELLERİN KİLİTLERİNİ AÇ (DEPLOY ARRAYS)' : 'DEPLOY SOLAR ARRAYS'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">{isTr ? 'GÜNEŞ GİRİŞ AÇISI' : 'INCIDENCE ANGLE'}:</span>
                    <strong className={`text-base font-bold tabular-nums ${Math.abs(sunTrackingAngle - 90) <= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sunTrackingAngle}° (Hedef: 90°)
                    </strong>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="160"
                    disabled={!currentOperatorInfo.isMe || solarVoltageLocked}
                    value={sunTrackingAngle}
                    onChange={(e) => setSunTrackingAngle(Number(e.target.value))}
                    className="w-full cursor-pointer accent-sky-400"
                  />

                  {!solarVoltageLocked ? (
                    <button
                      disabled={!currentOperatorInfo.isMe || Math.abs(sunTrackingAngle - 90) > 8}
                      onClick={handleLockSolarAngle}
                      className="px-6 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-40 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
                    >
                      {isTr ? 'GÜNEŞ KİLİDİNİ ONAYLA (%100 GÜÇ)' : 'LOCK SUN TRACKING (%100 POWER)'}
                    </button>
                  ) : (
                    <div className="text-emerald-400 font-mono text-xs font-bold">
                      {isTr ? '✓ GÜNEŞ PANELİ AÇISI KİLİTLENDİ - ŞEBEKE NOMİNAL VOLTAJDA' : '✓ SOLAR ARRAY LOCKED - BUS VOLTAGE FULL NOMINAL'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 7: SCIENCE PASS & DSN DOWNLINK MINI-GAME                    */}
        {/* ================================================================= */}
        {flightStage === 'science-pass' && (
          <div className="max-w-2xl w-full border border-white/10 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 space-y-6 shadow-2xl text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                {isTr ? 'AŞAMA 7: BİLİM VERİSİ VE DSN FREKANS KİLİDİ' : 'STAGE 7: SCIENCE PACKET DOWNLINK & DSN CARRIER LOCK'}
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                {isTr ? 'DSN Yer İstasyonuna Kilitlenip Veriyi Aktarın' : 'Lock DSN 34m Carrier & Stream Science Telemetry'}
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto">
                {currentOperatorInfo.isMe
                  ? isTr
                    ? 'Taşıyıcı frekansı ve faz açısını DSN 34m çanağına kilitleyin, ardından bilim paketlerini Dünya ya indirin.'
                    : 'Tune the microwave transmitter to match the Deep Space Network carrier wave to downlink science packets.'
                  : isTr
                  ? `${currentOperatorInfo.operatorName} operatörünün DSN frekans kilidini kurması izleniyor...`
                  : `Watching ${currentOperatorInfo.operatorName} establish DSN downlink carrier lock...`}
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-6 bg-[#080C14] space-y-5">
              {!dsnCarrierTuned ? (
                <button
                  disabled={!currentOperatorInfo.isMe}
                  onClick={() => setDsnCarrierTuned(true)}
                  className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer shadow-lg animate-pulse"
                >
                  {isTr ? 'DSN TAŞIYICI FREKANSINI KİLİTLE (8.4 GHz)' : 'LOCK DSN CARRIER (8.4 GHz)'}
                </button>
              ) : (
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isTr ? 'VERİ AKTARIMI (DOWNLINK)' : 'DATA DOWNLINK'}:</span>
                    <strong className="text-emerald-400 text-base font-bold tabular-nums">
                      {downlinkTransferPercent}%
                    </strong>
                  </div>

                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-150 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                      style={{ width: `${downlinkTransferPercent}%` }}
                    />
                  </div>

                  <span className="text-[11px] text-slate-400 block pt-1">
                    {isTr ? 'Yer İstasyonları: Goldstone, Madrid, Canberra senkronize.' : 'Ground Stations: Goldstone, Madrid, Canberra locked.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 8: MISSION COMPLETE & DEBRIEF REPORT                         */}
        {/* ================================================================= */}
        {flightStage === 'mission-complete' && (
          <div className="max-w-2xl w-full border border-emerald-500/30 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto">
              <img
                src="./flight-kit/seal-nasa-flight-ready.png"
                alt="Flight Ready Qualification Seal"
                className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(16,185,129,0.5)]"
              />
            </div>

            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                {isTr ? '✓ GÖREV BAŞARIYLA TAMAMLANDI' : '✓ EXPEDITION COMPLETE & QUALIFIED'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                {currentScenario.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'TOPLAM BİLİM' : 'SCIENCE HARVEST'}</span>
                <strong className="text-sky-300 text-base font-bold mt-1 block">
                  {telemetry.sciencePoints} PTS
                </strong>
              </div>

              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'KALAN BÜTÇE' : 'SURPLUS BUDGET'}</span>
                <strong className="text-white text-base font-bold mt-1 block">
                  ${telemetry.remainingBudgetM}M
                </strong>
              </div>

              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'DELTA-V MARJI' : 'DELTA-V MARGIN'}</span>
                <strong className="text-emerald-400 text-base font-bold mt-1 block">
                  +{telemetry.deltaVMarginPercent}%
                </strong>
              </div>

              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'GENEL DERECE' : 'OVERALL GRADE'}</span>
                <strong className="text-emerald-300 text-base font-bold mt-1 block">
                  {isTr ? 'MÜKEMMEL (EXCELLENCE)' : 'EXCELLENCE'}
                </strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetFlight}
                className="px-8 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                {isTr ? 'Yeni Bir Sefer Tasarla / Lobiye Dön' : 'Design Another Mission / Return to Lobby'}
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MISSION FAILED / LOSS OF VEHICLE DEBRIEF SCREEN                   */}
        {/* ================================================================= */}
        {flightStage === 'mission-failed' && (
          <div className="max-w-2xl w-full border border-rose-500/50 rounded-2xl bg-[#0E1422]/95 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient Red Alert Glow */}
            <div className="absolute inset-0 bg-rose-500/5 pointer-events-none -z-10" />

            {/* Failure Badge / Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.35)]">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{isTr ? 'GÖREV BAŞARISIZ // ARAÇ DÜŞTÜ' : 'MISSION FAILED // LOSS OF VEHICLE'}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                {currentScenario.name}
              </h2>
            </div>

            {/* Aerospace Mishap Investigation Report */}
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-left font-mono space-y-2">
              <div className="flex items-center justify-between text-[11px] text-rose-300 font-bold uppercase border-b border-rose-500/30 pb-1.5">
                <span>{isTr ? 'UÇUŞ KAZASI ARAŞTIRMA RAPORU' : 'FLIGHT MISHAP INVESTIGATION REPORT'}</span>
                <span className="text-rose-400 font-bold">FATAL ABORT</span>
              </div>
              <p className="text-xs text-rose-200/95 leading-relaxed font-sans sm:font-mono">
                {crashReason || (isTr ? 'Alt sistemlerdeki kritik eksiklikler nedeniyle araç irtifa kaybederek düştü.' : 'Critical subsystem deficiencies led to loss of altitude and vehicle impact.')}
              </p>
            </div>

            {/* Diagnostics at Loss Point */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'SON İRTİFA' : 'FINAL ALTITUDE'}</span>
                <strong className="text-rose-400 text-base font-bold mt-1 block">
                  0 m ({isTr ? 'Çarpışma' : 'Impact'})
                </strong>
              </div>

              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'GÖVDE DURUMU' : 'HULL STATUS'}</span>
                <strong className="text-rose-400 text-base font-bold mt-1 block">
                  {isTr ? 'Parçalandı' : 'Destroyed'}
                </strong>
              </div>

              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'TELEMETRİ' : 'TELEMETRY'}</span>
                <strong className="text-rose-400 text-base font-bold mt-1 block">
                  {isTr ? 'Sinyal Yok' : 'Lost'}
                </strong>
              </div>

              <div className="p-3 border border-slate-800 rounded-xl bg-[#0B0F17]">
                <span className="text-slate-400 block text-[10px]">{isTr ? 'HATALI SİSTEM' : 'DEFECTS'}</span>
                <strong className="text-amber-400 text-base font-bold mt-1 block">
                  {telemetry.validationErrors.length} {isTr ? 'Kritik Hata' : 'Errors'}
                </strong>
              </div>
            </div>

            {/* Corrective Guidance */}
            <div className="p-3 rounded-xl border border-slate-800 bg-[#0B0F17] text-left text-xs font-mono text-slate-300">
              <span className="text-sky-400 font-bold block mb-1">
                {isTr ? '💡 DÜZELTME TAVSİYESİ:' : '💡 CORRECTIVE RECOMMENDATION:'}
              </span>
              <span>
                {isTr
                  ? 'Haberleşme istasyonuna giderek daha yüksek kazançlı anten veya DSN yer istasyonu seçerek darboğazı giderin. İtki ve güç sistemlerini yeşil nominal sınırlara getirin.'
                  : 'Resolve comms bottlenecks by choosing a higher-gain antenna or DSN ground station. Ensure delta-V and power reserves meet required thresholds.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetFlight}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                {isTr ? 'Yeniden Tasarla & Hataları Düzelt' : 'Redesign & Fix Deficiencies'}
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-mono text-xs transition-all cursor-pointer"
              >
                {isTr ? 'Uçuş Köprüsünden Çık' : 'Exit Flight Deck'}
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 10 CRITICAL IN-FLIGHT ANOMALIES MODAL OVERLAY (WITH 4 CHOICES)    */}
        {/* ================================================================= */}
        {activeAnomaly && (
          <div className="absolute inset-0 bg-[#070B14]/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="max-w-3xl w-full border border-rose-500/50 bg-[#0E1422] rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
              {/* Crisis Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-rose-500/30 pb-3 sm:pb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-xs font-bold text-rose-300 uppercase tracking-widest">
                    {isTr ? 'KRİTİK UÇUŞ ACİL DURUMU' : 'CRITICAL IN-FLIGHT ANOMALY ALERT'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-slate-400">{isTr ? 'Kalan Süre' : 'Time Remaining'}:</span>
                  <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-bold tabular-nums text-sm">
                    {anomalyTimer}s
                  </span>
                </div>
              </div>

              {/* Anomaly Image & Scenario Description */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                <div className="w-full sm:w-44 h-24 sm:h-28 rounded-xl overflow-hidden border border-rose-500/40 shrink-0 bg-[#080C14]">
                  <img
                    src={getAnomalyArtwork(activeAnomaly.id, activeAnomaly.type)}
                    alt={activeAnomaly.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display font-bold text-base sm:text-lg text-white">
                    {activeAnomaly.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed">
                    {activeAnomaly.description}
                  </p>
                </div>
              </div>

              {/* Multiplayer Consensus Vote Tracker */}
              {isMultiplayer && (
                <div className="p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/30 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-sky-300">
                      {isTr ? 'Mürettebat Oylaması:' : 'Crew Consensus'}: <strong>{Object.keys(anomalyVotes).length} / {Math.max(1, players.length)}</strong> {isTr ? 'oylandı' : 'voted'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isTr ? 'Herkes oy verince anında uygulanır (veya 45s süre bitiminde)' : 'Applies when everyone votes or 45s timer ends'}
                  </span>
                </div>
              )}

              {/* 4 Realistic Engineering Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {activeAnomaly.choices.map((choice, cIdx) => {
                  const votesForChoice = Object.entries(anomalyVotes).filter(([_, cId]) => cId === choice.id);
                  const myVote = anomalyVotes[myPlayerInfo.peerId] === choice.id;

                  return (
                    <button
                      key={choice.id}
                      onClick={() => voteAnomalyChoice(choice.id)}
                      className={`text-left p-3 sm:p-3.5 border rounded-xl flex flex-col justify-between transition-all cursor-pointer font-mono active:scale-[0.99] touch-manipulation min-h-[64px] ${
                        myVote
                          ? 'border-sky-400 bg-sky-500/15 shadow-md ring-1 ring-sky-400/50'
                          : 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                          <span>
                            {String.fromCharCode(65 + cIdx)}) {choice.label}
                          </span>
                          {isMultiplayer && votesForChoice.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-bold">
                              {votesForChoice.length} {isTr ? 'OY' : 'VOTE'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {choice.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 font-medium">
                        {choice.effectDescription}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* 4. REALISTIC LIVE ROCKET COCKPIT TELEMETRY HUD (STATIONARY BOTTOM BAR)*/}
      {/* --------------------------------------------------------------------- */}
      {flightStage !== 'design' && (
        <footer className="w-full bg-[#0B0F17]/95 border-t border-white/10 px-4 md:px-8 py-3 shrink-0 backdrop-blur-md z-40">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs tabular-nums">
            {/* 1. Altitude */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${isCrashing ? 'border-rose-500/80 bg-rose-950/40' : 'border-slate-800 bg-[#0E1422]'}`}>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">
                {isTr ? 'İRTİFA (ALTITUDE)' : 'ALTITUDE'}
              </span>
              <strong className={`text-base font-bold block ${isCrashing ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {liveAltM < 1000 ? `${liveAltM.toLocaleString()} m` : `${(liveAltM / 1000).toFixed(1)} km`}
              </strong>
            </div>

            {/* 2. Velocity */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${isCrashing ? 'border-rose-500/80 bg-rose-950/40' : 'border-slate-800 bg-[#0E1422]'}`}>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">
                {isTr ? 'HIZ (VELOCITY)' : 'VELOCITY'}
              </span>
              <strong className={`text-base font-bold block ${isCrashing ? 'text-rose-400' : 'text-white'}`}>
                {liveVelMps.toLocaleString()} m/s
              </strong>
              <span className="text-[9px] text-slate-500 block">MACH {(liveVelMps / 343).toFixed(1)}</span>
            </div>

            {/* 3. Dynamic Pressure */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${isCrashing ? 'border-rose-500/80 bg-rose-950/40' : 'border-slate-800 bg-[#0E1422]'}`}>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">
                {isTr ? 'DİNAMİK BASINÇ (Q)' : 'DYN. PRESSURE'}
              </span>
              <strong className={`text-base font-bold block ${isCrashing ? 'text-rose-500' : liveQPressureKPa > 30 ? 'text-amber-400' : 'text-slate-300'}`}>
                {liveQPressureKPa.toFixed(1)} kPa
              </strong>
            </div>

            {/* 4. G-Force */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${isCrashing ? 'border-rose-500/80 bg-rose-950/40' : 'border-slate-800 bg-[#0E1422]'}`}>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">
                {isTr ? 'G-KUVVETİ (G-LOAD)' : 'G-FORCE LOAD'}
              </span>
              <strong className={`text-base font-bold block ${isCrashing ? 'text-rose-400' : 'text-white'}`}>
                {liveGForce.toFixed(2)} g
              </strong>
            </div>

            {/* 5. Fuel Remaining */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${isCrashing ? 'border-rose-500/80 bg-rose-950/40' : 'border-slate-800 bg-[#0E1422]'}`}>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">
                {isTr ? 'YAKIT REZERVİ' : 'PROPELLANT'}
              </span>
              <strong className={`text-base font-bold block ${isCrashing ? 'text-rose-400' : 'text-sky-300'}`}>
                {liveFuelPercent.toFixed(1)}%
              </strong>
            </div>

            {/* 6. DSN Signal & Target Distance */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${isCrashing ? 'border-rose-500/80 bg-rose-950/40' : 'border-slate-800 bg-[#0E1422]'}`}>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">
                {isTr ? 'DSN KİLİDİ' : 'DSN LOCK'}
              </span>
              <strong className={`text-base font-bold block ${isCrashing ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isCrashing ? (isTr ? 'SİNYAL KOPTU' : 'SIGNAL LOST') : simDownlinkPercent > 0 ? `${simDownlinkPercent}% NOMINAL` : 'STANDBY'}
              </strong>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
