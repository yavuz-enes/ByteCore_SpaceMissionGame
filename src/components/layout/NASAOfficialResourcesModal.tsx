import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  BookOpen,
  Award,
  Layers,
  Compass,
  Radio,
  Zap,
  Shield,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

interface NASAOfficialResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NASAOfficialResourcesModal: React.FC<NASAOfficialResourcesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { locale } = useMissionStore();
  const isTr = locale === 'tr';
  const [activeTab, setActiveTab] = useState<'competition' | 'engineering'>('competition');

  if (!isOpen) return null;

  const COMPETITION_SOURCES = [
    {
      id: 'source-1',
      number: '1',
      title: isTr ? 'NASA Webb "Build It Yourself: Satellite!"' : 'NASA Webb "Build It Yourself: Satellite!"',
      agency: 'NASA Goddard Space Flight Center',
      url: 'https://science.nasa.gov/mission/webb/game-build-it-yourself/',
      usedIn: isTr
        ? 'Bilim İnsanı İstasyonu (ScientistConsole) Spektrometre Kilidi & Akademi Enstrüman Atölyesi'
        : 'Scientist Console Spectrometer Lock & Space Academy Payload Workshop',
      integrationSummary: isTr
        ? 'Optik filtreleme, dalga boyu seçimi (Görünür, Yakın Kırmızıötesi, Orta Kırmızıötesi), ayna boyutu ve bilimsel dedektör mimarisi bu simülasyondaki parametreler temel alınarak entegre edilmiştir.'
        : 'Optical filtering, wavelength selection (Visible, NIR, MIR), mirror aperture and science detector tradeoffs are derived from this NASA interactive tool.',
      tag: isTr ? 'Resmi Yarışma Kaynağı 1' : 'Official Challenge Resource 1',
      icon: Sparkles,
      accent: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    },
    {
      id: 'source-2',
      number: '2',
      title: isTr ? 'NASA Mission-Viz (3D Uzay Görevi Görselleştirme)' : 'NASA Mission-Viz (3D Space Mission Visualization)',
      agency: 'NASA Open Source / GitHub Initiative',
      url: 'https://nasa.github.io/mission-viz/',
      usedIn: isTr
        ? '3B Yörünge Simülatörü, Uçuş Güvertesi (FlightSimulationModal) & SolarSystemCanvas'
        : '3D Orbit Simulation, Flight Deck & SolarSystemCanvas',
      integrationSummary: isTr
        ? 'Keplerian yörünge yayları, yarı büyük eksen, eksantriklik ve eğim parametreleri ile DSN yer istasyonu görüş konisi (downlink coverage cone) görselleştirmesi bu kütüphaneden uyarlanmıştır.'
        : 'Keplerian orbital propagation (semi-major axis, eccentricity, inclination) and DSN ground station visibility footprint cones are implemented based on this tool.',
      tag: isTr ? 'Resmi Yarışma Kaynağı 2' : 'Official Challenge Resource 2',
      icon: Compass,
      accent: 'from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/30',
    },
    {
      id: 'source-3',
      number: '3',
      title: isTr ? 'NASA Space Apps Challenge 2023: "Visualize a Space Mission Using VR"' : 'NASA Space Apps Challenge 2023: "Visualize a Space Mission Using VR"',
      agency: 'NASA International Space Apps Challenge',
      url: 'https://www.spaceappschallenge.org/2023/challenges/visualize-a-space-mission-using-virtual-reality/?tab=details',
      usedIn: isTr
        ? 'Görev Kilometre Taşları Zaman Çubuğu (Timeline Scrubber), Telemetri HUD & Kokpit Arayüzü'
        : 'Mission Timeline Scrubber, Real-time Telemetry HUD & Cockpit Perspective',
      integrationSummary: isTr
        ? 'Fırlatma, ayrılma, transfer seyri ve yörüngeye giriş aşamalarının uzamsal derinlikle sunulması, zaman kontrol çubuğu ve çok açılı kamera vizörleri bu hackathon şartnamesine dayanır.'
        : 'End-to-end mission phase scrubbing (Launch, Separation, Cruise, Orbit Insertion), multi-camera views and spatial HUD telemetry are inspired by this challenge.',
      tag: isTr ? 'Resmi Yarışma Kaynağı 3' : 'Official Challenge Resource 3',
      icon: Layers,
      accent: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
    },
    {
      id: 'source-4',
      number: '4',
      title: isTr ? 'Canadian Space Agency (CSA) Dijital Oyunlar ve Aktiviteler' : 'Canadian Space Agency (CSA) Digital Games and Activities',
      agency: 'Canadian Space Agency (ASC-CSA)',
      url: 'https://www.asc-csa.gc.ca/eng/youth-educators/digital-games-and-activities.asp',
      usedIn: isTr
        ? 'Canadarm Kargo Bırakma Protokolü, RADARSAT SAR Frekans Kilidi & Asteroit Yüzey Analizi'
        : 'Canadarm Payload Deployment, RADARSAT SAR Frequency Locking & Asteroid Hazard Scouting',
      integrationSummary: isTr
        ? 'CSA robotik kol kargo yerleştirme dinamiği, RADARSAT SAR radar dalga boyu kilitleme mini oyunu ve OSIRIS-REx Bennu yüzey krater/kaya risk değerlendirme mekanikleri bu kaynaktan esinlenmiştir.'
        : 'CSA Canadarm robotic payload deployment, RADARSAT SAR radar frequency tracking mini-games, and Bennu surface hazard landing site selection stem from this CSA hub.',
      tag: isTr ? 'Resmi Yarışma Kaynağı 4' : 'Official Challenge Resource 4',
      icon: Radio,
      accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    },
  ];

  const ENGINEERING_STANDARDS = [
    {
      id: 'std-1',
      title: isTr ? 'NASA Julie Levri – Bilim Görevleri Tasarımı (2025)' : 'NASA Julie Levri – Design & Develop Science Missions (2025)',
      agency: 'NASA SmallSat Institute & Systems Engineering Series',
      usedIn: isTr ? 'Ana Sayfa 4-Segment Mimarisi & NPR 7123.1 ConOps Döngüsü' : 'Landing Page 4-Segment Architecture & NPR 7123.1 ConOps',
      desc: isTr
        ? 'Fırlatma (Launch), Uzay Aracı (Space), Yer (Ground) ve Kullanıcı/Bilim (User) olmak üzere 4 ana uzay görevi segmentinin tanımı ve BioNutrients-2 operasyon protokolleri.'
        : 'Definition of the 4 core mission segments (Launch, Space, Ground, User) and ISS on-console experiment protocols (NPR 7123.1).',
    },
    {
      id: 'std-2',
      title: isTr ? 'NASA JPL / Caltech – Concept Maturity Levels (CML)' : 'NASA JPL / Caltech – Concept Maturity Levels (CML)',
      agency: 'Jet Propulsion Laboratory (Wessen et al.)',
      usedIn: isTr ? 'Uçuş Öncesi %80 CML-4 Hazırlık Skoru Barajı (PreFlightChecklist)' : 'Pre-Flight 80% CML-4 Concept Maturity Gate',
      desc: isTr
        ? 'CML 1 (Cocktail Napkin) seviyesinden CML 9 (CDR) seviyesine kadar 24 satırlık sistem olgunluk matrisi ve fırlatma onay checklist mekanizması.'
        : '24-row concept maturity framework (CML 1 to CML 9) and the 80% RYG (Red-Yellow-Green) acceptance criteria for flight clearance.',
    },
    {
      id: 'std-3',
      title: isTr ? 'NASA Goddard ETD – Mission Design Lab (MDL)' : 'NASA Goddard ETD – Mission Design Lab (MDL)',
      agency: 'NASA Goddard Engineering & Technology Directorate',
      usedIn: isTr ? '4 Çok Oyunculu Konsol Alt-Sistem Dağılımı ve Master Equipment List (MEL)' : '4 Multiplayer Station Subsystems & Master Equipment List (MEL)',
      desc: isTr
        ? '13 mühendislik disiplini (ADCS, İtki, Güç, Isıl, Aviyonik, Haberleşme vb.) arasındaki eş zamanlı mühendislik (concurrent engineering) iş birliği modeli.'
        : 'Concurrent engineering model across 13 aerospace disciplines (Attitude Control, Propulsion, Power, Thermal, Comms, Ops).',
    },
    {
      id: 'std-4',
      title: isTr ? 'NASA CubeSat 101 – İlk Geliştiriciler İçin Kılavuz' : 'NASA CubeSat 101 – First-Time Developer Handbook',
      agency: 'NASA CubeSat Launch Initiative (CSLI) / Cal Poly',
      usedIn: isTr ? 'Pre-Flight Çevresel Testleri (DITL, TVAC, Titreşim), RBF Pini & FCC/IARU' : 'Pre-Flight Environmental Testing (DITL, TVAC, Vibe), RBF Pin & FCC/IARU',
      desc: isTr
        ? 'P-POD dispenser standartları, Day In The Life (DITL) uçuş yazılımı zamanlayıcıları, termal vakum fırınlama ve Remove Before Flight (RBF) güvenlik pini doğrulama prosedürleri.'
        : 'P-POD dispenser interfaces, Day In The Life (DITL) inhibit timers, TVAC bakeout tolerances, and Remove Before Flight (RBF) safety pin procedures.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0B0F17] border border-sky-500/30 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.15)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#0E1422]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
                  {isTr ? 'RESMİ YARIŞMA REFERANSLARI' : 'OFFICIAL CHALLENGE CITATIONS'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  {isTr ? 'DOĞRULANMIŞ KAYNAKLAR' : 'VERIFIED RESOURCES'}
                </span>
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white">
                {isTr ? 'NASA & CSA Bilimsel Araştırma ve Yarışma Kaynakları' : 'NASA & CSA Scientific Research and Challenge Resources'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-700/60 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-[#080C14] px-4 sm:px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('competition')}
            className={`pb-3 px-3 text-xs sm:text-sm font-mono font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'competition'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isTr ? '1. Yarışmada Verilen 4 Kaynak (Web Portalları)' : '1. Competition Provided 4 Sources (Web Portals)'}
          </button>
          <button
            onClick={() => setActiveTab('engineering')}
            className={`pb-3 px-3 text-xs sm:text-sm font-mono font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'engineering'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isTr ? '2. Destekleyici Resmi NASA Standartları (Dokümanlar)' : '2. NASA Engineering Standards & Handbooks'}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
          {activeTab === 'competition' && (
            <div className="space-y-4">
              <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#0E1422] p-3 rounded-xl border border-white/5">
                {isTr
                  ? 'Aşağıdaki kaynaklar, yarışma kılavuzunda belirtilen zorunlu araştırma merkezleridir. ByteCore simülatörünün oyun mekanikleri, matematiksel modelleri ve arayüz elemanları doğrudan bu kaynakların teknik verileriyle inşa edilmiştir.'
                  : 'The following resources are the core challenge portals specified for the mission. ByteCore simulation mechanics, telemetry formulas, and interactive controls directly reference these platforms.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPETITION_SOURCES.map((src) => {
                  const Icon = src.icon;
                  return (
                    <div
                      key={src.id}
                      className="p-4 rounded-2xl border border-white/10 bg-[#0E1422] flex flex-col justify-between space-y-3 hover:border-sky-500/40 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold bg-gradient-to-r ${src.accent}`}>
                            {src.tag}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {src.agency}
                          </span>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Icon className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                          <h4 className="font-display font-medium text-base text-white">
                            {src.title}
                          </h4>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#080C14] border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-sky-400 font-semibold block uppercase">
                            {isTr ? 'SİTEDEKİ KULLANIM YERİ:' : 'INTEGRATION LOCATION:'}
                          </span>
                          <p className="text-[11px] font-mono text-slate-300">
                            {src.usedIn}
                          </p>
                        </div>

                        <p className="text-xs font-mono text-slate-400 leading-relaxed">
                          {src.integrationSummary}
                        </p>
                      </div>

                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors cursor-pointer group"
                      >
                        <span>{isTr ? 'Orijinal Kaynağı Ziyaret Et' : 'Open Official Resource'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'engineering' && (
            <div className="space-y-4">
              <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#0E1422] p-3 rounded-xl border border-white/5">
                {isTr
                  ? 'Projede kullanılan resmi NASA teknik kılavuzları, sistem mühendisliği standartları ve uçuş sertifikasyon süreçleri aşağıda listelenmiştir.'
                  : 'Official NASA procedural guidelines, systems engineering handbooks, and flight qualification standards applied in ByteCore:'}
              </p>

              <div className="space-y-3">
                {ENGINEERING_STANDARDS.map((std) => (
                  <div
                    key={std.id}
                    className="p-4 rounded-2xl border border-white/10 bg-[#0E1422] space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-display font-medium text-sm sm:text-base text-white flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{std.title}</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {std.agency}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#080C14] border border-white/5">
                      <span className="text-[10px] font-mono text-sky-400 font-semibold uppercase block">
                        {isTr ? 'SİSTEMDEKİ UYGULAMA:' : 'SYSTEM APPLICATION:'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300">
                        {std.usedIn}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-400 leading-relaxed">
                      {std.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#080C14] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              {isTr
                ? 'NASA Space Apps Challenge Araştırma Temelli Proje'
                : 'NASA Space Apps Challenge Research-Backed Solution'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isTr ? 'Anladım & Kapat' : 'Close Citations'}
          </button>
        </div>
      </div>
    </div>
  );
};
