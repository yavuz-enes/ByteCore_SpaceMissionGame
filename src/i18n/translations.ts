export type Locale = 'en' | 'tr';

export interface TranslationStrings {
  header: {
    badge: string;
    multiplayerBtn: string;
    room: string;
    crew: string;
    nominal: string;
    reviewsNeeded: string;
    launchBtn: string;
    language: string;
  };
  telemetry: {
    budget: string;
    max: string;
    surplus: string;
    deficit: string;
    mass: string;
    overload: string;
    ok: string;
    netPower: string;
    sun: string;
    drain: string;
    deltaV: string;
    req: string;
    scienceScore: string;
    targetMet: string;
    low: string;
    successProb: string;
    high: string;
    risky: string;
    critical: string;
    nominalStatus: string;
    attentionStatus: string;
    selected: string;
    active: string;
    off: string;
    pts: string;
  };
  roles: {
    commander: {
      name: string;
      title: string;
      duty: string;
    };
    engineer: {
      name: string;
      title: string;
      duty: string;
    };
    scientist: {
      name: string;
      title: string;
      duty: string;
    };
    comms: {
      name: string;
      title: string;
      duty: string;
    };
    stationController: string;
    uncrewed: string;
    soloNote: string;
  };
  commander: {
    stationTitle: string;
    step1Title: string;
    step2Title: string;
    step2Sub: string;
    targetDest: string;
    reqDeltaV: string;
    radLevel: string;
    altitude: string;
    inclination: string;
    sunlight: string;
    launchCost: string;
    payloadCap: string;
    deltaVBonus: string;
    reliability: string;
    tooSmallWarn: string;
    selectedBadge: string;
    deltaVReqLabel: string;
    radiationLevels: {
      low: string;
      moderate: string;
      severe: string;
      extreme: string;
    };
  };
  engineer: {
    stationTitle: string;
    pageHeading: string;
    stationDesc: string;
    solarIntensity: string;
    radShielding: string;
    netPowerDraw: string;
    sec1Title: string;
    sec1Sub: string;
    sec2Title: string;
    sec2Sub: string;
    sec3Title: string;
    sec4Title: string;
    sec4Sub: string;
    cost: string;
    dryMass: string;
    payloadCap: string;
    shieldRating: string;
    fuelMass: string;
    isp: string;
    thrustPower: string;
    basePower: string;
    deepSpace: string;
    capacity: string;
    mass: string;
    operational: string;
    poorEfficiency: string;
    safe: string;
    vulnerable: string;
    selectedBadge: string;
    proposalModalTitle: string;
    proposalModalDesc: string;
    proposalLabel: string;
    costLabel: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    cancel: string;
    submitToCrew: string;
  };
  scientist: {
    stationTitle: string;
    pageHeading: string;
    stationDesc: string;
    targetScience: string;
    currentScore: string;
    orbitMultiplier: string;
    objectiveComp: string;
    gridTitle: string;
    gridSub: string;
    scienceVal: string;
    powerDraw: string;
    mass: string;
    dataRate: string;
    price: string;
    active: string;
    off: string;
    pts: string;
  };
  comms: {
    stationTitle: string;
    pageHeading: string;
    stationDesc: string;
    distEarth: string;
    delay: string;
    downlinkStatus: string;
    optimal: string;
    bottleneck: string;
    sec1Title: string;
    sec2Title: string;
    cost: string;
    maxSpeed: string;
    powerDraw: string;
    mass: string;
    opsCost: string;
    coverage: string;
    throughputComparison: string;
    downlinkSpeed: string;
    sensorGenRate: string;
    bottleneckWarn: string;
    distanceUnit: string;
    selectedBadge: string;
  };
  advisory: {
    title: string;
    engine: string;
    allNominal: string;
    flightRecorder: string;
    online: string;
  };
  simulation: {
    flightTele: string;
    reset: string;
    close: string;
    lockedTitle: string;
    lockedDesc: string;
    warningsDetected: string;
    allSystemsNominal: string;
    allSystemsNominalDesc: string;
    startCountdown: string;
    countdownSub: string;
    countdownStatus: string;
    successTitle: string;
    successDesc: string;
    rating: string;
    harvest: string;
    margin: string;
    deltaVSurplus: string;
    debriefSummary: string;
    designAnother: string;
    failTitle: string;
    failDesc: string;
    analysisReport: string;
    returnArchitect: string;
    altitude: string;
    velocity: string;
    downlinkBuffer: string;
    scienceCollected: string;
    grades: {
      excellence: string;
      nominal: string;
      qualified: string;
      marginal: string;
    };
    targetLabel: string;
    dsnLock: string;
    goal: string;
    pts: string;
    flightStageTitle: string;
    steppers: {
      liftoff: string;
      maxQ: string;
      stageSep: string;
      transferCruise: string;
      orbitalBurn: string;
      solarDeploy: string;
      sciencePass: string;
    };
    stageDetails: {
      liftoff: string;
      maxQ: string;
      stageSep: string;
      transferCruise: string;
      orbitalBurn: string;
      solarDeploy: string;
      sciencePass: string;
    };
    environmentalStatus: string;
    vibrationTest: string;
    tvacTest: string;
    testPending: string;
    testPassed: string;
    testFailed: string;
    insertionBurnTitle: string;
    insertionBurnDesc: string;
    executeBurnBtn: string;
    awaitingCommanderBurn: string;
    targetWindowNotice: string;
    anomalyAlertTitle: string;
    anomalyUrgency: string;
    proceedToBurn: string;
    proceedToDeploy: string;
  };
  multiplayer: {
    title: string;
    sub: string;
    hostTitle: string;
    hostDesc: string;
    callsign: string;
    duty: string;
    roomCode: string;
    createBtn: string;
    joinTitle: string;
    joinDesc: string;
    connectBtn: string;
    code: string;
    readyBtn: string;
    readyGo: string;
    leaveBtn: string;
    crewStations: string;
    budgetVotes: string;
    takeStation: string;
    voiceChat: string;
    secureFreq: string;
    typeMsg: string;
    noProposals: string;
    budgetImpact: string;
    approve: string;
    reject: string;
    establishing: string;
    connecting: string;
    callsignPlaceholder: string;
    clientCallsignPlaceholder: string;
    autoCodePlaceholder: string;
    roomCodePlaceholder: string;
    hostRole: string;
    clientRole: string;
    standby: string;
    consoleUncrewed: string;
    by: string;
    statusApproved: string;
    statusRejected: string;
    statusPending: string;
    pings: {
      nominal: string;
      needPower: string;
      goLaunch: string;
    };
  };
  canvas: {
    target: string;
    cam3d: string;
    dragOrbit: string;
    orbitView: string;
    transferView: string;
    apoapsis: string;
    periapsis: string;
    velocityVec: string;
    trajectory: string;
    sun: string;
    earth: string;
  };
}

export const TRANSLATIONS: Record<Locale, TranslationStrings> = {
  en: {
    header: {
      badge: 'AEROSPACE SIM',
      multiplayerBtn: 'LOBBY',
      room: 'ROOM',
      crew: 'CREW',
      nominal: 'ALL SYSTEMS NOMINAL',
      reviewsNeeded: 'REVIEWS REQUIRED',
      launchBtn: 'LAUNCH SIMULATION',
      language: 'LANGUAGE',
    },
    telemetry: {
      budget: 'BUDGET',
      max: 'MAX',
      surplus: 'SURPLUS',
      deficit: 'DEFICIT',
      mass: 'MASS',
      overload: 'OVERLOAD',
      ok: 'OK',
      netPower: 'NET POWER',
      sun: 'SUN',
      drain: 'DRAIN',
      deltaV: 'DELTA-V',
      req: 'REQ',
      scienceScore: 'SCIENCE SCORE',
      targetMet: 'TARGET MET',
      low: 'LOW',
      successProb: 'SUCCESS PROB',
      high: 'HIGH',
      risky: 'RISKY',
      critical: 'CRITICAL',
      nominalStatus: 'NOMINAL',
      attentionStatus: 'ATTENTION',
      selected: 'SELECTED',
      active: 'ACTIVE',
      off: 'OFF',
      pts: 'PTS',
    },
    roles: {
      commander: {
        name: 'Commander',
        title: 'Mission Commander',
        duty: 'Selects destination, orbit altitude, and launch rocket',
      },
      engineer: {
        name: 'Flight Engineer',
        title: 'Systems & Power Engineer',
        duty: 'Balances bus structure, engines, solar wings, and battery storage',
      },
      scientist: {
        name: 'Science Lead',
        title: 'Principal Scientist',
        duty: 'Selects cameras, spectrometers, and radar to meet science goals',
      },
      comms: {
        name: 'Comms Officer',
        title: 'Telemetry & Comms Officer',
        duty: 'Configures high-gain dishes, laser links, and ground station relays',
      },
      stationController: 'STATION CONTROLLER',
      uncrewed: 'Unassigned (Take Controls)',
      soloNote: 'SOLO MODE • Switch between all 4 console stations at any time',
    },
    commander: {
      stationTitle: 'COMMAND STATION 01 • MISSION PROFILE & LAUNCH VEHICLE',
      step1Title: 'STEP 1: SELECT MISSION ORBIT PROFILE',
      step2Title: 'STEP 2: CHOOSE LAUNCH VEHICLE',
      step2Sub: '(Must have enough lift capacity for your total spacecraft wet mass)',
      targetDest: 'TARGET DESTINATION',
      reqDeltaV: 'REQUIRED DELTA-V',
      radLevel: 'RADIATION LEVEL',
      altitude: 'ALTITUDE',
      inclination: 'INCLINATION',
      sunlight: 'SUNLIGHT',
      launchCost: 'LAUNCH COST',
      payloadCap: 'PAYLOAD CAPACITY',
      deltaVBonus: 'DELTA-V BONUS',
      reliability: 'FLIGHT RELIABILITY',
      tooSmallWarn: 'Rocket is too small for current mass!',
      selectedBadge: 'SELECTED',
      deltaVReqLabel: 'ΔV REQ:',
      radiationLevels: {
        low: 'Low',
        moderate: 'Moderate',
        severe: 'Severe',
        extreme: 'Extreme',
      },
    },
    engineer: {
      stationTitle: 'SYSTEMS STATION 02 • SPACECRAFT BUS, PROPULSION & POWER',
      pageHeading: 'Spacecraft Engineering Systems',
      stationDesc: 'Design the structural bus, propulsion engine, and electrical power system. Interplanetary distance weakens solar energy, and ion thrusters require high electric power.',
      solarIntensity: 'SOLAR INTENSITY',
      radShielding: 'RADIATION SHIELDING',
      netPowerDraw: 'NET POWER DRAW',
      sec1Title: '1. SPACECRAFT BUS STRUCTURE',
      sec1Sub: '(Determines radiation protection and maximum payload mass)',
      sec2Title: '2. PROPULSION & ENGINES',
      sec2Sub: '(Fuel and ISP determine your available Delta-V)',
      sec3Title: '3. POWER GENERATION (SOLAR & NUCLEAR)',
      sec4Title: '4. BATTERY STORAGE',
      sec4Sub: '(Powers spacecraft during shadow/eclipse phases)',
      cost: 'COST',
      dryMass: 'DRY MASS',
      payloadCap: 'PAYLOAD CAPACITY',
      shieldRating: 'RADIATION SHIELD',
      fuelMass: 'FUEL MASS',
      isp: 'ISP (EFFICIENCY)',
      thrustPower: 'THRUST / POWER',
      basePower: 'BASE POWER',
      deepSpace: 'DEEP SPACE (JUPITER)',
      capacity: 'CAPACITY',
      mass: 'MASS',
      operational: '100% OPERATIONAL',
      poorEfficiency: 'POOR EFFICIENCY',
      safe: 'SAFE',
      vulnerable: 'VULNERABLE',
      selectedBadge: 'SELECTED',
      proposalModalTitle: 'Submit Engineering Proposal',
      proposalModalDesc: 'In multiplayer, major component and budget alterations are voted on by the flight crew.',
      proposalLabel: 'PROPOSAL:',
      costLabel: 'COST:',
      reasonLabel: 'Reason for Change (Optional):',
      reasonPlaceholder: 'e.g. Need more power for radar sweeps',
      cancel: 'Cancel',
      submitToCrew: 'Submit to Crew',
    },
    scientist: {
      stationTitle: 'SCIENCE STATION 03 • SCIENTIFIC SENSORS & PAYLOAD SELECTION',
      pageHeading: 'Scientific Instruments Suite',
      stationDesc: 'Equip scientific cameras, spectrometers, and radar. Every instrument generates valuable science data, but increases electrical draw, satellite weight, and required communication bandwidth.',
      targetScience: 'TARGET SCIENCE',
      currentScore: 'CURRENT SCORE',
      orbitMultiplier: 'ORBIT MULTIPLIER',
      objectiveComp: 'SCIENTIFIC OBJECTIVE COMPLETION',
      gridTitle: 'AVAILABLE SCIENTIFIC INSTRUMENTS',
      gridSub: '(Click to install or remove from payload bay)',
      scienceVal: 'SCIENCE VALUE',
      powerDraw: 'POWER DRAW',
      mass: 'MASS',
      dataRate: 'DATA RATE',
      price: 'PRICE',
      active: 'ACTIVE',
      off: 'OFF',
      pts: 'PTS',
    },
    comms: {
      stationTitle: 'COMMS STATION 04 • RADIO ANTENNAS & DEEP SPACE DOWNLINK',
      pageHeading: 'Communications & Ground Network',
      stationDesc: 'Configure your antenna dish and ground station network. Radio signal strength drops dramatically with distance across deep space. Ensure your throughput can transmit your science findings.',
      distEarth: 'DISTANCE TO EARTH',
      delay: 'ONE-WAY LIGHT DELAY',
      downlinkStatus: 'DOWNLINK STATUS',
      optimal: 'OPTIMAL',
      bottleneck: 'BANDWIDTH BOTTLENECK',
      sec1Title: '1. SELECT SPACECRAFT ANTENNA',
      sec2Title: '2. EARTH GROUND STATION RELAY',
      cost: 'COST',
      maxSpeed: 'MAX SPEED',
      powerDraw: 'POWER DRAW',
      mass: 'MASS',
      opsCost: 'OPERATIONS COST',
      coverage: 'ORBITAL COVERAGE',
      throughputComparison: 'DOWNLINK THROUGHPUT COMPARISON',
      downlinkSpeed: 'DOWNLINK SPEED AT DESTINATION',
      sensorGenRate: 'SENSORS DATA RATE GENERATED',
      bottleneckWarn: 'Bandwidth deficit: Downlink speed is lower than instrument data generation.',
      distanceUnit: '1 AU = 150 Million km',
      selectedBadge: 'SELECTED',
    },
    advisory: {
      title: 'FLIGHT ADVISORIES',
      engine: '',
      allNominal: 'All systems nominal',
      flightRecorder: 'MISSION CONTROL FLIGHT RECORDER',
      online: 'ONLINE',
    },
    simulation: {
      flightTele: 'Flight Telemetry & Mission Execution',
      reset: 'Reset',
      close: 'Close HUD',
      lockedTitle: 'Mission Design Locked & Verified',
      lockedDesc: 'Verify all launch parameters before igniting main engines. Ensure power balance, Delta-V capacity, and payload limits are within safe margins.',
      warningsDetected: 'CRITICAL FLIGHT WARNINGS DETECTED',
      allSystemsNominal: 'ALL MISSION SYSTEMS NOMINAL',
      allSystemsNominalDesc: 'Payload mass is balanced, power is surplus positive, and trajectory Delta-V is verified.',
      startCountdown: 'START COUNTDOWN (T-10s)',
      countdownSub: 'TERMINAL LAUNCH COUNTDOWN SEQUENCE',
      countdownStatus: '',
      successTitle: 'Mission Success! Objective Completed',
      successDesc: '',
      rating: 'OVERALL RATING',
      harvest: 'SCIENCE HARVEST',
      margin: 'BUDGET MARGIN',
      deltaVSurplus: 'DELTA-V SURPLUS',
      debriefSummary: 'NASA MISSION DEBRIEF SUMMARY',
      designAnother: 'Design Another Mission',
      failTitle: 'Mission Failure / Aborted',
      failDesc: 'The spacecraft was unable to complete the flight profile due to critical resource starvation or mass overload.',
      analysisReport: 'FAILURE ANALYSIS REPORT',
      returnArchitect: 'Return to Architect & Re-engineer',
      altitude: 'ALTITUDE',
      velocity: 'VELOCITY',
      downlinkBuffer: 'DOWNLINK BUFFER',
      scienceCollected: 'SCIENCE COLLECTED',
      grades: {
        excellence: 'A+ EXCELLENCE',
        nominal: 'A NOMINAL',
        qualified: 'B QUALIFIED',
        marginal: 'C MARGINAL',
      },
      targetLabel: 'TARGET',
      dsnLock: 'DSN GROUND LOCK',
      goal: 'GOAL',
      pts: 'PTS',
      flightStageTitle: 'FLIGHT STAGE',
      steppers: {
        liftoff: '1. LIFTOFF',
        maxQ: '2. MAX-Q',
        stageSep: '3. STAGE SEP',
        transferCruise: '4. HOHMANN TRANSFER',
        orbitalBurn: '5. INSERTION BURN',
        solarDeploy: '6. SOLAR DEPLOY',
        sciencePass: '7. SCIENCE DOWNLINK',
      },
      stageDetails: {
        liftoff: 'Main rocket engines at 100% thrust. Clearing launch tower.',
        maxQ: 'Passing through maximum aerodynamic stress. Structure nominal.',
        stageSep: 'Booster stage separation confirmed. Vacuum engine ignition.',
        transferCruise: 'Interplanetary Hohmann transfer orbit. Deep space telemetry active.',
        orbitalBurn: 'Execute terminal orbital insertion burn at target periapsis.',
        solarDeploy: 'Solar array wings unfolding and locking onto sunlight.',
        sciencePass: 'Instruments transmitting scientific data down to Earth.',
      },
      environmentalStatus: 'PRE-FLIGHT ENVIRONMENTAL QUALIFICATION',
      vibrationTest: 'ACOUSTIC SHAKE TABLE TEST',
      tvacTest: 'THERMAL VACUUM (TVAC) CHAMBER',
      testPending: 'PENDING QUALIFICATION',
      testPassed: 'QUALIFIED (PASS)',
      testFailed: 'FAILED (STRESS BREACH)',
      insertionBurnTitle: 'TERMINAL INSERTION BURN (TIMING TARGET)',
      insertionBurnDesc: 'Time ignition burn accurately within the ±5% nominal window to circularize orbit. Premature or late burns cause delta-v loss and hyperbolic escape.',
      executeBurnBtn: 'EXECUTE INSERTION BURN',
      awaitingCommanderBurn: 'AWAITING COMMANDER INJECTION BURN...',
      targetWindowNotice: 'NOMINAL INJECTION WINDOW (±5%)',
      anomalyAlertTitle: 'EMERGENCY TELEMETRY ALERT • CRISIS DETECTED',
      anomalyUrgency: 'CRITICAL WINDOW COUNTDOWN',
      proceedToBurn: 'PROCEED TO INSERTION BURN',
      proceedToDeploy: 'PROCEED TO SOLAR ARRAY DEPLOY',
    },
    multiplayer: {
      title: 'Multiplayer Mission Lobby',
      sub: 'WebRTC Peer-to-Peer 4-Crew Collaborative Command Deck',
      hostTitle: 'Host Crew Simulation',
      hostDesc: 'Start a room, choose your callsign, and share the 6-character room code with your teammates. Your browser will host the mission simulation.',
      callsign: 'Your Callsign / Name',
      duty: 'Select Console Duty',
      roomCode: 'Custom Room Code (Optional)',
      createBtn: 'CREATE ROOM AS HOST',
      joinTitle: 'Join Teammate’s Room',
      joinDesc: 'Enter the Room Code shared by your Host. You will instantly sync to their mission design and collaborate in real time.',
      connectBtn: 'CONNECT TO ROOM',
      code: 'CODE',
      readyBtn: 'MARK GO FOR LAUNCH',
      readyGo: 'CREW READY (GO)',
      leaveBtn: 'Leave Room',
      crewStations: 'CREW STATIONS',
      budgetVotes: 'BUDGET VOTES',
      takeStation: 'Take Station',
      voiceChat: 'TACTICAL VOICE / CHAT',
      secureFreq: 'SECURE FREQ',
      typeMsg: 'Type tactical message...',
      noProposals: 'No component upgrade proposals submitted yet. Crew members can submit proposals from their stations.',
      budgetImpact: 'Budget Impact',
      approve: 'Approve',
      reject: 'Reject',
      establishing: 'ESTABLISHING...',
      connecting: 'CONNECTING...',
      callsignPlaceholder: 'e.g. Commander Sarah',
      clientCallsignPlaceholder: 'e.g. Systems Alex',
      autoCodePlaceholder: 'Leave blank for auto-code',
      roomCodePlaceholder: 'e.g. APOLLO or NASA26',
      hostRole: 'HOST (Simulation Master)',
      clientRole: 'CLIENT (Synced)',
      standby: 'STANDBY',
      consoleUncrewed: 'Console uncrewed',
      by: 'BY',
      statusApproved: 'APPROVED',
      statusRejected: 'REJECTED',
      statusPending: 'PENDING',
      pings: {
        nominal: 'Systems check nominal!',
        needPower: 'Need more power margin!',
        goLaunch: 'GO for launch countdown.',
      },
    },
    canvas: {
      target: 'TARGET',
      cam3d: 'CAM: INTERACTIVE 3D',
      dragOrbit: 'DRAG TO ORBIT',
      orbitView: 'ORBIT VIEW',
      transferView: 'TRANSFER VIEW',
      apoapsis: 'APOAPSIS (AP)',
      periapsis: 'PERIAPSIS (PE)',
      velocityVec: 'VELOCITY VECTOR',
      trajectory: 'HOHMANN TRANSFER ARC',
      sun: 'SUN',
      earth: 'EARTH',
    },
  },
  tr: {
    header: {
      badge: 'UZAY SİMÜLASYONU',
      multiplayerBtn: 'LOBİ',
      room: 'ODA',
      crew: 'MÜRETTEBAT',
      nominal: 'TÜM SİSTEMLER HAZIR',
      reviewsNeeded: 'İNCELEME GEREKİYOR',
      launchBtn: 'FIRLATMA SİMÜLASYONU',
      language: 'DİL',
    },
    telemetry: {
      budget: 'BÜTÇE',
      max: 'AZAMİ',
      surplus: 'KALAN',
      deficit: 'AÇIK',
      mass: 'KÜTLE',
      overload: 'AŞIRI YÜK',
      ok: 'UYGUN',
      netPower: 'NET GÜÇ',
      sun: 'GÜNEŞ',
      drain: 'TÜKENME',
      deltaV: 'DELTA-V',
      req: 'GEREKEN',
      scienceScore: 'BİLİM PUANI',
      targetMet: 'HEDEF TAMAM',
      low: 'YETERSİZ',
      successProb: 'BAŞARI OLASILIĞI',
      high: 'YÜKSEK',
      risky: 'RİSKLİ',
      critical: 'KRİTİK',
      nominalStatus: 'NORMAL',
      attentionStatus: 'DİKKAT',
      selected: 'SEÇİLDİ',
      active: 'AKTİF',
      off: 'KAPALI',
      pts: 'PUAN',
    },
    roles: {
      commander: {
        name: 'Komutan',
        title: 'Görev Komutanı',
        duty: 'Hedef, yörünge irtifası ve fırlatma roketini seçer',
      },
      engineer: {
        name: 'Uçuş Mühendisi',
        title: 'Sistem ve Güç Mühendisi',
        duty: 'Gövde yapısı, motorlar, güneş panelleri ve bataryayı dengeler',
      },
      scientist: {
        name: 'Bilim Lideri',
        title: 'Baş Araştırmacı',
        duty: 'Bilim hedeflerine ulaşmak için kamera, spektrometre ve radar seçer',
      },
      comms: {
        name: 'Haberleşme Subayı',
        title: 'Telemetri ve İletişim',
        duty: 'Yüksek kazançlı antenler, lazer linkleri ve yer istasyonlarını yönetir',
      },
      stationController: 'KONSOL SORUMLUSU',
      uncrewed: 'Atanmadı (Kontrolü Al)',
      soloNote: 'TEK OYUNCULU MOD • İstediğiniz an 4 konsol istasyonu arasında geçiş yapabilirsiniz',
    },
    commander: {
      stationTitle: 'KOMUTA İSTASYONU 01 • GÖREV PROFİLİ VE FIRLATMA ROKETİ',
      step1Title: '1. ADIM: GÖREV YÖRÜNGE PROFİLİNİ SEÇİN',
      step2Title: '2. ADIM: FIRLATMA ROKETİNİ SEÇİN',
      step2Sub: '(Toplam uzay aracı ıslak kütlesi için yeterli taşıma kapasitesine sahip olmalıdır)',
      targetDest: 'HEDEF GÖK CİSMİ',
      reqDeltaV: 'GEREKEN DELTA-V',
      radLevel: 'RADYASYON DÜZEYİ',
      altitude: 'İRTİFA',
      inclination: 'EĞİKLİK',
      sunlight: 'GÜNEŞ IŞIĞI',
      launchCost: 'FIRLATMA MALİYETİ',
      payloadCap: 'TAŞIMA KAPASİTESİ',
      deltaVBonus: 'DELTA-V BONUSU',
      reliability: 'UÇUŞ GÜVENİLİRLİĞİ',
      tooSmallWarn: 'Roket mevcut kütle için çok küçük!',
      selectedBadge: 'SEÇİLDİ',
      deltaVReqLabel: 'GEREKEN ΔV:',
      radiationLevels: {
        low: 'Düşük',
        moderate: 'Orta',
        severe: 'Yüksek',
        extreme: 'Aşırı (Ölümcül)',
      },
    },
    engineer: {
      stationTitle: 'SİSTEM İSTASYONU 02 • UZAY ARACI GÖVDESİ, İTKİ VE GÜÇ',
      pageHeading: 'Uzay Aracı Mühendislik Sistemleri',
      stationDesc: 'Gövde yapısını, itki motorunu ve elektrik güç sistemini tasarlayın. Gezegenler arası mesafe güneş enerjisini zayıflatır; iyon iticileri yüksek elektrik gerektirir.',
      solarIntensity: 'GÜNEŞ ŞİDDETİ',
      radShielding: 'RADYASYON KALKANI',
      netPowerDraw: 'NET GÜÇ DENGESİ',
      sec1Title: '1. UZAY ARACI GÖVDE YAPISI',
      sec1Sub: '(Radyasyon korumasını ve azami faydalı yük kütlesini belirler)',
      sec2Title: '2. İTKİ VE MOTOR SİSTEMİ',
      sec2Sub: '(Yakıt ve özgül itici kuvvet mevcut Delta-V değerinizi belirler)',
      sec3Title: '3. GÜÇ ÜRETİMİ (GÜNEŞ VE NÜKLEER)',
      sec4Title: '4. BATARYA DEPOLAMA',
      sec4Sub: '(Tutulma ve gölge evrelerinde uzay aracına güç sağlar)',
      cost: 'MALİYET',
      dryMass: 'KURU KÜTLE',
      payloadCap: 'FAYDALI YÜK KAPASİTESİ',
      shieldRating: 'RADYASYON KALKANI',
      fuelMass: 'YAKIT KÜTLESİ',
      isp: 'ÖZGÜL İTİCİ KUVVET (ISP)',
      thrustPower: 'İTKİ / GÜÇ',
      basePower: 'TEMEL GÜÇ',
      deepSpace: 'DERİN UZAY (JÜPİTER)',
      capacity: 'KAPASİTE',
      mass: 'KÜTLE',
      operational: '%100 ÇALIŞIR',
      poorEfficiency: 'YETERSİZ VERİM',
      safe: 'GÜVENLİ',
      vulnerable: 'SAVUNMASIZ',
      selectedBadge: 'SEÇİLDİ',
      proposalModalTitle: 'Mühendislik Teklifi Gönder',
      proposalModalDesc: 'Çok oyunculu modda, ana bileşen ve bütçe değişiklikleri uçuş mürettebatı tarafından oylanır.',
      proposalLabel: 'TEKLİF:',
      costLabel: 'MALİYET:',
      reasonLabel: 'Değişiklik Gerekçesi (İsteğe Bağlı):',
      reasonPlaceholder: 'Örn: Radar taramaları için daha fazla güç gerekiyor',
      cancel: 'İptal',
      submitToCrew: 'Mürettebata İlet',
    },
    scientist: {
      stationTitle: 'BİLİM İSTASYONU 03 • BİLİMSEL ALGILAYICILAR VE FAYDALI YÜK',
      pageHeading: 'Bilimsel Algılayıcı Seti',
      stationDesc: 'Bilimsel kameralar, spektrometreler ve radarlar donatın. Her aygıt değerli bilim verisi toplar ancak elektrik tüketimini, kütleyi ve gereken bant genişliğini artırır.',
      targetScience: 'HEDEF BİLİM',
      currentScore: 'MEVCUT PUAN',
      orbitMultiplier: 'YÖRÜNGE ÇARPANI',
      objectiveComp: 'BİLİMSEL HEDEF TAMAMLANMA',
      gridTitle: 'KULLANILABİLİR BİLİMSEL AYGITLAR',
      gridSub: '(Faydalı yük bölmesine eklemek veya çıkarmak için tıklayın)',
      scienceVal: 'BİLİM DEĞERİ',
      powerDraw: 'GÜÇ ÇEKİMİ',
      mass: 'KÜTLE',
      dataRate: 'VERİ HIZI',
      price: 'FİYAT',
      active: 'AKTİF',
      off: 'KAPALI',
      pts: 'PUAN',
    },
    comms: {
      stationTitle: 'HABERLEŞME İSTASYONU 04 • RADYO ANTENLERİ VE YER İSTASYONU',
      pageHeading: 'Haberleşme ve Yer İstasyonu Ağı',
      stationDesc: 'Anten çanağınızı ve yer istasyonu ağını yapılandırın. Radyo sinyal gücü derin uzayda mesafeyle hızla zayıflar. İletişim hızınızın bilim verilerini aktarabildiğinden emin olun.',
      distEarth: 'DÜNYA\'YA UZAKLIK',
      delay: 'TEK YÖNLÜ IŞIK GECİKMESİ',
      downlinkStatus: 'VERİ AKTARIM DURUMU',
      optimal: 'OPTİMAL',
      bottleneck: 'BANT GENİŞLİĞİ DARBOĞAZI',
      sec1Title: '1. UZAY ARACI ANTENİNİ SEÇİN',
      sec2Title: '2. DÜNYA YER İSTASYONU AĞI',
      cost: 'MALİYET',
      maxSpeed: 'AZAMİ HIZ',
      powerDraw: 'GÜÇ ÇEKİMİ',
      mass: 'KÜTLE',
      opsCost: 'İŞLETME MALİYETİ',
      coverage: 'YÖRÜNGE KAPSAMASI',
      throughputComparison: 'VERİ AKTARIM HIZI KARŞILAŞTIRMASI',
      downlinkSpeed: 'HEDEFTE VERİ AKTARIM HIZI',
      sensorGenRate: 'ALGILAYICILARIN ÜRETTİĞİ VERİ',
      bottleneckWarn: 'Bant genişliği açığı: Veri indirme hızı aygıt üretiminin altında.',
      distanceUnit: '1 AB = 150 Milyon km',
      selectedBadge: 'SEÇİLDİ',
    },
    advisory: {
      title: 'UÇUŞ BİLDİRİMLERİ',
      engine: '',
      allNominal: 'Tüm sistemler nominal',
      flightRecorder: 'GÖREV KONTROL UÇUŞ KAYDI',
      online: 'ÇEVRİMİÇİ',
    },
    simulation: {
      flightTele: 'Uçuş Telemetrisi ve Görev İcrası',
      reset: 'Sıfırla',
      close: 'Pencereyi Kapat',
      lockedTitle: 'Görev Tasarımı Kilitlendi ve Doğrulandı',
      lockedDesc: 'Ana motorları ateşlemeden önce tüm fırlatma parametrelerini doğrulayın. Güç dengesi, Delta-V kapasitesi ve yük sınırlarının güvenli aralıkta olduğundan emin olun.',
      warningsDetected: 'KRİTİK UÇUŞ UYARILARI TESPİT EDİLDİ',
      allSystemsNominal: 'TÜM GÖREV SİSTEMLERİ NORMAL',
      allSystemsNominalDesc: 'Faydalı yük dengelendi, net güç fazlası mevcut ve yörünge Delta-V değeri doğrulandı.',
      startCountdown: 'GERİ SAYIMI BAŞLAT (T-10s)',
      countdownSub: 'FİNAL FIRLATMA GERİ SAYIM EVRESİ',
      countdownStatus: '',
      successTitle: 'Görev Başarılı! Hedefe Ulaşıldı',
      successDesc: '',
      rating: 'GENEL DERECELENDİRME',
      harvest: 'TOPLANAN BİLİM',
      margin: 'BÜTÇE PAYI',
      deltaVSurplus: 'DELTA-V FAZLASI',
      debriefSummary: 'NASA GÖREV SONU DEĞERLENDİRME RAPORU',
      designAnother: 'Yeni Bir Görev Tasarla',
      failTitle: 'Görev Başarısız / İptal Edildi',
      failDesc: 'Uzay aracı kritik kaynak tükenmesi veya aşırı kütle nedeniyle uçuş profilini tamamlayamadı.',
      analysisReport: 'HATA ANALİZ RAPORU',
      returnArchitect: 'Tasarım Konsoluna Dön ve Yeniden İncele',
      altitude: 'İRTİFA',
      velocity: 'HIZ',
      downlinkBuffer: 'VERİ TAMPONU',
      scienceCollected: 'TOPLANAN BİLİM',
      grades: {
        excellence: 'A+ MÜKEMMEL',
        nominal: 'A BAŞARILI',
        qualified: 'B YETERLİ',
        marginal: 'C SINIRDA',
      },
      targetLabel: 'HEDEF',
      dsnLock: 'DSN YER KİLİDİ',
      goal: 'HEDEF',
      pts: 'PUAN',
      flightStageTitle: 'UÇUŞ EVRESİ',
      steppers: {
        liftoff: '1. HAVALANMA',
        maxQ: '2. AZAMİ BASINÇ',
        stageSep: '3. KADEME AYRILMASI',
        transferCruise: '4. HOHMANN GEÇİŞİ',
        orbitalBurn: '5. YÖRÜNGE ATEŞLEMESİ',
        solarDeploy: '6. GÜNEŞ PANELİ AÇILIMI',
        sciencePass: '7. BİLİM VERİSİ AKTARIMI',
      },
      stageDetails: {
        liftoff: 'Ana roket motorları %100 itkiyle ateşlendi. Fırlatma kulesi geçiliyor.',
        maxQ: 'Azami aerodinamik sürtünme ve basınç bölgesinden geçiliyor. Yapısal durum normal.',
        stageSep: 'Birinci kademe roket ayrılması doğrulandı. Vakum motoru ateşlendi.',
        transferCruise: 'Gezegenler arası Hohmann transfer yörüngesi. Derin uzay telemetrisi aktif.',
        orbitalBurn: 'Hedef periapsiste son yörüngeye giriş ateşlemesini icra edin.',
        solarDeploy: 'Güneş paneli kanatları açılıyor ve güneşe kilitleniyor.',
        sciencePass: 'Bilimsel aygıtlar verileri Dünya\'ya başarıyla aktarıyor.',
      },
      environmentalStatus: 'UÇUŞ ÖNCESİ ÇEVRESEL TEST YETERLİLİĞİ',
      vibrationTest: 'AKUSTİK TİTREŞİM MASASI TESTİ',
      tvacTest: 'TERMAL VAKUM (TVAC) ODASI',
      testPending: 'YETERLİLİK BEKLENİYOR',
      testPassed: 'YETERLİ (GEÇTİ)',
      testFailed: 'BAŞARISIZ (GERİLİM LİMİTİ AŞIMI)',
      insertionBurnTitle: 'HASSAS YÖRÜNGE GİRİŞ ATEŞLEMESİ (ZAMANLAMA HEDEFİ)',
      insertionBurnDesc: 'Dairesel yörüngeye kilitlenmek için ateşlemeyi ±%5 nominal pencere içerisinde icra edin. Erken veya geç ateşleme delta-v kaybına ve hiperbolik kaçışa yol açar.',
      executeBurnBtn: 'YÖRÜNGE GİRİŞ ATEŞLEMESİNİ İCRA ET',
      awaitingCommanderBurn: 'KOMUTANIN YÖRÜNGE ATEŞLEMESİ BEKLENİYOR...',
      targetWindowNotice: 'NOMİNAL ATEŞLEME ARALIĞI (±%5)',
      anomalyAlertTitle: 'ACİL DURUM TELEMETRİ ALARMI • KRİZ TESPİT EDİLDİ',
      anomalyUrgency: 'KRİTİK MÜDAHALE SÜRESİ',
      proceedToBurn: 'YÖRÜNGE ATEŞLEMESİNE GEÇ',
      proceedToDeploy: 'GÜNEŞ PANELİ AÇILIMINA DEVAM ET',
    },
    multiplayer: {
      title: 'Çok Oyunculu Görev Lobisi',
      sub: 'WebRTC Noktadan Noktaya 4 Kişilik Ortak Komuta Güvertesi',
      hostTitle: 'Görev Odası Oluştur (Sunucu)',
      hostDesc: 'Oda açın, çağrı kodunuzu seçin ve 6 haneli oda kodunu ekip arkadaşlarınızla paylaşın. Simülasyonu tarayıcınız yönetecektir.',
      callsign: 'Çağrı Kodunuz / Adınız',
      duty: 'Konsol Görevi Seçin',
      roomCode: 'Özel Oda Kodu (İsteğe Bağlı)',
      createBtn: 'ODA OLUŞTUR (KURUCU)',
      joinTitle: 'Ekip Arkadaşının Odasına Katıl',
      joinDesc: 'Kurucunuzun paylaştığı Oda Kodunu girin. Görev tasarımına anında senkronize olun ve gerçek zamanlı iş birliği yapın.',
      connectBtn: 'ODAYA BAĞLAN',
      code: 'KOD',
      readyBtn: 'FIRLATMA İÇİN HAZIR OL',
      readyGo: 'HAZIR (FIRLATMAYA UYGUN)',
      leaveBtn: 'Odadan Ayrıl',
      crewStations: 'MÜRETTEBAT KONSOLU',
      budgetVotes: 'BÜTÇE OYLAMALARI',
      takeStation: 'İstasyonu Al',
      voiceChat: 'TAKTIK HABERLEŞME',
      secureFreq: 'GÜVENLİ FREKANS',
      typeMsg: 'Taktik mesaj yazın...',
      noProposals: 'Henüz bileşen yükseltme teklifi yapılmadı. Ekip üyeleri kendi istasyonlarından teklif sunabilir.',
      budgetImpact: 'Bütçe Etkisi',
      approve: 'Onayla',
      reject: 'Reddet',
      establishing: 'KURULUYOR...',
      connecting: 'BAĞLANILIYOR...',
      callsignPlaceholder: 'Örn: Komutan Sarah',
      clientCallsignPlaceholder: 'Örn: Sistemci Alex',
      autoCodePlaceholder: 'Otomatik kod için boş bırakın',
      roomCodePlaceholder: 'Örn: APOLLO veya NASA26',
      hostRole: 'KURUCU (Simülasyon Yöneticisi)',
      clientRole: 'İSTEMCİ (Senkronize)',
      standby: 'BEKLEMEDE',
      consoleUncrewed: 'Konsol boş',
      by: 'GÖNDEREN',
      statusApproved: 'ONAYLANDI',
      statusRejected: 'REDDEDİLDİ',
      statusPending: 'BEKLİYOR',
      pings: {
        nominal: 'Sistem kontrolleri normal!',
        needPower: 'Daha fazla güç marjı gerekiyor!',
        goLaunch: 'Geri sayım için hazırız (GO).',
      },
    },
    canvas: {
      target: 'HEDEF',
      cam3d: 'KAM: ETKİLEŞİMLİ 3D',
      dragOrbit: 'DÖNDÜRMEK İÇİN SÜRÜKLEYİN',
      orbitView: 'YÖRÜNGE GÖRÜNÜMÜ',
      transferView: 'TRANSFER ROTASI (GÜNEŞ SİSTEMİ)',
      apoapsis: 'EN UZAK NOKTA (AP)',
      periapsis: 'EN YAKIN NOKTA (PE)',
      velocityVec: 'HIZ VEKTÖRÜ',
      trajectory: 'HOHMANN TRANSFER YOLU',
      sun: 'GÜNEŞ',
      earth: 'DÜNYA',
    },
  },
};
