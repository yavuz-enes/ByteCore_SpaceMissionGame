import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2, Crosshair, HelpCircle } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

interface SpectrometerLockMiniGameProps {
  onComplete?: (bonusPoints: number) => void;
  className?: string;
}

export const SpectrometerLockMiniGame: React.FC<SpectrometerLockMiniGameProps> = ({
  onComplete,
  className = '',
}) => {
  const { locale, sendAssistancePing, activeAssistancePings } = useMissionStore();
  const isTr = locale === 'tr';

  // Crosshair coordinates (0-100%)
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const [targetPos, setTargetPos] = useState({ x: 45, y: 35 });
  const [lockDuration, setLockDuration] = useState(0); // 0 - 100%
  const [isLocked, setIsLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(12);
  const [assistSent, setAssistSent] = useState(false);

  // Assistance widens tolerance
  const hasAssistance = activeAssistancePings.some(
    (p) => p.stationName.includes('Spektrometre') || p.stationName.includes('Spectrometer')
  );
  const lockRadius = hasAssistance ? 18 : 12;

  // Drifting Target Movement Loop
  useEffect(() => {
    if (isLocked) return;

    const interval = setInterval(() => {
      setTargetPos((prev) => {
        const angle = Date.now() * 0.001;
        const newX = 50 + Math.sin(angle * 1.2) * 35;
        const newY = 50 + Math.cos(angle * 0.8) * 30;
        return { x: Math.max(15, Math.min(85, newX)), y: Math.max(15, Math.min(85, newY)) };
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isLocked]);

  // Lock detection
  const dist = Math.hypot(crosshairPos.x - targetPos.x, crosshairPos.y - targetPos.y);
  const isInRange = dist <= lockRadius;

  useEffect(() => {
    if (isLocked) return;

    let interval: NodeJS.Timeout;
    if (isInRange) {
      interval = setInterval(() => {
        setLockDuration((prev) => {
          if (prev >= 100) {
            setIsLocked(true);
            if (onComplete) onComplete(30);
            return 100;
          }
          return prev + 14;
        });
      }, 100);
    } else {
      interval = setInterval(() => {
        setLockDuration((prev) => Math.max(0, prev - 10));
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isInRange, isLocked, onComplete]);

  // Countdown
  useEffect(() => {
    if (isLocked || timeRemaining <= 0) return;
    const t = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [isLocked, timeRemaining]);

  const handleViewportMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCrosshairPos({ x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
  };

  const handleSendAssist = () => {
    sendAssistancePing(isTr ? 'Bilimsel Spektrometre' : 'Science Spectrometer');
    setAssistSent(true);
    setTimeout(() => setAssistSent(false), 3000);
  };

  return (
    <div className={`border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {isTr ? 'GEZEGEN SPEKTROMETRE HEDEFLEME' : 'PLANETARY SPECTROMETER TARGET LOCK'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-slate-400">
            {isTr ? 'Pencere' : 'Aperture'}: <strong className="text-white tabular-nums">{timeRemaining}s</strong>
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
              isLocked
                ? 'bg-emerald-500 text-slate-950'
                : isInRange
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'border border-slate-700 text-slate-400'
            }`}
          >
            {isLocked ? (isTr ? 'VERİ TOPLANDI (+30P)' : 'HARVEST COMPLETE') : `${lockDuration}%`}
          </span>
        </div>
      </div>

      {/* Target Crosshair Canvas Viewport */}
      <div
        onMouseMove={handleViewportMove}
        className="relative h-44 border border-slate-800 rounded-xl overflow-hidden bg-[#080C14] cursor-crosshair select-none"
      >
        {/* Celestial Background Grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(56,189,248,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Drifting Planetary Crater / Volatile Anomaly Target */}
        <div
          className="absolute transition-transform duration-75 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
        >
          <div
            className={`rounded-full border border-dashed flex items-center justify-center transition-all ${
              isInRange ? 'border-emerald-400 scale-110 bg-emerald-500/10' : 'border-sky-400/60 bg-sky-500/5'
            }`}
            style={{ width: `${lockRadius * 4}px`, height: `${lockRadius * 4}px` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          </div>
          <span className="text-[8px] font-mono text-sky-300 uppercase absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap pt-1">
            {isTr ? 'SU BUZU KRATERİ' : 'HYDROGEN ANOMALY'}
          </span>
        </div>

        {/* Player Controlled Crosshair Reticle */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
          style={{ left: `${crosshairPos.x}%`, top: `${crosshairPos.y}%` }}
        >
          <Crosshair
            className={`w-7 h-7 ${
              isLocked
                ? 'text-emerald-400 scale-125'
                : isInRange
                ? 'text-emerald-400 animate-pulse'
                : 'text-white/80'
            }`}
          />
        </div>

        {/* Overlaid Target Lock Ring */}
        {isLocked && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center space-x-2 text-emerald-300 font-mono text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{isTr ? 'SPEKTRAL İZ TOPLANDI (+30 BİLİM PUANI)' : 'SPECTRUM SIGNATURE CAPTURED (+30 PTS)'}</span>
          </div>
        )}
      </div>

      {/* Progress & Controls */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 text-xs font-mono">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{isTr ? 'Optik Kilit İlerlemesi' : 'Sensor Aperture Integration'}:</span>
            <span className={isLocked ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{lockDuration}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${lockDuration >= 100 ? 'bg-emerald-400' : 'bg-sky-400'}`}
              style={{ width: `${lockDuration}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleSendAssist}
          disabled={assistSent || isLocked}
          className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-40"
        >
          <HelpCircle className="w-3 h-3 text-emerald-400" />
          <span>{assistSent ? (isTr ? 'İletildi!' : 'Transmitted!') : (isTr ? 'Tolerans Genişlet' : 'Widen Tolerance')}</span>
        </button>
      </div>
    </div>
  );
};
