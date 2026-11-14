import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

export const AssistanceNotification: React.FC = () => {
  const { activeAssistancePings, dismissAssistancePing, myPlayerInfo, locale } = useMissionStore();
  const isTr = locale === 'tr';

  // Only show pings from teammates, not own pings
  const teammatePings = activeAssistancePings.filter(
    (p) => p.senderRole !== myPlayerInfo.role
  );

  if (teammatePings.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm">
      {teammatePings.map((ping) => (
        <div
          key={ping.id}
          className="p-3.5 border border-amber-500/40 rounded-2xl bg-[#0E1422] shadow-xl text-xs font-mono space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white font-semibold">
                {isTr ? 'EKİP DESTEK ÇAĞRISI' : 'TEAMMATE ASSIST REQUEST'}
              </span>
            </div>
            <button
              onClick={() => dismissAssistancePing(ping.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-white">{ping.senderName}</strong> ({ping.senderRole.toUpperCase()}){' '}
            {isTr
              ? `${ping.stationName} görevinde tolerans/zamanlama desteği talep ediyor!`
              : `requested assistance on ${ping.stationName}!`}
          </p>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => dismissAssistancePing(ping.id)}
              className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] hover:bg-amber-300 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>{isTr ? 'Destek Sağlandı (+Tolerans)' : 'Assist Granted (+Tolerance)'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
