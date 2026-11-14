import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wifi,
  Copy,
  Check,
  Play,
  Lock,
  Unlock,
  Target,
  Compass,
  Radio,
  Zap,
  Shield,
  Layers,
  Award,
  ChevronRight,
  UserPlus,
  Rocket,
  Activity,
  Globe,
  X,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useSiteContent } from '../../hooks/useSiteContent';
import { MissionId, PlayerRole } from '../../types/mission';

const DESTINATION_ARTWORK: Record<string, string> = {
  'lunar-recon': './flight-kit/card-moon-shackleton.webp',
  'mars-recon': './flight-kit/card-mars-valles.webp',
  'europa-recon': './flight-kit/card-europa-ice.webp',
  'asteroid-scout': './flight-kit/card-asteroid-psyche.webp',
};

export const LandingPage: React.FC = () => {
  const {
    missionState,
    setScenario,
    destinations,
    toggleCampaignDestination,
    removeCampaignDestination,
    isMultiplayer,
    isHost,
    roomCode,
    players,
    myPlayerInfo,
    isConnecting,
    createRoom,
    joinRoom,
    leaveRoom,
    claimRole,
    claimSecondaryRole,
    optimizeWithAI,
    toggleReady,
    startMultiplayerMission,
    startSoloMission,
    requestLaunchConsensus,
    addSimulatedCoPilot,
    locale,
    setLocale,
    setCurrentView,
    openAcademy,
  } = useMissionStore();

  const { content } = useSiteContent();
  const isTr = locale === 'tr';

  // Local state for lobby form
  const [lobbyMode, setLobbyMode] = useState<'host' | 'join'>('host');
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('commander');
  const [copied, setCopied] = useState(false);

  // Handle Copy Code
  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Host Create (Station is selected inside the room)
  const handleHostCreate = async () => {
    const code = (roomCodeInput || Math.random().toString(36).substring(2, 8)).toUpperCase();
    await createRoom(code, playerNameInput || (isTr ? 'Kaptan' : 'Flight Commander'), 'commander');
  };

  // Handle Join Room (Station is selected inside the room)
  const handleJoinSubmit = async () => {
    if (!roomCodeInput.trim()) return;
    await joinRoom(roomCodeInput.trim().toUpperCase(), playerNameInput || (isTr ? 'Mürettebat' : 'Crew Member'), 'engineer');
  };

  // Multi-destination campaign toggling & removal (Only commander can modify in multiplayer)
  const handleToggleDestination = (destId: string) => {
    if (isMultiplayer && !isHost) return;
    toggleCampaignDestination(destId as MissionId);
  };

  const handleRemoveDestination = (destId: string) => {
    if (isMultiplayer && !isHost) return;
    removeCampaignDestination(destId as MissionId);
  };

  // Solo Start
  const handleSoloStart = () => {
    startSoloMission();
  };

  const selectedDestinationContent = content.destinations.find(
    (d) => d.id === missionState.scenarioId
  ) || content.destinations[0];

  const hasTwoPlayers = players.length >= 2;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-sky-500/20 selection:text-white relative">
      {/* Global Ambient Deep Space Atmosphere & Cockpit Layers (strictly behind content) */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('./flight-kit/bg-hero-deepspace.webp')` }}
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F17]/25"
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-15"
        style={{ backgroundImage: `url('./flight-kit/orbital-grid-pattern.svg')`, backgroundSize: '320px' }}
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center opacity-20 mix-blend-screen"
        style={{ backgroundImage: `url('./flight-kit/bg-cockpit-overlay.png')` }}
      />
      {/* ------------------------------------------------------------------------- */}
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      {/* ------------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full bg-[#0B0F17]/90 border-b border-white/10 backdrop-blur-md px-4 md:px-8 py-3.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="#"
            className="flex items-center space-x-3 group cursor-pointer"
            title="ByteCore Home"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] group-hover:scale-125 transition-transform" />
            <span className="font-display font-semibold text-lg md:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
              BYTECORE
            </span>
          </a>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono text-slate-400">
            <a href="#lobby" className="hover:text-white transition-colors">
              {isTr ? 'LOBİ' : 'LOBBY'}
            </a>
            <button
              onClick={openAcademy}
              className="hover:text-sky-300 text-slate-400 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>{isTr ? 'EĞİTİME GİR' : 'ACADEMY'}</span>
            </button>
            <a href="#team" className="hover:text-white transition-colors">
              {isTr ? 'BYTECORE EKİBİ' : 'BYTECORE TEAM'}
            </a>
          </nav>

          {/* Right Controls: Language Selector & Launch CTA */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-900/80 border border-slate-700/80 p-0.5 rounded-full font-mono text-xs">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  locale === 'en'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('tr')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  locale === 'tr'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TR
              </button>
            </div>

            {/* Quick Launch CTA */}
            <a
              href="#lobby"
              className="flex items-center space-x-2 bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs md:text-sm px-4 md:px-5 py-2 rounded-full shadow-sm transition-all"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isTr ? 'GÖREV LOBİSİ' : 'EXPEDITION LOBBY'}</span>
            </a>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ------------------------------------------------------------------------- */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-white/10 bg-transparent z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-[1360px] mx-auto px-4 md:px-8 relative z-10 text-center space-y-6">
          {/* Headline */}
          <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            {content.site.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {content.site.heroSubtitle}
          </p>

          {/* Hero CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openAcademy}
              className="px-6 py-3 rounded-full bg-sky-500/10 border border-sky-400/40 hover:border-sky-300 text-sky-300 hover:text-white hover:bg-sky-500/20 font-semibold text-xs md:text-sm tracking-wider shadow-sm transition-all flex items-center space-x-2 cursor-pointer font-mono"
            >
              <Award className="w-4 h-4 text-sky-400" />
              <span>{isTr ? 'EĞİTİME GİR (UZAY AKADEMİSİ)' : 'ENTER ACADEMY (SPACE ACADEMY)'}</span>
            </button>

            <a
              href="#lobby"
              className="px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs md:text-sm tracking-wider shadow-sm transition-all flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>{content.site.createRoomBtn}</span>
            </a>

            <button
              onClick={handleSoloStart}
              className="px-6 py-3 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500 text-xs md:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{content.site.soloExploreBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* 3. DESTINATION SELECTION & MULTIPLAYER LOBBY (PRIOR TO LAUNCH) */}
      {/* ------------------------------------------------------------------------- */}
      <section id="lobby" className="py-16 border-b border-white/10 bg-[#0B0F17]/40 relative z-10">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white">
              {isTr ? 'Hedef Seçin ve Uçuş Köprüsünü Kurun' : 'Select Destination & Form Flight Crew'}
            </h2>
          </div>

          {/* Destination Selector Grid (Multi-Destination Campaign Setup) */}
          <div id="destinations" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                  {isTr ? 'GÖREV HEDEFLERİ' : 'MISSION TARGETS'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={openAcademy}
                  className="text-[11px] font-mono text-sky-400 hover:text-sky-300 transition-colors flex items-center space-x-1 cursor-pointer"
                  title={isTr ? 'Ön test ve uzay fiziği eğitimleri' : 'Pre-test and aerospace physics training'}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isTr ? 'Uçuş Akademisi' : 'Flight Academy'}</span>
                </button>
                <span className="text-[11px] font-mono text-emerald-400 font-medium">
                  {isTr ? 'Sefer Planı' : 'Campaign'}: {destinations.length}/2 {isTr ? 'Hedef' : 'Target(s)'}
                </span>
              </div>
            </div>

            {/* Campaign Flight Plan Sequence Bar */}
            {destinations.length > 0 && (
              <div className="p-3 border border-sky-500/30 rounded-2xl overflow-hidden bg-[#0E1422] flex flex-wrap items-center gap-2 text-xs font-mono w-full max-w-full">
                <span className="text-sky-300 font-semibold uppercase tracking-wider flex items-center space-x-1.5 mr-2 shrink-0">
                  <Target className="w-3.5 h-3.5" />
                  <span>{isTr ? 'SEFER ROTASI:' : 'FLIGHT PLAN:'}</span>
                </span>
                <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                  {destinations.map((destId, idx) => {
                    const item = content.destinations.find((d) => d.id === destId);
                    return (
                      <React.Fragment key={destId}>
                        {idx > 0 && <span className="text-slate-600 font-bold shrink-0">➔</span>}
                        <span className="px-2.5 sm:px-3 py-1 rounded-full border border-sky-400/40 bg-[#0B0F17] text-white font-medium flex items-center space-x-1.5 sm:space-x-2 shadow-sm text-xs max-w-full">
                          <span className="text-sky-400 font-bold shrink-0">#{idx + 1}</span>
                          <span className="truncate">{item ? item.name : destId}</span>
                          {(!isMultiplayer || isHost) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDestination(destId);
                              }}
                              className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-1 shrink-0"
                              title={isTr ? 'Görevi Kaldır' : 'Remove Mission'}
                              aria-label={isTr ? 'Görevi kaldır' : 'Remove mission'}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full">
              {content.destinations.map((dest) => {
                const queueIndex = destinations.indexOf(dest.id as MissionId);
                const isInCampaign = queueIndex !== -1;
                const isMaxReached = destinations.length >= 2 && !isInCampaign;

                return (
                  <div
                    key={dest.id}
                    onClick={() => {
                      if (isMultiplayer && !isHost) return;
                      if (isInCampaign) {
                        handleRemoveDestination(dest.id);
                      } else if (!isMaxReached) {
                        handleToggleDestination(dest.id);
                      }
                    }}
                    className={`p-4 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between group ${
                      isInCampaign
                        ? 'border-sky-400/80 bg-[#111827] shadow-sm'
                        : isMaxReached
                        ? 'border-slate-800/60 bg-[#0E1422]/50 opacity-60 cursor-not-allowed'
                        : 'border-slate-800 hover:border-slate-700 bg-[#0E1422]'
                    } ${isMultiplayer && !isHost ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="space-y-3">
                      {/* Destination Artwork Banner */}
                      <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-white/10 group-hover:border-sky-400/40 transition-colors bg-[#080C14]">
                        <img
                          src={DESTINATION_ARTWORK[dest.id] || './flight-kit/card-moon-shackleton.webp'}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/20 to-transparent" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md border border-white/20 text-white tracking-wider">
                          {dest.target.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display font-medium text-base text-white mt-0.5 truncate">
                            {dest.name}
                          </h3>
                        </div>
                        {isInCampaign ? (
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="text-[11px] font-mono text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                              #{queueIndex + 1} {isTr ? 'SEÇİLDİ' : 'SELECTED'}
                            </span>
                            {(!isMultiplayer || isHost) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDestination(dest.id);
                                }}
                                className="w-5 h-5 rounded-full flex items-center justify-center bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/40 hover:text-white transition-colors cursor-pointer shrink-0"
                                title={isTr ? 'Görevi Kaldır' : 'Remove Mission'}
                                aria-label={isTr ? 'Görevi kaldır' : 'Remove mission'}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : isMultiplayer && !isHost ? (
                          <span className="text-[10px] font-mono text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-800 shrink-0">
                            {isTr ? 'KAPTAN SEÇER' : 'HOST ONLY'}
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                              isMaxReached
                                ? 'border-slate-800 text-slate-600'
                                : 'border-slate-700/60 text-slate-400 hover:text-white'
                            }`}
                          >
                            + {isTr ? 'SEÇ' : 'SELECT'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 font-mono text-xs tabular-nums">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isTr ? 'Gereken Δv' : 'Req. Δv'}:</span>
                        <strong className="text-white font-medium">{dest.deltaV.toLocaleString()} m/s</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isTr ? 'Mesafe' : 'Distance'}:</span>
                        <span className="text-slate-300">{dest.distance}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multiplayer Room Panel */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0E1422] p-6 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-xl md:text-2xl font-display font-medium text-white">
                  {isMultiplayer ? (
                    <span>{isTr ? 'Çok Oyunculu Görev Odası' : 'Active Collaborative Flight Bridge'}</span>
                  ) : (
                    <span>{isTr ? 'Görev Odası Oluştur veya Bağlan' : 'Create or Join Mission Room'}</span>
                  )}
                </h3>
              </div>

              {/* Status Chips & Leave Room Action */}
              <div className="flex items-center space-x-2">
                {isMultiplayer && (
                  <>
                    <div className="flex items-center space-x-2 bg-[#0B0F17] border border-slate-700 rounded-full px-3.5 py-1.5 font-mono text-xs">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400">{isTr ? 'Oda Kodu' : 'Room'}:</span>
                      <strong className="text-white tracking-widest">{roomCode}</strong>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isTr ? 'Kodu Kopyala' : 'Copy Room Code'}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={leaveRoom}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                      title={isTr ? 'Odadan Ayrıl' : 'Leave Room'}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Odadan Çık' : 'Leave Room'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {!isMultiplayer ? (
              /* Create or Join Controls */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                {/* Host Column */}
                <div className="space-y-4 pr-0 md:pr-6">
                  <h4 className="font-display font-medium text-base text-white flex items-center space-x-2">
                    <Rocket className="w-4 h-4 text-sky-400" />
                    <span>{isTr ? 'Oda Oluştur' : 'Host Room'}</span>
                  </h4>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">
                        {isTr ? 'Çağrı İşareti / İsminiz' : 'Callsign / Operator Name'}:
                      </label>
                      <input
                        type="text"
                        value={playerNameInput}
                        onChange={(e) => setPlayerNameInput(e.target.value)}
                        placeholder={isTr ? 'Örn: Kaptan Alex' : 'e.g., Flight Lead Alex'}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">
                        {isTr ? 'Özel Oda Kodu (Opsiyonel)' : 'Custom Room Code (Optional)'}:
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder={isTr ? 'Boş bırakılırsa otomatik üretilir' : 'Auto-generated if blank'}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white uppercase focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={isConnecting}
                      onClick={handleHostCreate}
                      className="w-full py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isConnecting ? (isTr ? 'Oda Kuruluyor...' : 'Establishing Room...') : (isTr ? 'Odayı Kur' : 'Create Room')}
                    </button>
                  </div>
                </div>

                {/* Join Column */}
                <div className="space-y-4 pt-6 md:pt-0 pl-0 md:pl-6">
                  <h4 className="font-display font-medium text-base text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>{isTr ? 'Mevcut Odaya Katıl' : 'Join Existing Room'}</span>
                  </h4>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">
                        {isTr ? 'Oda Kodu' : 'Room Code'}:
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder={isTr ? 'Örn: ARTMIS' : 'e.g., ARTMIS'}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-sm text-white uppercase font-bold tracking-widest focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">
                        {isTr ? 'Çağrı İşareti / İsminiz' : 'Callsign / Operator Name'}:
                      </label>
                      <input
                        type="text"
                        value={playerNameInput}
                        onChange={(e) => setPlayerNameInput(e.target.value)}
                        placeholder={isTr ? 'Örn: Mühendis Elena' : 'e.g., Engineer Elena'}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={isConnecting || !roomCodeInput.trim()}
                      onClick={handleJoinSubmit}
                      className="w-full py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isConnecting ? (isTr ? 'Bağlanılıyor...' : 'Connecting...') : (isTr ? 'Odaya Bağlan' : 'Connect to Crew')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Room Crew Roster & Launch Gate */
              <div className="space-y-6">
                {/* Crew Roster Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span>{isTr ? 'MÜRETTEBAT KADROSU' : 'CONNECTED FLIGHT CREW'} ({players.length}/4)</span>
                    <span className="text-slate-600">•</span>
                    <span className={hasTwoPlayers ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                      {hasTwoPlayers
                        ? (isTr ? 'BAŞLATMAYA HAZIR (2+ OYUNCU)' : 'MINIMUM CREW SATISFIED (2+ PLAYERS)')
                        : (isTr ? 'EN AZ 2 OYUNCU GEREKİYOR' : 'MINIMUM 2 PLAYERS REQUIRED')}
                    </span>
                  </div>

                  {/* Quick Crew & AI Action Helpers */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 2-Player Dual Station Auto-Distribution */}
                    <button
                      onClick={() => {
                        if (isHost) {
                          claimRole('commander');
                          claimSecondaryRole('comms');
                        } else {
                          claimRole('engineer');
                          claimSecondaryRole('scientist');
                        }
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-sky-500/40 hover:border-sky-400 text-[11px] text-sky-300 hover:text-white transition-colors bg-sky-500/10"
                      title={isTr ? '2 kişi oynarken tüm 4 istasyonu 2 ve 2 olarak otomatik paylaştırır' : 'Auto-splits all 4 stations across 2 players (Commander/Comms & Engineer/Science)'}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isTr ? '2 Kişilik Dağılım (2 İstasyon/Kişi)' : '2-Player Split (2 Stations/Player)'}</span>
                    </button>

                    {/* AI Flight Assistant: Auto-Optimize All Systems */}
                    <button
                      onClick={optimizeWithAI}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-emerald-500/40 hover:border-emerald-400 text-[11px] text-emerald-300 hover:text-white transition-colors bg-emerald-500/10"
                      title={isTr ? 'Yapay zeka tüm alt sistemleri analiz eder ve uçuşu nominal seviyeye getirir' : 'AI balances all subsystems to achieve nominal flight readiness'}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Yapay Zeka ile Optimize Et' : 'AI Auto-Optimize'}</span>
                    </button>

                    {/* Add Simulated Test Co-Pilot (Makes Autonomous Subsystem Changes) */}
                    {players.length < 4 && (
                      <button
                        onClick={addSimulatedCoPilot}
                        className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-700/80 hover:border-slate-500 text-[11px] text-slate-300 hover:text-white transition-colors bg-slate-900/60"
                        title="Add a simulated co-pilot that actively modifies its station subsystems"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isTr ? '+ Test Co-Pilot Ekle (Otonom Değişiklik Yapar)' : '+ Add Test Co-Pilot (Autonomous Updates)'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Crew Slots Grid (Supports Primary & Secondary Dual Stations) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(['commander', 'engineer', 'scientist', 'comms'] as PlayerRole[]).map((role) => {
                    const assignedPrimary = players.find((p) => p.role === role);
                    const assignedSecondary = players.find((p) => p.secondaryRole === role);
                    const isMyPrimary = myPlayerInfo.role === role;
                    const isMySecondary = myPlayerInfo.secondaryRole === role;
                    const occupant = assignedPrimary || assignedSecondary;

                    return (
                      <div
                        key={role}
                        className={`p-4 border rounded-2xl overflow-hidden flex flex-col justify-between ${
                          isMyPrimary || isMySecondary
                            ? 'border-sky-500/60 bg-[#0E1526]'
                            : assignedPrimary || assignedSecondary
                            ? 'border-slate-800 bg-[#0B0F17]'
                            : 'border-slate-800/60 border-dashed bg-[#0B0F17]/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {role === 'commander' && (isTr ? 'KOMUTA' : 'COMMAND')}
                              {role === 'engineer' && (isTr ? 'GÜÇ & İTKİ' : 'POWER & PROP')}
                              {role === 'scientist' && (isTr ? 'BİLİM YÜKÜ' : 'PAYLOAD')}
                              {role === 'comms' && (isTr ? 'HABERLEŞME' : 'COMMS')}
                            </span>
                            {occupant && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                  occupant.isReady
                                    ? 'text-emerald-300 border border-emerald-500/30 bg-emerald-500/10'
                                    : 'text-amber-300 border border-amber-500/30 bg-amber-500/10'
                                }`}
                              >
                                {occupant.isReady ? (isTr ? '✓ ONAYLANDI (GO)' : 'GO') : (isTr ? 'BEKLİYOR' : 'STANDBY')}
                              </span>
                            )}
                          </div>

                          <div className="font-display font-medium text-sm text-white pt-1">
                            {assignedPrimary ? (
                              <span>{assignedPrimary.name}</span>
                            ) : assignedSecondary ? (
                              <span className="text-purple-300">{assignedSecondary.name}</span>
                            ) : (
                              <span className="text-slate-500">{isTr ? 'Boş İstasyon' : 'Uncrewed Console'}</span>
                            )}
                          </div>

                          {isMyPrimary && (
                            <span className="text-[10px] font-mono text-sky-400 block font-semibold">
                              ({isTr ? '1. İstasyonunuz - Siz' : 'Primary Station - You'})
                            </span>
                          )}
                          {isMySecondary && (
                            <span className="text-[10px] font-mono text-purple-300 block font-semibold">
                              ({isTr ? '2. İstasyonunuz - Siz' : 'Secondary Station - You'})
                            </span>
                          )}
                          {!isMyPrimary && !isMySecondary && assignedSecondary && (
                            <span className="text-[9px] font-mono text-slate-400 block">
                              ({assignedSecondary.name} {isTr ? '2. İstasyon' : 'Secondary'})
                            </span>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800 space-y-1.5">
                          {isMyPrimary ? (
                            <button
                              onClick={toggleReady}
                              className={`w-full py-1.5 rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                                myPlayerInfo.isReady
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                  : 'border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                              }`}
                            >
                              {myPlayerInfo.isReady ? (isTr ? '✓ ONAYLANDI (GO)' : 'READY (GO)') : (isTr ? 'HAZIR OL' : 'TOGGLE READY')}
                            </button>
                          ) : isMySecondary ? (
                            <div className="space-y-1.5">
                              <button
                                onClick={toggleReady}
                                className={`w-full py-1.5 rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                                  myPlayerInfo.isReady
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    : 'border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                                }`}
                              >
                                {myPlayerInfo.isReady ? (isTr ? '✓ ONAYLANDI (GO)' : 'READY (GO)') : (isTr ? 'HAZIR OL' : 'TOGGLE READY')}
                              </button>
                              <button
                                onClick={() => claimSecondaryRole(undefined)}
                                className="w-full py-1 rounded-full border border-rose-500/40 text-[10px] font-mono text-rose-300 hover:bg-rose-500/20 hover:text-white transition-colors cursor-pointer"
                              >
                                {isTr ? '✕ 2. İstasyonu Bırak' : '✕ Release Station'}
                              </button>
                            </div>
                          ) : !assignedPrimary ? (
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => claimRole(role)}
                                className="py-1 px-1.5 rounded-full border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white transition-colors text-center cursor-pointer"
                              >
                                {isTr ? '1. İstasyon' : 'Primary'}
                              </button>
                              <button
                                onClick={() => claimSecondaryRole(role)}
                                className="py-1 px-1.5 rounded-full border border-purple-500/50 bg-purple-500/10 text-[10px] font-mono text-purple-300 hover:text-white hover:bg-purple-500/20 transition-colors text-center cursor-pointer"
                              >
                                {isTr ? '+ 2. İstasyon' : '+ 2nd Role'}
                              </button>
                            </div>
                          ) : !assignedSecondary && !myPlayerInfo.secondaryRole ? (
                            <button
                              onClick={() => claimSecondaryRole(role)}
                              className="w-full py-1 rounded-full border border-purple-500/50 bg-purple-500/10 text-[11px] font-mono text-purple-300 hover:text-white hover:bg-purple-500/20 transition-colors cursor-pointer"
                            >
                              {isTr ? '+ 2. İstasyon Olarak Al' : '+ Claim as 2nd Station'}
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-500 block text-center">
                              {assignedPrimary.isHost ? (isTr ? 'Oda Sahibi' : 'Room Host') : (isTr ? 'Mürettebat' : 'Crew Member')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* HARD CONSTRAINT: START MISSION BUTTON (LOCKED UNTIL 2 PLAYERS) */}
                {/* ------------------------------------------------------------- */}
                <div className="pt-4 p-5 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-mono">
                      {hasTwoPlayers ? (
                        <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                          <Unlock className="w-4 h-4" />
                          <span>{isTr ? 'FIRLATMA KİLİDİ AÇILDI' : 'LAUNCH GATE UNLOCKED'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                          <Lock className="w-4 h-4" />
                          <span>{isTr ? 'FIRLATMA KİLİTLİ: EN AZ 2 OYUNCU' : 'LAUNCH LOCKED: MINIMUM 2 PLAYERS'}</span>
                        </span>
                      )}
                      <span className="text-slate-600">|</span>
                      <span className="text-white font-medium">
                        {isTr ? 'Sefer Rotası' : 'Campaign'}: <strong>{destinations.map((d) => content.destinations.find((cd) => cd.id === d)?.name || d).join(' ➔ ')}</strong>
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs max-w-lg leading-relaxed">
                      {hasTwoPlayers
                        ? (isTr
                            ? 'Mürettebat koşulu sağlandı. Fırlatıldığında seçilen sefer rotası kilitlenir ve aktif uçuş konsolunda simülasyona başlanır.'
                            : 'Minimum crew satisfied. Launching locks this campaign sequence inside the flight bridge for the multi-stage mission.')
                        : (isTr
                            ? 'Görevi başlatmak için lobide en az 2 oyuncu bulunmalıdır. Arkadaşınızı davet edin veya test için "Test Co-Pilot Ekle" butonunu kullanın.'
                            : 'At least 2 players must be in the lobby to start the mission. Invite a teammate or click "Add Test Co-Pilot" for solo evaluation.')}
                    </p>
                  </div>

                  <div>
                    {isHost ? (
                      <button
                        disabled={!hasTwoPlayers}
                        onClick={startMultiplayerMission}
                        className={`px-8 py-3 rounded-full font-semibold text-xs md:text-sm tracking-wider shadow-sm transition-all flex items-center space-x-2 ${
                          hasTwoPlayers
                            ? 'bg-white text-slate-950 hover:bg-slate-100 cursor-pointer'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {hasTwoPlayers ? <Play className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
                        <span>
                          {hasTwoPlayers
                            ? (isTr ? `SEFERİ BAŞLAT (${destinations.length} HEDEF)` : `START CAMPAIGN (${destinations.length} TARGET${destinations.length > 1 ? 'S' : ''})`)
                            : (isTr ? 'MÜRETTEBAT BEKLENİYOR (2/2)' : 'WAITING FOR CREW (2/2)')}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center font-mono text-xs text-slate-400 border border-slate-700/80 px-5 py-2.5 rounded-full bg-slate-900/60">
                        {isTr ? 'KAPTANIN SEFERİ BAŞLATMASI BEKLENİYOR...' : 'WAITING FOR COMMANDER TO START CAMPAIGN...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* 4. SPACE FLIGHT ACADEMY SHOWCASE (EĞİTİM BÖLÜMÜ)                         */}
      {/* ------------------------------------------------------------------------- */}
      <section id="academy" className="py-16 border-b border-white/10 relative z-10 bg-[#0B0F17]/40">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <div className="text-sky-400 text-[11px] font-mono tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{isTr ? 'UZAY UÇUŞ AKADEMİSİ' : 'SPACE FLIGHT ACADEMY'}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white">
              {isTr ? 'Uçuş Öncesi Sistem Mühendisliği Eğitimi' : 'Pre-Flight Aerospace Systems Training'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-mono">
              {isTr
                ? 'Tsiolkovsky roket dinamiği, ters kare güneş ışınımı, DSN radyo iletişimi, radyasyon kalkanı ve alt sistem optimizasyonunu etkileşimli simülatörler ve sesli anlatımla keşfedin.'
                : 'Master Tsiolkovsky orbital mechanics, inverse-square solar flux, Deep Space Network attenuation, radiation shielding, and subsystem trades through interactive simulators and voice narration.'}
            </p>
          </div>

          {/* 5 Module Artwork Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                id: 'delta-v',
                title: isTr ? 'Delta-V & İtki' : 'Delta-V & Thrust',
                desc: isTr ? 'Tsiolkovsky roket denklemi ve Hohmann geçişi' : 'Tsiolkovsky equation & Hohmann transfers',
                img: './flight-kit/module-delta-v.webp',
              },
              {
                id: 'solar',
                title: isTr ? 'Güneş Akısı & Isı' : 'Solar Flux & Thermal',
                desc: isTr ? 'Ters kare kanunu (1/r²) ve güç panelleri' : 'Inverse-square irradiance & power margins',
                img: './flight-kit/module-solar-flux.webp',
              },
              {
                id: 'telecom',
                title: isTr ? 'DSN İletişimi' : 'DSN Telecom',
                desc: isTr ? 'Serbest uzay yol kaybı (FSPL) ve anten çapı' : 'Free space path loss & ground receivers',
                img: './flight-kit/module-dsn-comm.webp',
              },
              {
                id: 'radiation',
                title: isTr ? 'Radyasyon Kalkanı' : 'Radiation Shielding',
                desc: isTr ? 'Güneş fırtınaları ve iyonize parçacıklar' : 'Coronal mass ejections & ion hardening',
                img: './flight-kit/module-radiation.webp',
              },
              {
                id: 'tradeoffs',
                title: isTr ? 'Sistem Dengeleme' : 'System Trades',
                desc: isTr ? 'Kütle, bütçe ve bilim puanı optimizasyonu' : 'Pareto-optimal mass, budget & payload balance',
                img: './flight-kit/module-tradeoffs.webp',
              },
            ].map((mod) => (
              <div
                key={mod.id}
                onClick={openAcademy}
                className="group border border-white/10 rounded-2xl overflow-hidden bg-[#0E1422]/90 hover:border-sky-400/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 overflow-hidden bg-[#080C14]">
                    <img
                      src={mod.img}
                      alt={mod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/30 to-transparent" />
                  </div>
                  <div className="p-3.5 space-y-1">
                    <h4 className="font-display font-medium text-sm text-white group-hover:text-sky-300 transition-colors">
                      {mod.title}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prominent CTA Button: EĞİTİME KATIL */}
          <div className="text-center pt-2">
            <button
              onClick={openAcademy}
              className="px-8 py-3.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs md:text-sm tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center space-x-2.5 cursor-pointer font-mono group"
            >
              <Award className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              <span>{isTr ? 'EĞİTİME KATIL' : 'JOIN ACADEMY'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* 5. TEAM PROFILE & MISSION STATEMENT */}
      {/* ------------------------------------------------------------------------- */}
      <section id="team" className="py-16 bg-[#0B0F17]/50 relative z-10">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 space-y-10">
          {/* Section Header: Lean & Impactful */}
          <div className="text-center space-y-2">
            <div className="text-slate-400 text-[11px] font-mono tracking-widest uppercase">
              {content.team.subtitle}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white">
              {content.team.name}
            </h2>
          </div>

          {/* Team Members Grid: Clean 1-Line Badges & Scannable Presentation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.team.members.map((member, i) => (
              <div
                key={i}
                className="p-5 border border-slate-800 rounded-2xl overflow-hidden bg-[#0E1422] flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-slate-700 text-slate-300 bg-slate-900/80 uppercase">
                      {member.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold">
                      {member.callsign}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-medium text-base text-white">
                      {member.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400 block mt-1">
                      {member.bio}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};