import React from 'react';
import { Lock } from 'lucide-react';
import { useMissionStore, ADVANCED_TECH_COMPONENTS } from '../../store/missionStore';
import {
  getLocalizedScientificInstruments,
  getLocalizedScenarios,
} from '../../i18n/missionsLocale';
import { TRANSLATIONS } from '../../i18n/translations';

export const ScientistConsole: React.FC = () => {
  const {
    missionState,
    toggleInstrument,
    telemetry,
    locale,
    isMultiplayer,
    myPlayerInfo,
    players,
    activeRole,
    unlockedAdvancedComponents,
    clearanceRequests,
    requestTechClearance,
  } = useMissionStore();

  const isTr = locale === 'tr';
  const t = TRANSLATIONS[locale].scientist;

  const isScientist = !isMultiplayer || myPlayerInfo.role === 'scientist' || myPlayerInfo.secondaryRole === 'scientist' || activeRole === 'scientist';
  const assignedScientist = players.find((p) => p.role === 'scientist' || p.secondaryRole === 'scientist') || (activeRole === 'scientist' ? myPlayerInfo : undefined);

  const scenarios = getLocalizedScenarios(locale);
  const instruments = getLocalizedScientificInstruments(locale);

  const currentScenario = scenarios.find((s) => s.id === missionState.scenarioId) || scenarios[0];

  const targetScience = currentScenario.minScienceThreshold;
  const currentScience = telemetry.sciencePoints;
  const hasMetThreshold = currentScience >= targetScience;

  return (
    <div className="space-y-6">
      {/* Station Authority & Score Header */}
      <div className="border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3">
        {isMultiplayer && (
          <div className="p-2.5 border border-slate-800 rounded-2xl sm:rounded-full bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isScientist ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
              <span className="text-slate-400">
                {isTr ? 'İSTASYON YETKİLİSİ' : 'STATION AUTHORITY'}: <strong className="text-white">{assignedScientist ? assignedScientist.name : (isTr ? 'Atanmadı' : 'Uncrewed')}</strong>
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium w-fit ${isScientist ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'border border-slate-700 text-slate-400'}`}>
              {isScientist ? (isTr ? 'KONTROL SİZDE' : 'CONSOLE ACTIVE') : (isTr ? 'TELEMETRİ İZLEME' : 'READ-ONLY')}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              {t.pageHeading}
            </h2>
          </div>
        </div>

        {/* Minimal Score Progress Meter */}
        <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
          <div className="flex-1 bg-slate-800/80 h-[3px] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${hasMetThreshold ? 'bg-emerald-400' : 'bg-sky-400'}`}
              style={{ width: `${Math.min(100, (currentScience / targetScience) * 100)}%` }}
            />
          </div>
          <span className={`text-[10px] font-mono font-semibold tabular-nums ${hasMetThreshold ? 'text-emerald-400' : 'text-sky-400'}`}>
            {Math.min(100, Math.round((currentScience / targetScience) * 100))}%
          </span>
        </div>
      </div>

      {/* Instruments Selection Grid (Pruned, High-Density) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.gridTitle}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {instruments.length} {isTr ? 'Bilimsel Aygıt' : 'Payload Sensors'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {instruments.map((inst) => {
            const isInstalled = missionState.selectedInstrumentIds.includes(inst.id);
            const isAdvanced = ADVANCED_TECH_COMPONENTS.includes(inst.id);
            const isLocked = isMultiplayer && isAdvanced && !unlockedAdvancedComponents.includes(inst.id);
            const pendingReq = clearanceRequests.find((r) => r.componentId === inst.id && r.status === 'pending');

            return (
              <div
                key={inst.id}
                onClick={() => {
                  if (isLocked) {
                    if (!pendingReq) requestTechClearance(inst.id, inst.name, 'engineer');
                    return;
                  }
                  if (isScientist) toggleInstrument(inst.id);
                }}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isScientist
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isLocked
                    ? 'border-amber-500/30 bg-[#0E1422] opacity-90 cursor-pointer'
                    : isInstalled
                    ? 'cursor-pointer border-sky-400/80 bg-[#111827] shadow-sm'
                    : 'cursor-pointer border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                        {inst.category}
                      </span>
                      <h4 className="font-display font-bold text-sm text-white mt-0.5">
                        {inst.name}
                      </h4>
                      {isLocked && (
                        <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block mt-0.5">
                          {isTr ? 'GÜVENLİK YETKİSİ GEREKLİ' : 'CLEARANCE REQUIRED'}
                        </span>
                      )}
                    </div>

                    {isLocked ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{pendingReq ? (isTr ? 'BEKLENİYOR' : 'PENDING') : (isTr ? 'YETKİ İSTE' : 'REQUEST AUTH')}</span>
                      </span>
                    ) : isInstalled ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-950">
                        {t.active}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700/60 text-slate-400 hover:text-white">
                        {t.off}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1 font-mono text-xs tabular-nums">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.scienceVal}:</span>
                    <strong className="text-emerald-400 font-semibold">+{inst.scienceValue} {t.pts}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.powerDraw}:</span>
                    <span className="text-white">{inst.powerDrawW} W</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.mass}:</span>
                    <span className="text-white">{inst.massKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.price}:</span>
                    <strong className="text-white">${inst.costM}M</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
