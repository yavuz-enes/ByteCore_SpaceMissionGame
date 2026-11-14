import React from 'react';
import { Sparkles } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { PlayerRole } from '../../types/mission';
import { TRANSLATIONS } from '../../i18n/translations';

const ROLE_AVATARS: Record<PlayerRole, string> = {
  commander: './flight-kit/avatar-commander.png',
  engineer: './flight-kit/avatar-engineer.png',
  scientist: './flight-kit/avatar-scientist.png',
  comms: './flight-kit/avatar-comms.png',
};

export const RoleNavigation: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    isMultiplayer,
    myPlayerInfo,
    players,
    locale,
    optimizeWithAI,
  } = useMissionStore();

  const t = TRANSLATIONS[locale].roles;
  const isTr = locale === 'tr';

  const roleList: { id: PlayerRole; label: string }[] = [
    { id: 'commander', label: t.commander.name },
    { id: 'engineer', label: t.engineer.name },
    { id: 'scientist', label: t.scientist.name },
    { id: 'comms', label: t.comms.name },
  ];

  return (
    <div className="relative z-10 w-full max-w-full overflow-hidden bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 md:px-8 py-2 sm:py-2.5">
      <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0">
        {isMultiplayer ? (
          /* Dual-Station Cooperative Station Switcher (2-Player / Multi-Role Capable) */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
            {/* Left: Station Switcher Pills for Player's Primary & Secondary Stations */}
            <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar py-0.5 min-w-0">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                {isTr ? 'KONSOL:' : 'CONSOLE:'}
              </span>

              {roleList.map((role) => {
                const isPrimary = myPlayerInfo.role === role.id;
                const isSecondary = myPlayerInfo.secondaryRole === role.id;
                const isMyStation = isPrimary || isSecondary;
                const assignedPlayer = players.find(
                  (p) => p.role === role.id || p.secondaryRole === role.id
                );
                const isUncrewed = !assignedPlayer;
                const isActive = activeRole === role.id;
                const canSwitch = isMyStation || isUncrewed;

                return (
                  <button
                    key={role.id}
                    disabled={!canSwitch}
                    onClick={() => {
                      if (canSwitch) {
                        setActiveRole(role.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-sm cursor-pointer'
                        : canSwitch
                        ? 'border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-500 cursor-pointer'
                        : 'border border-slate-800/60 bg-slate-900/30 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <img
                      src={ROLE_AVATARS[role.id]}
                      alt={role.label}
                      className="w-4 h-4 rounded-full object-cover border border-white/20 shrink-0"
                    />
                    <span>{role.label}</span>
                    {isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono">
                        {isTr ? '1. Görev' : 'Primary'}
                      </span>
                    )}
                    {isSecondary && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-purple-300 font-mono">
                        {isTr ? '2. Görev' : 'Secondary'}
                      </span>
                    )}
                    {!isMyStation && assignedPlayer && (
                      <span className="text-[9px] text-slate-500 truncate max-w-[70px]">
                        ({assignedPlayer.name})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: AI Flight Assistant & Team Status */}
            <div className="flex items-center space-x-2 text-xs font-mono w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <button
                onClick={optimizeWithAI}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm group shrink-0"
                title={
                  isTr
                    ? 'Yapay zeka tüm alt sistemleri analiz edip uçuşa hazır hale getirir'
                    : 'AI analyzes and optimizes all subsystems for nominal flight'
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
                <span>{isTr ? 'YAPAY ZEKA ASİSTANI' : 'AI FLIGHT ASSISTANT'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Solo Commander: Free Console Switcher + AI Assistant */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {roleList.map((role) => {
                const isActive = activeRole === role.id;

                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'border border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-900/60'
                    }`}
                  >
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={optimizeWithAI}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm group shrink-0"
                title={
                  isTr
                    ? 'Yapay zeka tüm alt sistemleri analiz edip uçuşa hazır hale getirir'
                    : 'AI analyzes and optimizes all subsystems for nominal flight'
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
                <span>{isTr ? 'YAPAY ZEKA ASİSTANI' : 'AI FLIGHT ASSISTANT'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
