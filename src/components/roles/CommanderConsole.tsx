import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import {
  getLocalizedScenarios,
  getLocalizedLaunchVehicles,
  getLocalizedOrbitProfiles,
} from '../../i18n/missionsLocale';
import { TRANSLATIONS } from '../../i18n/translations';

export const CommanderConsole: React.FC = () => {
  const {
    missionState,
    updateMissionState,
    telemetry,
    locale,
    isMultiplayer,
    myPlayerInfo,
    players,
    activeRole,
  } = useMissionStore();

  const isTr = locale === 'tr';
  const t = TRANSLATIONS[locale].commander;

  const isCommander = !isMultiplayer || myPlayerInfo.role === 'commander' || myPlayerInfo.secondaryRole === 'commander' || activeRole === 'commander';
  const assignedCommander = players.find((p) => p.role === 'commander' || p.secondaryRole === 'commander') || (activeRole === 'commander' ? myPlayerInfo : undefined);

  const scenarios = getLocalizedScenarios(locale);
  const vehicles = getLocalizedLaunchVehicles(locale);
  const orbits = getLocalizedOrbitProfiles(locale);

  const currentScenario = scenarios.find((s) => s.id === missionState.scenarioId) || scenarios[0];

  return (
    <div className="space-y-6">
      {/* Station Authority & High-Level Mission Specs */}
      <div className="border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3">
        {isMultiplayer && (
          <div className="p-2.5 border border-slate-800 rounded-2xl sm:rounded-full bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isCommander ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
              <span className="text-slate-400">
                {isTr ? 'İSTASYON YETKİLİSİ' : 'STATION AUTHORITY'}: <strong className="text-white">{assignedCommander ? assignedCommander.name : (isTr ? 'Atanmadı' : 'Uncrewed')}</strong>
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium w-fit ${isCommander ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'border border-slate-700 text-slate-400'}`}>
              {isCommander ? (isTr ? 'KONTROL SİZDE' : 'CONSOLE ACTIVE') : (isTr ? 'TELEMETRİ İZLEME' : 'READ-ONLY')}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              {currentScenario.name}
            </h2>
          </div>
        </div>
      </div>

      {/* Step 1: Orbit Selection (Pruned, High-Density) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.step1Title}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {orbits.map((orbit) => {
            const isSelected = missionState.orbitId === orbit.id;

            return (
              <div
                key={orbit.id}
                onClick={() => isCommander && updateMissionState({ orbitId: orbit.id })}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isCommander
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isSelected
                    ? 'cursor-pointer border-sky-400/80 bg-[#111827] shadow-sm'
                    : 'cursor-pointer border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-display font-bold text-sm text-white">
                      {orbit.name}
                    </h4>
                    {isSelected ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-950">
                        {t.selectedBadge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700/60 text-slate-400 hover:text-white">
                        {isTr ? 'SEÇ' : 'SELECT'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px] font-mono tabular-nums">
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t.altitude}:</span>
                    <strong className="text-white">{orbit.altitudeKm} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t.inclination}:</span>
                    <strong className="text-white">{orbit.inclinationDeg}°</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t.deltaVReqLabel}:</span>
                    <strong className="text-white">{orbit.deltaVRequiredMps.toLocaleString()} m/s</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t.sunlight}:</span>
                    <strong className="text-white">{orbit.sunlightExposurePercent}%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Launch Vehicle Selection (Pruned, High-Density) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.step2Title}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {vehicles.map((rocket) => {
            const isSelected = missionState.launchVehicleId === rocket.id;
            const canLift = telemetry.totalMassKg <= rocket.maxPayloadKg;

            return (
              <div
                key={rocket.id}
                onClick={() => isCommander && updateMissionState({ launchVehicleId: rocket.id })}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isCommander
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isSelected
                    ? 'cursor-pointer border-sky-400/80 bg-[#111827] shadow-sm'
                    : 'cursor-pointer border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                        {rocket.manufacturer}
                      </span>
                      <h4 className="font-display font-bold text-sm text-white mt-0.5">
                        {rocket.name}
                      </h4>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-950">
                        {t.selectedBadge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700/60 text-slate-400 hover:text-white">
                        {isTr ? 'SEÇ' : 'SELECT'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1 font-mono text-xs tabular-nums">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.launchCost}:</span>
                    <strong className="text-white">${rocket.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.payloadCap}:</span>
                    <strong className={canLift ? 'text-white' : 'text-rose-400 font-semibold'}>
                      {rocket.maxPayloadKg.toLocaleString()} kg
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.deltaVBonus}:</span>
                    <span className="text-white">+{rocket.maxDeltaVBonus} m/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.reliability}:</span>
                    <span className="text-emerald-400 font-medium">{rocket.reliability}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official NASA & Challenge Citation Banner */}
      <div className="p-4 border border-sky-500/30 rounded-2xl bg-[#080C14] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-sky-400 uppercase">
              {isTr ? 'NASA GÖREV & YARIŞMA KAYNAĞI NOTU' : 'OFFICIAL NASA & CHALLENGE DIRECTIVE'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-sky-500/10 border border-sky-500/30 text-sky-300">
            {isTr ? 'Yarışma Kaynağı 2: NASA Mission-Viz' : 'Challenge Source 2: NASA Mission-Viz'}
          </span>
        </div>
        <p className="text-xs font-mono text-slate-300 leading-relaxed">
          {isTr
            ? 'Bu istasyondaki yörünge transfer yayları, yer istasyonu (DSN) görüş konileri ve fırlatma kriterleri NASA Mission-Viz 3D Yörünge Simülatörü ile JPL CML-4 sistem olgunluk matrisine göre hesaplanmaktadır.'
            : 'Orbital transfer arcs, DSN line-of-sight visibility cones, and launch criteria are based on NASA Mission-Viz 3D tools and JPL CML-4 maturity guidelines.'}
        </p>
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
          <span className="text-slate-400">
            {isTr ? 'Referans Doküman: NASA GSFC Mission Design Lab (MDL)' : 'Reference: NASA GSFC Mission Design Lab (MDL)'}
          </span>
          <a
            href="https://nasa.github.io/mission-viz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline inline-flex items-center space-x-1"
          >
            <span>nasa.github.io/mission-viz</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
