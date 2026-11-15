import React from 'react';
import { Lock, ShieldCheck, ExternalLink } from 'lucide-react';
import { useMissionStore, ADVANCED_TECH_COMPONENTS } from '../../store/missionStore';
import {
  getLocalizedSpacecraftBuses,
  getLocalizedPropulsionSystems,
  getLocalizedPowerSystems,
  getLocalizedBatterySystems,
} from '../../i18n/missionsLocale';
import { TRANSLATIONS } from '../../i18n/translations';

const PROPULSION_ARTWORK: Record<string, string> = {
  'prop-coldgas': './flight-kit/prop-cold-gas.webp',
  'prop-monoprop': './flight-kit/prop-hall-hermes.webp',
  'prop-biprop': './flight-kit/prop-chemical-biprop.webp',
  'prop-ion': './flight-kit/prop-ion-nextc.webp',
  'prop-nuclear': './flight-kit/prop-nuclear-ntp.webp',
};

const POWER_ARTWORK: Record<string, string> = {
  'power-body': './flight-kit/power-solar-ultraflex.webp',
  'power-deployable': './flight-kit/power-solar-gaas.webp',
  'power-gallium': './flight-kit/power-solar-gaas.webp',
  'power-rtg': './flight-kit/power-rtg-nextgen.webp',
  'power-fission': './flight-kit/power-kilopower-fission.webp',
};

const BATTERY_ARTWORK: Record<string, string> = {
  'batt-standard': './flight-kit/batt-li-ion-nmc.webp',
  'batt-advanced': './flight-kit/batt-li-sulfur.webp',
  'batt-heavy': './flight-kit/batt-supercap-hybrid.webp',
};

export const EngineerConsole: React.FC = () => {
  const {
    missionState,
    updateMissionState,
    telemetry,
    isMultiplayer,
    myPlayerInfo,
    players,
    activeRole,
    environmentalTests,
    runVibrationTest,
    runTvacTest,
    unlockedAdvancedComponents,
    clearanceRequests,
    requestTechClearance,
    locale,
  } = useMissionStore();

  const isTr = locale === 'tr';
  const t = TRANSLATIONS[locale].engineer;

  const isEngineer = !isMultiplayer || myPlayerInfo.role === 'engineer' || myPlayerInfo.secondaryRole === 'engineer' || activeRole === 'engineer';
  const assignedEngineer = players.find((p) => p.role === 'engineer' || p.secondaryRole === 'engineer') || (activeRole === 'engineer' ? myPlayerInfo : undefined);

  const buses = getLocalizedSpacecraftBuses(locale);
  const propulsions = getLocalizedPropulsionSystems(locale);
  const powerSystems = getLocalizedPowerSystems(locale);
  const batteries = getLocalizedBatterySystems(locale);

  return (
    <div className="space-y-6">
      {/* Station Authority & Specs Header */}
      <div className="border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3">
        {isMultiplayer && (
          <div className="p-2.5 border border-slate-800 rounded-2xl sm:rounded-full bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isEngineer ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
              <span className="text-slate-400">
                {isTr ? 'İSTASYON YETKİLİSİ' : 'STATION AUTHORITY'}: <strong className="text-white">{assignedEngineer ? assignedEngineer.name : (isTr ? 'Atanmadı' : 'Uncrewed')}</strong>
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium w-fit ${isEngineer ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'border border-slate-700 text-slate-400'}`}>
              {isEngineer ? (isTr ? 'KONTROL SİZDE' : 'CONSOLE ACTIVE') : (isTr ? 'TELEMETRİ İZLEME' : 'READ-ONLY')}
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
      </div>

      {/* Pre-Flight Environmental Test Lab (Streamlined, Hairline Outlines) */}
      <div className="border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {isTr ? 'UÇUŞ ÖNCESİ TEST LAB (TVAC & TİTREŞİM)' : 'PRE-FLIGHT TEST LAB (TVAC & SHAKE)'}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
              environmentalTests.vibrationPassed && environmentalTests.tvacPassed
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'border border-slate-700 text-slate-400'
            }`}
          >
            {environmentalTests.vibrationPassed && environmentalTests.tvacPassed
              ? (isTr ? 'TESTLER ONAYLANDI' : 'QUALIFIED')
              : (isTr ? 'TEST BEKLENİYOR' : 'PENDING')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {/* Shake Table */}
          <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] flex flex-col justify-between space-y-2.5">
            <div className="relative w-full h-24 rounded-xl overflow-hidden bg-[#080C14] border border-white/10">
              <img
                src="./flight-kit/eng-shake-table-rig.webp"
                alt="Shake Table Bench"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/20 to-transparent" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/75 border border-white/20 text-sky-300">
                {isTr ? 'HAVACILIK TESTİ' : 'AEROSPACE RIG'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase font-bold text-[11px]">
                {isTr ? 'TİTREŞİM MASASI' : 'SHAKE TABLE'}
              </span>
              {environmentalTests.vibrationTested ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${environmentalTests.vibrationPassed ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'}`}>
                  {environmentalTests.vibrationPassed
                    ? (isTr ? `GEÇTİ (%${environmentalTests.vibrationScore})` : `PASS (${environmentalTests.vibrationScore}%)`)
                    : (isTr ? `KALDI (%${environmentalTests.vibrationScore})` : `FAIL (${environmentalTests.vibrationScore}%)`)}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">{isTr ? 'BEKLİYOR' : 'PENDING'}</span>
              )}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                {telemetry.totalMassKg.toLocaleString()} kg
              </span>
              <button
                disabled={!isEngineer}
                onClick={runVibrationTest}
                className="px-3.5 py-1 rounded-full bg-white text-slate-950 font-semibold text-[11px] hover:bg-slate-100 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                {isTr ? 'Test Et' : 'Run Test'}
              </button>
            </div>
          </div>

          {/* TVAC */}
          <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] flex flex-col justify-between space-y-2.5">
            <div className="relative w-full h-24 rounded-xl overflow-hidden bg-[#080C14] border border-white/10">
              <img
                src="./flight-kit/eng-tvac-chamber.webp"
                alt="Thermal Vacuum (TVAC) Chamber"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/20 to-transparent" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/75 border border-white/20 text-purple-300">
                {isTr ? 'TERMAL VAKUM' : 'CRYO VACUUM'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase font-bold text-[11px]">
                {isTr ? 'TVAC ODASI' : 'TVAC CHAMBER'}
              </span>
              {environmentalTests.tvacTested ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${environmentalTests.tvacPassed ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'}`}>
                  {environmentalTests.tvacPassed
                    ? (isTr ? `GEÇTİ (%${environmentalTests.tvacScore})` : `PASS (${environmentalTests.tvacScore}%)`)
                    : (isTr ? `KALDI (%${environmentalTests.tvacScore})` : `FAIL (${environmentalTests.tvacScore}%)`)}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">{isTr ? 'BEKLİYOR' : 'PENDING'}</span>
              )}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                {telemetry.netPowerW} W
              </span>
              <button
                disabled={!isEngineer}
                onClick={runTvacTest}
                className="px-3.5 py-1 rounded-full bg-white text-slate-950 font-semibold text-[11px] hover:bg-slate-100 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                {isTr ? 'Test Et' : 'Run Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Spacecraft Bus Section */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.sec1Title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {buses.length} {isTr ? 'Bileşen' : 'Options'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {buses.map((bus) => {
            const isSelected = missionState.busId === bus.id;
            const isAdvanced = ADVANCED_TECH_COMPONENTS.includes(bus.id);
            const isLocked = isMultiplayer && isAdvanced && !unlockedAdvancedComponents.includes(bus.id);
            const pendingReq = clearanceRequests.find((r) => r.componentId === bus.id && r.status === 'pending');

            return (
              <div
                key={bus.id}
                onClick={() => {
                  if (isLocked) {
                    if (!pendingReq) requestTechClearance(bus.id, bus.name, 'commander');
                    return;
                  }
                  if (isEngineer) updateMissionState({ busId: bus.id }, true);
                }}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isEngineer
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isLocked
                    ? 'border-amber-500/30 bg-[#0E1422] opacity-90 cursor-pointer'
                    : isSelected
                    ? 'border-sky-400/80 bg-[#111827] shadow-sm cursor-pointer'
                    : 'border-slate-800 hover:border-slate-700 bg-[#0E1422] cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{bus.name}</h4>
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
                  ) : isSelected ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-950">
                      {t.selectedBadge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-700/60 text-slate-400 hover:text-white">
                      {isTr ? 'SEÇ' : 'SELECT'}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1 font-mono text-xs tabular-nums">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.cost}:</span>
                    <strong className="text-white">${bus.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.dryMass}:</span>
                    <span className="text-white">{bus.dryMassKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.payloadCap}:</span>
                    <span className="text-white font-medium">{bus.maxPayloadCapacityKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.shieldRating}:</span>
                    <span className="text-sky-300">{bus.radiationShieldingRating}/5</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Propulsion System */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.sec2Title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {propulsions.length} {isTr ? 'Bileşen' : 'Options'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {propulsions.map((prop) => {
            const isSelected = missionState.propulsionId === prop.id;
            const isAdvanced = ADVANCED_TECH_COMPONENTS.includes(prop.id);
            const isLocked = isMultiplayer && isAdvanced && !unlockedAdvancedComponents.includes(prop.id);
            const pendingReq = clearanceRequests.find((r) => r.componentId === prop.id && r.status === 'pending');

            return (
              <div
                key={prop.id}
                onClick={() => {
                  if (isLocked) {
                    if (!pendingReq) requestTechClearance(prop.id, prop.name, 'commander');
                    return;
                  }
                  if (isEngineer) updateMissionState({ propulsionId: prop.id }, true);
                }}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isEngineer
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isLocked
                    ? 'border-amber-500/30 bg-[#0E1422] opacity-90 cursor-pointer'
                    : isSelected
                    ? 'border-sky-400/80 bg-[#111827] shadow-sm cursor-pointer'
                    : 'border-slate-800 hover:border-slate-700 bg-[#0E1422] cursor-pointer'
                }`}
              >
                <div>
                  {/* Aerospace Engine Hardware Render */}
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-[#080C14] border border-white/10">
                    <img
                      src={PROPULSION_ARTWORK[prop.id] || './flight-kit/prop-chemical-biprop.webp'}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/20 to-transparent" />
                    <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-sky-300 font-semibold uppercase">
                      {prop.type}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white mt-0.5">{prop.name}</h4>
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
                    ) : isSelected ? (
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
                    <span className="text-slate-400 text-[10px]">{t.cost}:</span>
                    <strong className="text-white">${prop.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.fuelMass}:</span>
                    <span className="text-white">{prop.fuelMassKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.isp}:</span>
                    <span className="text-white font-medium">{prop.ispSeconds} s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.thrustPower}:</span>
                    <span className="text-sky-300">{prop.thrustN}N</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Power Generation */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.sec3Title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {powerSystems.length} {isTr ? 'Bileşen' : 'Options'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {powerSystems.map((pwr) => {
            const isSelected = missionState.powerId === pwr.id;
            const isAdvanced = ADVANCED_TECH_COMPONENTS.includes(pwr.id);
            const isLocked = isMultiplayer && isAdvanced && !unlockedAdvancedComponents.includes(pwr.id);
            const pendingReq = clearanceRequests.find((r) => r.componentId === pwr.id && r.status === 'pending');

            return (
              <div
                key={pwr.id}
                onClick={() => {
                  if (isLocked) {
                    if (!pendingReq) requestTechClearance(pwr.id, pwr.name, 'commander');
                    return;
                  }
                  if (isEngineer) updateMissionState({ powerId: pwr.id }, true);
                }}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isEngineer
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isLocked
                    ? 'border-amber-500/30 bg-[#0E1422] opacity-90 cursor-pointer'
                    : isSelected
                    ? 'border-sky-400/80 bg-[#111827] shadow-sm cursor-pointer'
                    : 'border-slate-800 hover:border-slate-700 bg-[#0E1422] cursor-pointer'
                }`}
              >
                <div>
                  {/* Spacecraft Power System Hardware Render */}
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-[#080C14] border border-white/10">
                    <img
                      src={POWER_ARTWORK[pwr.id] || './flight-kit/power-solar-gaas.webp'}
                      alt={pwr.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/20 to-transparent" />
                    <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-emerald-300 font-semibold uppercase">
                      +{pwr.basePowerW}W
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">{pwr.name}</h4>
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
                    ) : isSelected ? (
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
                    <span className="text-slate-400 text-[10px]">{t.cost}:</span>
                    <strong className="text-white">${pwr.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.basePower}:</span>
                    <strong className="text-emerald-400">+{pwr.basePowerW} W</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.deepSpace}:</span>
                    <span className={pwr.worksInDeepSpace ? 'text-emerald-400' : 'text-amber-400'}>
                      {pwr.worksInDeepSpace ? t.operational : t.poorEfficiency}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Battery Storage */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.sec4Title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {batteries.length} {isTr ? 'Bileşen' : 'Options'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {batteries.map((bat) => {
            const isSelected = missionState.batteryId === bat.id;

            return (
              <div
                key={bat.id}
                onClick={() => isEngineer && updateMissionState({ batteryId: bat.id }, true)}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isEngineer
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isSelected
                    ? 'border-sky-400/80 bg-[#111827] shadow-sm cursor-pointer'
                    : 'border-slate-800 hover:border-slate-700 bg-[#0E1422] cursor-pointer'
                }`}
              >
                <div>
                  {/* Space-Grade Battery Pack Render */}
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-[#080C14] border border-white/10">
                    <img
                      src={BATTERY_ARTWORK[bat.id] || './flight-kit/batt-li-ion-nmc.webp'}
                      alt={bat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/20 to-transparent" />
                    <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-sky-300 font-semibold uppercase">
                      {bat.capacityWh} Wh
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <h4 className="font-display font-bold text-sm text-white">{bat.name}</h4>
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
                    <span className="text-slate-400 text-[10px]">{t.cost}:</span>
                    <strong className="text-white">${bat.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.capacity}:</span>
                    <span className="text-white">{bat.capacityWh.toLocaleString()} Wh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.mass}:</span>
                    <span className="text-slate-400">{bat.massKg} kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official NASA CubeSat 101 & CSLI Citation Banner */}
      <div className="p-4 border border-amber-500/30 rounded-2xl bg-[#080C14] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">
              {isTr ? 'NASA GÖREV & MÜHENDİSLİK KAYNAĞI NOTU' : 'OFFICIAL NASA ENGINEERING DIRECTIVE'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
            {isTr ? 'Standart: NASA CubeSat 101 (CSLI)' : 'Standard: NASA CubeSat 101 (CSLI)'}
          </span>
        </div>
        <p className="text-xs font-mono text-slate-300 leading-relaxed">
          {isTr
            ? 'Bu konsoldaki Titreşim (Vibration) ve Termal Vakum (TVAC) test prosedürleri ile UL-1642 batarya güvenlik toleransları, NASA CubeSat 101 El Kitabı Bölüm 6.9 (Çevresel Doğrulama) şartnamesine dayanmaktadır.'
            : 'Vibration and Thermal Vacuum (TVAC) bakeout tests along with UL-1642 battery safety limits are based on NASA CubeSat 101 Handbook Chapter 6.9 requirements.'}
        </p>
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
          <span className="text-slate-400">
            {isTr ? 'Fırlatma Referansı: NASA CubeSat Launch Initiative (Bölüm 2.4 Burn-Wire & P-POD)' : 'Launch Reference: NASA CubeSat Launch Initiative (Ch. 2.4 Burn-Wire)'}
          </span>
          <span className="text-amber-400/90 font-semibold">
            NASA CSLI Document NP-2017-10-2470-HQ
          </span>
        </div>
      </div>
    </div>
  );
};
