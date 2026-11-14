import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

interface PowerGridMiniGameProps {
  onComplete?: () => void;
  className?: string;
}

export const PowerGridMiniGame: React.FC<PowerGridMiniGameProps> = ({
  onComplete,
  className = '',
}) => {
  const { locale, sendAssistancePing, activeAssistancePings } = useMissionStore();
  const isTr = locale === 'tr';

  // Available Power Limit during Eclipse / Surge
  const totalAvailableWattage = 360;

  // Channels
  const [thermalHeaters, setThermalHeaters] = useState(130);
  const [avionics, setAvionics] = useState(140);
  const [thrusterIgniters, setThrusterIgniters] = useState(130);

  const [isBalanced, setIsBalanced] = useState(false);
  const [assistSent, setAssistSent] = useState(false);

  const totalConsumed = thermalHeaters + avionics + thrusterIgniters;
  const netSurplus = totalAvailableWattage - totalConsumed;

  // Safe parameters
  const heaterSafe = thermalHeaters >= 80 && thermalHeaters <= 125;
  const avionicsSafe = avionics >= 85 && avionics <= 125;
  const thrustersSafe = thrusterIgniters >= 90 && thrusterIgniters <= 135;
  const withinBusLimit = netSurplus >= 0;

  const allNominal = heaterSafe && avionicsSafe && thrustersSafe && withinBusLimit;

  useEffect(() => {
    if (allNominal && !isBalanced) {
      const timer = setTimeout(() => {
        setIsBalanced(true);
        if (onComplete) onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [allNominal, isBalanced, onComplete]);

  const handleSendAssist = () => {
    sendAssistancePing(isTr ? 'EPS Güç Dağıtım Panosu' : 'EPS Power Bus');
    setAssistSent(true);
    setTimeout(() => setAssistSent(false), 3000);
  };

  const handleQuickOptimize = () => {
    setThermalHeaters(105);
    setAvionics(110);
    setThrusterIgniters(120);
  };

  return (
    <div className={`border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {isTr ? 'EPS GÜÇ HATTI DAĞITIM PANOSU' : 'EPS POWER DISTRIBUTION BUS'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
              isBalanced
                ? 'bg-emerald-500 text-slate-950'
                : withinBusLimit
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isBalanced
              ? (isTr ? 'HAT DENGELENDİ' : 'BUS STABLE')
              : withinBusLimit
              ? (isTr ? 'GÜÇ YETERLİ' : 'WITHIN CAPACITY')
              : (isTr ? 'AŞIRI YÜK (TRIP)' : 'OVERLOAD TRIP')}
          </span>
        </div>
      </div>

      {/* Main Bus Capacity Meter */}
      <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14] space-y-1.5 font-mono text-xs">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">{isTr ? 'Hat Tüketimi / Azami Kapasite' : 'Bus Load / Max Generation'}:</span>
          <span className="tabular-nums">
            <strong className={withinBusLimit ? 'text-white' : 'text-rose-400 font-bold'}>{totalConsumed}W</strong>
            <span className="text-slate-500"> / {totalAvailableWattage}W</span>
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              totalConsumed > totalAvailableWattage
                ? 'bg-rose-500'
                : allNominal
                ? 'bg-emerald-400'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, (totalConsumed / totalAvailableWattage) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
          <span>{isTr ? 'Şebeke Marjı' : 'Net Power Margin'}:</span>
          <span className={`tabular-nums font-semibold ${netSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netSurplus >= 0 ? `+${netSurplus}W` : `${netSurplus}W`}
          </span>
        </div>
      </div>

      {/* Channels Sliders */}
      <div className="space-y-2.5 font-mono text-xs">
        {/* Channel 1: Thermal Heaters */}
        <div className="p-2.5 border border-slate-800/80 rounded-xl bg-[#0B0F17] space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">{isTr ? '1. Termal Isıtıcı Battaniyeler' : '1. Thermal Survival Heaters'}:</span>
            <span className={`tabular-nums font-semibold ${heaterSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {thermalHeaters}W {heaterSafe ? '✓' : '(80-125W)'}
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="180"
            step="5"
            value={thermalHeaters}
            disabled={isBalanced}
            onChange={(e) => setThermalHeaters(parseInt(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Channel 2: Avionics & Guidance */}
        <div className="p-2.5 border border-slate-800/80 rounded-xl bg-[#0B0F17] space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">{isTr ? '2. Aviyonik ve Yıldız Takipçiler' : '2. Avionics & Guidance'}:</span>
            <span className={`tabular-nums font-semibold ${avionicsSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {avionics}W {avionicsSafe ? '✓' : '(85-125W)'}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            step="5"
            value={avionics}
            disabled={isBalanced}
            onChange={(e) => setAvionics(parseInt(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Channel 3: Thruster Solenoids */}
        <div className="p-2.5 border border-slate-800/80 rounded-xl bg-[#0B0F17] space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">{isTr ? '3. İtki Valf ve Ateşleyiciler' : '3. Thruster Solenoid Igniters'}:</span>
            <span className={`tabular-nums font-semibold ${thrustersSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {thrusterIgniters}W {thrustersSafe ? '✓' : '(90-135W)'}
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            step="5"
            value={thrusterIgniters}
            disabled={isBalanced}
            onChange={(e) => setThrusterIgniters(parseInt(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 font-mono text-xs">
        <button
          onClick={handleQuickOptimize}
          disabled={isBalanced}
          className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-semibold transition-all cursor-pointer"
        >
          {isTr ? 'Dengeleme Önayarı' : 'Auto-Balance Preset'}
        </button>

        <button
          onClick={handleSendAssist}
          disabled={assistSent || isBalanced}
          className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-semibold flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-40"
        >
          <HelpCircle className="w-3 h-3 text-amber-400" />
          <span>{assistSent ? (isTr ? 'Sinyal İletildi!' : 'Ping Sent!') : (isTr ? 'Yardım İste' : 'Request Assist')}</span>
        </button>
      </div>
    </div>
  );
};
