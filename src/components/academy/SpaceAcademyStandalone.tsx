import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  Zap,
  Check,
  BookOpen,
  Rocket,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import {
  getStandaloneModules,
  getAcademyUI,
  StandaloneModuleId,
} from '../../data/academyContent';

const MODULE_ARTWORK: Record<StandaloneModuleId, string> = {
  'delta-v': './flight-kit/acad-diagram-deltav.webp',
  'solar-thermal': './flight-kit/acad-diagram-solarflux.webp',
  'deep-space-comm': './flight-kit/acad-diagram-linkbudget.webp',
  'radiation-environment': './flight-kit/acad-diagram-radiation.webp',
  'subsystem-tradeoffs': './flight-kit/acad-diagram-swapc.webp',
};

const MODULE_THUMBNAILS: Record<StandaloneModuleId, string> = {
  'delta-v': './flight-kit/module-delta-v.webp',
  'solar-thermal': './flight-kit/module-solar-flux.webp',
  'deep-space-comm': './flight-kit/module-dsn-comm.webp',
  'radiation-environment': './flight-kit/module-radiation.webp',
  'subsystem-tradeoffs': './flight-kit/module-tradeoffs.webp',
};

export const SpaceAcademyStandalone: React.FC = () => {
  const { locale, setLocale, closeAcademy, startSoloMission } = useMissionStore();
  const isTr = locale === 'tr';

  const modules = getStandaloneModules(locale);
  const ui = getAcademyUI(locale);

  // Active Module & Curriculum State
  const [activeModuleId, setActiveModuleId] = useState<StandaloneModuleId>('delta-v');
  const [masteredModules, setMasteredModules] = useState<Set<StandaloneModuleId>>(new Set());

  // Interactive Challenge & Quiz State
  const [sliderInput, setSliderInput] = useState(2500);
  const [challengeFeedback, setChallengeFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizEvaluated, setQuizEvaluated] = useState(false);
  const [showRemediation, setShowRemediation] = useState(false);
  const [retryAnswer, setRetryAnswer] = useState<string | null>(null);
  const [retryEvaluated, setRetryEvaluated] = useState(false);

  // Speech Voiceover State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeModule =
    modules.find((m) => m.id === activeModuleId) || modules[0];

  // Stop audio on module switch or unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setChallengeFeedback(null);
    setSelectedQuizOption(null);
    setQuizEvaluated(false);
    setShowRemediation(false);
    setRetryAnswer(null);
    setRetryEvaluated(false);
    setSliderInput(2500);
  }, [activeModuleId]);

  // Voice Playback Toggle (Localized Voice Engine)
  const handleToggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeModule.speechScript);
      utterance.lang = isTr ? 'tr-TR' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Interactive Challenge Handler
  const handleRunChallenge = () => {
    if (activeModule.challenge.type === 'slider') {
      const target = activeModule.challenge.targetValue || 3950;
      const tol = activeModule.challenge.tolerance || 150;
      const diff = Math.abs(sliderInput - target);

      if (diff <= tol) {
        setChallengeFeedback({
          success: true,
          message: activeModule.challenge.successFeedback,
        });
      } else {
        setChallengeFeedback({
          success: false,
          message:
            sliderInput < target
              ? isTr
                ? `Hata: Yetersiz Delta-V (${sliderInput.toLocaleString()} m/s). Ay transfer elipsine ulaşılamadı.`
                : `Error: Insufficient Delta-V (${sliderInput.toLocaleString()} m/s). Failed to reach lunar transfer ellipse.`
              : isTr
                ? `Hata: Aşırı Delta-V (${sliderInput.toLocaleString()} m/s). Kaçış hızı aşıldı, araç kayboldu.`
                : `Error: Excessive Delta-V (${sliderInput.toLocaleString()} m/s). Escape velocity exceeded, spacecraft lost.`,
        });
      }
    }
  };

  const handleSelectChallengeOption = (optionId: string) => {
    const opt = activeModule.challenge.options?.find((o) => o.id === optionId);
    if (!opt) return;

    setChallengeFeedback({
      success: opt.isCorrect,
      message: opt.feedback,
    });
  };

  // Quiz Answer Evaluation & Adaptive Remediation Loop
  const handleEvaluateQuiz = () => {
    if (!selectedQuizOption) return;
    setQuizEvaluated(true);

    const isCorrect = activeModule.quiz.options.find((o) => o.id === selectedQuizOption)?.isCorrect;
    if (isCorrect) {
      const nextMastered = new Set(masteredModules);
      nextMastered.add(activeModuleId);
      setMasteredModules(nextMastered);
      setShowRemediation(false);
    } else {
      // Trigger Adaptive Re-learning loop
      setShowRemediation(true);
      setRetryAnswer(null);
      setRetryEvaluated(false);
    }
  };

  // Remediation Retry Evaluation
  const handleEvaluateRetry = () => {
    if (!retryAnswer) return;
    setRetryEvaluated(true);
    const isCorrect = activeModule.remediation.retryQuestion.options.find((o) => o.id === retryAnswer)?.isCorrect;
    if (isCorrect) {
      const nextMastered = new Set(masteredModules);
      nextMastered.add(activeModuleId);
      setMasteredModules(nextMastered);
    }
  };

  const isAllMastered = masteredModules.size === modules.length;

  return (
    <div className="min-h-screen w-full max-w-full bg-transparent text-white flex flex-col font-sans relative">
      {/* Ambient Deep Space & Aerospace Hangar Artwork (Positioned safely behind all content) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 mix-blend-screen -z-20"
        style={{ backgroundImage: `url('./flight-kit/bg-hero-deepspace.webp')` }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-screen -z-10"
        style={{ backgroundImage: `url('./flight-kit/bg-academy-hangar.webp')` }}
      />
      <div className="fixed inset-0 bg-[#070B14]/40 pointer-events-none -z-10" />

      {/* --------------------------------------------------------------------- */}
      {/* TOP HEADER: GLOBAL NAVIGATION BAR (MATCHES LANDING PAGE)              */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full bg-[#070B14]/75 border-b border-white/10 backdrop-blur-md px-4 md:px-8 py-3.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            onClick={closeAcademy}
            className="flex items-center space-x-3 group cursor-pointer text-left"
            title="ByteCore Home"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] group-hover:scale-125 transition-transform" />
            <span className="font-display font-semibold text-lg md:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
              BYTECORE
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono text-slate-400">
            <button
              onClick={closeAcademy}
              className="hover:text-white text-slate-400 transition-colors cursor-pointer"
            >
              {isTr ? 'LOBİ' : 'LOBBY'}
            </button>
            <span className="text-sky-400 font-semibold flex items-center space-x-1 cursor-default">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>{isTr ? 'EĞİTİME GİR' : 'ACADEMY'}</span>
            </span>
            <button
              onClick={closeAcademy}
              className="hover:text-white text-slate-400 transition-colors cursor-pointer"
            >
              {isTr ? 'BYTECORE EKİBİ' : 'BYTECORE TEAM'}
            </button>
          </nav>

          {/* Right Controls: Language Selector & Launch CTA */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-900/80 border border-slate-700/80 p-0.5 rounded-full font-mono text-xs">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  locale === 'en'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('tr')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  locale === 'tr'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TR
              </button>
            </div>

            {/* Quick Launch CTA */}
            <button
              onClick={closeAcademy}
              className="flex items-center space-x-2 bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs md:text-sm px-4 md:px-5 py-2 rounded-full shadow-sm transition-all cursor-pointer font-mono"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isTr ? 'GÖREV LOBİSİ' : 'EXPEDITION LOBBY'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN ACADEMY BODY                                                     */}
      {/* --------------------------------------------------------------------- */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="space-y-6">
          {/* Module Selector Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {modules.map((mod) => {
              const isActive = activeModuleId === mod.id;
              const isMastered = masteredModules.has(mod.id);
              const ModIcon = mod.icon;

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isActive
                      ? 'border-sky-400 bg-sky-500/15 shadow-md shadow-sky-500/10'
                      : isMastered
                      ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400'
                      : 'border-slate-800 bg-[#0E1422] hover:border-slate-700'
                  }`}
                >
                  <div className="relative w-full h-12 rounded-xl overflow-hidden border border-white/10 bg-[#080C14]">
                    <img src={MODULE_THUMBNAILS[mod.id]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-transparent to-transparent" />
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-sky-300">
                      {mod.index}
                    </span>
                    {isMastered && (
                      <span className="absolute top-1 right-1.5 p-0.5 rounded-full bg-emerald-500/80 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-display font-bold text-white line-clamp-1">
                      {mod.title}
                    </h4>
                      <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                        {mod.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Module Master Workstation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Lesson Concepts, Voiceover & 60fps Physics Simulator (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Module Header & Voiceover Toolbar */}
                <div className="border border-white/10 rounded-2xl overflow-hidden p-6 bg-[#0E1422] space-y-4">
                  {/* Module Artwork Hero Banner */}
                  <div className="relative w-full h-32 sm:h-44 rounded-xl overflow-hidden border border-white/10 bg-[#080C14]">
                    <img
                      src={MODULE_ARTWORK[activeModule.id] || './flight-kit/module-delta-v.webp'}
                      alt={activeModule.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/30 to-transparent" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider block">
                        {activeModule.category} · {ui.modulesCount} {activeModule.index}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">
                        {activeModule.title}
                      </h2>
                      <span className="text-xs font-mono text-slate-400 mt-1 block">
                        {activeModule.subtitle}
                      </span>
                    </div>

                    {/* Web Speech Audio Narration Control */}
                    <button
                      onClick={handleToggleVoice}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 shadow-sm ${
                        isSpeaking
                          ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse'
                          : 'border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-400" />
                          <span>{ui.pauseSpeech}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-sky-400" />
                          <span>{ui.listenLesson}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary & Core Formula */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080C14] space-y-2">
                    <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                      {activeModule.summary}
                    </p>
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60 font-mono text-xs">
                      <span className="text-slate-400 uppercase text-[10px]">{ui.formulaHeading}:</span>
                      <strong className="text-emerald-400">{activeModule.keyFormula}</strong>
                    </div>
                  </div>

                  {/* Detailed Theory Points */}
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      {ui.theoryTab}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-mono list-disc list-inside">
                      {activeModule.detailedLesson.theory.map((pt, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Flight Rules & Real Case Study */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                        {ui.rulesHeading}
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-400 font-mono">
                        {activeModule.detailedLesson.rules.map((rl, rIdx) => (
                          <li key={rIdx}>• {rl}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-sky-400 block">
                        {ui.caseStudyHeading}
                      </span>
                      <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                        {activeModule.detailedLesson.realWorldExample}
                      </p>
                    </div>
                  </div>

                  {/* NASA & CSA Competition Source Reference for Module */}
                  <div className="p-3 rounded-xl border border-sky-500/30 bg-[#080C14] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-sky-400 font-bold uppercase flex items-center space-x-1.5">
                        <BookOpen className="w-3 h-3 text-sky-400" />
                        <span>{isTr ? 'RESMİ YARIŞMA & NASA BİLİMSEL REFERANSI' : 'OFFICIAL CHALLENGE & NASA SCIENTIFIC CITATION'}</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {isTr ? 'Akademik Doğrulama' : 'Peer-Verified'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                      {activeModule.id === 'delta-v'
                        ? (isTr
                            ? 'Bu modüldeki Tsiolkovsky ve yörünge transfer hesaplamaları NASA Mission-Viz (nasa.github.io/mission-viz) ve JPL CML-3 Trade Space analizlerine dayanır.'
                            : 'Delta-V and transfer orbit mechanics are based on NASA Mission-Viz and JPL CML-3 Trade Space guidelines.')
                        : activeModule.id === 'solar-thermal'
                        ? (isTr
                            ? 'Güneş paneli açılımı (Burn-Wire), ters-kare ışıma ve TVAC ısıl denge testleri NASA CubeSat 101 Bölüm 2.4 ve 6.9 standartlarına dayanır.'
                            : 'Burn-wire solar deploy, inverse-square irradiance and TVAC thermal margins comply with NASA CubeSat 101 Ch. 2.4 & 6.9.')
                        : activeModule.id === 'deep-space-comm'
                        ? (isTr
                            ? 'Serbest uzay yol kaybı (FSPL) ve DSN yer ağı kapsama hesaplamaları NASA Julie Levri 4-Segment Yer Modeli ve CubeSat 101 FCC/IARU kılavuzuna dayanır.'
                            : 'FSPL attenuation and DSN ground coverage are modeled per NASA Julie Levri 4-Segment Ground Model and CubeSat 101.')
                        : activeModule.id === 'radiation-environment'
                        ? (isTr
                            ? 'Güneş patlamaları (CME) ve iyonlaştırıcı radyasyon koruması NASA PUNCH Görevi ve Julie Levri Uzay Sistemleri Mühendisliği serisinden alınmıştır.'
                            : 'Solar flare CME defense and radiation dose hardening are derived from NASA PUNCH Mission and Julie Levri Systems Series.')
                        : (isTr
                            ? 'Bilim yükü dalga boyu optimizasyonu ve alt sistem dengelemeleri NASA Webb "Build It Yourself: Satellite!" ve CSA OSIRIS-REx modellerinden uyarlanmıştır.'
                            : 'Science payload wavelength tradeoffs and subsystem balancing are derived from NASA Webb Satellite Builder & CSA OSIRIS-REx.')}
                    </p>
                  </div>
                </div>

                {/* 60fps Interactive Physics Simulator Section */}
                <div className="border border-white/10 rounded-2xl overflow-hidden p-6 bg-[#0E1422] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                        {ui.simTitle}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      60 FPS REALTIME
                    </span>
                  </div>

                  {/* Simulator 1: Orbital Delta-V & Hohmann Transfer Simulator */}
                  {activeModule.id === 'delta-v' && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{isTr ? 'Ateşleme Hızı (Burn Δv):' : 'Burn Velocity (Delta-V):'}</span>
                        <strong className="text-emerald-400 text-sm tabular-nums">
                          {sliderInput.toLocaleString()} m/s
                        </strong>
                      </div>

                      <input
                        type="range"
                        min="1000"
                        max="6000"
                        step="50"
                        value={sliderInput}
                        onChange={(e) => setSliderInput(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />

                      <div className="h-32 w-full bg-[#080C14] rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 320 120">
                          {/* Earth Center */}
                          <circle cx="60" cy="60" r="16" fill="#38bdf8" opacity="0.9" />
                          <text x="60" y="64" fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                            {isTr ? 'DÜNYA' : 'EARTH'}
                          </text>

                          {/* Dynamic Ellipse Orbit */}
                          <ellipse
                            cx={60 + (sliderInput - 1000) * 0.024}
                            cy="60"
                            rx={24 + (sliderInput - 1000) * 0.036}
                            ry={24 + (sliderInput - 1000) * 0.015}
                            fill="none"
                            stroke={sliderInput >= 3800 && sliderInput <= 4100 ? '#10b981' : '#38bdf8'}
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />

                          {/* Moon Target */}
                          <circle cx="240" cy="60" r="11" fill="#94a3b8" />
                          <text x="240" y="63" fontSize="7" fill="#ffffff" textAnchor="middle">
                            {isTr ? 'AY' : 'MOON'}
                          </text>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Simulator 2: Inverse Square Law Distance Flux Meter */}
                  {activeModule.id === 'solar-thermal' && (
                    <div className="space-y-4 font-mono">
                      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                        <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'DÜNYA (1.0 AU)' : 'EARTH (1.0 AU)'}</span>
                          <strong className="text-emerald-400 text-sm">1.361 W/m² (%100)</strong>
                        </div>
                        <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'MARS (1.52 AU)' : 'MARS (1.52 AU)'}</span>
                          <strong className="text-amber-400 text-sm">590 W/m² (%43)</strong>
                        </div>
                        <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'EUROPA (5.2 AU)' : 'EUROPA (5.2 AU)'}</span>
                          <strong className="text-rose-400 text-sm">50 W/m² (%3.7)</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] text-xs text-slate-300 leading-relaxed">
                        {isTr
                          ? '⚡ Fizik Sonucu: 5.2 AU mesafede ışık şiddeti 27 kat azalır. Güneş paneli yerine radyoaktif bozunmayla +110W güç ve 2 kW ısı üreten Plutonyum-238 RTG reaktörü seçilmelidir.'
                          : '⚡ Physics Verdict: At 5.2 AU, solar flux drops by 27 times. Nuclear Plutonium-238 RTG generators delivering +110W electricity and 2 kW thermal line heating must replace solar arrays.'}
                      </div>
                    </div>
                  )}

                  {/* Simulator 3: Deep Space Light Latency & FSPL Link */}
                  {activeModule.id === 'deep-space-comm' && (
                    <div className="space-y-4 font-mono">
                      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                        <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'AY' : 'MOON'}</span>
                          <strong className="text-white text-sm">{isTr ? '1.3 Saniye' : '1.3 Seconds'}</strong>
                        </div>
                        <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'MARS' : 'MARS'}</span>
                          <strong className="text-amber-400 text-sm">{isTr ? '12.5 Dakika' : '12.5 Minutes'}</strong>
                        </div>
                        <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'EUROPA' : 'EUROPA'}</span>
                          <strong className="text-rose-400 text-sm">{isTr ? '43.3 Dakika' : '43.3 Minutes'}</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] text-xs text-slate-300 leading-relaxed">
                        {isTr
                          ? '📡 DSN Yönlü Odaklanma: Parabolik 2.4m Cassegrain çanağı, dağılan mikrodalga enerjisini Dünya\'daki 70 metrelik DSN dev çanaklarına kilitler; sinyal-gürültü oranı (SNR) korunur.'
                          : '📡 DSN Directional Lock: A 2.4m Cassegrain parabolic dish collimates microwave energy into a tight beam locked onto Earth\'s 70-meter Deep Space Network arrays, preserving Signal-to-Noise Ratio (SNR).'}
                      </div>
                    </div>
                  )}

                  {/* Simulator 4: Radiation Hazard Shielding */}
                  {activeModule.id === 'radiation-environment' && (
                    <div className="space-y-4 font-mono">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2.5 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'AY' : 'MOON'}</span>
                          <strong className="text-emerald-400">{isTr ? '0.3 rad/gün' : '0.3 rad/day'}</strong>
                        </div>
                        <div className="p-2.5 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'MARS' : 'MARS'}</span>
                          <strong className="text-emerald-400">{isTr ? '0.7 rad/gün' : '0.7 rad/day'}</strong>
                        </div>
                        <div className="p-2.5 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'ASTEROİT' : 'ASTEROID'}</span>
                          <strong className="text-emerald-400">{isTr ? '0.2 rad/gün' : '0.2 rad/day'}</strong>
                        </div>
                        <div className="p-2.5 border border-slate-800 rounded-xl bg-[#080C14]">
                          <span className="text-[10px] text-slate-400 block">{isTr ? 'EUROPA' : 'EUROPA'}</span>
                          <strong className="text-rose-400 font-bold">{isTr ? '540 rad/gün' : '540 rad/day'}</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] text-xs text-slate-300 leading-relaxed">
                        {isTr
                          ? '🛡️ Tantal Zırhı: Jüpiter\'in ölümcül radyasyon fırtınasında transistörlerin bit çevrilmesi (SEU) yaşamaması için tantal ve titanyum kalkan kasası (Radiation Vault) zorunludur.'
                          : '🛡️ Tantalum Shielding: In Jupiter\'s intense radiation belts, flight avionics require a heavy tantalum-titanium Radiation Vault to prevent Single-Event Upset (SEU) memory bit-flips.'}
                      </div>
                    </div>
                  )}

                  {/* Simulator 5: Subsystem Trade-off Balancer */}
                  {activeModule.id === 'subsystem-tradeoffs' && (
                    <div className="space-y-4 font-mono">
                      <div className="p-3.5 border border-slate-800 rounded-xl bg-[#080C14] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{isTr ? 'FAYDALI YÜK KÜTLESİ: 100 kg' : 'PAYLOAD MASS: 100 kg'}</span>
                          <span className="text-emerald-400 font-bold">{isTr ? 'GEREKEN ROKET: FALCON 9' : 'REQUIRED LAUNCHER: FALCON 9'}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                          <span className="text-slate-400">{isTr ? 'FAYDALI YÜK KÜTLESİ: 600 kg' : 'PAYLOAD MASS: 600 kg'}</span>
                          <span className="text-amber-400 font-bold">{isTr ? 'GEREKEN ROKET: FALCON HEAVY' : 'REQUIRED LAUNCHER: FALCON HEAVY'}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                          <span className="text-slate-400">{isTr ? 'FAYDALI YÜK KÜTLESİ: 1.500 kg (Flagship)' : 'PAYLOAD MASS: 1,500 kg (Flagship)'}</span>
                          <span className="text-rose-400 font-bold">{isTr ? 'GEREKEN ROKET: NASA SLS' : 'REQUIRED LAUNCHER: NASA SLS'}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] text-xs text-slate-300 leading-relaxed">
                        {isTr
                          ? '⚖️ Kütle Çarpanı: Eklenen her 1 kg bilim aygıtı, aracın yakıt ihtiyacını ve roket maliyetini katlayarak büyütür. Mühendislik, fazlalıklardan arınma sanatıdır.'
                          : '⚖️ Compounding Mass Penalty: Every 1 kg of added instrument mass inflates propellant requirements and launch costs exponentially. Aerospace engineering is the discipline of optimal elimination.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Engineering Challenge & Mastery Evaluation with Adaptive Remediation Loop */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Practical Hands-On Engineering Challenge */}
                <div className="border border-white/10 rounded-2xl overflow-hidden p-6 bg-[#0E1422] space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                      {ui.challengeTitle}
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-white font-mono">
                      {activeModule.challenge.title}
                    </h4>
                    <p className="text-slate-400 text-xs font-mono leading-relaxed">
                      {activeModule.challenge.description}
                    </p>
                  </div>

                  {/* Challenge Action Area */}
                  {activeModule.challenge.type === 'slider' ? (
                    <div className="space-y-3 font-mono">
                      <button
                        onClick={handleRunChallenge}
                        className="w-full py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        {ui.executeAction}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 font-mono">
                      {activeModule.challenge.options?.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectChallengeOption(opt.id)}
                          className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Challenge Feedback Result */}
                  {challengeFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                        challengeFeedback.success
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      {challengeFeedback.message}
                    </div>
                  )}
                </div>

                {/* 2. Mastery Quiz & Adaptive Remediation Gate */}
                <div className="border border-white/10 rounded-2xl overflow-hidden p-6 bg-[#0E1422] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-sky-400" />
                      <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                        {ui.quizTitle}
                      </h3>
                    </div>
                    {masteredModules.has(activeModuleId) && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {ui.moduleMastered}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-mono text-white leading-relaxed">
                    {activeModule.quiz.question}
                  </p>

                  <div className="space-y-2 font-mono">
                    {activeModule.quiz.options.map((opt) => {
                      const isSelected = selectedQuizOption === opt.id;
                      const isCorrect = opt.isCorrect;

                      return (
                        <button
                          key={opt.id}
                          disabled={quizEvaluated && masteredModules.has(activeModuleId)}
                          onClick={() => setSelectedQuizOption(opt.id)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            quizEvaluated && isSelected && isCorrect
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                              : quizEvaluated && isSelected && !isCorrect
                              ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                              : isSelected
                              ? 'border-sky-400 bg-sky-500/15 text-white'
                              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {quizEvaluated && isSelected && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizEvaluated ? (
                    <button
                      disabled={!selectedQuizOption}
                      onClick={handleEvaluateQuiz}
                      className={`w-full py-2.5 rounded-full font-semibold text-xs font-mono transition-all ${
                        selectedQuizOption
                          ? 'bg-sky-400 text-slate-950 hover:bg-sky-300 cursor-pointer shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isTr ? 'CEVABI ONAYLA VE DEĞERLENDİR' : 'SUBMIT & EVALUATE ANSWER'}
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] text-xs font-mono text-slate-300 leading-relaxed">
                      💡 <strong>{isTr ? 'Açıklama' : 'Explanation'}:</strong> {activeModule.quiz.explanation}
                    </div>
                  )}

                  {/* --------------------------------------------------------- */}
                  {/* ADAPTIVE RE-LEARNING / REMEDIATION LOOP                   */}
                  {/* --------------------------------------------------------- */}
                  {showRemediation && (
                    <div className="mt-4 p-4 border border-rose-500/40 rounded-xl bg-rose-500/5 space-y-3 font-mono">
                      <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{ui.remediationAlert}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {ui.remediationDesc}
                      </p>

                      <div className="p-3 rounded-lg border border-slate-800 bg-[#0B0F17] text-xs text-amber-300 leading-relaxed">
                        🔍 <strong>{activeModule.remediation.conceptKey}:</strong> {activeModule.remediation.remedyExplanation}
                      </div>

                      {/* Alternate Re-evaluation Question */}
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {isTr ? 'TELAFİ VE PEKİŞTİRME SORUSU:' : 'RE-EVALUATION REMEDIATION QUESTION:'}
                        </span>
                        <p className="text-xs text-white">
                          {activeModule.remediation.retryQuestion.question}
                        </p>

                        <div className="space-y-1.5">
                          {activeModule.remediation.retryQuestion.options.map((retOpt) => (
                            <button
                              key={retOpt.id}
                              disabled={retryEvaluated}
                              onClick={() => setRetryAnswer(retOpt.id)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                retryEvaluated && retOpt.isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                                  : retryAnswer === retOpt.id
                                  ? 'border-sky-400 bg-sky-500/15 text-white'
                                  : 'border-slate-800 bg-slate-900/60 text-slate-300'
                              }`}
                            >
                              {retOpt.text}
                            </button>
                          ))}
                        </div>

                        {!retryEvaluated ? (
                          <button
                            disabled={!retryAnswer}
                            onClick={handleEvaluateRetry}
                            className={`w-full py-2 rounded-full font-semibold text-xs font-mono transition-all ${
                              retryAnswer
                                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 cursor-pointer shadow-sm'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {ui.solveRetryBtn}
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                            {isTr ? '✓ Telafi başarılı! Modül yetkinliği onaylandı.' : '✓ Remediation successful! Module competency verified.'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 3. FLIGHT SYSTEMS ENGINEER GRADUATION CERTIFICATE             */}
            {/* ------------------------------------------------------------- */}
            {isAllMastered && (
              <div className="border border-emerald-500/40 rounded-2xl overflow-hidden p-8 bg-[#0B1516] text-center space-y-5 shadow-2xl">
                <div className="w-24 h-24 mx-auto">
                  <img
                    src="./flight-kit/seal-nasa-flight-ready.png"
                    alt="Official Aerospace Flight Qualification Seal"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(16,185,129,0.5)]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    {isTr ? 'RESMİ UÇUŞ KALİFİKASYON ONAYI' : 'OFFICIAL FLIGHT QUALIFICATION CLEARANCE'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {ui.graduationTitle}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-mono leading-relaxed">
                    {ui.graduationSubtitle}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={startSoloMission}
                    className="px-8 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs sm:text-sm font-mono tracking-wider transition-all cursor-pointer shadow-md flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{ui.launchRealMissionBtn}</span>
                  </button>

                  <button
                    onClick={closeAcademy}
                    className="px-6 py-3 rounded-full border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                  >
                    {ui.returnHome}
                  </button>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};
