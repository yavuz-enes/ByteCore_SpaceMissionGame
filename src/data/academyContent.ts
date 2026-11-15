import { Orbit, Sun, Radio, Shield, Cpu, LucideIcon } from 'lucide-react';
import { Locale } from '../i18n/translations';

export type StandaloneModuleId =
  | 'delta-v'
  | 'solar-thermal'
  | 'deep-space-comm'
  | 'radiation-environment'
  | 'subsystem-tradeoffs';

export interface StandaloneDiagQuestion {
  id: string;
  moduleId: StandaloneModuleId;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

export interface RemediationContent {
  conceptKey: string;
  remedyExplanation: string;
  retryQuestion: {
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  };
}

export interface StandaloneModule {
  id: StandaloneModuleId;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  icon: LucideIcon;
  keyFormula: string;
  summary: string;
  detailedLesson: {
    theory: string[];
    rules: string[];
    realWorldExample: string;
  };
  speechScript: string;
  remediation: RemediationContent;
  challenge: {
    title: string;
    description: string;
    type: 'slider' | 'select' | 'balance';
    targetValue?: number;
    tolerance?: number;
    options?: { id: string; label: string; isCorrect: boolean; feedback: string }[];
    successFeedback: string;
  };
  quiz: {
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  };
}

// ---------------------------------------------------------------------------
// 1. DIAGNOSTIC PRE-TEST QUESTIONS (TR & EN)
// ---------------------------------------------------------------------------
export const getStandaloneDiagQuestions = (locale: Locale): StandaloneDiagQuestion[] => {
  const isTr = locale === 'tr';

  if (isTr) {
    return [
      {
        id: 'pre-1',
        moduleId: 'delta-v',
        question: 'Tsiolkovsky roket denklemine göre bir uzay aracının hız değişim kapasitesini (Delta-V) artırmanın en etkili iki yolu nedir?',
        options: [
          { id: 'a', text: 'Özgül itkiyi (Isp) yükseltmek ve kalkış/kuru kütle oranını (m0/mf) büyütmek', isCorrect: true },
          { id: 'b', text: 'Aracın gövde boyutunu büyütüp atmosferik kanatlar eklemek', isCorrect: false },
          { id: 'c', text: 'Güneş panellerinin voltajını artırmak', isCorrect: false },
        ],
        explanation: 'Δv = Isp · g₀ · ln(m₀ / mf). Motorun yakıt verimi (Isp) ve harcanan yakıtın kuru kütleye oranı (m0/mf) Delta-V\'yi belirleyen yegane parametrelerdir.',
      },
      {
        id: 'pre-2',
        moduleId: 'solar-thermal',
        question: 'Güneş\'e 5.2 AU mesafedeki Jüpiter ve Europa\'da güneş panelleri Dünya\'ya kıyasla kaç kat daha az enerji üretir?',
        options: [
          { id: 'a', text: 'Ters Kare Yasası (1/5.2²) gereği yaklaşık 27 kat daha az (%3.7 akı)', isCorrect: true },
          { id: 'b', text: 'Mesafe 5.2 kat olduğu için 5.2 kat daha az', isCorrect: false },
          { id: 'c', text: 'Güneş ışığı uzayda zayıflamaz, aynı enerjiyi üretir', isCorrect: false },
        ],
        explanation: 'Güneş ışığı akısı mesafe karesiyle ters orantılıdır (1/r²). 5.2² = 27.04 olduğundan ışık şiddeti 1/27 seviyesine (50 W/m²) düşer.',
      },
      {
        id: 'pre-3',
        moduleId: 'deep-space-comm',
        question: 'Mars veya Europa gibi derin uzay görevlerinde Dünya ile iletişimde tek yönlü ışık gecikmesi ne kadardır?',
        options: [
          { id: 'a', text: 'Mars için 4 - 20 dakika, Europa için 33 - 53 dakika', isCorrect: true },
          { id: 'b', text: 'Işık hızı sonsuz olduğundan her an sıfır saniyedir', isCorrect: false },
          { id: 'c', text: 'Tüm Güneş Sistemi\'nde sabit 1.3 saniyedir', isCorrect: false },
        ],
        explanation: 'Radyo dalgaları ışık hızında (300.000 km/s) yayılır. Gezegenlerin yörünge konumlarına göre Dünya-Mars arası 4-20 dk, Europa arası 33-53 dk gecikme oluşur.',
      },
      {
        id: 'pre-4',
        moduleId: 'radiation-environment',
        question: 'Jüpiter\'in devasa manyetosferinde hapsolan iyonize parçacıkların mikroçiplerde neden olduğu "Single-Event Upset (SEU)" arızası nedir?',
        options: [
          { id: 'a', text: 'Yüksek enerjili iyonların bellek transistöründe yük bırakarak 0\'ı 1\'e çevirmesi (bit-flip)', isCorrect: true },
          { id: 'b', text: 'Güneş panelinin mekanik motorunun dönmeyi durdurması', isCorrect: false },
          { id: 'c', text: 'Yakıt deposunun basınç kaybetmesi', isCorrect: false },
        ],
        explanation: 'SEU, kozmik radyasyonun bellek hücrelerinde bit çevrilmesine yol açarak uçuş bilgisayarını kilitlemesidir. Tantal zırh ve rad-hard işlemcilerle önlenir.',
      },
      {
        id: 'pre-5',
        moduleId: 'subsystem-tradeoffs',
        question: 'Uzay sistem mühendisliğinde "Kütle Çarpanı (Mass Penalty)" ne anlama gelir?',
        options: [
          { id: 'a', text: 'Eklenen her 1 kg bilimsel faydalı yük için fırlatma roketinde 4 ila 10 kg ek kütle gerekmesi', isCorrect: true },
          { id: 'b', text: 'Aracın yerçekiminde daha hafif hissetmesi', isCorrect: false },
          { id: 'c', text: 'Bataryanın zamanla kapasite kaybetmesi', isCorrect: false },
        ],
        explanation: 'Her 1 kg yük; ek güç, ek yapı, ek yakıt ve çok daha büyük fırlatma roketi gerektirir. Bu bileşik etkiye kütle çarpanı denir.',
      },
    ];
  }

  // English Questions
  return [
    {
      id: 'pre-1',
      moduleId: 'delta-v',
      question: 'According to the Tsiolkovsky rocket equation, what are the two most effective ways to increase spacecraft Delta-V capacity?',
      options: [
        { id: 'a', text: 'Increase specific impulse (Isp) and maximize propellant mass ratio (m0/mf)', isCorrect: true },
        { id: 'b', text: 'Increase body volume and attach aerodynamic atmospheric wings', isCorrect: false },
        { id: 'c', text: 'Increase solar panel bus voltage', isCorrect: false },
      ],
      explanation: 'Δv = Isp · g₀ · ln(m₀ / mf). Exhaust velocity efficiency (Isp) and propellant mass fraction (m0/mf) are the governing physical parameters of orbital velocity change.',
    },
    {
      id: 'pre-2',
      moduleId: 'solar-thermal',
      question: 'At Jupiter and Europa (5.2 AU), how much less solar power do photovoltaic panels generate compared to Earth (1.0 AU)?',
      options: [
        { id: 'a', text: 'Approximately 27 times less (~3.7% flux) due to the Inverse-Square Law (1/5.2²)', isCorrect: true },
        { id: 'b', text: '5.2 times less, directly proportional to distance', isCorrect: false },
        { id: 'c', text: 'Solar irradiance does not decay across vacuum, power remains identical', isCorrect: false },
      ],
      explanation: 'Solar irradiance scales inversely with the square of the astronomical distance (1/r²). Because 5.2² ≈ 27.04, radiant flux drops to only 50 W/m² (from 1,361 W/m² at Earth).',
    },
    {
      id: 'pre-3',
      moduleId: 'deep-space-comm',
      question: 'What is the typical one-way light-time communication latency between Earth and deep space targets like Mars and Europa?',
      options: [
        { id: 'a', text: '4 to 20 minutes for Mars; 33 to 53 minutes for Europa', isCorrect: true },
        { id: 'b', text: 'Zero latency because radio wave velocity is instantaneous in vacuum', isCorrect: false },
        { id: 'c', text: 'Constant 1.3 seconds across the entire Solar System', isCorrect: false },
      ],
      explanation: 'Radio signals travel at the speed of light (300,000 km/s). Planetary orbital separations induce 4-20 minute latency for Mars and up to 53 minutes for the Jovian system.',
    },
    {
      id: 'pre-4',
      moduleId: 'radiation-environment',
      question: 'In Jupiter\'s intense magnetic radiation belt, what is a "Single-Event Upset (SEU)" microchip malfunction?',
      options: [
        { id: 'a', text: 'High-energy ionizing particles depositing localized charge, flipping memory bits (bit-flip)', isCorrect: true },
        { id: 'b', text: 'The solar panel deployment motor jamming mechanically', isCorrect: false },
        { id: 'c', text: 'Hydrazine propellant tanks losing chamber pressure', isCorrect: false },
      ],
      explanation: 'SEU occurs when relativistic ionizing radiation penetrates semiconductor silicon and shifts logic state from 0 to 1, crashing the flight computer unless mitigated by tantalum shielding and rad-hard logic.',
    },
    {
      id: 'pre-5',
      moduleId: 'subsystem-tradeoffs',
      question: 'In spacecraft systems engineering, what does the "Mass Penalty (Mass Multiplier)" rule describe?',
      options: [
        { id: 'a', text: 'Each 1 kg of science instrument requires 4 to 10 kg of compounding structural, power, propellant, and launch vehicle mass', isCorrect: true },
        { id: 'b', text: 'Spacecraft weight feeling lighter in microgravity', isCorrect: false },
        { id: 'c', text: 'Lithium battery voltage decaying over time', isCorrect: false },
      ],
      explanation: 'Every kilogram of payload necessitates larger solar arrays, heavier battery cells, reinforced structure, and exponentially more propellant, drastically swelling the required launch vehicle class.',
    },
  ];
};

// ---------------------------------------------------------------------------
// 2. COMPREHENSIVE TRAINING MODULES (TR & EN)
// ---------------------------------------------------------------------------
export const getStandaloneModules = (locale: Locale): StandaloneModule[] => {
  const isTr = locale === 'tr';

  if (isTr) {
    return [
      {
        id: 'delta-v',
        index: '01',
        title: 'Delta-V (Δv) ve Yörünge Manevraları',
        subtitle: 'Tsiolkovsky Roket Denklemi, Hohmann Transferi ve İtki Bütçesi',
        category: 'YÖRÜNGE DİNAMİĞİ',
        icon: Orbit,
        keyFormula: 'Δv = Isp · g₀ · ln(m₀ / mf)',
        summary: 'Delta-V, uzay aracının motoruyla elde edebileceği toplam hız vektörü değişim kapasitesidir. Gitmek istediğiniz yörünge rotasının biletidir.',
        detailedLesson: {
          theory: [
            'Delta-V (Δv), roket itkisinin bir uzay aracına kazandırdığı hız değişimidir (m/s cinsinden).',
            'Tsiolkovsky Roket Denklemine göre: Nihai hız artışı, roket motorunun egzoz hızına (Isp · g0) ve kütle oranının (kalkış kütlesi / kuru kütle) doğal logaritmasına bağlıdır.',
            'LEO (Alçak Dünya Yörüngesi) kazanımı için yaklaşık 9.400 m/s hız gerekir.',
            'Ay Transfer Yörüngesi (TLI) için +3.950 m/s ek hız gerekir. Mars Hohmann transferi için +5.600 m/s, Europa transferi için +8.200 m/s bütçe zorunludur.',
            'Oberth Etkisi: Bir uzay aracı en yüksek hızdayken (Periapsis noktasında) ateşleme yaparsa, aynı yakıtla çok daha yüksek kinetik enerji kazanır.',
          ],
          rules: [
            'Kural 1: Faydalı yük kütlesi arttıkça, aynı yakıtla elde edilen Delta-V logaritmik olarak düşer.',
            'Kural 2: İyon itki motorları çok yüksek Isp değerine (3.000 - 4.500 sn) sahiptir; az yakıtla devasa Delta-V üretir ancak itki kuvveti düşüktür.',
            'Kural 3: Kimyasal çift yakıtlı (Bipropellant) motorlar yüksek anlık itki sağlar; yörünge yakalama manevralarında vazgeçilmezdir.',
          ],
          realWorldExample: 'NASA Apollo görevlerinde Saturn V roketi, komuta modülünü 3.950 m/s Delta-V vererek Ay rotasına (Trans-Lunar Injection) fırlatmıştır.',
        },
        speechScript: 'Delta-V, uzay aracınızın yapabileceği manevra bütçesidir. Tsiolkovsky roket denklemine göre hız değişimi, motor verimliliği olan özgül itki ve yakıt kütle oranıyla belirlenir. LEO yörüngesinden Ay\'a ulaşmak için 3 bin 950 metre bölü saniye, Mars için ise 5 bin 600 metre bölü saniye Delta-V zorunludur.',
        remediation: {
          conceptKey: 'Tsiolkovsky Kütle Oranı & Isp İlişkisi',
          remedyExplanation: 'Özgül İtki (Isp), 1 saniyede harcanan 1 kg yakıtın ürettiği itme verimidir. Delta-V bütçesini tutturmak için kuru kütleyi hafifletmeli veya yüksek Isp değerli motor (örneğin iyon motoru) seçmelisiniz.',
          retryQuestion: {
            question: 'İyon motoru (Isp: 3200s) ile Kimyasal motor (Isp: 320s) kıyaslandığında; 100 kg yakıtla hangisi daha yüksek Delta-V üretir?',
            options: [
              { id: 'ret-1a', text: 'İyon motoru (10 kat daha yüksek egzoz hızına sahip olduğu için)', isCorrect: true },
              { id: 'ret-1b', text: 'Kimyasal motor (Daha gürültülü yandığı için)', isCorrect: false },
              { id: 'ret-1c', text: 'İkisi de eşit üretir (Yakıt kütlesi aynıdır)', isCorrect: false },
            ],
            explanation: 'Δv doğrudan Isp ile çarpılır. 3200s Isp değeri olan iyon motoru, aynı yakıt kütlesiyle 10 kat daha fazla Delta-V sağlar.',
          },
        },
        challenge: {
          title: 'Trans-Lunar Injection (Ay Transfer Ateşlemesi)',
          description: 'LEO dairesel yörüngesinden Ay transfer rotasına girmek için ateşleme sürgüsünü tam 3.950 m/s seviyesine ayarlayın.',
          type: 'slider',
          targetValue: 3950,
          tolerance: 150,
          successFeedback: '✓ Mükemmel Ateşleme! 3.950 m/s Delta-V ile apogesi Ay yörüngesiyle kesişen Hohmann elipsine girdiniz.',
        },
        quiz: {
          question: 'Bir uzay aracı LEO yörüngesindeyken Mars transferi için 5.600 m/s yerine sadece 2.500 m/s ateşleme yaparsa ne olur?',
          options: [
            { id: 'q1-a', text: 'Mars yörüngesine ulaşamaz; yüksek Dünya eliptik yörüngesinde takılı kalır', isCorrect: true },
            { id: 'q1-b', text: 'Daha yavaş da olsa Mars\'a yine ulaşır', isCorrect: false },
            { id: 'q1-c', text: 'Güneş sisteminden tamamen kaçar', isCorrect: false },
          ],
          explanation: 'Yörünge mekaniğinde hız doğrudan apoapsis irtifasını belirler. Yetersiz Delta-V yörünge elipsini Mars mesafesine (1.52 AU) kadar genişletemez.',
        },
      },
      {
        id: 'solar-thermal',
        index: '02',
        title: 'Güneş Işığı, Termal Denge ve Ters Kare Yasası',
        subtitle: 'Radyasyon Isı Yayılımı, Güneş Enerjisi Akısı ve Nükleer RTG',
        category: 'GÜÇ VE TERMAL MÜHENDİSLİK',
        icon: Sun,
        keyFormula: 'I = P_sun / (4π · r²)  |  Q_rad = ε · σ · A · T⁴',
        summary: 'Güneş ışığı akısı mesafenin karesiyle azalır. Derin uzay boşluğunda konveksiyon yoktur; sıcaklık kontrolü yalnızca ışıma (radyasyon) ile sağlanır.',
        detailedLesson: {
          theory: [
            'Ters Kare Yasası: Güneş\'in yaydığı enerji küresel olarak genişler. Bu yüzden ışık akısı (W/m²), Güneş\'e olan mesafenin karesiyle ters orantılıdır.',
            '1.0 AU (Dünya / Ay): Işık akısı 1.361 W/m²\'dir. Silikon ve Galyum Arsenit güneş panelleri tam verimle çalışır.',
            '1.52 AU (Mars): Işık akısı 590 W/m²\'ye (%43) düşer. Mars yüzeyinde genişletilmiş paneller gerekir.',
            '5.2 AU (Europa / Jüpiter): Işık akısı sadece 50 W/m² (%3.7) seviyesine iner. Güneş paneliyle 100W elektrik almak için devasa 30 metrelik kanatlar gerekir.',
            'Dış Güneş Sistemi çözümü: Nükleer RTG (Radyoizotop Termoelektrik Üreteç). Plutonyum-238 izotopunun doğal alfa bozunma ısısını termokupllarla elektriğe çevirir.',
          ],
          rules: [
            'Kural 1: Dış gezegenlerde (Europa, Satürn, Plüton) güneş paneli yerine RTG seçilmelidir.',
            'Kural 2: Tutulma (Eclipse) evresinde güneş ışığı kesildiğinde ısıtıcılar bataryadan beslenir; batarya kapasitesi donmayı önleyecek boyutta olmalıdır.',
            'Kural 3: Isı boşlukta sadece Stefan-Boltzmann ışımasıyla atılabilir.',
          ],
          realWorldExample: 'NASA Europa Clipper görevi devasa 30 metrelik özel paneller kullanırken, Cassini ve Voyager sondaları nükleer RTG jeneratörleri taşımıştır.',
        },
        speechScript: 'Güneş ışığı akısı, Ters Kare Yasası nedeniyle Güneş\'ten uzaklaştıkça karesiyle azalır. Dünya\'da bin 361 watt olan metrekare başına güneş gücü, Europa\'da 50 watt seviyesine düşer. Dış gezegenlerde elektrik ve ısı üretmek için nükleer RTG güç kaynakları kullanılır.',
        remediation: {
          conceptKey: 'Ters Kare Yasası Hesaplama Mantığı',
          remedyExplanation: 'Işık şiddeti 1 / r² formülüyle hesaplanır. Mesafe 2 katına çıkarsa ışık 4 kat azalır. Mesafe 5 katına çıkarsa ışık 25 kat azalır.',
          retryQuestion: {
            question: 'Güneş\'e 3 AU mesafedeki bir asteroitteki güneş paneli, Dünya\'ya (1 AU) kıyasla ne kadar enerji üretir?',
            options: [
              { id: 'ret-2a', text: '1/9 oranında (%11)', isCorrect: true },
              { id: 'ret-2b', text: '1/3 oranında (%33)', isCorrect: false },
              { id: 'ret-2c', text: '3 kat daha fazla', isCorrect: false },
            ],
            explanation: '1 / (3 AU)² = 1 / 9 ≈ %11.1 akı.',
          },
        },
        challenge: {
          title: 'Europa (5.2 AU) Enerji Mimarisini Tasarla',
          description: 'Europa\'nın buzlu yörüngesinde (50 W/m² ışık akısı) donmayı önlemek ve 120W sürekli güç sağlamak için doğru güç kaynağını seçin.',
          type: 'select',
          options: [
            { id: 'ch-opt-solar', label: 'Standart Gövdeye Monteli Güneş Hücreleri', isCorrect: false, feedback: 'Arıza! 5.2 AU mesafede panel 10W bile üretemez. Batarya bitti, araç donarak sustu.' },
            { id: 'ch-opt-rtg', label: 'Multi-Mission Plutonyum-238 RTG (Nükleer Üreteç)', isCorrect: true, feedback: 'Nominal! RTG güneş ışığından bağımsız olarak kesintisiz +110W güç ve 2 kW termal ısı sağladı.' },
          ],
          successFeedback: '✓ Güç mimarisi onaylandı. Europa\'nın buzlu karanlığında elektrik ve termal denge güvence altında.',
        },
        quiz: {
          question: 'Uzay aracınız Güneş tutulmasına (gece fazına) girdiğinde termal ısıtıcıları açık tutmazsanız ne meydana gelir?',
          options: [
            { id: 'q2-a', text: 'Sıvı yakıt hatları ve batarya elektrolitleri donarak parçalanır', isCorrect: true },
            { id: 'q2-b', text: 'Araç daha hızlı hareket etmeye başlar', isCorrect: false },
            { id: 'q2-c', text: 'Radyo anteni frekansı iki katına çıkar', isCorrect: false },
          ],
          explanation: 'Uzay boşluğunda sıcaklık -150°C altına iner. Isıtıcı hatları olmadan hidrazin yakıtı ve lityum bataryalar donarak kalıcı hasar görür.',
        },
      },
      {
        id: 'deep-space-comm',
        index: '03',
        title: 'Derin Uzay Telekomünikasyonu, FSPL ve DSN Ağı',
        subtitle: 'Serbest Uzay Yol Kaybı, Parabolik Çanak Kazancı ve Işık Hızı Gecikmesi',
        category: 'HABERLEŞME VE VERİ BAĞLANTISI',
        icon: Radio,
        keyFormula: 'FSPL = (4π · d · f / c)²  |  G = η · (π · D / λ)²',
        summary: 'Radyo sinyali uzayda küresel olarak dağılır (FSPL). Milyonlarca kilometre öteden zayıf sinyalleri yakalamak için yüksek kazançlı çanaklar ve DSN 70m dev antenleri gerekir.',
        detailedLesson: {
          theory: [
            'Serbest Uzay Yol Kaybı (FSPL): Radyo sinyali antenden ayrıldıktan sonra küresel bir dalga cephesi halinde yayılır. Güç yoğunluğu mesafenin karesiyle seyrekleşir.',
            'Anten Kazancı (Gain): Çanak anten (HGA), sinyali her yöne saçmak yerine dar bir projektör ışığı gibi tek bir yöne odaklar. Çanak çapı (D) büyüdükçe kazanç katlanarak artar.',
            'Frekans Bantları: Derin uzayda genellikle X-Band (8.4 GHz) ve Ka-Band (32 GHz) kullanılır. Yüksek frekans, daha yüksek veri aktarım hızı (Mbps) sağlar.',
            'Işık Hızı Sınırı: Bilgi boşlukta ışık hızından (300.000 km/s) hızlı gidemez. Dünya-Mars mesafesinde sinyalin araca ulaşması 4 ila 20 dakika sürer.',
            'NASA Deep Space Network (DSN): Dünya çevresine 120 derece açıyla yerleştirilmiş 3 ana istasyondan oluşur: Goldstone (ABD), Madrid (İspanya), Canberra (Avustralya). Dünya döndükçe iletişim kesilmez.',
          ],
          rules: [
            'Kural 1: Alçak Dünya Yörüngesi (LEO) için omni anten yeterlidir; gezegenler arası mesafe için yüksek kazançlı yönlü çanak (HGA) zorunludur.',
            'Kural 2: Derin uzayda gerçek zamanlı kumanda kolu kontrolü imkansızdır; ışık gecikmesi nedeniyle uzay aracı otonom kararlar alabilmelidir.',
            'Kural 3: Link marjı (Link Margin) 3 dB üzerinde tutulmalıdır; aksi takdirde veri indirme hızı düşer veya bağlantı kopar.',
          ],
          realWorldExample: 'Perseverance keşif aracı Mars\'a inerken Dünya ile 11 dakikalık ışık gecikmesi vardı. İniş süreci (7 Minutes of Terror) tamamen aracın kendi otonom bilgisayarıyla yönetildi.',
        },
        speechScript: 'Derin uzayda radyo sinyali serbest uzay yol kaybı nedeniyle mesafenin karesiyle zayıflar. Dünya ile Mars arasındaki iletişimde sinyal 4 ila 20 dakika sonra ulaşır. Bu nedenle yüksek kazançlı parabolik çanak antenler ve Dünya\'daki Deep Space Network yer istasyonları kullanılır.',
        remediation: {
          conceptKey: 'FSPL ve Anten Çapı İlişkisi',
          remedyExplanation: 'Mesafe arttıkça sinyal zayıflamasını dengelemek için anten kazancını artırmalısınız. Çanak çapı iki katına çıktığında anten kazancı 4 katına çıkar.',
          retryQuestion: {
            question: 'Gezegenler arası bir görevde omni (küresel) anten kullanırsanız ne sonuçla karşılaşırsınız?',
            options: [
              { id: 'ret-3a', text: 'Sinyal uzayda dağılır; Dünya\'daki alıcıya gürültüden farksız zayıf bir sinyal ulaşır', isCorrect: true },
              { id: 'ret-3b', text: 'Veri hızı gigabit seviyesine çıkar', isCorrect: false },
              { id: 'ret-3c', text: 'Işık hızı gecikmesi sıfıra iner', isCorrect: false },
            ],
            explanation: 'Omni anten enerjiyi tüm uzaya saçar; Mars mesafesinde Dünya\'ya ulaşan güç pikovatın milyonda birine iner ve sinyal kaybolur.',
          },
        },
        challenge: {
          title: 'Mars Yörüngesinden Bilim Verisi İndirme',
          description: 'Dünya\'ya 1.5 AU mesafeden 4.5 Mbps bilimsel spektrometre verisi indirmek için doğru iletişim zincirini kurun.',
          type: 'select',
          options: [
            { id: 'ch-ant-omni', label: 'S-Band Yama Omni Anten + Standart Ticari Yer İstasyonu', isCorrect: false, feedback: 'Bağlantı koptu! Link marjı -35 dB. Sinyal uzay gürültüsünde kayboldu.' },
            { id: 'ch-ant-hga', label: '2.4 Metre Ka-Band Cassegrain Çanak Anten + NASA DSN 70m Ağı', isCorrect: true, feedback: 'Link Kilitlendi! Link marjı +6.2 dB. 4.5 Mbps bilim verisi kesintisiz aktarılıyor.' },
          ],
          successFeedback: '✓ Sinyal hattı doğrulandı. Yüksek kazançlı çanak ve DSN ağıyla bilimsel veri akışı güvenceye alındı.',
        },
        quiz: {
          question: 'Dünya ile Europa arasındaki tek yönlü radyo sinyal süresi ortalama 45 dakikadır. Europa\'daki araca acil "Motoru Kapat" komutu gönderirseniz ne zaman yanıt alırsınız?',
          options: [
            { id: 'q3-a', text: 'En erken 90 dakika sonra (45 dk gidiş + 45 dk dönüş)', isCorrect: true },
            { id: 'q3-b', text: '45 dakika sonra', isCorrect: false },
            { id: 'q3-c', text: 'Radyo sinyalleri kuantum dolanıklığı ile anında yanıt verir', isCorrect: false },
          ],
          explanation: 'Sinyalin Europa\'ya ulaşması 45 dakika, aracın komutu uygulayıp onay sinyalini Dünya\'ya geri göndermesi 45 dakika daha sürer: Toplam 90 dakika.',
        },
      },
      {
        id: 'radiation-environment',
        index: '04',
        title: 'Gök Cisimleri Çevre Fiziği ve Jovian Radyasyon Kuşakları',
        subtitle: 'Radyasyon Dozu, Single-Event Upset (SEU) ve Tantal Zırh Kasası',
        category: 'UZAY ÇEVRE BİLİMİ',
        icon: Shield,
        keyFormula: 'Doz = Φ · (S/ρ) · t  |  SEU_oranı ∝ Akı_ağır_iyon',
        summary: 'Her gök cisminin uzay çevresi radikal biçimde farklıdır. Jüpiter\'in ölümcül radyasyon kuşağı standart çipleri dakikalar içinde yakar; tantal zırhlı radyasyon kasası gerekir.',
        detailedLesson: {
          theory: [
            'Ay Çevresi: Atmosfersiz tam vakum. Gece/gündüz sıcaklık farkı 300°C\'dir. Mikrometeorit çarpma riski ve elektrostatik regolith toz aşındırması hakimdir.',
            'Mars Çevresi: İnce karbondioksit atmosferi (~6 mbar yüzey basıncı). Küresel toz fırtınaları güneş panellerini örter. Atmosferik giriş (EDL) sırasında termal kalkan gerekir.',
            'Europa ve Jüpiter Çevresi: Jüpiter\'in devasa manyetosferi, Güneş rüzgarından gelen elektron ve protonları yakalayarak hızlandırır. Europa yüzeyi günde 540 rad ölümcül radyasyona maruz kalır.',
            'Single-Event Upset (SEU): Yüksek enerjili iyonize bir parçacığın mikroçipten geçerken elektrik yükü bırakması ve dijital bellekte 0\'ı 1\'e çevirmesidir (bit-flip). Uçuş bilgisayarının kilitlenmesine neden olur.',
            'Radyasyon Zırhı (Radiation Vault): Kritik uçuş elektroniği, kalın tantal, titanyum ve kurşun katmanlarından oluşan koruyucu bir metal kasanın içine yerleştirilir.',
          ],
          rules: [
            'Kural 1: Europa görevlerinde standart alüminyum CubeSat gövdeleri kullanılamaz; Jovian Flagship zırhlı gövde zorunludur.',
            'Kural 2: Bilgisayar belleğinde hata düzeltici kodlama (ECC Memory) ve yedekli işlemciler (Triple Modular Redundancy) bulunmalıdır.',
            'Kural 3: Mars inişinde ısı kalkanı (Heat Shield) olmadan atmosfere girilirse araç sürtünme ısısıyla yanar.',
          ],
          realWorldExample: 'NASA Juno uzay aracı, Jüpiter\'in radyasyonundan korunmak için uçuş bilgisayarını 1 santimetre kalınlığında 200 kilogramlık titanyum bir kasanın içine kilitlemiştir.',
        },
        speechScript: 'Uzay çevre koşulları her gök cisminde farklıdır. Ay\'da mikrometeorit ve sıcaklık farkı, Mars\'ta toz fırtınaları vardır. Jüpiter\'in manyetosferinde ise Europa çevresinde günde 540 rad öldürücü iyonize radyasyon bulunur. Çiplerin bit çevrilmesi yaşamaması için tantal zırhlı radyasyon kasaları kullanılır.',
        remediation: {
          conceptKey: 'İyonize Radyasyon ve SEU Mekaniği',
          remedyExplanation: 'Radyasyon sadece ısıtmaz; atomları iyonlaştırarak elektronik kapıları açıp kapatır. Ağır metal zırh (titanyum ve tantal), yüklü parçacıkları emerek içerdeki silikon kristalleri korur.',
          retryQuestion: {
            question: 'Europa yörüngesine gönderilecek bir uydunun gövdesinde hangisi zorunludur?',
            options: [
              { id: 'ret-4a', text: 'Tantal ve titanyum zırhlı radyasyon kasası (Radiation Vault)', isCorrect: true },
              { id: 'ret-4b', text: 'Daha büyük bir paraşüt', isCorrect: false },
              { id: 'ret-4c', text: 'Sıvı soğutmalı otomobil radyatörü', isCorrect: false },
            ],
            explanation: 'Jüpiter\'in manyetosferindeki relativistic elektronları durdurmanın tek yolu yüksek yoğunluklu metal zırhtır.',
          },
        },
        challenge: {
          title: 'Europa Radyasyon Kalkanı Mimarisi',
          description: 'Jüpiter\'in 540 rad/gün şiddetindeki radyasyon fırtınasında uçuş bilgisayarının yanmasını önleyecek gövdeyi seçin.',
          type: 'select',
          options: [
            { id: 'ch-rad-thin', label: '1 mm İnce Alüminyum CubeSat Gövdesi', isCorrect: false, feedback: 'Radyasyon delindi! 48 saat içinde mikroişlemcide kalıcı donanım yanması (Latch-up) gerçekleşti.' },
            { id: 'ch-rad-heavy', label: 'Titanyum & Tantal Zırhlı Jovian Flagship Gövdesi', isCorrect: true, feedback: 'Zırh doğrulandı! Doz 100 kat azaltıldı, ECC bellek SEU bit-flip hatalarını otonom düzeltti.' },
          ],
          successFeedback: '✓ Kalkan onaylandı. Jovian radyasyon kuşağında bilim yapma yetkinliği kazanıldı.',
        },
        quiz: {
          question: 'Uzayda bir mikrometeorit zırhı (Whipple Shield) nasıl çalışır?',
          options: [
            { id: 'q4-a', text: 'Öndeki ince sac mermiyi buharlaştırıp dağıtır, arkadaki ana gövdeye toz olarak çarpar', isCorrect: true },
            { id: 'q4-b', text: 'Meteoriti mıknatısla geri iter', isCorrect: false },
            { id: 'q4-c', text: 'Meteoritin sıcaklığını düşürür', isCorrect: false },
          ],
          explanation: 'Fred Whipple tarafından geliştirilen kalkanda; öndeki ince tampon mermiyi parçalayıp buharlaştırır, geniş alana yayılan plazma ana duvara zarar veremez.',
        },
      },
      {
        id: 'subsystem-tradeoffs',
        index: '05',
        title: 'Uzay Aracı Mühendislik Entegrasyonu ve Alt Sistem Takasları',
        subtitle: 'Kütle Çarpanı, Güç Dengesi, Roket Taşıma Sınırları ve Bütçe Takası',
        category: 'SİSTEM MÜHENDİSLİĞİ',
        icon: Cpu,
        keyFormula: 'm_kalkış = m_faydalı_yük · exp(Δv / (Isp · g₀))',
        summary: 'Uzay sistem mühendisliğinde bedava hiçbir şey yoktur: Her 1 kg ekstra bilim aygıtı, aracın yakıtını, bataryasını ve roket maliyetini katlayarak büyütür.',
        detailedLesson: {
          theory: [
            'Sistem Mühendisliği Takası (Trade-off): Uzay aracı tasarımında kütle, güç, veri hızı, bütçe ve roket kapasitesi birbirine sıkı sıkıya bağlıdır.',
            'Kütle Bileşkesi: Araca 10 kg ağırlığında yüksek çözünürlüklü bir kamera eklendiğinde; kamerayı beslemek için daha büyük güneş paneli, daha ağır batarya, daha sağlam gövde ve manevra için daha çok yakıt gerekir. 10 kg yük rokete 80 kg olarak yansır.',
            'Fırlatma Roketi Sınırı: Bir roketin belirli bir yörüngeye (örneğin TLI veya TMI) taşıyabileceği maksimum faydalı yük sabittir. Aracınız roketi 1 kg bile aşarsa roket fırlatılamaz.',
            'Güç Pozitifliği: Üretilen güneş/nükleer güç, tüm aktif sistemlerin ve ısıtıcıların anlık tüketiminden yüksek olmalıdır. Net güç negatif olursa bataryalar tükenir ve görev çöker.',
            'Bilim ve Maliyet Dengesi: Asgari bilim hedefini aşarken proje bütçesini aşmamak gerekir. Her bileşen maliyeti doğrudan fırlatma bütçesini tüketir.',
          ],
          rules: [
            'Kural 1: Güç dengesi daima pozitif (+W) olmalıdır.',
            'Kural 2: Toplam araç kütlesi, seçilen fırlatma roketinin azami faydalı yük kapasitesini asla aşamaz.',
            'Kural 3: Bütçe kısıtını aşmadan asgari bilim puanı barajını geçmek görevin birincil başarısıdır.',
          ],
          realWorldExample: 'NASA James Webb Uzay Teleskobu tasarımında her gram için aylar süren kütle optimizasyonu yapılmış; Ariane 5 roketinin 6.200 kg sınırına milimetrik olarak uyulmuştur.',
        },
        speechScript: 'Uzay sistem mühendisliğinde her bileşenin bir takas bedeli vardır. Eklediğiniz her bir kilogram bilim yükü, daha büyük batarya, daha çok yakıt ve daha güçlü bir fırlatma roketi gerektirir. Güç daima pozitif, kütle roket sınırının altında ve bütçe dengede tutulmalıdır.',
        remediation: {
          conceptKey: 'Kütle Çarpanı ve Güç Pozitifliği',
          remedyExplanation: 'Aracınızın roket taşıma kapasitesini aşması durumunda; ya bilim aygıtlarının kütlesini hafifletmeli ya da daha ağır sınıf bir fırlatma roketine (örneğin Falcon Heavy veya SLS) geçmelisiniz.',
          retryQuestion: {
            question: 'Uzay aracınızın toplam kütlesi 1.200 kg ve seçtiğiniz roketin taşıma kapasitesi 1.000 kg ise ne yapmalısınız?',
            options: [
              { id: 'ret-5a', text: 'Daha büyük bir rokete geçmeli veya araç bileşenlerini hafifletmelisiniz', isCorrect: true },
              { id: 'ret-5b', text: 'Hiçbir şey yapmadan fırlatmayı başlatabilirsiniz', isCorrect: false },
              { id: 'ret-5c', text: 'Güneş panellerini kapatmalısınız', isCorrect: false },
            ],
            explanation: 'Fırlatma roketi azami kütleyi kaldıramazsa yörüngeye ulaşamaz ve okyanusa düşer.',
          },
        },
        challenge: {
          title: 'Alt Sistem Dengeleme Takası',
          description: 'Aşırı kütle nedeniyle roket sınırını aşan bir tasarımda bilimi düşürmeden güç ve kütle dengesini kurun.',
          type: 'select',
          options: [
            { id: 'ch-sub-fail', label: 'Ağır Çelik Gövde + Düşük Verimli Kurşun Batarya', isCorrect: false, feedback: 'Kütle aşıldı! Araç roket kapasitesini 350 kg aştı, fırlatma kapısı kilitlendi.' },
            { id: 'ch-sub-pass', label: 'Hafif Karbon Kompozit Gövde + Yüksek Enerji Yoğunluklu Li-Polymer Batarya', isCorrect: true, feedback: 'Nominal Takas! Kütle 280 kg hafifletildi, roket kapasitesi altına inildi ve güç pozitif kaldı.' },
          ],
          successFeedback: '✓ Mühendislik takası optimize edildi. Kütle, güç ve bütçe sınırları başarıyla sağlandı.',
        },
        quiz: {
          question: 'Uzay aracınızda üretilen güç 150W ve tüm aktif bileşenlerin tüketimi 180W ise ne gerçekleşir?',
          options: [
            { id: 'q5-a', text: 'Net güç -30W negatif olur; batarya birkaç saat içinde boşalır ve araç kalıcı olarak kapanır', isCorrect: true },
            { id: 'q5-b', text: 'Araç eksik gücü uzay boşluğundan çeker', isCorrect: false },
            { id: 'q5-c', text: 'Roket motoru kendiliğinden elektrik üretir', isCorrect: false },
          ],
          explanation: 'Net güç negatif olduğunda batarya tamponu sürekli tükenir. Batarya voltajı kritik eşiğin altına inince bilgisayar kapanır.',
        },
      },
    ];
  }

  // English Modules
  return [
    {
      id: 'delta-v',
      index: '01',
      title: 'Delta-V (Δv) & Orbital Maneuvers',
      subtitle: 'Tsiolkovsky Rocket Equation, Hohmann Transfer & Propulsion Budgeting',
      category: 'ORBITAL DYNAMICS',
      icon: Orbit,
      keyFormula: 'Δv = Isp · g₀ · ln(m₀ / mf)',
      summary: 'Delta-V is the scalar measure of impulse per unit mass needed to execute orbital velocity vector changes. It is your velocity currency for interplanetary travel.',
      detailedLesson: {
        theory: [
          'Delta-V (Δv) defines the velocity change (in m/s) imparted to a spacecraft by its propulsion system.',
          'Tsiolkovsky Rocket Equation: Final velocity gain depends on effective exhaust velocity (Isp · g0) and the natural logarithm of mass ratio (initial wet mass / final dry mass).',
          'Attaining Low Earth Orbit (LEO) requires approximately 9,400 m/s from ground launch.',
          'Trans-Lunar Injection (TLI) requires +3,950 m/s from LEO. Mars Hohmann transfer requires +5,600 m/s, while Europa orbital insertion demands +8,200 m/s.',
          'The Oberth Effect: Firing engines at the deepest point of a gravity well (periapsis) yields significantly greater kinetic energy per kilogram of burned propellant.',
        ],
        rules: [
          'Rule 1: As payload dry mass increases, the Delta-V delivered by a fixed propellant tank diminishes logarithmically.',
          'Rule 2: Ion propulsion engines exhibit exceptional specific impulse (3,000 - 4,500s), delivering huge Delta-V with minimal fuel, but generate low instantaneous thrust.',
          'Rule 3: Chemical bipropellant engines deliver high instantaneous thrust (kilonewtons), essential for brief orbital capture burns in planetary gravity wells.',
        ],
        realWorldExample: 'In the Apollo lunar program, the Saturn V third stage (S-IVB) delivered exactly 3,950 m/s of Delta-V to send the Command and Lunar Modules on their Trans-Lunar trajectory.',
      },
      speechScript: 'Delta-V is the fundamental maneuver currency of spaceflight. Governed by the Tsiolkovsky rocket equation, velocity change is dictated by specific impulse and propellant mass fraction. From Low Earth Orbit, reaching the Moon requires 3,950 meters per second, while Mars demands 5,600 meters per second.',
      remediation: {
        conceptKey: 'Tsiolkovsky Mass Ratio & Specific Impulse',
        remedyExplanation: 'Specific Impulse (Isp) is the propellant efficiency per second. To increase your Delta-V margin, you must either shed dry payload weight or select higher-efficiency engines like electric Hall thrusters.',
        retryQuestion: {
          question: 'Comparing an Ion engine (Isp: 3200s) to a Chemical engine (Isp: 320s), which generates greater Delta-V using 100 kg of propellant?',
          options: [
            { id: 'ret-1a', text: 'Ion engine (it possesses a 10x higher exhaust velocity)', isCorrect: true },
            { id: 'ret-1b', text: 'Chemical engine (because combustion is louder and hotter)', isCorrect: false },
            { id: 'ret-1c', text: 'Both generate identical Delta-V (propellant mass is the same)', isCorrect: false },
          ],
          explanation: 'Δv scales linearly with Isp. An engine with 3200s Isp yields exactly ten times the velocity change of a 320s engine for the identical fuel mass.',
        },
      },
      challenge: {
        title: 'Trans-Lunar Injection Burn Execution',
        description: 'Adjust the throttle slider to inject precisely 3,950 m/s Delta-V from LEO into a lunar Hohmann transfer ellipse.',
        type: 'slider',
        targetValue: 3950,
        tolerance: 150,
        successFeedback: '✓ Nominal Burn Confirmed! 3,950 m/s placed the spacecraft into an apogee arc intersecting lunar orbital coordinates.',
      },
      quiz: {
        question: 'If a spacecraft in Low Earth Orbit ignites only 2,500 m/s instead of the required 5,600 m/s for a Mars transfer, what occurs?',
        options: [
          { id: 'q1-a', text: 'It fails to reach Mars orbit and remains trapped in a high elliptical Earth orbit', isCorrect: true },
          { id: 'q1-b', text: 'It still reaches Mars, only at a slower speed', isCorrect: false },
          { id: 'q1-c', text: 'It escapes the solar system entirely', isCorrect: false },
        ],
        explanation: 'Orbital velocity directly sets apoapsis altitude. Insufficient Delta-V cannot stretch the orbital ellipse outward to Mars distance (1.52 AU).',
      },
    },
    {
      id: 'solar-thermal',
      index: '02',
      title: 'Solar Irradiance, Thermal Balance & Inverse-Square Law',
      subtitle: 'Radiative Heat Transfer, Solar Flux Attenuation & Nuclear RTGs',
      category: 'POWER & THERMAL ENGINEERING',
      icon: Sun,
      keyFormula: 'I = P_sun / (4π · r²)  |  Q_rad = ε · σ · A · T⁴',
      summary: 'Solar flux decays with the square of distance. In deep space vacuum there is no convection; thermal control relies strictly on Stefan-Boltzmann radiation.',
      detailedLesson: {
        theory: [
          'Inverse-Square Law: Radiant energy radiates spherically outward. Solar flux (W/m²) is inversely proportional to the square of the distance from the Sun.',
          '1.0 AU (Earth / Moon): Solar irradiance is 1,361 W/m². Silicon and Gallium-Arsenide photovoltaic arrays operate at baseline efficiency.',
          '1.52 AU (Mars): Solar flux drops to 590 W/m² (43%). Mars missions require enlarged solar wings and dust management.',
          '5.2 AU (Europa / Jupiter): Solar flux drops drastically to 50 W/m² (only 3.7% of Earth values). Producing 100W of electricity requires monstrous 30-meter solar wings.',
          'Deep Space Solution: Radioisotope Thermoelectric Generators (RTGs). Plutonium-238 alpha decay produces reliable continuous heat converted to electrical current via thermocouples.',
        ],
        rules: [
          'Rule 1: For Outer Planet destinations (Jupiter, Saturn, Uranus), RTG nuclear systems should replace or supplement solar panels.',
          'Rule 2: During eclipse periods when solar flux drops to zero, onboard electric heaters must be sustained by battery power to prevent freeze fracture.',
          'Rule 3: In vacuum, excess thermal energy can only be expelled via radiative heat emission.',
        ],
        realWorldExample: 'While Europa Clipper engineered massive 30-meter solar wings, deep space explorers like Cassini and New Horizons relied on nuclear RTGs.',
      },
      speechScript: 'Solar flux diminishes with the square of the distance from the Sun. At Earth, one square meter receives 1,361 watts of sunlight, but at Jupiter and Europa, this drops to only 50 watts. Deep space spacecraft utilize nuclear radioisotope generators for continuous power and survival heat.',
      remediation: {
        conceptKey: 'Inverse-Square Law Flux Calculation',
        remedyExplanation: 'Irradiance scales with 1 / r². Doubling distance divides light by 4. Quintupling distance divides light by 25.',
        retryQuestion: {
          question: 'How much solar power does a panel produce at an asteroid located 3.0 AU from the Sun compared to Earth (1.0 AU)?',
          options: [
            { id: 'ret-2a', text: '1/9th (~11.1% of Earth power)', isCorrect: true },
            { id: 'ret-2b', text: '1/3rd (33.3% of Earth power)', isCorrect: false },
            { id: 'ret-2c', text: '3 times greater power', isCorrect: false },
          ],
          explanation: '1 / (3.0 AU)² = 1 / 9 ≈ 11.1% of baseline irradiance.',
        },
      },
      challenge: {
        title: 'Architecting Europa (5.2 AU) Power Systems',
        description: 'Select the optimal power supply to guarantee 120W of continuous bus electricity and freeze-protection heating in Europa\'s 50 W/m² sunlight.',
        type: 'select',
        options: [
          { id: 'ch-opt-solar', label: 'Body-Mounted Silicon Solar Panels', isCorrect: false, feedback: 'Failure! At 5.2 AU, panels generate under 10W. Batteries drained and bus froze solid in hours.' },
          { id: 'ch-opt-rtg', label: 'Multi-Mission Plutonium-238 RTG (Nuclear Generator)', isCorrect: true, feedback: 'Nominal! RTG delivers uninterruptible +110W electrical power and 2 kW of thermal line heating.' },
        ],
        successFeedback: '✓ Power architecture validated. Both electrical and thermal balance are secured in deep space darkness.',
      },
      quiz: {
        question: 'What occurs if survival thermal heaters are left unpowered during prolonged eclipse night phases?',
        options: [
          { id: 'q2-a', text: 'Hydrazine propellant fuel lines and battery electrolytes freeze and rupture', isCorrect: true },
          { id: 'q2-b', text: 'The spacecraft accelerates faster along its trajectory', isCorrect: false },
          { id: 'q2-c', text: 'Communication dish carrier frequency doubles', isCorrect: false },
        ],
        explanation: 'Deep space equilibrium temperatures plummet below -150°C. Unheated propellant lines freeze solid, causing catastrophic pipe rupture.',
      },
    },
    {
      id: 'deep-space-comm',
      index: '03',
      title: 'Deep Space Telecommunications, FSPL & DSN Ground Grid',
      subtitle: 'Free Space Path Loss, Parabolic Gain & Relativistic Light Latency',
      category: 'COMMUNICATIONS & TELEMETRY',
      icon: Radio,
      keyFormula: 'FSPL = (4π · d · f / c)²  |  G = η · (π · D / λ)²',
      summary: 'Radio wave power attenuates over astronomical distances due to spherical dispersal (FSPL). High-gain parabolic dishes and 70m DSN receiver arrays are required.',
      detailedLesson: {
        theory: [
          'Free Space Path Loss (FSPL): Radio energy disperses across a spherical wavefront as it propagates away from the transmitter. Power density drops with the square of distance.',
          'Antenna Gain: High-Gain Dishes (HGA) collimate microwave radio energy into narrow beams. Dish gain scales exponentially with reflector diameter (D) and frequency (f).',
          'Deep Space Frequencies: Deep space operations primarily utilize X-Band (8.4 GHz) and Ka-Band (32 GHz) for higher bandwidth downlink capability.',
          'Finite Speed of Light: Electromagnetic transmissions travel strictly at 300,000 km/s. Signals require 4 to 20 minutes to reach Mars, and up to 53 minutes to reach Europa.',
          'NASA Deep Space Network (DSN): Three 70-meter antenna complexes spaced 120 degrees apart across Earth: Goldstone (USA), Madrid (Spain), and Canberra (Australia) maintain continuous line-of-sight as Earth rotates.',
        ],
        rules: [
          'Rule 1: Omni-directional antennas are suitable only for LEO; interplanetary links mandate steerable High-Gain Cassegrain dishes.',
          'Rule 2: Real-time joystick teleoperation is physically impossible in deep space; autonomous onboard hazard avoidance is mandatory.',
          'Rule 3: Telemetry link margin must stay above +3 dB to prevent phase-lock loop dropouts and corrupted data frames.',
        ],
        realWorldExample: 'During the Perseverance rover landing on Mars, a 7-minute entry sequence was executed with an 11-minute light delay to Earth, necessitating 100% onboard autonomous flight computer control.',
      },
      speechScript: 'In deep space, radio signals attenuate with distance squared due to free space path loss. Radio transmissions take between 4 to 20 minutes to travel between Earth and Mars. High-gain parabolic antennas and 70-meter Deep Space Network dishes are required to close the communications link.',
      remediation: {
        conceptKey: 'FSPL & Reflector Aperture Scaling',
        remedyExplanation: 'To overcome free space path loss across astronomical distances, antenna aperture must be expanded. Doubling dish diameter quadruples antenna gain.',
        retryQuestion: {
          question: 'What occurs if an omni antenna is used as the primary downlink transmitter at Mars distance?',
          options: [
            { id: 'ret-3a', text: 'Signal radiates spherically and drops below ground receiver thermal noise, losing all data', isCorrect: true },
            { id: 'ret-3b', text: 'Telemetry data rate skyrockets to gigabit speeds', isCorrect: false },
            { id: 'ret-3c', text: 'Light-speed latency drops to zero', isCorrect: false },
          ],
          explanation: 'Omnidirectional antennas disperse power in all directions. At Mars distance, power received at Earth drops to fractions of a femtowatt, below detectable receiver thresholds.',
        },
      },
      challenge: {
        title: 'Downlinking Science Telemetry from Mars Orbit',
        description: 'Establish a communications chain to downlink 4.5 Mbps spectrometer telemetry across 1.5 AU distance.',
        type: 'select',
        options: [
          { id: 'ch-ant-omni', label: 'S-Band Patch Omni Antenna + Standard Commercial Ground Station', isCorrect: false, feedback: 'Carrier Lost! Link margin is -35 dB. Signal drowned in galactic background noise.' },
          { id: 'ch-ant-hga', label: '2.4-Meter Ka-Band Cassegrain Dish + NASA DSN 70m Ground Array', isCorrect: true, feedback: 'Link Locked! Link margin is +6.2 dB. High-yield science stream downlinking at 4.5 Mbps.' },
        ],
        successFeedback: '✓ Communications architecture verified. Reliable data throughput secured via DSN 70m aperture.',
      },
      quiz: {
        question: 'One-way radio travel time between Earth and Europa is 45 minutes. If Earth sends an emergency "Engine Abort" command, when is execution confirmed?',
        options: [
          { id: 'q3-a', text: 'At least 90 minutes later (45 min outbound + 45 min telemetry return)', isCorrect: true },
          { id: 'q3-b', text: 'Exactly 45 minutes later', isCorrect: false },
          { id: 'q3-c', text: 'Instantly via quantum entanglement telemetry', isCorrect: false },
        ],
        explanation: 'Commands travel outbound at light speed for 45 minutes, and telemetry return takes another 45 minutes: a round-trip time of 90 minutes.',
      },
    },
    {
      id: 'radiation-environment',
      index: '04',
      title: 'Planetary Environment Physics & Jovian Radiation Belts',
      subtitle: 'Absorbed Dose, Single-Event Upset (SEU) & Tantalum Radiation Vaults',
      category: 'SPACE ENVIRONMENTAL SCIENCE',
      icon: Shield,
      keyFormula: 'Dose = Φ · (S/ρ) · t  |  SEU_rate ∝ Heavy_Ion_Flux',
      summary: 'Each planetary body presents a radically distinct operating environment. Jupiter\'s fierce radiation belt destroys consumer-grade silicon in hours without heavy metal vaults.',
      detailedLesson: {
        theory: [
          'Lunar Environment: Hard vacuum, 300°C diurnal thermal swings, solar wind bombardment, and abrasive electrostatic regolith dust.',
          'Martian Environment: Thin CO2 atmosphere (~6 mbar surface pressure), global dust storms obscuring solar arrays, and high entry heating (EDL).',
          'Europa & Jovian Environment: Jupiter\'s massive magnetosphere traps and accelerates relativistic electrons and protons. Europa\'s surface receives over 540 rads of lethal radiation daily.',
          'Single-Event Upset (SEU): Relativistic ionizing ions strike memory cells and deposit charge, causing bit-flips (0 becomes 1), corrupting guidance registers and crashing avionics.',
          'Radiation Vault Architecture: Mission-critical computers are encased within high-density titanium, tantalum, and tungsten shielding boxes.',
        ],
        rules: [
          'Rule 1: Standard aluminum CubeSat structures cannot survive Jovian orbital radiation; shielded flagship structures are mandatory.',
          'Rule 2: Flight computer memory must incorporate Error-Correcting Code (ECC) and Triple Modular Redundancy (TMR).',
          'Rule 3: Mars atmospheric entry without an ablative heat shield causes destructive vehicle burnup.',
        ],
        realWorldExample: 'NASA\'s Juno spacecraft sealed its avionics suite inside a 1-centimeter thick, 200-kilogram titanium vault to survive Jupiter\'s extreme magnetospheric belt.',
      },
      speechScript: 'Environmental conditions vary across celestial targets. The Moon presents micro-meteoroid hazards, and Mars features global dust storms. Inside Jupiter\'s magnetosphere, Europa experiences over 540 rads of ionizing radiation per day. Tantalum radiation vaults protect flight computers from memory corruption.',
      remediation: {
        conceptKey: 'Ionizing Particle Shielding & SEU Mechanics',
        remedyExplanation: 'Radiation causes ionizing charges in microchip semiconductor gates. Dense tantalum and titanium armor absorbs energetic electrons, preserving onboard logic.',
        retryQuestion: {
          question: 'What is mandatory for an orbiter payload operating in Jupiter\'s Europa radiation belt?',
          options: [
            { id: 'ret-4a', text: 'Tantalum and titanium radiation vault protecting core avionics', isCorrect: true },
            { id: 'ret-4b', text: 'A larger deceleration parachute', isCorrect: false },
            { id: 'ret-4c', text: 'An automotive liquid-cooled radiator', isCorrect: false },
          ],
          explanation: 'Dense metallic shielding is the only physical mechanism to attenuate relativistic electrons trapped in Jupiter\'s magnetosphere.',
        },
      },
      challenge: {
        title: 'Architecting Europa Radiation Hardening',
        description: 'Select the chassis configuration capable of keeping the guidance computer operational across 540 rad/day flux.',
        type: 'select',
        options: [
          { id: 'ch-rad-thin', label: '1mm Lightweight Aluminum CubeSat Shell', isCorrect: false, feedback: 'Radiation Breach! Destructive latch-up occurred within 48 hours. Avionics fried.' },
          { id: 'ch-rad-heavy', label: 'Titanium & Tantalum Shielded Jovian Flagship Vault', isCorrect: true, feedback: 'Shielding Verified! Absorbed dose reduced by 99%. ECC memory autonomously corrects minor upsets.' },
        ],
        successFeedback: '✓ Radiation vault certified. Spacecraft is rated for extended operations in Jovian radiation belts.',
      },
      quiz: {
        question: 'How does an orbital Whipple Shield protect a spacecraft from micrometeoroid impacts?',
        options: [
          { id: 'q4-a', text: 'An outer thin bumper shatters and vaporizes the projectile into a harmless expanding plasma cloud before the rear wall', isCorrect: true },
          { id: 'q4-b', text: 'It uses magnetic repulsion to push meteoroids away', isCorrect: false },
          { id: 'q4-c', text: 'It cools the meteoroid to absolute zero', isCorrect: false },
        ],
        explanation: 'Invented by Fred Whipple, the outer sacrificial bumper vaporizes hypervelocity particles into a diffuse cloud of gas and fragments that harmlessly dissipates across the main hull.',
      },
    },
    {
      id: 'subsystem-tradeoffs',
      index: '05',
      title: 'Spacecraft Systems Integration & Engineering Trade-offs',
      subtitle: 'Compounding Mass Penalties, Power Balance, Launch Limits & Budget Envelopes',
      category: 'SYSTEMS ENGINEERING',
      icon: Cpu,
      keyFormula: 'm_wet = m_payload · exp(Δv / (Isp · g₀))',
      summary: 'In aerospace systems engineering, nothing is free: every extra 1 kg of scientific payload inflates propellant, structure, battery size, and rocket costs.',
      detailedLesson: {
        theory: [
          'Systems Trade-off: In spacecraft architecture, mass, electrical power, downlink bandwidth, budget, and launch capacity are inextricably coupled.',
          'Compounding Mass Multiplier: Adding a 10 kg high-resolution optical spectrometer requires more solar panel area, larger battery cells, reinforced bus structure, and additional propellant. That 10 kg payload inflates total wet mass by 60 to 100 kg on the launch pad.',
          'Launch Vehicle Capacity Threshold: Rockets have absolute payload mass limits to specific transfer trajectories (TLI, TMI). Exceeding rocket lift by even 1 kg prevents mission launch.',
          'Net Power Positive Criterion: Total generated electrical power must exceed continuous component and thermal heater consumption. Negative net power drains batteries and terminates the mission.',
          'Science vs. Budget Optimization: Maximizing scientific harvest while respecting programmatic budget limits is the hallmark of professional aerospace systems design.',
        ],
        rules: [
          'Rule 1: Net electrical power balance must remain surplus positive (+W) under worst-case illumination.',
          'Rule 2: Total spacecraft wet mass must never exceed the maximum lift payload of the chosen launch vehicle.',
          'Rule 3: Exceeding initial funding budget results in flight project cancellation.',
        ],
        realWorldExample: 'Designing the James Webb Space Telescope required years of strict mass accounting, trimming individual grams to fit within Ariane 5\'s 6,200 kg launch envelope.',
      },
      speechScript: 'In space systems engineering, every design choice carries a trade-off. Adding science instrumentation increases battery mass, fuel requirements, and required rocket booster size. You must maintain positive net power, keep mass under rocket limits, and balance the programmatic budget.',
      remediation: {
        conceptKey: 'Mass Multipliers & Electrical Power Balance',
        remedyExplanation: 'If wet mass exceeds launch vehicle limits, you must either deselect non-essential scientific instruments, select lightweight composite structures, or upgrade to a heavier rocket class like Falcon Heavy or SLS.',
        retryQuestion: {
          question: 'If your total spacecraft wet mass is 1,200 kg and the selected rocket capacity is 1,000 kg, what is the required engineering action?',
          options: [
            { id: 'ret-5a', text: 'Upgrade to a higher-capacity launch vehicle or reduce vehicle subsystem dry mass', isCorrect: true },
            { id: 'ret-5b', text: 'Attempt the launch anyway without alterations', isCorrect: false },
            { id: 'ret-5c', text: 'Turn off the solar arrays during launch', isCorrect: false },
          ],
          explanation: 'Rockets cannot lift mass exceeding their ballistic payload limits. Exceeding capacity causes suborbital abort and ocean disposal.',
        },
      },
      challenge: {
        title: 'Balancing the Aerospace Engineering Envelope',
        description: 'Resolve a mass deficit exceeding rocket limits while keeping science return high and power positive.',
        type: 'select',
        options: [
          { id: 'ch-sub-fail', label: 'Heavy Steel Structure + Low-Density Lead-Acid Battery', isCorrect: false, feedback: 'Launch Abort! Vehicle exceeds rocket lift capacity by 350 kg.' },
          { id: 'ch-sub-pass', label: 'Carbon-Composite Bus + High-Energy-Density Li-Polymer Cells', isCorrect: true, feedback: 'Nominal Optimization! Dry mass trimmed by 280 kg, staying below rocket limits with positive power.' },
        ],
        successFeedback: '✓ Engineering trade-off optimized. Mass, power, and programmatic budget envelopes successfully closed.',
      },
      quiz: {
        question: 'If total power generated by panels is 150W and active avionics and heaters consume 180W, what occurs?',
        options: [
          { id: 'q5-a', text: 'Net power is -30W negative; battery reserves deplete within hours, causing vehicle loss', isCorrect: true },
          { id: 'q5-b', text: 'The spacecraft draws missing electricity from vacuum space', isCorrect: false },
          { id: 'q5-c', text: 'Rocket thrusters generate auxiliary electrical current automatically', isCorrect: false },
        ],
        explanation: 'Negative net power continuously drains storage batteries. When battery cell voltage drops below critical thresholds, flight computers suffer permanent shutdown.',
      },
    },
  ];
};

// ---------------------------------------------------------------------------
// 3. UI STRINGS & LABELS (TR & EN)
// ---------------------------------------------------------------------------
export const getAcademyUI = (locale: Locale) => {
  const isTr = locale === 'tr';

  return {
    campusTitle: isTr
      ? 'BYTECORE UZAY SİSTEM MÜHENDİSLİĞİ AKADEMİSİ'
      : 'BYTECORE SPACE SYSTEMS ENGINEERING ACADEMY',
    returnHome: isTr ? 'Ana Ekrana Dön' : 'Return to Home',
    competencyLabel: isTr ? 'YETKİNLİK' : 'COMPETENCY',
    modulesCount: isTr ? 'MODÜL' : 'MODULES',
    startMission: isTr ? 'GÖREVE BAŞLA' : 'LAUNCH MISSION',
    gateBadge: isTr ? 'ZORUNLU ÖN SEVİYE TESPİT DEĞERLENDİRMESİ' : 'MANDATORY DIAGNOSTIC PRE-ASSESSMENT',
    questionStep: isTr ? 'SORU' : 'QUESTION',
    preTestTitle: isTr ? 'Uzay Uçuş Eğitimi Öncesi Seviye Tespiti' : 'Pre-Flight Diagnostic Level Assessment',
    preTestDesc: isTr
      ? 'Eğitim modüllerinin açılması için önce bu 5 temel fizik sorusunu yanıtlamalısınız. Yanıtlarınıza göre eksik kavramlarınız belirlenecek ve eğitim rotanız kişiselleştirilecektir.'
      : 'Before training modules unlock, you must complete this 5-question diagnostic baseline. Your answers identify knowledge gaps and calibrate your flight training syllabus.',
    preTestCompletedTitle: isTr
      ? 'Ön Değerlendirme Tamamlandı & Eğitimler Açıldı'
      : 'Diagnostic Completed & Training Modules Unlocked',
    preTestScore: isTr ? 'Skorunuz' : 'Your Score',
    correctLabel: isTr ? 'Doğru' : 'Correct',
    retakeTest: isTr ? 'Ön Testi Yeniden Yap' : 'Retake Diagnostic',
    strongConcepts: isTr ? 'GÜÇLÜ KAVRAMLAR (TAM HAKİMİYET)' : 'VERIFIED STRENGTHS (MASTERY)',
    requiredModules: isTr ? 'ZORUNLU / ÖNCELİKLİ EĞİTİM MODÜLLERİ' : 'PRIORITY REMEDIATION MODULES',
    continueTraining: isTr ? 'Eğitimlere Devam Et' : 'Proceed to Training',
    theoryTab: isTr ? '1. Teorik İlkeler & NASA Kuralları' : '1. Theory & Flight Rules',
    simTab: isTr ? '2. İnteraktif Simülatör (60fps)' : '2. Interactive Simulator (60fps)',
    challengeTab: isTr ? '3. Mühendislik Uygulaması' : '3. Hands-on Challenge',
    quizTab: isTr ? '4. Modül Yetkinlik Sınavı' : '4. Mastery Quiz',
    speechNarration: isTr ? 'SESLİ ANLATIM' : 'AUDIO NARRATION',
    listenLesson: isTr ? 'Dersi Dinle' : 'Listen Lesson',
    pauseSpeech: isTr ? 'Durdur' : 'Pause',
    formulaHeading: isTr ? 'Fiziksel / Matematiksel Temel Denklem' : 'Physical & Mathematical Foundation',
    rulesHeading: isTr ? 'Uzay Sistem Mühendisliği Altın Kuralları' : 'Aerospace Golden Engineering Rules',
    caseStudyHeading: isTr ? 'Gerçek NASA & Derin Uzay Görev Örneği' : 'Real NASA & Flight Mission Case Study',
    simTitle: isTr ? '60fps İnteraktif Simülatör' : '60fps Interactive Physics Simulator',
    challengeTitle: isTr ? 'Uygulamalı Mühendislik Görevi' : 'Applied Engineering Challenge',
    executeAction: isTr ? 'Uygula / Ateşle' : 'Execute / Fire',
    quizTitle: isTr ? 'Modül Yetkinlik Doğrulama Sınavı' : 'Module Competency Verification Quiz',
    moduleMastered: isTr ? 'MODÜL TAMAMLANDI' : 'MODULE MASTERED',
    moduleInProgress: isTr ? 'EĞİTİM SÜRÜYOR' : 'IN TRAINING',
    remediationAlert: isTr ? 'KAVRAM PEKİŞTİRME DÖNGÜSÜ DEVREDE' : 'CONCEPT REMEDIATION LOOP ACTIVE',
    remediationDesc: isTr
      ? 'Yetkinlik sınavında tespit edilen eksik kavram için özel analiz hazırlanmıştır. Aşağıdaki açıklamayı inceleyip telafi sorusunu yanıtlayın.'
      : 'Targeted remediation diagnostic has been generated for your identified knowledge gap. Review the explanation and solve the alternate re-evaluation question below.',
    solveRetryBtn: isTr ? 'Pekiştirme Sorusunu Çöz' : 'Solve Remediation Question',
    graduationTitle: isTr ? 'ByteCore Uzay Sistem Mühendisliği Sertifikası' : 'ByteCore Space Systems Engineering Certificate',
    graduationSubtitle: isTr
      ? 'Tüm 5 modül teorik, simülasyon ve telafi döngüleriyle başarıyla tamamlanmış ve uzay uçuş operasyonları için tam yetkinlik onaylanmıştır.'
      : 'All 5 core aerospace modules verified via theory, real-time simulation, and adaptive remediation loops. Full flight operations clearance granted.',
    serialNumber: isTr ? 'Sertifika Seri No' : 'Serial Number',
    launchRealMissionBtn: isTr ? 'UÇUŞ SİMÜLASYONUNA GİR & FIRLATMAYA BAŞLA' : 'ENTER FLIGHT SIMULATION & PROCEED TO LAUNCH',
  };
};
