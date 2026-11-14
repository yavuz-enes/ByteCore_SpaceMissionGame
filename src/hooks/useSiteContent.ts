import { useState, useEffect } from 'react';
import { useMissionStore } from '../store/missionStore';

export interface TeamMember {
  name: string;
  role: string;
  callsign: string;
  bio: string;
}

export interface LearningOutcome {
  id: string;
  title: string;
  tagline: string;
  description: string;
  metric: string;
  metricLabel: string;
}

export interface DestinationContent {
  id: string;
  target: 'Moon' | 'Mars' | 'Europa' | 'Asteroid';
  name: string;
  distance: string;
  budget: number;
  deltaV: number;
  radiation: string;
  solarFlux: string;
  tagline: string;
  description: string;
  objectives: string[];
}

export interface SiteContentLocale {
  site: {
    title: string;
    tagline: string;
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    startMissionBtn: string;
    waitingCrewBtn: string;
    createRoomBtn: string;
    joinRoomBtn: string;
    activeLobbyBadge: string;
    soloExploreBtn: string;
  };
  team: {
    title: string;
    subtitle: string;
    name: string;
    callsign: string;
    missionStatement: string;
    members: TeamMember[];
  };
  learningOutcomes: LearningOutcome[];
  destinations: DestinationContent[];
}

export interface SiteContentData {
  en: SiteContentLocale;
  tr: SiteContentLocale;
}

// Robust fallback data in case of fetch failure
const FALLBACK_SITE_CONTENT: SiteContentData = {
  en: {
    site: {
      title: "BYTECORE MISSION DESIGN GAME",
      tagline: "Deep Space Cooperative Systems Engineering",
      badge: "AEROSPACE SIMULATION",
      heroTitle: "DESIGN. SIMULATE. EXPLORE.",
      heroSubtitle: "A collaborative real-time orbital mission simulator. Team up in multi-operator command bridges to balance launch budgets, orbital trajectories, power envelopes, and deep-space science harvest across the Solar System.",
      startMissionBtn: "START MISSION",
      waitingCrewBtn: "WAITING FOR CREW (MIN. 2 PLAYERS)",
      createRoomBtn: "HOST EXPEDITION",
      joinRoomBtn: "JOIN FREQUENCY",
      activeLobbyBadge: "LOBBY",
      soloExploreBtn: "SOLO FLIGHT DECK"
    },
    team: {
      title: "BYTECORE TEAM",
      subtitle: "Interdisciplinary aerospace and systems engineering crew behind the ByteCore Mission Simulator.",
      name: "BYTECORE TEAM",
      callsign: "BYTECORE-TEAM",
      missionStatement: "Our mission is to democratize authentic space mission architecture. By combining real Tsiolkovsky orbital dynamics, inverse-square solar radiation models, and peer-to-peer collaborative mission control bridges, we inspire the next generation of aerospace engineers to tackle humanity's boldest interplanetary frontiers.",
      members: [
        {
          name: "Enes Yavuz Özgen",
          role: "Software Engineer",
          callsign: "DEV",
          bio: "Software architecture, orbital telemetry, and real-time multiplayer flight control."
        },
        {
          name: "Veli Kağan Şahin",
          role: "Designer",
          callsign: "DESIGN",
          bio: "Aerospace human interface design, visual systems, and mission HUD ergonomics."
        },
        {
          name: "Enes Kalmaz",
          role: "Systems Engineer",
          callsign: "ENG",
          bio: "Orbital mechanics calculation, subsystem power budgets, and propulsion dynamics."
        },
        {
          name: "Taner Birtek",
          role: "Mission Engineer",
          callsign: "OPS",
          bio: "Flight operations, science payload profiles, and telemetry verification."
        }
      ]
    },
    learningOutcomes: [
      {
        id: "orbital-mechanics",
        title: "Orbital Mechanics & Delta-V Margins",
        tagline: "Vis-Viva Equation & Tsiolkovsky Rocket Dynamics",
        description: "Calculate propellant mass fractions and velocity changes (Δv) required for Low Orbit circularization, Hohmann interplanetary transfer arcs, and planetary gravity wells.",
        metric: "Δv = Isp · g₀ · ln(m₀ / mf)",
        metricLabel: "Tsiolkovsky Rocket Equation"
      },
      {
        id: "power-thermal",
        title: "Deep Space Solar Flux & Power Envelopes",
        tagline: "Inverse Square Irradiance & Nuclear RTG Trade-offs",
        description: "Understand why solar power decays with 1/r² distance. While 1 m² generates 1361 W at Earth, it yields only 50 W at Jupiter (5.2 AU), necessitating radioactive thermo-electric power.",
        metric: "P(d) = P₀ · (1 AU / d)²",
        metricLabel: "Inverse Square Irradiance"
      },
      {
        id: "telecommunications",
        title: "Deep Space Telecommunications & Latency",
        tagline: "Friis Transmission Equation & NASA Deep Space Network",
        description: "Model light-speed latency (up to 43 minutes round-trip at Jupiter) and high-frequency microwave attenuation across astronomical distances using 34m and 70m ground arrays.",
        metric: "FSPL = (4πd / λ)²",
        metricLabel: "Free Space Path Attenuation"
      },
      {
        id: "systems-engineering",
        title: "Mission Cost & Scientific Harvest Trade-offs",
        tagline: "Pareto Optimal Frontier in Spacecraft Engineering",
        description: "Experience true aerospace systems engineering: payload mass increases require heavier launch rockets, inflating budget costs while competing against science instrument suites.",
        metric: "Total Cost ≤ Initial Budget ($M)",
        metricLabel: "Programmatic Budget Envelope"
      }
    ],
    destinations: [
      {
        id: "lunar-recon",
        target: "Moon",
        name: "Lunar Reconnaissance Orbiter",
        distance: "0.0026 AU (~384,400 km)",
        budget: 280,
        deltaV: 3950,
        radiation: "Low (0.1 Sv/yr)",
        solarFlux: "100% (1361 W/m²)",
        tagline: "Map permanently shadowed craters and discover volatile water ice at the lunar South Pole.",
        description: "Targeting Shackleton and Faustini craters to map subsurface hydrogen volatiles. Essential for determining propellant ISRU viability for NASA Artemis astronaut encampments.",
        objectives: [
          "Polar low-altitude laser altimetry profiling",
          "Neutron spectrometer hydrogen epithermal mapping",
          "Direct Earth S-band telemetry link with zero latency"
        ]
      },
      {
        id: "mars-sample",
        target: "Mars",
        name: "Mars Atmospheric & Sample Explorer",
        distance: "1.52 AU (~225M km)",
        budget: 650,
        deltaV: 5600,
        radiation: "Moderate (0.3 Sv/yr)",
        solarFlux: "43% (585 W/m²)",
        tagline: "Search for atmospheric methane plumes and ancient hydrothermal biosignatures.",
        description: "Navigate interplanetary cruise to enter Mars elliptical orbit. Balance severe comm delays (up to 20 mins) with heavy multispectral spectrometers and 57% solar power drop.",
        objectives: [
          "Hyperspectral trace gas atmospheric limb sounding",
          "Paleolake delta biosignature reconnaissance",
          "Autonomous aerobraking and orbital trimming"
        ]
      },
      {
        id: "europa-explorer",
        target: "Europa",
        name: "Europa Ocean Life Explorer",
        distance: "5.20 AU (~780M km)",
        budget: 1150,
        deltaV: 8200,
        radiation: "Extreme (5.4 Sv/pass)",
        solarFlux: "3.7% (50 W/m²)",
        tagline: "Sound through kilometers of cryogenic ice into Jupiter's warm tidal subsurface ocean.",
        description: "Brave lethal Jovian magnetospheric radiation belts. Deploy deep ice-penetrating radar and magnetometers to measure ocean depth, salinity, and potential extraterrestrial biosignatures.",
        objectives: [
          "Dual-frequency ice-penetrating radar sounding",
          "Induction magnetic sounding of saline ocean core",
          "Radiation-hardened avionics vault survival"
        ]
      },
      {
        id: "asteroid-scout",
        target: "Asteroid",
        name: "Asteroid Deflection & Resource Scout",
        distance: "1.15 AU (~172M km)",
        budget: 380,
        deltaV: 4800,
        radiation: "Moderate (0.2 Sv/yr)",
        solarFlux: "85% (1150 W/m²)",
        tagline: "Rendezvous with an Apollo-class asteroid to assay rare metals and test kinetic deflection.",
        description: "Perform close-proximity stationkeeping around a low-gravity tumbling asteroid. Fire a kinetic impactor projectile and measure volatile mineral ejecta with optical spectrometers.",
        objectives: [
          "LIDAR micro-gravity shape and gravity field modeling",
          "Kinetic impact momentum transfer measurement",
          "Assay platinum-group and rare earth mineral distribution"
        ]
      }
    ]
  },
  tr: {
    site: {
      title: "BYTECORE UZAY GÖREVİ TASARIM OYUNU",
      tagline: "Derin Uzay Çok Oyunculu Sistem Mühendisliği",
      badge: "UZAY SİMÜLASYONU",
      heroTitle: "TASARLA. SİMÜLE ET. KEŞFET.",
      heroSubtitle: "Gerçek zamanlı iş birlikli yörünge görev simülatörü. Çok operatörlü görev köprüsünde bir araya gelin; Güneş Sistemi boyunca fırlatma bütçesini, yörünge rotalarını, güç dengesini ve derin uzay bilim hasadını yönetin.",
      startMissionBtn: "GÖREVE BAŞLA",
      waitingCrewBtn: "MÜRETTEBAT BEKLENİYOR (EN AZ 2 KİŞİ)",
      createRoomBtn: "ODA OLUŞTUR",
      joinRoomBtn: "ODAYA KATIL",
      activeLobbyBadge: "GÖREV LOBİSİ",
      soloExploreBtn: "TEK KİŞİLİK UÇUŞ KÖPRÜSÜ"
    },
    team: {
      title: "BYTECORE EKİBİ",
      subtitle: "ByteCore Görev Simülatörünün arkasındaki disiplinlerarası havacılık ve uzay sistem mühendisliği ekibi.",
      name: "BYTECORE EKİBİ",
      callsign: "BYTECORE-EKİBİ",
      missionStatement: "Misyonumuz, özgün uzay görevi mimarisini herkes için erişilebilir kılmaktır. Tsiolkovsky yörünge mekaniğini, ters kare güneş radyasyonu modellerini ve eşler arası iş birlikli görev kontrol köprülerini birleştirerek, insanlığın en cüretkar gezegenler arası ufuklarını keşfedecek yeni nesil uzay mühendislerine ilham veriyoruz.",
      members: [
        {
          name: "Enes Yavuz Özgen",
          role: "Yazılımcı",
          callsign: "DEV",
          bio: "Yazılım mimarisi, yörünge telemetrisi ve gerçek zamanlı çok oyunculu uçuş kontrolü."
        },
        {
          name: "Veli Kağan Şahin",
          role: "Tasarımcı",
          callsign: "TASARIM",
          bio: "Havacılık ve uzay arayüz tasarımı, görsel sistemler ve görev HUD ergonomisi."
        },
        {
          name: "Enes Kalmaz",
          role: "Sistem Mühendisi",
          callsign: "SİSTEM",
          bio: "Yörünge mekaniği hesaplamaları, alt sistem güç bütçeleri ve itki dinamiği."
        },
        {
          name: "Taner Birtek",
          role: "Görev Mühendisi",
          callsign: "GÖREV",
          bio: "Uçuş operasyonları, bilimsel faydalı yük profilleri ve telemetri doğrulaması."
        }
      ]
    },
    learningOutcomes: [
      {
        id: "orbital-mechanics",
        title: "Yörünge Mekaniği ve Delta-V Marjları",
        tagline: "Vis-Viva Denklemi ve Tsiolkovsky Roket Dinamiği",
        description: "Alçak yörünge daireselleştirme, Hohmann gezegenler arası transfer yayları ve gezegen çekim kuyusu girişleri için gereken hız değişimini (Δv) ve yakıt kütle oranlarını hesaplayın.",
        metric: "Δv = Isp · g₀ · ln(m₀ / mf)",
        metricLabel: "Tsiolkovsky Roket Denklemi"
      },
      {
        id: "power-thermal",
        title: "Derin Uzay Güneş Işınımı ve Güç Dengesi",
        tagline: "Ters Kare Yasası ve Nükleer RTG Dengesi",
        description: "Güneş enerjisinin mesafenin karesiyle (1/r²) nasıl azaldığını öğrenin. Dünya'da 1 m² panel 1361 W üretirken, Jüpiter'de (5.2 AU) sadece 50 W üretir; bu da nükleer termoelektrik jeneratörleri (RTG) zorunlu kılar.",
        metric: "P(d) = P₀ · (1 AU / d)²",
        metricLabel: "Ters Kare Güneş Işınımı"
      },
      {
        id: "telecommunications",
        title: "Derin Uzay Telekomünikasyonu ve Gecikme",
        tagline: "Friis İletim Modeli ve NASA Derin Uzay Ağı",
        description: "Astronomik mesafelerde ışık hızı gecikmesini (Jüpiter'de 43 dakikaya kadar gidiş-dönüş) ve 34m ile 70m yer antenleri kullanılarak mikrodalga sinyal zayıflamasını modelleyin.",
        metric: "FSPL = (4πd / λ)²",
        metricLabel: "Boş Uzay Yol Zayıflaması"
      },
      {
        id: "systems-engineering",
        title: "Görev Maliyeti ve Bilimsel Hasat Dengesi",
        tagline: "Uzay Aracı Mühendisliğinde Pareto Optimumu",
        description: "Gerçek havacılık sistem mühendisliğini deneyimleyin: Faydalı yük kütlesi arttıkça daha büyük roket gerekir, bu da bütçeyi tüketir ve bilimsel cihaz seçimiyle yarışır.",
        metric: "Toplam Maliyet ≤ İlk Bütçe ($M)",
        metricLabel: "Programatik Bütçe Sınırı"
      }
    ],
    destinations: [
      {
        id: "lunar-recon",
        target: "Moon",
        name: "Ay Keşif Yörünge Aracı (LRO)",
        distance: "0.0026 AU (~384,400 km)",
        budget: 280,
        deltaV: 3950,
        radiation: "Düşük (0.1 Sv/yıl)",
        solarFlux: "%100 (1361 W/m²)",
        tagline: "Ay'ın Güney Kutbu'ndaki kalıcı gölgeli kraterleri haritalayın ve su buzu yataklarını tespit edin.",
        description: "Shackleton ve Faustini kraterlerindeki hapsolmuş hidrojen uçucularını tarar. NASA Artemis astronot üsleri için yerinde yakıt üretimi (ISRU) fizibilitesini belirler.",
        objectives: [
          "Kutup alçak irtifa lazer altimetresi ile topoğrafik haritalama",
          "Nötron spektrometresi ile hidrojen uçucu tespiti",
          "Sıfır gecikmeli doğrudan Dünya S-band telemetri bağlantısı"
        ]
      },
      {
        id: "mars-sample",
        target: "Mars",
        name: "Mars Atmosfer ve Numune Kaşifi",
        distance: "1.52 AU (~225M km)",
        budget: 650,
        deltaV: 5600,
        radiation: "Orta (0.3 Sv/yıl)",
        solarFlux: "%43 (585 W/m²)",
        tagline: "Atmosferik metan gazı izlerini ve antik hidrotermal biyolojik izleri araştırın.",
        description: "Mars eliptik yörüngesine giriş için gezegenler arası transferi yönetin. 20 dakikaya varan iletişim gecikmesini, ağır spektrometreleri ve %57 güneş enerjisi kaybını dengeleyin.",
        objectives: [
          "Çok bantlı iz gazı atmosferik taraması",
          "Eski göl deltası biyolojik iz keşfi",
          "Otonom aerofrenleme ve yörünge düzeltme"
        ]
      },
      {
        id: "europa-explorer",
        target: "Europa",
        name: "Europa Okyanus Yaşamı Kaşifi",
        distance: "5.20 AU (~780M km)",
        budget: 1150,
        deltaV: 8200,
        radiation: "Aşırı (5.4 Sv/geçiş)",
        solarFlux: "%3.7 (50 W/m²)",
        tagline: "Kilometrelerce kalınlıktaki kriyojenik buz kabuğunu delerek Jüpiter'in sıcak tuzlu yeraltı okyanusunu inceleyin.",
        description: "Ölümcül Jüpiter manyetosfer radyasyon kuşaklarına meydan okuyun. Buz altı radarı ve manyetometrelerle okyanus derinliğini, tuzluluğunu ve dünya dışı yaşam izlerini ölçün.",
        objectives: [
          "Çift frekanslı buz delici radar sondajı",
          "Tuzlu okyanus çekirdeğinin manyetik indüksiyon ölçümü",
          "Radyasyona karşı zırhlı aviyonik koruma kasası dayanımı"
        ]
      },
      {
        id: "asteroid-scout",
        target: "Asteroid",
        name: "Asteroit Saptırma ve Maden Gözlemcisi",
        distance: "1.15 AU (~172M km)",
        budget: 380,
        deltaV: 4800,
        radiation: "Orta (0.2 Sv/yıl)",
        solarFlux: "%85 (1150 W/m²)",
        tagline: "Apollo sınıfı bir asteroitle buluşup değerli metalleri analiz edin ve kinetik saptırmayı test edin.",
        description: "Düşük yerçekimli asteroit çevresinde yakın mesafe manevraları yapın. Kinetik çarpışma mermisi ateşleyerek mineral püskürmesini optik spektrometreyle analiz edin.",
        objectives: [
          "LIDAR ile mikro yerçekimi ve şekil modelleme",
          "Kinetik çarpışma momentum transfer ölçümü",
          "Platin grubu ve nadir toprak elementleri dağılım analizi"
        ]
      }
    ]
  }
};

export const useSiteContent = () => {
  const { locale } = useMissionStore();
  const [content, setContent] = useState<SiteContentData>(FALLBACK_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const res = await fetch('./data/site-content.json');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json && json.en && json.tr) {
            setContent(json);
          }
        }
      } catch (err) {
        // Fallback is already initialized
        console.warn('Using fallback site-content data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeLocaleContent: SiteContentLocale = content[locale] || content.en;

  return {
    content: activeLocaleContent,
    fullData: content,
    isLoading,
    locale,
  };
};