import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Radio,
  Sun,
  Zap,
  Orbit,
  Shield,
  Award,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

// ---------------------------------------------------------------------------
// TYPES & DATA CONTRACTS
// ---------------------------------------------------------------------------
export type AcademyModuleId = 'delta-v' | 'solar-irradiance' | 'deep-space-comm' | 'radiation-hazards';

interface DiagnosticQuestion {
  id: string;
  moduleId: AcademyModuleId;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

interface ModuleChallenge {
  title: string;
  instruction: string;
  type: 'slider' | 'select';
  targetValue?: number;
  tolerance?: number;
  options?: { id: string; label: string; isCorrect: boolean; feedback: string }[];
  successMessage: string;
}

interface AcademyModule {
  id: AcademyModuleId;
  title: string;
  category: string;
  icon: React.ElementType;
  keyFormula: string;
  takeaway: string;
  speechText: string;
  challenge: ModuleChallenge;
  quizQuestion: {
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  };
}

// ---------------------------------------------------------------------------
// DIAGNOSTIC ASSESSMENT QUESTIONS (Ön Seviye Belirleme)
// ---------------------------------------------------------------------------
const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-1',
    moduleId: 'delta-v',
    question: 'Bir uzay aracının Dünya yörüngesinden Ay veya Mars rotasına geçmesi için gereken toplam hız değişim bütçesine ne ad verilir?',
    options: [
      { id: 'a', text: 'Delta-V (Δv) — Hız Değişim Kapasitesi', isCorrect: true },
      { id: 'b', text: 'Özgül İtki (Isp) — Yakıt Verimliliği', isCorrect: false },
      { id: 'c', text: 'Yerçekimi İvmesi (g0)', isCorrect: false },
    ],
    explanation: 'Delta-V (Δv), roket motorunun uzay aracının hız vektörünü değiştirmek için harcadığı toplam hız kapasitesidir (m/s).',
  },
  {
    id: 'diag-2',
    moduleId: 'solar-irradiance',
    question: 'Jüpiter ve uydusu Europa (5.2 AU) çevresinde güneş panellerinin elektrik üretiminin Dünya\'ya kıyasla %3.7\'ye düşmesinin temel nedeni nedir?',
    options: [
      { id: 'a', text: 'Ters Kare Yasası (1/r²): Güneş ışığı mesafenin karesiyle azalır', isCorrect: true },
      { id: 'b', text: 'Jüpiter\'in devasa manyetosferinin güneş ışığını emmesi', isCorrect: false },
      { id: 'c', text: 'Derin uzaydaki düşük sıcaklığın silikon hücreleri dondurması', isCorrect: false },
    ],
    explanation: 'Işık akısı mesafe karesiyle ters orantılıdır (1/5.2² ≈ 1/27 = %3.7). Bu nedenle Europa gibi dış gezegenlerde nükleer RTG tercih edilir.',
  },
  {
    id: 'diag-3',
    moduleId: 'deep-space-comm',
    question: 'Mars veya Europa ile iletişimde omni (küresel) anten yerine neden yüksek kazançlı çanak anten (HGA) ve DSN kullanılır?',
    options: [
      { id: 'a', text: 'Serbest uzay yol kaybı (FSPL) mesafeyle büyür; dar hüzme ile sinyal odaklanmalıdır', isCorrect: true },
      { id: 'b', text: 'Güneş rüzgarı omni antenlerin frekansını bozar', isCorrect: false },
      { id: 'c', text: 'Işık hızının derin uzayda yavaşlamasını önlemek için', isCorrect: false },
    ],
    explanation: 'Serbest uzay yol kaybı (FSPL) milyonlarca kilometrede sinyali zayıflatır. Çanak anten sinyali dar bir ışın halinde Dünya\'daki DSN istasyonlarına odaklar.',
  },
];

// ---------------------------------------------------------------------------
// 4 INTERACTIVE MODULE SPECIFICATIONS
// ---------------------------------------------------------------------------
const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: 'delta-v',
    title: 'Delta-V (Δv) ve Yörünge Manevraları',
    category: 'YÖRÜNGE MEKANİĞİ',
    icon: Orbit,
    keyFormula: 'Δv = Isp · g₀ · ln(m₀ / mf)',
    takeaway: 'Delta-V, uzay aracının gidebileceği mesafeyi belirleyen hız para birimidir. Alçak Dünya Yörüngesi (LEO) için 9.400 m/s, Ay transferi için +3.950 m/s, Mars için +5.600 m/s gerekir.',
    speechText: 'Delta-V, roketinizin harcayabileceği toplam hız değişim bütçesidir. Tsiolkovsky roket denklemine göre itki verimliliği ve kütle oranı arttıkça Delta-V yükselir. Ay transferi için 3 bin 950 metre bölü saniye, Mars için 5 bin 600 metre bölü saniye gereklidir.',
    challenge: {
      title: 'Ay Transfer Ateşlemesi (TLI Manevrası)',
      instruction: 'İtki sürgüsünü kullanarak aracı Ay Transfer Yörüngesi için gereken 3.950 m/s Delta-V değerine ulaştırın.',
      type: 'slider',
      targetValue: 3950,
      tolerance: 150,
      successMessage: 'Mükemmel! 3.950 m/s ile Hohmann eliptik transfer rotasına girdiniz. Ay kütleçekim alanına yakalanacaksınız.',
    },
    quizQuestion: {
      question: 'Uzay aracınızın faydalı yük kütlesi 2 katına çıkarsa, aynı yakıt miktarıyla elde edebileceğiniz Delta-V nasıl değişir?',
      options: [
        { id: 'q1-a', text: 'Azalır (Tsiolkovsky denkleminde son kütle mf büyüdüğü için)', isCorrect: true },
        { id: 'q1-b', text: 'Değişmez (Yakıt miktarı aynı kaldığı sürece)', isCorrect: false },
        { id: 'q1-c', text: 'Artar (Ağır cisimler daha çok momentum kazanır)', isCorrect: false },
      ],
      explanation: 'Δv = Isp · g₀ · ln(m₀ / mf). Aracın kuru kütlesi (mf) arttığında kütle oranı küçülür ve toplam Delta-V düşer.',
    },
  },
  {
    id: 'solar-irradiance',
    title: 'Güneş Işığı ve Ters Kare Yasası',
    category: 'GÜÇ VE ENERJİ SİSTEMLERİ',
    icon: Sun,
    keyFormula: 'I = P / (4π · r²)',
    takeaway: 'Güneş ışığı akısı Güneş\'ten uzaklaştıkça karesiyle azalır. Dünya\'da 1.361 W/m² olan enerji akısı, Mars\'ta 590 W/m² (%43) ve Jüpiter/Europa\'da 50 W/m² (%3.7) seviyesine iner.',
    speechText: 'Ters Kare Yasası gereğince güneş ışığı akısı mesafenin karesiyle azalır. Dünya\'da bin 361 watt olan metrekare başına güç, Mars\'ta 590 watt, Jüpiter ve Europa\'da ise yalnızca 50 watt seviyesine düşer. Dış Güneş Sistemi görevlerinde nükleer RTG bataryaları zorunludur.',
    challenge: {
      title: 'Europa (5.2 AU) Güç Sistemi Seçimi',
      instruction: 'Europa\'da güneş ışığı Dünya\'nın %3.7\'sidir. Aracın donmaması ve bilim aygıtlarını çalıştırması için doğru güç kaynağını seçin:',
      type: 'select',
      options: [
        { id: 'opt-solar', label: 'Standart Silikon Güneş Paneli', isCorrect: false, feedback: 'Yetersiz! 5.2 AU mesafede panel sadece 50 W/m² üretir, batarya dakikalar içinde tükenir.' },
        { id: 'opt-rtg', label: 'Plutonyum-238 Nükleer RTG Ünitesi', isCorrect: true, feedback: 'Harika seçim! RTG, güneş ışığından bağımsız olarak radyoaktif bozunma ısısıyla onlarca yıl kesintisiz +110W güç ve ısı sağlar.' },
      ],
      successMessage: 'Doğru güç mimarisi seçildi. Europa\'nın buzlu karanlığında enerji ve ısı güvenceye alındı.',
    },
    quizQuestion: {
      question: 'Mars (1.52 AU) yörüngesindeki bir uydunun güneş paneli boyutu, Dünya ile aynı gücü üretmek için nasıl olmalıdır?',
      options: [
        { id: 'q2-a', text: 'Yaklaşık 2.3 kat daha geniş panel alanı gerekir (1.52² ≈ 2.31)', isCorrect: true },
        { id: 'q2-b', text: 'Yarı yarıya daha küçük panel yeterlidir', isCorrect: false },
        { id: 'q2-c', text: 'Mesafe doğrusal olduğu için %50 büyük olmalıdır', isCorrect: false },
      ],
      explanation: 'Ters kare kuralına göre 1 / (1.52)² ≈ 0.433. Yani ışık şiddeti %43\'e düşer; aynı gücü almak için panel alanını 1 / 0.433 ≈ 2.31 kat büyütmek gerekir.',
    },
  },
  {
    id: 'deep-space-comm',
    title: 'Derin Uzay İletişimi ve DSN Sinyal Hattı',
    category: 'TELEKOMÜNİKASYON',
    icon: Radio,
    keyFormula: 'FSPL = (4π · d · f / c)²',
    takeaway: 'Milyonlarca kilometre ötede sinyal serbest uzayda dağılır (FSPL). Çanak anten sinyali 0.5 derecelik dar bir hüzmeye odaklar. Dünya\'daki 70 metrelik DSN dev çanakları zayıf sinyalleri yakalar.',
    speechText: 'Derin uzayda haberleşme serbest uzay yol kaybı ile sınırlıdır. Mesafe arttıkça sinyal zayıflar ve ışık hızı gecikmesi artar. Mars ile konuşurken sinyalin gidiş gelişi 8 ila 40 dakika sürer. Yüksek kazançlı çanak antenler ve Dünya\'daki DSN yer istasyonları hayati önem taşır.',
    challenge: {
      title: 'Mars (1.5 AU) Veri İndirme Linki',
      instruction: 'Mars yüzeyinden Dünya\'ya 4.5 Mbps bilimsel kamera verisi göndereceksiniz. Doğru anteni seçin:',
      type: 'select',
      options: [
        { id: 'opt-omni', label: 'Düşük Kazançlı Omni Yama Anten', isCorrect: false, feedback: 'Sinyal uzayda dağıldı! Omni anten gezegenler arası mesafede saniyede yalnızca birkaç bayt telemetri gönderebilir.' },
        { id: 'opt-hga', label: '2.4 Metre Yüksek Kazançlı Çanak Anten (HGA)', isCorrect: true, feedback: 'Bağlantı kilitlendi! 2.4 metrelik parabolik çanak X-Band sinyalini Dünya\'daki DSN Madrid istasyonuna başarıyla odakladı.' },
      ],
      successMessage: 'DSN taşıyıcı frekansına kilitlenildi. 4.5 Mbps veri aktarımı aktif.',
    },
    quizQuestion: {
      question: 'Dünya ile Mars arasındaki mesafe 2.0 AU olduğunda, gönderilen bir radyo komutunun araca ulaşması yaklaşık kaç dakika sürer? (1 AU ışık süresi ≈ 500 saniye)',
      options: [
        { id: 'q3-a', text: 'Yaklaşık 16.6 dakika (1000 saniye)', isCorrect: true },
        { id: 'q3-b', text: 'Anında iletilir (Radyo dalgaları ışıktan hızlıdır)', isCorrect: false },
        { id: 'q3-c', text: 'Yaklaşık 2 saniye', isCorrect: false },
      ],
      explanation: 'Işık boşlukta 300.000 km/s hızla gider (1 AU ≈ 150 milyon km ≈ 500 saniye). 2 AU için 1000 saniye ≈ 16 dakika 40 saniye tek yönlü gecikme oluşur.',
    },
  },
  {
    id: 'radiation-hazards',
    title: 'Gök Cisimleri ve Radyasyon Kalkanı',
    category: 'UZAY ÇEVRE KOŞULLARI',
    icon: Shield,
    keyFormula: 'Doz = Φ · (S / ρ) · t',
    takeaway: 'Her gök cisminin uzay çevresi farklıdır: Ay vakum ve mikrometeorittir; Mars ince CO₂ ve toz fırtınaları barındırır; Jüpiter ve Europa ise uyduları kavuran ölümcül iyonize radyasyon kuşaklarına sahiptir.',
    speechText: 'Uzay ortamı her hedef gök cisminde radikal biçimde değişir. Ay\'da atmosfer yoktur ve gece gündüz sıcaklık farkı 300 derecedir. Mars\'ta ince karbondioksit atmosferi vardır. Jüpiter\'in devasa manyetosferi ise Europa çevresinde öldürücü radyasyon kuşakları oluşturur. Elektronik bileşenler tantal ve titanyum kasalarla zırhlanmalıdır.',
    challenge: {
      title: 'Europa Görevi Gövde Kalkanı Mimarisi',
      instruction: 'Jüpiter radyasyon kuşağında bilim yapabilmek için gerekli gövde sınıfını seçin:',
      type: 'select',
      options: [
        { id: 'opt-cubesat', label: 'Standart Alüminyum CubeSat Kasası', isCorrect: false, feedback: 'Radyasyon delindi! İyonize yüklü parçacıklar bellek çiplerini yaktı, araç single-event upset arızasına girdi.' },
        { id: 'opt-flagship', label: 'Tantal & Titanyum Zırhlı Jovian Flagship Gövdesi', isCorrect: true, feedback: 'Kalkan aktif! Çok katmanlı ağır metal zırh 100 krad radyasyon dozunu bloke etti, bilgisayar nominal çalışıyor.' },
      ],
      successMessage: 'Radyasyon zırhı doğrulandı. Europa buz altı radar aygıtı güvenle veri topluyor.',
    },
    quizQuestion: {
      question: 'Jüpiter radyasyon kuşağındaki "Single-Event Upset (SEU)" nedir?',
      options: [
        { id: 'q4-a', text: 'Kozmik iyonize parçacığın dijital bellekte 0\'ı 1\'e çevirerek işlemciyi kilitlemesi', isCorrect: true },
        { id: 'q4-b', text: 'Güneş panellerinin aniden yönünü kaybetmesi', isCorrect: false },
        { id: 'q4-c', text: 'Roket motorunun erken kapanması', isCorrect: false },
      ],
      explanation: 'SEU (Single-Event Upset), yüksek enerjili bir iyonun mikroişlemci transistöründen geçerken elektrik yükü bırakması ve bit çevrilmesine (bit-flip) yol açmasıdır.',
    },
  },
];

export const SpaceAcademy: React.FC = () => {
  const { locale } = useMissionStore();
  const isTr = locale === 'tr';

  // State Management
  const [hasTakenDiagnostic, setHasTakenDiagnostic] = useState(false);
  const [diagStep, setDiagStep] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, string>>({});
  const [diagResult, setDiagResult] = useState<{ score: number; weakModules: AcademyModuleId[] } | null>(null);

  // Active Learning Module State
  const [activeModuleId, setActiveModuleId] = useState<AcademyModuleId>('delta-v');
  const [completedModules, setCompletedModules] = useState<Set<AcademyModuleId>>(new Set());

  // Interactive Challenge State
  const [sliderVal, setSliderVal] = useState(2500);
  const [challengeResult, setChallengeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Audio Speech Synthesis State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeModule = ACADEMY_MODULES.find((m) => m.id === activeModuleId) || ACADEMY_MODULES[0];

  // Stop audio on unmount or module switch
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    // Reset challenge & quiz when switching module
    setChallengeResult(null);
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setSliderVal(2500);
  }, [activeModuleId]);

  // Speech Synthesis Control
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeModule.speechText);
      utterance.lang = isTr ? 'tr-TR' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Diagnostic handler
  const handleSelectDiagOption = (optionId: string) => {
    const q = DIAGNOSTIC_QUESTIONS[diagStep];
    const newAnswers = { ...diagAnswers, [q.id]: optionId };
    setDiagAnswers(newAnswers);

    if (diagStep < DIAGNOSTIC_QUESTIONS.length - 1) {
      setDiagStep(diagStep + 1);
    } else {
      // Calculate score & identify weak areas
      let score = 0;
      const weak: AcademyModuleId[] = [];
      DIAGNOSTIC_QUESTIONS.forEach((quest) => {
        const chosen = newAnswers[quest.id];
        const opt = quest.options.find((o) => o.id === chosen);
        if (opt?.isCorrect) {
          score += 1;
        } else {
          weak.push(quest.moduleId);
        }
      });
      setDiagResult({ score, weakModules: weak });
      setHasTakenDiagnostic(true);
      // Auto-focus the first weak module if any
      if (weak.length > 0) {
        setActiveModuleId(weak[0]);
      }
    }
  };

  // Interactive Challenge Handlers
  const handleTestSliderChallenge = () => {
    const target = activeModule.challenge.targetValue || 3950;
    const tol = activeModule.challenge.tolerance || 150;
    const diff = Math.abs(sliderVal - target);

    if (diff <= tol) {
      setChallengeResult({ success: true, message: activeModule.challenge.successMessage });
    } else {
      setChallengeResult({
        success: false,
        message: sliderVal < target
          ? `Yetersiz Delta-V (${sliderVal.toLocaleString()} m/s). Ay transfer yörüngesine ulaşamadınız; roket Dünya'ya geri düşecek.`
          : `Aşırı Delta-V (${sliderVal.toLocaleString()} m/s). Hızınız Ay kaçış hızını aştı; Güneş yörüngesine fırladınız.`,
      });
    }
  };

  const handleTestSelectChallenge = (optionId: string) => {
    const opt = activeModule.challenge.options?.find((o) => o.id === optionId);
    if (!opt) return;

    if (opt.isCorrect) {
      setChallengeResult({ success: true, message: opt.feedback });
    } else {
      setChallengeResult({ success: false, message: opt.feedback });
    }
  };

  // Quiz submission handler
  const handleSubmitQuiz = () => {
    if (!quizAnswer) return;
    setQuizSubmitted(true);
    const isCorrect = activeModule.quizQuestion.options.find((o) => o.id === quizAnswer)?.isCorrect;
    if (isCorrect) {
      const nextCompleted = new Set(completedModules);
      nextCompleted.add(activeModuleId);
      setCompletedModules(nextCompleted);
    }
  };

  return (
    <div className="space-y-8">
      {/* Academy Header */}
      <div className="border border-white/10 rounded-2xl overflow-hidden p-6 bg-[#0B0F17] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              BYTECORE UZAY SİSTEM MÜHENDİSLİĞİ AKADEMİSİ
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Etkileşimli Görev Fiziği ve Mühendislik Laboratuvarı
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl font-mono leading-relaxed">
            Delta-V bütçeleri, Ters Kare Yasası, derin uzay ışık gecikmesi ve Jovian radyasyon zırhı. Seslendirmeli dersler ve canlı simülasyonlarla uzay uçuş kurallarını öğrenin.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center space-x-3 bg-[#0E1422] border border-slate-800 px-4 py-2.5 rounded-full shrink-0 font-mono text-xs">
          <Award className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">TAMAMLANAN:</span>
          <strong className="text-white tabular-nums">{completedModules.size} / {ACADEMY_MODULES.length} MODÜL</strong>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. SEVİYE TESPİT TESTİ (DIAGNOSTIC ASSESSMENT MODAL/BANNER)            */}
      {/* --------------------------------------------------------------------- */}
      {!hasTakenDiagnostic ? (
        <div className="border border-sky-500/30 rounded-2xl overflow-hidden p-6 bg-[#0E1526] space-y-4">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <h3 className="font-display font-semibold text-white text-base">
                Ön Seviye Tespit Değerlendirmesi ({diagStep + 1} / {DIAGNOSTIC_QUESTIONS.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-sky-300">
              Kişiselleştirilmiş Öğrenme Rotası İçin
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <p className="text-white text-sm sm:text-base font-medium leading-snug">
              {DIAGNOSTIC_QUESTIONS[diagStep].question}
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2">
              {DIAGNOSTIC_QUESTIONS[diagStep].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectDiagOption(option.id)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-700/80 hover:border-sky-400 bg-slate-900/60 hover:bg-sky-500/10 text-xs sm:text-sm font-mono text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>{option.text}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : diagResult && (
        <div className="border border-emerald-500/30 rounded-2xl overflow-hidden p-4 bg-[#0B1516] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              Ön değerlendirme tamamlandı: <strong className="text-emerald-300">{diagResult.score} / {DIAGNOSTIC_QUESTIONS.length} Doğru</strong>.
              {diagResult.weakModules.length > 0
                ? ' Öncelikli modüller öğrenme listenizin başına alındı.'
                : ' Tebrikler, tüm temel kavramlara hakimsiniz!'}
            </span>
          </div>

          <button
            onClick={() => {
              setHasTakenDiagnostic(false);
              setDiagStep(0);
              setDiagAnswers({});
              setDiagResult(null);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Testi Tekrarla</span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. MODULE NAVIGATION PILLS                                            */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {ACADEMY_MODULES.map((mod) => {
          const isActive = activeModuleId === mod.id;
          const isDone = completedModules.has(mod.id);
          const isWeak = diagResult?.weakModules.includes(mod.id);
          const IconComponent = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => setActiveModuleId(mod.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'border border-slate-800 bg-[#0E1422] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-sky-400'}`} />
              <span>{mod.title}</span>
              {isDone ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  ✓
                </span>
              ) : isWeak ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  Öncelikli
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. ACTIVE MODULE WORKSPACE (Interactive Simulator + Audio Lesson)     */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Content & Audio Speech Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border border-white/10 rounded-2xl overflow-hidden p-5 sm:p-6 bg-[#0E1422] space-y-4">
            {/* Header & Voice Synthesis Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase">
                  {activeModule.category}
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-0.5">
                  {activeModule.title}
                </h3>
              </div>

              {/* Web Speech Audio Controller Button */}
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer shadow-sm ${
                  isPlayingAudio
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : 'border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
                title="Sesli anlatımı başlat / durdur"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>SESLİ DİNLEME AKTİF</span>
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>DERSİ SESLENDİR</span>
                  </>
                )}
              </button>
            </div>

            {/* Core Mathematical Law & Formula Card */}
            <div className="p-3 border border-slate-800 rounded-xl bg-[#080C14] flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">TEMEL FİZİK DENKLEMİ:</span>
              <strong className="text-emerald-400 text-sm tracking-wide">{activeModule.keyFormula}</strong>
            </div>

            {/* Core Takeaway Paragraph */}
            <div className="space-y-2">
              <p className="text-slate-300 text-xs sm:text-sm font-mono leading-relaxed">
                {activeModule.takeaway}
              </p>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Visual Interactive Animation Simulator for Active Module      */}
            {/* ------------------------------------------------------------- */}
            <div className="p-4 border border-slate-800 rounded-xl bg-[#080C14] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 uppercase">CANLI ETKİLEŞİMLİ FİZİK GÖSTERİMİ</span>
                <span className="text-sky-300">60 FPS Gerçek Zamanlı</span>
              </div>

              {/* Module 1: Delta-V Orbit Expander */}
              {activeModuleId === 'delta-v' && (
                <div className="space-y-3 py-1 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ATEŞLEME DELTA-V ({sliderVal.toLocaleString()} m/s):</span>
                    <span className={`font-bold ${sliderVal >= 3800 && sliderVal <= 4100 ? 'text-emerald-400' : 'text-sky-300'}`}>
                      {sliderVal < 3800 ? 'LEO Dairesel Yörünge' : sliderVal <= 4100 ? 'Ay Hohmann Transfer Yörüngesi (TLI)' : 'Gezegenler Arası Kaçış'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1000}
                    max={6500}
                    step={50}
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />

                  {/* SVG Dynamic Trajectory Morph */}
                  <div className="relative h-24 w-full bg-[#0B0F17] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 100">
                      {/* Earth Center */}
                      <circle cx="50" cy="50" r="14" fill="#38bdf8" opacity="0.8" />
                      <text x="50" y="54" fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold">DÜNYA</text>

                      {/* Dynamic Trajectory Ellipse based on slider */}
                      <ellipse
                        cx={50 + (sliderVal - 1000) * 0.024}
                        cy="50"
                        rx={20 + (sliderVal - 1000) * 0.038}
                        ry={20 + (sliderVal - 1000) * 0.016}
                        fill="none"
                        stroke={sliderVal >= 3800 && sliderVal <= 4100 ? '#10b981' : '#38bdf8'}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />

                      {/* Target: Moon */}
                      <circle cx="230" cy="50" r="10" fill="#94a3b8" />
                      <text x="230" y="53" fontSize="7" fill="#ffffff" textAnchor="middle">AY</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Module 2: Inverse Square Law Visualizer */}
              {activeModuleId === 'solar-irradiance' && (
                <div className="space-y-3 py-1 font-mono">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">DÜNYA / AY (1.0 AU)</span>
                      <strong className="text-emerald-400">1.361 W/m² (100%)</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">MARS (1.52 AU)</span>
                      <strong className="text-amber-400">590 W/m² (43%)</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">EUROPA (5.2 AU)</span>
                      <strong className="text-rose-400">50 W/m² (3.7%)</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-[#0E1422] text-[11px] text-slate-300 leading-relaxed">
                    💡 <strong>Mühendislik Kuralı:</strong> 5.2 AU mesafede güneş panelleri sadece %3.7 verim üretir. 100W enerji için Dünya\'dakinden 27 kat büyük devasa kanatlar gerekir; bu nedenle Europa\'da nükleer RTG kullanılır.
                  </div>
                </div>
              )}

              {/* Module 3: Deep Space Light Delay & Gain */}
              {activeModuleId === 'deep-space-comm' && (
                <div className="space-y-3 py-1 font-mono">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">AY (0.0026 AU)</span>
                      <strong className="text-white">1.3 Saniye</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">MARS (1.5 AU)</span>
                      <strong className="text-amber-400">12.5 Dakika</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">EUROPA (5.2 AU)</span>
                      <strong className="text-rose-400">43.3 Dakika</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-[#0E1422] text-[11px] text-slate-300 leading-relaxed">
                    📡 <strong>FSPL Kaybı:</strong> Sinyal küresel yayılınca enerjisi mesafenin karesiyle dağılır. 2.4 metrelik Cassegrain çanak anten, mikrodalga ışınını DSN istasyonlarına odaklayarak veri kopmasını önler.
                  </div>
                </div>
              )}

              {/* Module 4: Celestial Radiation Matrix */}
              {activeModuleId === 'radiation-hazards' && (
                <div className="space-y-3 py-1 font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">AY</span>
                      <strong className="text-emerald-400">0.3 rad/gün</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">MARS</span>
                      <strong className="text-emerald-400">0.7 rad/gün</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">ASTEROİT</span>
                      <strong className="text-emerald-400">0.2 rad/gün</strong>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-lg bg-[#0E1422]">
                      <span className="text-[10px] text-slate-400 block">EUROPA</span>
                      <strong className="text-rose-400 font-bold">540 rad/gün (Ölümcül)</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-[#0E1422] text-[11px] text-slate-300 leading-relaxed">
                    🛡️ <strong>Tantal Zırhı:</strong> Jüpiter\'in radyasyon kuşağı standart uzay araçlarını saatler içinde yakar. Europa görevlerinde elektronik beyin tantal ve titanyum kalkan kasasına (Radiation Vault) kilitlenir.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Hands-on Interactive Engineering Challenge & Quiz (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Hands-on Interactive Challenge */}
          <div className="border border-white/10 rounded-2xl overflow-hidden p-5 bg-[#0E1422] space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                Uygulamalı Mühendislik Görevi
              </h4>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-white font-mono">
                {activeModule.challenge.title}
              </h5>
              <p className="text-slate-400 text-xs font-mono leading-relaxed">
                {activeModule.challenge.instruction}
              </p>
            </div>

            {/* Slider Challenge Input */}
            {activeModule.challenge.type === 'slider' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">İtki Değeri:</span>
                  <strong className="text-white tabular-nums text-sm">{sliderVal.toLocaleString()} m/s</strong>
                </div>

                <input
                  type="range"
                  min={1000}
                  max={6000}
                  step={25}
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />

                <button
                  onClick={handleTestSliderChallenge}
                  className="w-full py-2 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer font-mono shadow-sm"
                >
                  ATEŞLE VE YÖRÜNGEYİ DOĞRULA
                </button>
              </div>
            )}

            {/* Selection Challenge Input */}
            {activeModule.challenge.type === 'select' && activeModule.challenge.options && (
              <div className="space-y-2 pt-2 font-mono">
                {activeModule.challenge.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleTestSelectChallenge(opt.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-700/80 hover:border-emerald-400 bg-slate-900/60 hover:bg-emerald-500/10 text-xs text-slate-200 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}

            {/* Challenge Result Feedback */}
            {challengeResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                  challengeResult.success
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                }`}
              >
                {challengeResult.message}
              </div>
            )}
          </div>

          {/* 2. Mastery Verification Quiz */}
          <div className="border border-white/10 rounded-2xl overflow-hidden p-5 bg-[#0E1422] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
                  Modül Ustalık Testi
                </h4>
              </div>
              {completedModules.has(activeModuleId) && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✓ KAZANILDI
                </span>
              )}
            </div>

            <p className="text-white text-xs sm:text-sm font-medium font-mono leading-snug">
              {activeModule.quizQuestion.question}
            </p>

            <div className="space-y-2 pt-1 font-mono">
              {activeModule.quizQuestion.options.map((opt) => {
                const isSelected = quizAnswer === opt.id;
                const isCorrect = opt.isCorrect;
                return (
                  <button
                    key={opt.id}
                    disabled={quizSubmitted}
                    onClick={() => setQuizAnswer(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      quizSubmitted && isCorrect
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                        : quizSubmitted && isSelected && !isCorrect
                        ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                        : isSelected
                        ? 'border-sky-400 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {quizSubmitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                disabled={!quizAnswer}
                onClick={handleSubmitQuiz}
                className={`w-full py-2 rounded-full font-semibold text-xs transition-all font-mono shadow-sm ${
                  quizAnswer
                    ? 'bg-white text-slate-950 hover:bg-slate-100 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                YANITI ONAYLA
              </button>
            ) : (
              <div className="p-3 rounded-xl border border-slate-800 bg-[#080C14] text-xs font-mono space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">AÇIKLAMA:</span>
                <p className="text-slate-300 leading-relaxed">
                  {activeModule.quizQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
