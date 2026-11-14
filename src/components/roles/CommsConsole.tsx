import React from 'react';
import { Lock, ExternalLink } from 'lucide-react';
import { useMissionStore, ADVANCED_TECH_COMPONENTS } from '../../store/missionStore';
import {
  getLocalizedAntennaSystems,
  getLocalizedGroundStations,
} from '../../i18n/missionsLocale';
import { SCIENTIFIC_INSTRUMENTS } from '../../data/missions';
import { TRANSLATIONS } from '../../i18n/translations';

export const CommsConsole: React.FC = () => {
  const {
    missionState,
    updateMissionState,
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
  const t = TRANSLATIONS[locale].comms;

  const isComms = !isMultiplayer || myPlayerInfo.role === 'comms' || myPlayerInfo.secondaryRole === 'comms' || activeRole === 'comms';
  const assignedComms = players.find((p) => p.role === 'comms' || p.secondaryRole === 'comms') || (activeRole === 'comms' ? myPlayerInfo : undefined);

  const antennas = getLocalizedAntennaSystems(locale);
  const groundStations = getLocalizedGroundStations(locale);

  const selectedInstruments = SCIENTIFIC_INSTRUMENTS.filter((i) =>
    missionState.selectedInstrumentIds.includes(i.id)
  );

  const totalScienceDataRateKbps = selectedInstruments.reduce((sum, i) => sum + i.dataRateKbps, 0);
  const throughputKbps = telemetry.dataThroughputKbps;
  const isBottlenecked = throughputKbps < totalScienceDataRateKbps;

  return (
    <div className="space-y-6">
      {/* Station Authority & Comms Specs Header */}
      <div className="border border-white/10 rounded-2xl overflow-hidden p-4 bg-[#0E1422] space-y-3">
        {isMultiplayer && (
          <div className="p-2.5 border border-slate-800 rounded-2xl sm:rounded-full bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isComms ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
              <span className="text-slate-400">
                {isTr ? 'İSTASYON YETKİLİSİ' : 'STATION AUTHORITY'}: <strong className="text-white">{assignedComms ? assignedComms.name : (isTr ? 'Atanmadı' : 'Uncrewed')}</strong>
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium w-fit ${isComms ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'border border-slate-700 text-slate-400'}`}>
              {isComms ? (isTr ? 'KONTROL SİZDE' : 'CONSOLE ACTIVE') : (isTr ? 'TELEMETRİ İZLEME' : 'READ-ONLY')}
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

      {/* Prominent Communication Bottleneck Error Notice */}
      {isBottlenecked && (
        <div className="p-4 border-2 border-rose-500/80 bg-rose-950/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-[0_0_20px_rgba(244,63,94,0.25)]">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center shrink-0 text-rose-400 font-bold text-base animate-pulse">
              !
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-rose-400 font-bold tracking-wider uppercase text-[11px]">
                  {isTr ? 'KRİTİK HATA: İLETİŞİM DARBOĞAZI' : 'CRITICAL ERROR: COMMS BOTTLENECK'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold">
                  {isTr ? 'UÇUŞ KOPMA RİSKİ' : 'TELEMETRY LOSS RISK'}
                </span>
              </div>
              <p className="text-rose-200/90 text-xs mt-1 leading-relaxed">
                {isTr
                  ? `Seçilen anten veya yer istasyonu bilim yükünün veri akış hızını karşılayamıyor (${throughputKbps} kbps < ${totalScienceDataRateKbps} kbps). Uçuş sırasında telemetri kaybı ve araç düşüşü gerçekleşir! Daha güçlü bir anten veya Deep Space Network (DSN) yer istasyonu seçin.`
                  : `Selected antenna or ground station cannot meet instrument data stream rate (${throughputKbps} kbps < ${totalScienceDataRateKbps} kbps). Telemetry loss and flight crash will occur! Select a higher-gain antenna or Deep Space Network (DSN).`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 font-bold text-rose-400 text-sm">
            -{totalScienceDataRateKbps - throughputKbps} kbps
          </div>
        </div>
      )}

      {/* 1. Antenna System Selection (Pruned) */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.sec1Title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {antennas.length} {isTr ? 'Anten Tipi' : 'Antenna Systems'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {antennas.map((ant) => {
            const isSelected = missionState.antennaId === ant.id;
            const isAdvanced = ADVANCED_TECH_COMPONENTS.includes(ant.id);
            const isLocked = isMultiplayer && isAdvanced && !unlockedAdvancedComponents.includes(ant.id);
            const pendingReq = clearanceRequests.find((r) => r.componentId === ant.id && r.status === 'pending');

            return (
              <div
                key={ant.id}
                onClick={() => {
                  if (isLocked) {
                    if (!pendingReq) requestTechClearance(ant.id, ant.name, 'engineer');
                    return;
                  }
                  if (isComms) updateMissionState({ antennaId: ant.id });
                }}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isComms
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isLocked
                    ? 'border-amber-500/30 bg-[#0E1422] opacity-90 cursor-pointer'
                    : isSelected
                    ? 'cursor-pointer border-sky-400/80 bg-[#111827] shadow-sm'
                    : 'cursor-pointer border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">{ant.frequencyBand}</span>
                      <h4 className="font-display font-bold text-sm text-white mt-0.5">{ant.name}</h4>
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
                    <strong className="text-white">${ant.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.maxSpeed}:</span>
                    <strong className="text-sky-300 font-medium">{ant.maxThroughputKbps.toLocaleString()} kbps</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.powerDraw}:</span>
                    <span className="text-white">{ant.powerDrawW} W</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.mass}:</span>
                    <span className="text-white">{ant.massKg} kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Ground Station Network Selection (Pruned) */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            {t.sec2Title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {groundStations.length} {isTr ? 'Yer İstasyonu' : 'Ground Networks'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {groundStations.map((ground) => {
            const isSelected = missionState.groundStationId === ground.id;

            return (
              <div
                key={ground.id}
                onClick={() => isComms && updateMissionState({ groundStationId: ground.id })}
                className={`p-3.5 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  !isComms
                    ? 'cursor-not-allowed opacity-75 border-slate-800 bg-[#0E1422]'
                    : isSelected
                    ? 'cursor-pointer border-sky-400/80 bg-[#111827] shadow-sm'
                    : 'cursor-pointer border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-display font-bold text-sm text-white">{ground.name}</h4>
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
                    <span className="text-slate-400 text-[10px]">{t.opsCost}:</span>
                    <strong className="text-white">${ground.costM}M</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">{t.coverage}:</span>
                    <strong className="text-emerald-400 font-semibold">{ground.coveragePercent}%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Bandwidth Balance Analysis (Condensed) */}
      <div
        className={`border rounded-2xl overflow-hidden p-4 font-mono text-xs space-y-3 transition-colors ${
          isBottlenecked
            ? 'border-rose-500/80 bg-[#160B12] shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            : 'border-white/10 bg-[#0E1422]'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            {isBottlenecked && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
            <span className={`font-bold uppercase tracking-wider ${isBottlenecked ? 'text-rose-400' : 'text-white'}`}>
              {t.throughputComparison} {isBottlenecked && (isTr ? '(KRİTİK HATA)' : '(CRITICAL ERROR)')}
            </span>
          </div>
          <span className={isBottlenecked ? 'text-rose-400 font-bold' : 'text-slate-400'}>
            {throughputKbps} / {totalScienceDataRateKbps} kbps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-slate-400 text-[10px] mb-1">
              <span>{t.downlinkSpeed}:</span>
              <strong className={`${isBottlenecked ? 'text-rose-400' : 'text-sky-300'} tabular-nums font-semibold`}>
                {throughputKbps} kbps
              </strong>
            </div>
            <div className="w-full bg-slate-800/80 h-[3px] rounded-full overflow-hidden">
              <div
                className={`h-full ${isBottlenecked ? 'bg-rose-500' : 'bg-sky-400'}`}
                style={{ width: `${Math.min(100, (throughputKbps / 3000) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 text-[10px] mb-1">
              <span>{t.sensorGenRate}:</span>
              <strong className="text-white tabular-nums">{totalScienceDataRateKbps} kbps</strong>
            </div>
            <div className="w-full bg-slate-800/80 h-[3px] rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-600"
                style={{ width: `${Math.min(100, (totalScienceDataRateKbps / 3000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {isBottlenecked && (
          <div className="border-t border-rose-500/30 pt-2 flex items-center justify-between text-[11px] font-mono bg-rose-500/10 -mx-4 -mb-4 px-4 py-2.5 text-rose-300">
            <span className="font-bold flex items-center space-x-1.5">
              <span>⚠️</span>
              <span>{t.bottleneckWarn}</span>
            </span>
            <span className="text-rose-400 font-bold tabular-nums">
              -{totalScienceDataRateKbps - throughputKbps} kbps ({isTr ? 'AÇIK - HATA' : 'DEFICIT - ERROR'})
            </span>
          </div>
        )}
      </div>

      {/* Official NASA Ground Segment & FCC/IARU Citation Banner */}
      <div className="p-4 border border-sky-500/30 rounded-2xl bg-[#080C14] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-sky-400 uppercase">
              {isTr ? 'HABERLEŞME & YER İSTASYONU KAYNAK NOTU' : 'OFFICIAL COMMS & GROUND SEGMENT DIRECTIVE'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-sky-500/10 border border-sky-500/30 text-sky-300">
            {isTr ? 'NASA Yer Segmenti & CubeSat 101' : 'NASA Ground Segment & CubeSat 101'}
          </span>
        </div>
        <p className="text-xs font-mono text-slate-300 leading-relaxed">
          {isTr
            ? 'Bu konsoldaki DSN yer istasyonları (Goldstone, Madrid, Canberra), serbest uzay yol kaybı (FSPL) ve veri indirme (downlink) mimarisi NASA Julie Levri 4-Segment Yer Modeli ve CubeSat 101 Bölüm 5 (FCC Part 97/5 & IARU Frekans Koordinasyonu) kurallarına göre modellenmiştir.'
            : 'DSN ground station network, Free Space Path Loss (FSPL) and downlink throughput are modeled according to NASA Julie Levri 4-Segment Ground Architecture and CubeSat 101 Chapter 5 (FCC Part 97/5 & IARU frequency coordination).'}
        </p>
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
          <span className="text-slate-400">
            {isTr ? 'Teknik Kılavuz: NASA Systems Engineering Webinar Series (Julie Levri)' : 'Technical Guide: NASA Systems Engineering Webinar Series'}
          </span>
          <span className="text-sky-400 font-semibold">
            NASA DSN & CubeSat 101 Ch. 2.10
          </span>
        </div>
      </div>
    </div>
  );
};
