import React, { useState, useEffect } from 'react';
import { Navigation, CheckCircle2, Flame, HelpCircle } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

interface GimbalTrimMiniGameProps {
  onComplete?: () => void;
  className?: string;
}

export const GimbalTrimMiniGame: React.FC<GimbalTrimMiniGameProps> = ({
  onComplete,
  className = '',
}) => {
  const { locale, sendAssistancePing, activeAssistancePings } = useMissionStore();
  const isTr = locale === 'tr';

  // Gimbal Pitch & Yaw Trim Angles (-10° to +10°)
  const [pitch, setPitch] = useState(4.2);
  const [yaw, setYaw] = useState(-3.5);

  const [trimStability, setTrimStability] = useState(0); // 0 - 100%
  const [isTrimmed, setIsTrimmed] = useState(false);
  const [assistSent, setAssistSent] = useState(false);

  // Assistance expands tolerance
  const hasAssistance = activeAssistancePings.some(
    (p) => p.stationName.includes('Gimbal') || p.stationName.includes('Vektör')
  );
  const tolerance = hasAssistance ? 2.5 : 1.4;

  const inEnvelope = Math.abs(pitch) <= tolerance && Math.abs(yaw) <= tolerance;

  // Stability Accumulator
  useEffect(() => {
    if (isTrimmed) return;

    let interval: NodeJS.Timeout;
    if (inEnvelope) {
      interval = setInterval(() => {
        setTrimStability((prev) => {
          if (prev >= 100) {
            setIsTrimmed(true);
            if (onComplete) onComplete();
            return 100;
          }
          return prev + 15;
        });
      }, 100);
    } else {
      interval = setInterval(() => {
        setTrimStability((prev) => Math.max(0, prev - 12));
      }, 100);
    }

    return () => clearInterval(interval);
  }, [inEnvelope, isTrimmed, onComplete]);

  const handleSendAssist = () => {
    sendAssistancePing(isTr ? 'İtki Gimbal Vektörü' : 'Thrust Gimbal Vector');
    setAssistSent(true);
    setTimeout(() => setAssistSent(false), 3000);
  };

  const handleCenterTrim = () => {
    setPitch(0.2);
    setYaw(-0.1);
  };

  return (
    <div className={`border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {isTr ? 'İTKİ GİMBAL VEKTÖR TRİMİ' : 'THRUST GIMBAL VECTOR TRIM'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
              isTrimmed
                ? 'bg-emerald-500 text-slate-950'
                : inEnvelope
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'border border-slate-700 text-slate-400'
            }`}
          >
            {isTrimmed
              ? (isTr ? 'VEKTÖR KİLİTLENDİ' : 'VECTOR LOCKED')
              : inEnvelope
              ? (isTr ? 'HEDEF MERKEZDE' : 'IN TOLERANCE')
              : (isTr ? 'VEKTÖR SAPIYOR' : 'OFF NOMINAL')}
          </span>
        </div>
      </div>

      {/* 2D Gimbal Attitude Radar */}
      <div className="relative h-40 border border-slate-800 rounded-xl overflow-hidden bg-[#080C14] flex items-center justify-center">
        {/* Navball Attitude Backdrop Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <img
            src="./flight-kit/hud-navball.png"
            alt="Attitude Navball"
            className="w-28 h-28 object-contain"
          />
        </div>

        {/* Reticle Crosshairs */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 pointer-events-none" />

        {/* Center Target Bullseye Circle */}
        <div
          className={`rounded-full border border-dashed transition-all flex items-center justify-center ${
            inEnvelope ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700'
          }`}
          style={{ width: `${tolerance * 26}px`, height: `${tolerance * 26}px` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Thrust Vector Marker */}
        <div
          className="absolute transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${50 + (yaw / 10) * 42}%`,
            top: `${50 + (pitch / 10) * 42}%`,
          }}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isTrimmed
                ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                : inEnvelope
                ? 'border-emerald-400 text-emerald-400 animate-pulse'
                : 'border-sky-400 text-sky-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>

        {isTrimmed && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center space-x-2 text-emerald-300 font-mono text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{isTr ? 'YÖRÜNGE TRİMİ KİLİTLENDİ (+%10 Δv VERİMİ)' : 'THRUST VECTOR NOMINAL (+10% Δv MARGIN)'}</span>
          </div>
        )}
      </div>

      {/* Pitch & Yaw Trimmers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>{isTr ? 'Yunuslama (Pitch)' : 'Pitch Trim'}:</span>
            <strong className={`tabular-nums ${Math.abs(pitch) <= tolerance ? 'text-emerald-400' : 'text-white'}`}>
              {pitch > 0 ? `+${pitch.toFixed(1)}°` : `${pitch.toFixed(1)}°`}
            </strong>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.2"
            value={pitch}
            disabled={isTrimmed}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>{isTr ? 'Sapma (Yaw)' : 'Yaw Trim'}:</span>
            <strong className={`tabular-nums ${Math.abs(yaw) <= tolerance ? 'text-emerald-400' : 'text-white'}`}>
              {yaw > 0 ? `+${yaw.toFixed(1)}°` : `${yaw.toFixed(1)}°`}
            </strong>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.2"
            value={yaw}
            disabled={isTrimmed}
            onChange={(e) => setYaw(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Stability & Controls */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 text-xs font-mono">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{isTr ? 'Trim Kararlılığı' : 'Thrust Vector Hold'}:</span>
            <span className={isTrimmed ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{trimStability}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${trimStability >= 100 ? 'bg-emerald-400' : 'bg-sky-400'}`}
              style={{ width: `${trimStability}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCenterTrim}
            disabled={isTrimmed}
            className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-semibold transition-all cursor-pointer"
          >
            {isTr ? 'Sıfırla' : 'Center Trim'}
          </button>
          <button
            onClick={handleSendAssist}
            disabled={assistSent || isTrimmed}
            className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-semibold flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-40"
          >
            <HelpCircle className="w-3 h-3 text-sky-400" />
            <span>{assistSent ? (isTr ? 'İletildi!' : 'Sent!') : (isTr ? 'Yardım İste' : 'Request Assist')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
