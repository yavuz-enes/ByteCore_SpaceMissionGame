import React, { useState, useEffect, useRef } from 'react';
import { Radio, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

interface DsnFrequencyMiniGameProps {
  onComplete?: () => void;
  className?: string;
}

export const DsnFrequencyMiniGame: React.FC<DsnFrequencyMiniGameProps> = ({
  onComplete,
  className = '',
}) => {
  const { locale, sendAssistancePing, activeAssistancePings } = useMissionStore();
  const isTr = locale === 'tr';

  // Target carrier parameters
  const [targetFreq] = useState(8.42); // GHz
  const [targetAmp] = useState(1.2);

  // User carrier sliders
  const [userFreq, setUserFreq] = useState(7.6);
  const [userAmp, setUserAmp] = useState(0.5);

  const [lockProgress, setLockProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [assistSent, setAssistSent] = useState(false);

  // Assistance tolerance bonus
  const hasTeammateAssistance = activeAssistancePings.some(
    (p) => p.stationName.includes('DSN') || p.stationName.includes('İletişim')
  );

  const tolerance = hasTeammateAssistance ? 0.22 : 0.12;
  const freqDiff = Math.abs(userFreq - targetFreq);
  const ampDiff = Math.abs(userAmp - targetAmp);
  const alignmentPercent = Math.max(
    0,
    Math.min(100, Math.round(100 - (freqDiff * 65 + ampDiff * 35)))
  );

  const isAligned = freqDiff <= tolerance && ampDiff <= tolerance * 2;

  // Phase Lock Accumulator
  useEffect(() => {
    if (isLocked) return;

    let interval: NodeJS.Timeout;
    if (isAligned) {
      interval = setInterval(() => {
        setLockProgress((prev) => {
          if (prev >= 100) {
            setIsLocked(true);
            if (onComplete) onComplete();
            return 100;
          }
          return prev + 12;
        });
      }, 100);
    } else {
      interval = setInterval(() => {
        setLockProgress((prev) => Math.max(0, prev - 8));
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isAligned, isLocked, onComplete]);

  // Canvas Oscilloscope Animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;

      ctx.fillStyle = '#080C14';
      ctx.fillRect(0, 0, w, h);

      // Subtle Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Target Reference Wave (Emerald dashed)
      ctx.strokeStyle = isLocked ? '#10B981' : 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = mid + Math.sin(x * 0.04 * targetFreq + t) * (targetAmp * 24);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // User Tuned Carrier Wave (Sky solid)
      ctx.strokeStyle = isLocked ? '#10B981' : '#38BDF8';
      ctx.lineWidth = isLocked ? 3 : 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = mid + Math.sin(x * 0.04 * userFreq + t) * (userAmp * 24);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [userFreq, userAmp, targetFreq, targetAmp, isLocked]);

  const handleSendAssist = () => {
    sendAssistancePing(isTr ? 'DSN Frekans Kilidi' : 'DSN Carrier Lock');
    setAssistSent(true);
    setTimeout(() => setAssistSent(false), 3000);
  };

  return (
    <div className={`border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {isTr ? 'DSN TAŞIYICI FREKANS KİLİDİ' : 'DSN CARRIER FREQUENCY ALIGNMENT'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasTeammateAssistance && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {isTr ? 'EKİP DESTEĞİ AKTİF' : 'CREW ASSISTED'}
            </span>
          )}
          <span
            className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
              isLocked
                ? 'bg-emerald-500 text-slate-950'
                : isAligned
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'border border-slate-700 text-slate-400'
            }`}
          >
            {isLocked ? (isTr ? 'FAZ KİLİTLENDİ' : 'LOCKED (100%)') : `${alignmentPercent}% SYNC`}
          </span>
        </div>
      </div>

      {/* Oscilloscope Viewport */}
      <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-[#080C14]">
        {/* Subtle Frequency Waveform Watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15 bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url('/flight-kit/hud-frequency-wave.svg')` }}
        />
        <canvas ref={canvasRef} width={480} height={130} className="w-full h-32 block relative z-10" />

        {/* HUD Overlay Labels */}
        <div className="absolute top-2 left-2 flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-0.5 bg-emerald-400 inline-block" />
            <span>{isTr ? 'HEDEF DSN TAŞIYICI' : 'DSN TARGET'}</span>
          </span>
          <span className="flex items-center space-x-1 text-sky-400">
            <span className="w-2 h-0.5 bg-sky-400 inline-block" />
            <span>{isTr ? 'GÖVDE ANTENİ' : 'LOCAL CARRIER'}</span>
          </span>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center space-x-2 text-emerald-300 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isTr ? 'BANT GENİŞLİĞİ KİLİTLENDİ (+500 kbps)' : 'CARRIER LOCK ACQUIRED (+500 kbps)'}</span>
          </div>
        )}
      </div>

      {/* Tuning Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>{isTr ? 'Frekans (GHz)' : 'Frequency (GHz)'}:</span>
            <strong className="text-white tabular-nums">{userFreq.toFixed(2)} GHz</strong>
          </div>
          <input
            type="range"
            min="6.5"
            max="10.5"
            step="0.02"
            value={userFreq}
            disabled={isLocked}
            onChange={(e) => setUserFreq(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>{isTr ? 'Sinyal Kazancı (Gain)' : 'RF Amplitude Gain'}:</span>
            <strong className="text-white tabular-nums">{userAmp.toFixed(2)}x</strong>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.2"
            step="0.05"
            value={userAmp}
            disabled={isLocked}
            onChange={(e) => setUserAmp(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Lock Progress Meter & Ping */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 text-xs font-mono">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{isTr ? 'Faz Kilidi Tutarlılığı' : 'Phase Lock Stability'}:</span>
            <span className={lockProgress >= 100 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {lockProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${lockProgress >= 100 ? 'bg-emerald-400' : 'bg-sky-400'}`}
              style={{ width: `${lockProgress}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleSendAssist}
          disabled={assistSent || isLocked}
          className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-40"
        >
          <HelpCircle className="w-3 h-3 text-sky-400" />
          <span>{assistSent ? (isTr ? 'Sinyal Gönderildi!' : 'Ping Transmitted!') : (isTr ? 'Yardım İste' : 'Request Assist')}</span>
        </button>
      </div>
    </div>
  );
};
