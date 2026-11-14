import { Locale } from './translations';
import {
  MissionScenario,
  LaunchVehicle,
  SpacecraftBus,
  PropulsionSystem,
  PowerSystem,
  BatterySystem,
  ScientificInstrument,
  AntennaSystem,
  GroundStationNetwork,
  OrbitProfile,
} from '../types/mission';
import {
  MISSION_SCENARIOS,
  LAUNCH_VEHICLES,
  SPACECRAFT_BUSES,
  PROPULSION_SYSTEMS,
  POWER_SYSTEMS,
  BATTERY_SYSTEMS,
  SCIENTIFIC_INSTRUMENTS,
  ANTENNA_SYSTEMS,
  GROUND_STATIONS,
  ORBIT_PROFILES,
} from '../data/missions';

export const TARGET_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'Moon': 'Moon',
    'Mars': 'Mars',
    'Europa': 'Europa',
    'Asteroid': 'Asteroid',
    'Earth Orbit': 'Earth Orbit',
  },
  tr: {
    'Moon': 'Ay',
    'Mars': 'Mars',
    'Europa': 'Europa (Jüpiter Uydusu)',
    'Asteroid': 'Asteroit',
    'Earth Orbit': 'Dünya Yörüngesi',
  },
};

export const MISSION_SCENARIOS_TR: Record<string, Partial<MissionScenario>> = {
  'lunar-recon': {
    name: 'Ay Keşif Yörünge Aracı',
    tagline: 'Kalıcı gölgeleri haritalayın ve Ay\'ın Güney Kutbu\'nda su buzu bulun.',
    description: 'Yüksek çözünürlüklü bir Ay haritalama uydusu tasarlayın. Amacınız, gelecekteki NASA Artemis astronot üslerini desteklemek için Shackleton Krateri\'ndeki hapsolmuş su buzu yataklarını taramaktır. Alçak kutup yörüngesi, yüksek optik çözünürlük ve nötron spektrometrisi gerektirir.',
    target: 'Moon',
  },
  'mars-sample': {
    name: 'Mars Atmosfer ve Örnek Keşif Aracı',
    tagline: 'Mars kanyonlarında ve atmosfer gazında biyo-imza izlerini araştırın.',
    description: 'Mars atmosferik kaçışını incelemek ve antik hidrotermal bacaları tespit etmek için gezegenler arası bir yörünge aracı fırlatın. Yüksek iletişim gecikmelerini (20 dakikaya kadar), ağır spektrometre yüklerini ve 1.5 AU mesafedeki güneş gücü kaybını dengelemeniz gerekir.',
    target: 'Mars',
  },
  'europa-explorer': {
    name: 'Europa Okyanus Yaşam Kaşifi',
    tagline: 'Kilometrelerce buzun altına inerek Jüpiter\'in ılık sıvı yeraltı okyanusunu araştırın.',
    description: 'Ölümcül Jüpiter radyasyon kuşaklarına meydan okuyun. Uzay aracınız, Europa\'nın gizli okyanusunun tuzluluğunu ve derinliğini ölçmek için buza nüfuz eden radar ve manyetometreler taşımalıdır. Aşırı mesafe RTG nükleer güç veya devasa güneş panelleri ile kalın radyasyon kalkanı gerektirir.',
    target: 'Europa',
  },
  'asteroid-scout': {
    name: 'Asteroit Saptırma ve Maden Kaşifi',
    tagline: 'Dünya\'ya yakın bir asteroitle buluşun, kinetik saptırma testi yapın ve nadir mineralleri analiz edin.',
    description: 'Apollo sınıfı bir Dünya\'ya yakın asteroitle randevu gerçekleştirin. Yakın mesafeden lidar haritalaması yapın, iç yoğunluğu ölçmek için bir çarpma modülü ateşleyin ve platin grubu metalleri analiz edin. İyon itki sistemiyle hızlı geçiş üstün yakıt verimliliği sunar.',
    target: 'Asteroid',
  },
  'sandbox': {
    name: 'Serbest Tasarım Görev Laboratuvarı',
    tagline: 'Özel hedefler, bütçe sınırları ve deneysel donanımlarla dilediğiniz derin uzay görevini tasarlayın.',
    description: 'Önceden belirlenmiş sınırlamalar olmadan açık bir mühendislik test alanı. Özel yörüngelerde amiral gemisi gövdeler, deneysel iyon motorları ve yüksek hızlı optik lazer veri aktarımlarıyla deneyler yapın.',
    target: 'Earth Orbit',
  },
};

export const LAUNCH_VEHICLES_TR: Record<string, Partial<LaunchVehicle>> = {
  'rocket-electron': {
    name: 'Electron Roketi',
    description: 'Elektrikli turbo pompalı Rutherford motorlarına sahip ultra hafif karbon kompozit roket. Düşük maliyetlidir ancak kesinlikle CubeSat ve SmallSat küçük uydu görevleriyle sınırlıdır.',
  },
  'rocket-falcon9': {
    name: 'Falcon 9 Block 5',
    description: 'Dokuz Merlin motorlu yeniden kullanılabilir görev atı. Ay ve Mars orta sınıf görevleri için olağanüstü güvenilirlik ve cömert faydalı yük kapasitesi.',
  },
  'rocket-falcon-heavy': {
    name: 'Falcon Heavy',
    description: 'Bir araya getirilmiş 3 adet Falcon çekirdeği ile 5 milyon pound itiş gücü üretir. Dış güneş sistemi sondaları için olağanüstü ağır yük taşıma kapasitesi.',
  },
  'rocket-sls': {
    name: 'Space Launch System (SLS)',
    description: 'RS-25 kriyojenik çekirdekli süper ağır keşif roketi. Yerçekimi sapanı manevralarına ihtiyaç duymadan dış güneş sistemine doğrudan fırlatma kabiliyeti.',
  },
  'rocket-starship': {
    name: 'Starship Super Heavy',
    description: 'Raptor metan motorlarıyla güçlendirilmiş yeni nesil devasa paslanmaz çelik fırlatma sistemi. Eşsiz 100 ton faydalı yük taşıma kapasitesi.',
  },
};

export const SPACECRAFT_BUSES_TR: Record<string, Partial<SpacecraftBus>> = {
  'bus-cubesat': {
    name: '12U Modüler CubeSat Gövdesi',
    description: 'Standartlaştırılmış modüler nano-uydu gövdesi. İnşası çok uygun maliyetli ve hızlıdır ancak sert güneş fırtınalarında kolayca hasar görür.',
  },
  'bus-smallsat': {
    name: 'ESPA Sınıfı Küçük Uydu Gövdesi',
    description: 'Alüminyum petek panelleri ve entegre yıldız takipçileri olan orta-kompakt uydu platformu. Ay ve asteroit görevleri için idealdir.',
  },
  'bus-medium': {
    name: 'Derin Uzay Kaşif Gövdesi',
    description: 'Çift hatlı yedekli aviyoniklere sahip dayanıklı alüminyum-lityum çekirdek. Gezegenler arası yolculuklar için güçlü termal kontrol sağlar.',
  },
  'bus-flagship': {
    name: 'Jüpiter Radyasyon Amiral Gövdesi',
    description: 'Kurşun-tantal kompozit kalkanlı titanyum radyasyon kasası. Jüpiter çevresindeki yıllar süren ölümcül radyasyonda hayatta kalmak için özel üretilmiştir.',
  },
};

export const PROPULSION_SYSTEMS_TR: Record<string, Partial<PropulsionSystem>> = {
  'prop-coldgas': {
    name: 'Azot Soğuk Gaz İticisi',
    type: 'Soğuk Gaz İticisi',
    description: 'Basit, zehirli olmayan basınçlı gaz sistemi. Güvenli ve ucuzdur ancak düşük özgül itme ve sınırlı hız değişimleri sağlar.',
  },
  'prop-monoprop': {
    name: 'Hidrazin Tek Yakıtlı İtici',
    type: 'Hidrazin Tek Yakıt',
    description: 'Güvenilir katalitik ayrışma itkisi. Yörünge yükseltme ve yönelim stabilizasyonu için mükemmel standart.',
  },
  'prop-biprop': {
    name: 'Çift Modlu Kimyasal (MMH / NTO)',
    type: 'Çift Yakıtlı Kimyasal',
    description: 'Hipergolik yakıt ve oksitleyici sistemi. Hızlı yörüngeye giriş ateşlemeleri ve gezegen yakalama manevraları için yüksek itme kuvveti sağlar.',
  },
  'prop-ion': {
    name: 'NEXT-C Ksenon İyon Izgaralı Motor',
    type: 'İyon Elektrik Sürücüsü',
    description: 'Yüksek verimli elektrostatik iyon iticisi. Aylarca süren nazik sürekli itmeyle devasa Delta-V sağlayan inanılmaz özgül itici kuvvet (ISP).',
  },
};

export const POWER_SYSTEMS_TR: Record<string, Partial<PowerSystem>> = {
  'power-body': {
    name: 'Gövdeye Monte Silikon Güneş Hücreleri',
    type: 'Body Solar',
    description: 'Doğrudan uydu dış yüzeyini kaplayan sabit paneller. Hareketli açılma mekanizması yoktur ancak toplam yüzey alanı ve gücü düşüktür.',
  },
  'power-deployable': {
    name: 'Açılabilir Çift Kanat Güneş Paneli',
    type: 'Deployable Solar Arrays',
    description: 'Tek eksenli güneş takibine sahip katlanabilir güneş panelleri. Dünya, Ay ve Asteroit yörüngeleri için harika güç dengesi.',
  },
  'power-gallium': {
    name: 'UltraFlex Yüksek Verimli Galyum Kanatlar',
    type: 'Advanced Gallium Wings',
    description: 'Dairesel akordeon şeklinde katlanan üç eklemli güneş panelleri. Mars\'taki düşük güneş ışığında bile yüksek verim, ancak Jüpiter\'de yetersizdir.',
  },
  'power-rtg': {
    name: 'Çok Görevli RTG (Pu-238 Nükleer Jeneratör)',
    type: 'RTG Nuclear Generator',
    description: 'Radyoaktif bozunma ısısını 20+ yıl boyunca sabit elektriğe dönüştüren, güneş ışığından tamamen bağımsız çalışan nükleer ünite.',
  },
};

export const BATTERY_SYSTEMS_TR: Record<string, Partial<BatterySystem>> = {
  'batt-standard': {
    name: 'Kompakt Li-Ion Paketi (450 Wh)',
    description: 'Standart şarj edilebilir lityum-iyon batarya. Kısa yörünge tutulmalarında temel sistemleri canlı tutar.',
  },
  'batt-advanced': {
    name: 'Derin Deşarjlı Li-Polimer (1.800 Wh)',
    description: 'Termal ısıtıcılara sahip yüksek enerji yoğunluklu batarya paketi. Gece geçişlerinde yüksek güçlü cihaz taramalarını destekler.',
  },
  'batt-heavy': {
    name: 'Ağır Hizmet Katı Hal Uzay Bataryası (5.200 Wh)',
    description: 'Binlerce derin döngü ve aşırı sıcaklık dayanıklılığı için tasarlanmış gelişmiş katı hal batarya hücreleri.',
  },
};

export const SCIENTIFIC_INSTRUMENTS_TR: Record<string, Partial<ScientificInstrument>> = {
  'inst-camera-hires': {
    name: 'Yüksek Çözünürlüklü Dar Açılı Kamera',
    category: 'Optik Görüntüleme',
    description: 'Metre altı yüzey detayları, kaya sayımları ve iniş alanı tehlike analizi sağlayan teleskopik optik kamera.',
  },
  'inst-spectrometer-ir': {
    name: 'Kızılötesi Mineral ve Su Spektrometresi',
    category: 'Kızılötesi Spektrometri',
    description: 'Su izlerini, kil minerallerini ve organik molekülleri tespit etmek için yansıyan güneş kızılötesi ışığını ölçer.',
  },
  'inst-radar-subsurface': {
    name: 'Buz Deline Radar Sondajı (SHARAD)',
    category: 'Yüzeyaltı Radarı',
    description: 'Gezegen kabuğunun altına nüfuz eden HF radar darbeleriyle yer altı su buzu katmanlarını ve mağara boşluklarını haritalar.',
  },
  'inst-magnetometer': {
    name: 'Fluxgate Manyetometre Direği',
    category: 'Manyetik & Parçacık',
    description: '4 metrelik açılabilir bir direğe monte edilir. Gezegen manyetik kalkanını ve indüklenen yüzey altı okyanus akıntılarını ölçer.',
  },
  'inst-mass-spec': {
    name: 'Gaz Kromatografı ve Kütle Spektrometresi',
    category: 'Gaz & Numune Analizi',
    description: 'İzotop oranlarını, metan patlamalarını ve karbon amino asitlerini tespit etmek için atmosfer veya yüzey tozu örneklerini buharlaştırır.',
  },
  'inst-neutron-detector': {
    name: 'Termal Nötron Spektrometresi',
    category: 'Nötron Algılayıcı',
    description: 'Gezegen toprağından seken yavaşlatılmış nötronları ölçerek hidrojen yoğunluklarını (su buzu göstergesi) tespit eder.',
  },
};

export const ANTENNA_SYSTEMS_TR: Record<string, Partial<AntennaSystem>> = {
  'ant-omni': {
    name: 'Düşük Kazançlı S-Bant Küresel Yama Anten',
    description: 'Geniş küresel kapsama alanı. Uydu döndüğünde asla kilidi kaybetmez, ancak derin uzayda veri aktarım hızı çok düşüktür.',
  },
  'ant-horn': {
    name: 'Orta Kazançlı X-Bant Yönlü Huni Anten',
    description: 'İç güneş sistemi seferleri için yönlü kazanç ve orta düzey hedefleme toleransı arasında iyi bir denge sunar.',
  },
  'ant-dish-hga': {
    name: '2.4 Metre Yüksek Kazançlı Cassegrain Çanak',
    description: 'Motorlu yönlendirilebilir parabolik reflektör. Yüksek megabit hızları sağlar ancak hassas Dünya hedeflemesi gerektirir.',
  },
  'ant-laser': {
    name: 'Derin Uzay Optik Lazer İletişimi (DSOC)',
    description: 'Kızılötesi lazer ışını. Geleneksel radyo frekanslarına kıyasla 10 kat daha fazla bilim verisi aktaran yeni nesil teknoloji.',
  },
};

export const GROUND_STATIONS_TR: Record<string, Partial<GroundStationNetwork>> = {
  'ground-polar': {
    name: 'Svalbard ve Troll Kutup İstasyonları',
    description: 'Dünya ve düşük eğimli Ay yörüngeleri için ideal yüksek enlem yer istasyonları. Uygun maliyetli ancak aralıklı geçişler sağlar.',
  },
  'ground-dsn': {
    name: 'NASA Derin Uzay Ağı (DSN)',
    description: 'Goldstone, Madrid ve Canberra\'da 120 derece aralıkla yerleştirilmiş 70 metrelik üç dev çanak kompleksi. Kesintisiz derin uzay kapsaması.',
  },
  'ground-relay': {
    name: 'TDRSS Yörünge Takip ve Röle Uyduları',
    description: 'Jeosenkron veri röle uyduları takımyıldızı. Yer istasyonu kör noktaları olmadan %100 gerçek zamanlı kesintisiz bağlantı.',
  },
};

export const ORBIT_PROFILES_TR: Record<string, Partial<OrbitProfile>> = {
  'orbit-lunar-polar': {
    name: 'Alçak Ay Kutup Yörüngesi (100 km)',
    description: 'Ay altta dönerken her 2 saatte bir doğrudan kutup kraterlerinin üzerinden geçer. Küresel kutup buzu haritalaması için idealdir.',
  },
  'orbit-mars-low': {
    name: 'Alçak Mars Dairesel Bilim Yörüngesi (350 km)',
    description: 'Atmosferik sürtünmeyle yakın kanyon ve nehir yatağı görüntülemesini dengeleyen güneşe eşzamanlı Mars yörüngesi.',
  },
  'orbit-europa-flyby': {
    name: 'Europa Rezonans Yakın Geçişli Jüpiter Yörüngesi',
    description: 'Hızlı yakınlaşmalarda Europa\'nın buz gayzerleri bölgesine dalar, ardından ölümcül Jüpiter radyasyonundan kaçmak için dışa açılır.',
  },
  'orbit-asteroid-halo': {
    name: 'Dünya\'ya Yakın Asteroit Halo Yörüngesi (12 km)',
    description: 'Dönen bir asteroitin mikro yerçekimi denge noktası etrafında konum koruma yörüngesi.',
  },
  'orbit-leo-science': {
    name: 'Alçak Dünya Bilim Yörüngesi (550 km)',
    description: 'Yörünge gözlemevleri ve deneysel teknoloji göstericileri için standart uzay irtifası.',
  },
};

// Helper getter functions that return objects with localized names and descriptions
export function getLocalizedScenarios(locale: Locale): MissionScenario[] {
  if (locale === 'en') return MISSION_SCENARIOS;
  return MISSION_SCENARIOS.map((sc) => ({
    ...sc,
    ...(MISSION_SCENARIOS_TR[sc.id] || {}),
  }));
}

export function getLocalizedLaunchVehicles(locale: Locale): LaunchVehicle[] {
  if (locale === 'en') return LAUNCH_VEHICLES;
  return LAUNCH_VEHICLES.map((v) => ({
    ...v,
    ...(LAUNCH_VEHICLES_TR[v.id] || {}),
  }));
}

export function getLocalizedSpacecraftBuses(locale: Locale): SpacecraftBus[] {
  if (locale === 'en') return SPACECRAFT_BUSES;
  return SPACECRAFT_BUSES.map((b) => ({
    ...b,
    ...(SPACECRAFT_BUSES_TR[b.id] || {}),
  }));
}

export function getLocalizedPropulsionSystems(locale: Locale): PropulsionSystem[] {
  if (locale === 'en') return PROPULSION_SYSTEMS;
  return PROPULSION_SYSTEMS.map((p) => ({
    ...p,
    ...(PROPULSION_SYSTEMS_TR[p.id] || {}),
  }));
}

export function getLocalizedPowerSystems(locale: Locale): PowerSystem[] {
  if (locale === 'en') return POWER_SYSTEMS;
  return POWER_SYSTEMS.map((p) => ({
    ...p,
    ...(POWER_SYSTEMS_TR[p.id] || {}),
  }));
}

export function getLocalizedBatterySystems(locale: Locale): BatterySystem[] {
  if (locale === 'en') return BATTERY_SYSTEMS;
  return BATTERY_SYSTEMS.map((b) => ({
    ...b,
    ...(BATTERY_SYSTEMS_TR[b.id] || {}),
  }));
}

export function getLocalizedScientificInstruments(locale: Locale): ScientificInstrument[] {
  if (locale === 'en') return SCIENTIFIC_INSTRUMENTS;
  return SCIENTIFIC_INSTRUMENTS.map((inst) => ({
    ...inst,
    ...(SCIENTIFIC_INSTRUMENTS_TR[inst.id] || {}),
  }));
}

export function getLocalizedAntennaSystems(locale: Locale): AntennaSystem[] {
  if (locale === 'en') return ANTENNA_SYSTEMS;
  return ANTENNA_SYSTEMS.map((a) => ({
    ...a,
    ...(ANTENNA_SYSTEMS_TR[a.id] || {}),
  }));
}

export function getLocalizedGroundStations(locale: Locale): GroundStationNetwork[] {
  if (locale === 'en') return GROUND_STATIONS;
  return GROUND_STATIONS.map((g) => ({
    ...g,
    ...(GROUND_STATIONS_TR[g.id] || {}),
  }));
}

export function getLocalizedOrbitProfiles(locale: Locale): OrbitProfile[] {
  if (locale === 'en') return ORBIT_PROFILES;
  return ORBIT_PROFILES.map((o) => ({
    ...o,
    ...(ORBIT_PROFILES_TR[o.id] || {}),
  }));
}
