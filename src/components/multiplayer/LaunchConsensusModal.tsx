import React from 'react';
import { Rocket, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

export const LaunchConsensusModal: React.FC = () => {
  const {
    launchPoll,
    voteLaunchConsensus,
    dismissLaunchPoll,
    players,
    myPlayerInfo,
    locale,
  } = useMissionStore();

  if (!launchPoll) return null;

  const isTr = locale === 'tr';
  const myVote = launchPoll.votes[myPlayerInfo.peerId];
  const hasVoted = myVote !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0E1422] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B0F17]">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <Rocket className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-white">
              {isTr ? 'FIRLATMA YETKİLENDİRMESİ // ALL STATIONS GO' : 'LAUNCH CONSENSUS // ALL STATIONS GO'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 border border-slate-700/60 px-2.5 py-0.5 rounded-full">
            {launchPoll.status === 'voting'
              ? (isTr ? 'OYLANIYOR' : 'VOTING')
              : launchPoll.status === 'approved'
              ? (isTr ? 'ONAYLANDI' : 'APPROVED')
              : (isTr ? 'İPTAL' : 'ABORTED')}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <p className="text-slate-300 text-xs leading-relaxed">
            {isTr
              ? `${launchPoll.initiatedByName} uçuş simülasyonunu başlatmak istiyor. Simülasyonun devreye girmesi için tüm mürettebat istasyonlarının GO onayı vermesi şarttır.`
              : `${launchPoll.initiatedByName} initiated the launch sequence. All crew duty stations must confirm GO before flight ignition.`}
          </p>

          {/* Station Readiness Status Roster */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 bg-[#080C14]">
            {players.map((player) => {
              const vote = launchPoll.votes[player.peerId];
              const isMe = player.peerId === myPlayerInfo.peerId;

              return (
                <div
                  key={player.peerId}
                  className="px-4 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color || '#38bdf8' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-bold text-white text-xs truncate">
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="text-[9px] text-sky-400">
                            ({isTr ? 'Siz' : 'You'})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase block truncate">
                        {player.role}
                        {player.secondaryRole ? ` + ${player.secondaryRole}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {vote === 'go' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>GO</span>
                      </span>
                    ) : vote === 'abort' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>NO-GO</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{isTr ? 'BEKLİYOR' : 'PENDING'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Feedback Notice */}
          {launchPoll.status === 'aborted' && (
            <div className="p-3 border border-rose-500/40 rounded-2xl bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                {isTr
                  ? 'Fırlatma iptal edildi. Mürettebat hazır olana kadar sistem tasarım köprüsünde kalınacak.'
                  : 'Launch aborted. Mission hold active until all crew members are ready.'}
              </span>
            </div>
          )}

          {launchPoll.status === 'approved' && (
            <div className="p-3 border border-emerald-500/40 rounded-2xl bg-emerald-500/10 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {isTr
                  ? 'Tüm istasyonlar GO verdi! Ortak fırlatma geri sayımı başlıyor...'
                  : 'All stations confirmed GO! Engaging simultaneous launch countdown...'}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-[#0B0F17] flex flex-col sm:flex-row items-center justify-between gap-3">
          {launchPoll.status === 'voting' ? (
            !hasVoted ? (
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  onClick={() => voteLaunchConsensus('go')}
                  className="py-2.5 px-4 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isTr ? 'FIRLATMAYA ONAY VER (GO)' : 'CONFIRM GO-FOR-LAUNCH'}</span>
                </button>
                <button
                  onClick={() => voteLaunchConsensus('abort')}
                  className="py-2.5 px-4 rounded-full border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isTr ? 'BEKLET (NO-GO)' : 'HOLD / ABORT'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-slate-400 text-xs">
                <span>
                  {isTr
                    ? 'İstasyon onayınız (GO) iletildi. Diğer üyelerin onayı bekleniyor...'
                    : 'Your station confirmation (GO) registered. Awaiting teammates...'}
                </span>
                <button
                  onClick={() => voteLaunchConsensus('abort')}
                  className="text-rose-400 hover:underline text-[11px] ml-auto cursor-pointer"
                >
                  {isTr ? 'Kararı İptal Et' : 'Change to No-Go'}
                </button>
              </div>
            )
          ) : (
            <button
              onClick={dismissLaunchPoll}
              className="w-full py-2 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-xs cursor-pointer"
            >
              {isTr ? 'Pencereyi Kapat' : 'Close Window'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
