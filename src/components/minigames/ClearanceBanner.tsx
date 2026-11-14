import React from 'react';
import { Lock, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

export const ClearanceBanner: React.FC = () => {
  const { clearanceRequests, respondTechClearance, myPlayerInfo, isMultiplayer, locale } =
    useMissionStore();
  const isTr = locale === 'tr';

  if (!isMultiplayer) return null;

  // Filter pending requests for this player or commander
  const pendingRequests = clearanceRequests.filter(
    (r) =>
      r.status === 'pending' &&
      r.requestedByRole !== myPlayerInfo.role && // Don't approve own request
      (
        r.targetRole === myPlayerInfo.role ||
        r.targetRole === myPlayerInfo.secondaryRole ||
        myPlayerInfo.role === 'commander' ||
        myPlayerInfo.secondaryRole === 'commander' ||
        r.targetRole === 'commander'
      )
  );

  if (pendingRequests.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {pendingRequests.map((req) => (
        <div
          key={req.id}
          className="p-3.5 border border-sky-400/40 rounded-2xl bg-[#0E1422] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
        >
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
            <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-white font-semibold">
                {isTr ? 'GÜVENLİK YETKİ TALEBİ:' : 'TECH CLEARANCE REQUEST:'}{' '}
                <strong className="text-sky-300">{req.componentName}</strong>
              </span>
              <span className="text-slate-400 block text-[11px]">
                {isTr ? 'Talep Eden:' : 'Requested by:'}{' '}
                <strong className="text-white">{req.requestedByName}</strong> ({req.requestedByRole.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => respondTechClearance(req.id, true)}
              className="px-3.5 py-1.5 rounded-full bg-white text-slate-950 font-semibold text-[11px] hover:bg-slate-100 transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTr ? 'Yetkilendir (Onayla)' : 'Authorize Unlock'}</span>
            </button>
            <button
              onClick={() => respondTechClearance(req.id, false)}
              className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isTr ? 'Reddet' : 'Deny'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
