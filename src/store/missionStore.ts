import { create } from 'zustand';
import {
  MissionState,
  MissionId,
  PlayerRole,
  FlightStage,
  TelemetryMetrics,
  BurnExecutionResult,
  BurnAccuracyRating,
  MissionAnomaly,
  EnvironmentalTestState,
} from '../types/mission';
import {
  PlayerInfo,
  ChatMessage,
  BudgetProposal,
  TechClearanceRequest,
  AsymmetricAnomalyState,
  AssistancePing,
  LaunchPoll,
} from '../types/multiplayer';
import { MISSION_SCENARIOS, ORBIT_PROFILES, LAUNCH_VEHICLES } from '../data/missions';
import { calculateMissionTelemetry } from '../utils/physics';
import { multiplayerService } from '../services/multiplayerService';
import { Locale } from '../i18n/translations';
import { getLocalizedAnomalies } from '../data/anomalies';

export const ADVANCED_TECH_COMPONENTS = [
  'prop-ion',
  'power-rtg',
  'bus-flagship',
  'ant-dish-hga',
  'ant-laser',
  'inst-radar-subsurface',
  'inst-mass-spec',
];

interface MissionStore {
  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Mission Configuration
  missionState: MissionState;
  telemetry: TelemetryMetrics;
  
  // Player & Console View
  mode: 'solo' | 'multiplayer';
  setMode: (mode: 'solo' | 'multiplayer') => void;
  activeRole: PlayerRole;
  isMultiplayer: boolean;
  roomCode: string;
  isHost: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  players: PlayerInfo[];
  myPlayerInfo: PlayerInfo;

  // View & Destination Lock
  destinations: MissionId[];
  setDestinations: (destinations: MissionId[]) => void;
  toggleCampaignDestination: (destId: MissionId) => void;
  removeCampaignDestination: (destId: MissionId) => void;
  currentView: 'landing' | 'bridge' | 'academy';
  isDestinationLocked: boolean;
  setCurrentView: (view: 'landing' | 'bridge' | 'academy') => void;
  openAcademy: () => void;
  closeAcademy: () => void;
  setIsDestinationLocked: (locked: boolean) => void;
  startMultiplayerMission: () => void;
  startSoloMission: () => void;
  abortToLanding: () => void;
  addSimulatedCoPilot: () => void;

  // Flight Simulation
  flightStage: FlightStage;
  countdownSeconds: number;
  simAltitudeKm: number;
  simVelocityMps: number;
  simDownlinkPercent: number;
  simScienceCollected: number;
  missionLog: string[];

  // Tactical Chat & Collaborative Proposals
  chatMessages: ChatMessage[];
  budgetProposals: BudgetProposal[];

  // Actions
  setScenario: (scenarioId: MissionId) => void;
  updateMissionState: (changes: Partial<MissionState>, syncToNetwork?: boolean) => void;
  toggleInstrument: (instrumentId: string) => void;
  setActiveRole: (role: PlayerRole) => void;

  // Multiplayer Actions
  createRoom: (roomCode: string, playerName: string, initialRole: PlayerRole, initialSecondaryRole?: PlayerRole) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string, initialRole: PlayerRole, initialSecondaryRole?: PlayerRole) => Promise<void>;
  leaveRoom: () => void;
  claimRole: (role: PlayerRole) => void;
  claimSecondaryRole: (role: PlayerRole | undefined) => void;
  optimizeWithAI: () => void;
  toggleReady: () => void;
  sendChatMessage: (text: string) => void;
  proposeBudgetChange: (description: string, costDeltaM: number, changes: Partial<MissionState>) => void;
  voteBudgetProposal: (proposalId: string, vote: 'approve' | 'reject') => void;

  // Simulation Controls
  startCountdown: () => void;
  setFlightStage: (stage: FlightStage) => void;
  updateSimTelemetry: (deltaAlt: number, deltaVel: number, deltaDownlink: number, deltaScience: number) => void;
  resetToDesign: () => void;
  addLogMessage: (msg: string) => void;

  // Active Orbital Timing Burn
  burnExecution: BurnExecutionResult | null;
  executeInsertionBurn: (cursorPercent: number) => BurnExecutionResult;

  // In-Flight Anomalies & Crisis Management
  activeAnomaly: MissionAnomaly | null;
  anomalyCountdown: number;
  anomalyVotes: Record<string, string>;
  triggerAnomaly: () => void;
  voteAnomalyChoice: (choiceId: string) => void;
  tallyAndResolveAnomaly: () => void;
  resolveAnomaly: (choiceId: string) => void;

  // Pre-Flight Environmental Test Lab (TVAC & Vibration)
  environmentalTests: EnvironmentalTestState;
  runVibrationTest: () => { passed: boolean; score: number };
  runTvacTest: () => { passed: boolean; score: number };

  // Viewport Overlays (CoM & Thermal)
  showCenterOfMass: boolean;
  toggleCenterOfMass: () => void;
  showThermalOverlay: boolean;
  toggleThermalOverlay: () => void;

  // Role-Locked Advanced Subsystems & Peer Clearances
  unlockedAdvancedComponents: string[];
  clearanceRequests: TechClearanceRequest[];
  requestTechClearance: (componentId: string, componentName: string, targetRole: PlayerRole) => void;
  respondTechClearance: (requestId: string, approve: boolean) => void;

  // Asymmetric Co-op "Keep Talking" Anomaly
  asymmetricAnomaly: AsymmetricAnomalyState | null;
  triggerAsymmetricAnomaly: () => void;
  submitAsymmetricInput: (input: string) => boolean;
  resolveAsymmetricAnomaly: (success: boolean) => void;

  // Teammate Assistance Pings
  activeAssistancePings: AssistancePing[];
  sendAssistancePing: (stationName: string) => void;
  dismissAssistancePing: (id: string) => void;

  // Cooperative Go-For-Launch Consensus
  launchPoll: LaunchPoll | null;
  isFlightModalOpen: boolean;
  setIsFlightModalOpen: (open: boolean) => void;
  requestLaunchConsensus: () => void;
  voteLaunchConsensus: (vote: 'go' | 'abort') => void;
  finalizeLaunch: () => void;
  dismissLaunchPoll: () => void;

  // Audio / Sound Settings
  audioEnabled: boolean;
  toggleAudio: () => void;
  audioVolume: number;
  setAudioVolume: (v: number) => void;
}

const initialMissionState: MissionState = {
  scenarioId: 'lunar-recon',
  orbitId: 'orbit-lunar-polar',
  launchVehicleId: 'rocket-falcon9',
  busId: 'bus-smallsat',
  propulsionId: 'prop-monoprop',
  powerId: 'power-deployable',
  batteryId: 'batt-standard',
  antennaId: 'ant-dish-hga',
  groundStationId: 'ground-dsn',
  selectedInstrumentIds: ['inst-camera-hires', 'inst-neutron-detector'],
};

const initialPlayer: PlayerInfo = {
  peerId: 'local-commander',
  name: 'Lead Commander',
  role: 'commander',
  isHost: true,
  isReady: false,
  color: '#54b9ff',
};

export const useMissionStore = create<MissionStore>((set, get) => {
  // Listen to peer network packets
  multiplayerService.onPacket((packet) => {
    const state = get();

    switch (packet.type) {
      case 'PLAYER_JOIN': {
        const existing = state.players.filter((p) => p.peerId !== packet.player.peerId);
        const updatedPlayers = [...existing, packet.player];
        set({ players: updatedPlayers });

        // If host, send full sync to everyone
        if (state.isHost) {
          const syncPacket = {
            type: 'ROOM_STATE_SYNC' as const,
            players: updatedPlayers,
            missionState: state.missionState,
            hostPeerId: state.myPlayerInfo.peerId,
            destinations: state.destinations,
          };
          multiplayerService.broadcastPacket(syncPacket);
          setTimeout(() => {
            multiplayerService.broadcastPacket(syncPacket);
          }, 350);
        }
        state.addLogMessage(`[MULTI] ${packet.player.name} odaya katıldı.`);
        break;
      }

      case 'PLAYER_LEAVE': {
        const updated = state.players.filter((p) => p.peerId !== packet.peerId);
        set({ players: updated });
        state.addLogMessage(`[MULTI] Crew member left the frequency.`);
        break;
      }

      case 'ROOM_STATE_SYNC': {
        const telemetry = calculateMissionTelemetry(packet.missionState, state.locale);
        const mySynced = packet.players.find(
          (p) => p.peerId === state.myPlayerInfo.peerId
        );
        set({
          players: packet.players,
          missionState: packet.missionState,
          telemetry,
          ...(mySynced ? { myPlayerInfo: { ...state.myPlayerInfo, ...mySynced } } : {}),
          ...(packet.destinations && packet.destinations.length > 0 ? { destinations: packet.destinations as MissionId[] } : {}),
        });
        break;
      }

      case 'MISSION_STATE_UPDATE': {
        const newMissionState = { ...state.missionState, ...packet.state };
        const telemetry = calculateMissionTelemetry(newMissionState, state.locale);
        set({ missionState: newMissionState, telemetry });
        state.addLogMessage(`[UPDATE] ${packet.updatedByRole.toUpperCase()} revised spacecraft configuration`);
        break;
      }

      case 'ROLE_CLAIM': {
        const updatedPlayers = state.players.map((p) =>
          p.peerId === packet.peerId
            ? { ...p, role: packet.role, secondaryRole: packet.secondaryRole, name: packet.name || p.name }
            : p
        );
        set({ players: updatedPlayers });

        if (state.isHost) {
          multiplayerService.broadcastPacket({
            type: 'ROOM_STATE_SYNC',
            players: updatedPlayers,
            missionState: state.missionState,
            hostPeerId: state.myPlayerInfo.peerId,
            destinations: state.destinations,
          });
        }
        break;
      }

      case 'READY_TOGGLE': {
        const updatedPlayers = state.players.map((p) =>
          p.peerId === packet.peerId ? { ...p, isReady: packet.isReady } : p
        );
        const isMyToggled = packet.peerId === state.myPlayerInfo.peerId;
        const myUpdated = isMyToggled
          ? { ...state.myPlayerInfo, isReady: packet.isReady }
          : state.myPlayerInfo;
        set({ players: updatedPlayers, myPlayerInfo: myUpdated });

        // If host, rebroadcast canonical room state sync
        if (state.isHost) {
          multiplayerService.broadcastPacket({
            type: 'ROOM_STATE_SYNC',
            players: updatedPlayers,
            missionState: state.missionState,
            hostPeerId: state.myPlayerInfo.peerId,
            destinations: state.destinations,
          });
        }
        break;
      }

      case 'CHAT_MSG': {
        set({ chatMessages: [...state.chatMessages, packet.message] });
        break;
      }

      case 'BUDGET_PROPOSAL': {
        set({ budgetProposals: [packet.proposal, ...state.budgetProposals] });
        state.addLogMessage(`[PROPOSAL] New engineering proposal by ${packet.proposal.proposedByName}`);
        break;
      }

      case 'BUDGET_VOTE': {
        const updatedProposals = state.budgetProposals.map((prop) => {
          if (prop.id !== packet.proposalId) return prop;
          const newVotes = { ...prop.votes, [packet.peerId]: packet.vote };
          const approveCount = Object.values(newVotes).filter((v) => v === 'approve').length;
          
          let newStatus = prop.status;
          if (approveCount >= 2) {
            newStatus = 'approved';
            // Apply changes
            if (state.isHost) {
              get().updateMissionState(prop.newState, true);
            }
          }
          return { ...prop, votes: newVotes, status: newStatus };
        });
        set({ budgetProposals: updatedProposals });
        break;
      }

      case 'LAUNCH_START': {
        get().startCountdown();
        break;
      }

      case 'LAUNCH_STAGE_UPDATE': {
        get().setFlightStage(packet.stage as FlightStage);
        break;
      }

      case 'RESET_TO_DESIGN': {
        get().resetToDesign();
        break;
      }

      case 'ENTER_MISSION': {
        const scenarioId = packet.scenarioId as MissionId;
        const d = (packet.destinations && packet.destinations.length > 0)
          ? (packet.destinations as MissionId[])
          : [scenarioId];
        set({
          mode: 'multiplayer',
          currentView: 'bridge',
          isDestinationLocked: true,
          destinations: d,
        });
        get().setScenario(scenarioId);
        get().addLogMessage(`[MISSION] Operations initiated by host. Campaign locked: ${d.join(' -> ').toUpperCase()}`);
        break;
      }

      case 'CAMPAIGN_QUEUE_UPDATE': {
        const d = packet.destinations as MissionId[];
        const primary = d[0] || state.missionState.scenarioId;
        set({
          destinations: d,
          missionState: {
            ...state.missionState,
            scenarioId: primary,
          },
        });
        const isTr = state.locale === 'tr';
        state.addLogMessage(
          isTr
            ? `[KAMPANYA] Görev rotası güncellendi: ${d.join(' ➔ ').toUpperCase()}`
            : `[CAMPAIGN] Flight plan updated: ${d.join(' -> ').toUpperCase()}`
        );
        break;
      }

      case 'ABORT_TO_HOME': {
        set({
          currentView: 'landing',
          isDestinationLocked: false,
        });
        get().addLogMessage(`[MISSION] Operations aborted by host. Returned to mission gateway.`);
        break;
      }

      case 'EXECUTE_INSERTION_BURN': {
        const result = packet.result;
        set({ burnExecution: result });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ATEŞLEME] Uçuş Komutanı yörüngeye giriş ateşlemesini tamamladı: ${result.rating.toUpperCase()}`
            : `[BURN] Flight Commander executed insertion burn: ${result.rating.toUpperCase()}`
        );
        break;
      }

      case 'ANOMALY_TRIGGERED': {
        set({
          activeAnomaly: packet.anomaly,
          anomalyCountdown: packet.anomaly.urgencySeconds,
          anomalyVotes: {},
        });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ACİL DURUM] Uçuş anomalisi tespit edildi: ${packet.anomaly.title}`
            : `[EMERGENCY] Flight anomaly detected: ${packet.anomaly.title}`
        );
        break;
      }

      case 'ANOMALY_VOTE': {
        const state = get();
        const newVotes = { ...state.anomalyVotes, [packet.peerId]: packet.choiceId };
        set({ anomalyVotes: newVotes });

        if (state.isHost && state.activeAnomaly) {
          const totalCrew = Math.max(1, state.players.length);
          if (Object.keys(newVotes).length >= totalCrew) {
            get().tallyAndResolveAnomaly();
          }
        }
        break;
      }

      case 'ANOMALY_RESOLVED': {
        const state = get();
        const anomaly = state.activeAnomaly;
        const choice = anomaly?.choices.find((c) => c.id === packet.choiceId);

        if (choice) {
          const updatedTelemetry: TelemetryMetrics = {
            ...state.telemetry,
            availableDeltaVMps: Math.max(0, state.telemetry.availableDeltaVMps - choice.deltaVCostMps),
            sciencePoints: Math.max(0, state.telemetry.sciencePoints + choice.scienceDelta),
            netPowerW: state.telemetry.netPowerW + choice.powerDeltaW,
            overallSuccessRate: Math.max(10, Math.min(100, state.telemetry.overallSuccessRate + choice.successRateDelta)),
          };
          set({
            activeAnomaly: null,
            anomalyVotes: {},
            telemetry: updatedTelemetry,
            simScienceCollected: Math.max(0, state.simScienceCollected + choice.scienceDelta),
          });
        } else {
          set({ activeAnomaly: null, anomalyVotes: {} });
        }

        const isTr = state.locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ANOMALİ ÇÖZÜLDÜ] ${packet.resolvedByName} (${packet.resolvedByRole.toUpperCase()}) mühendislik çözümünü uyguladı.`
            : `[ANOMALY RESOLVED] ${packet.resolvedByName} (${packet.resolvedByRole.toUpperCase()}) executed remediation.`
        );
        break;
      }

      case 'ENV_TEST_UPDATE': {
        const tests = { ...get().environmentalTests };
        if (packet.testType === 'vibration') {
          tests.vibrationTested = true;
          tests.vibrationPassed = packet.passed;
          tests.vibrationScore = packet.score;
        } else {
          tests.tvacTested = true;
          tests.tvacPassed = packet.passed;
          tests.tvacScore = packet.score;
        }
        set({ environmentalTests: tests });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[TEST LAB] Sistem Mühendisi ${packet.testType.toUpperCase()} testini tamamladı: ${packet.passed ? 'GEÇTİ (PASSED)' : 'BAŞARISIZ'}`
            : `[TEST LAB] Flight Engineer completed ${packet.testType.toUpperCase()} qualification: ${packet.passed ? 'PASSED' : 'FAILED'}`
        );
        break;
      }

      case 'TECH_CLEARANCE_REQUEST': {
        const existing = get().clearanceRequests.filter((r) => r.id !== packet.request.id);
        set({ clearanceRequests: [...existing, packet.request] });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[GÜVENLİK YETKİSİ] ${packet.request.requestedByName} (${packet.request.requestedByRole.toUpperCase()}) ${packet.request.componentName} için onay talep etti.`
            : `[TECH CLEARANCE] ${packet.request.requestedByName} (${packet.request.requestedByRole.toUpperCase()}) requested clearance for ${packet.request.componentName}.`
        );
        break;
      }

      case 'TECH_CLEARANCE_RESPONSE': {
        const updatedRequests = get().clearanceRequests.map((r) =>
          r.id === packet.requestId ? { ...r, status: packet.approved ? ('approved' as const) : ('rejected' as const) } : r
        );
        const unlocked = packet.approved
          ? Array.from(new Set([...get().unlockedAdvancedComponents, packet.componentId]))
          : get().unlockedAdvancedComponents;

        set({
          clearanceRequests: updatedRequests,
          unlockedAdvancedComponents: unlocked,
        });

        const isTr = get().locale === 'tr';
        get().addLogMessage(
          packet.approved
            ? (isTr
                ? `[YETKİ VERİLDİ] ${packet.authorizedByName} teknoloji kilidini açtı.`
                : `[CLEARANCE APPROVED] ${packet.authorizedByName} granted tech authorization.`)
            : (isTr
                ? `[YETKİ REDDEDİLDİ] ${packet.authorizedByName} talebi onaylamadı.`
                : `[CLEARANCE DENIED] ${packet.authorizedByName} denied tech authorization.`)
        );
        break;
      }

      case 'ASYMMETRIC_ANOMALY_INIT': {
        set({ asymmetricAnomaly: packet.anomaly });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ACİL DURUM] Çift taraflı mürettebat anomalisi tetiklendi! Teşhis ve müdahale konsolları ayrıldı.`
            : `[EMERGENCY] Asymmetric crew anomaly initiated! Diagnostic & resolution stations decoupled.`
        );
        break;
      }

      case 'ASYMMETRIC_ANOMALY_SOLVED': {
        set({ asymmetricAnomaly: null });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ANOMALİ ÇÖZÜLDÜ] Mürettebat koordinasyonuyla sistem yeniden başlatıldı! (${packet.solvedByName})`
            : `[ANOMALY NEUTRALIZED] System restored via crew coordination! (${packet.solvedByName})`
        );
        break;
      }

      case 'TEAMMATE_ASSISTANCE_PING': {
        const pings = [...get().activeAssistancePings, packet.ping];
        set({ activeAssistancePings: pings });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[YARDIM ÇAĞRISI] ${packet.ping.senderName} (${packet.ping.stationName}) istasyonunda destek istiyor!`
            : `[ASSISTANCE PING] ${packet.ping.senderName} requested help at ${packet.ping.stationName}!`
        );
        break;
      }

      case 'LAUNCH_POLL_INIT': {
        const myId = get().myPlayerInfo.peerId;
        const initialVotes = { ...packet.poll.votes };
        if (myId.startsWith('sim-copilot')) {
          initialVotes[myId] = 'go';
        }
        set({ launchPoll: { ...packet.poll, votes: initialVotes } });
        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[FIRLATMA] ${packet.poll.initiatedByName} fırlatma yetkilendirmesi talep etti. Tüm istasyonların GO onayı bekleniyor.`
            : `[LAUNCH] ${packet.poll.initiatedByName} requested Go-For-Launch. All crew stations must confirm GO.`
        );
        break;
      }

      case 'LAUNCH_POLL_VOTE': {
        const currentPoll = get().launchPoll;
        if (!currentPoll || currentPoll.id !== packet.pollId) break;

        const updatedVotes = {
          ...currentPoll.votes,
          [packet.peerId]: packet.vote,
        };

        const hasAbort = Object.values(updatedVotes).includes('abort');
        const allVotedGo = get().players.every((p) => updatedVotes[p.peerId] === 'go');

        let status = currentPoll.status;
        if (hasAbort) {
          status = 'aborted';
        } else if (allVotedGo) {
          status = 'approved';
        }

        set({
          launchPoll: {
            ...currentPoll,
            status,
            votes: updatedVotes,
          },
        });

        if (allVotedGo) {
          get().finalizeLaunch();
        } else if (hasAbort) {
          setTimeout(() => {
            set({ launchPoll: null });
          }, 1800);
        }
        break;
      }

      case 'LAUNCH_MODAL_SYNC': {
        set({
          isFlightModalOpen: packet.isOpen,
          currentView: packet.isOpen ? 'bridge' : get().currentView,
        });
        break;
      }
    }
  });

  return {
    locale: 'en',
    setLocale: (locale: Locale) => {
      const telemetry = calculateMissionTelemetry(get().missionState, locale);
      const isTr = locale === 'tr';
      set({
        locale,
        telemetry,
        missionLog: isTr
          ? [
              '[SİS] ByteCore Görev Kontrol Sistemi başlatıldı.',
              '[SİS] Telemetri hattı devrede. Tasarıma başlamak için hedef senaryoyu seçin.',
            ]
          : [
              '[SYS] ByteCore Mission Control System initialized.',
              '[SYS] telemetry link online. Select target mission scenario to begin design.',
            ],
        chatMessages: [
          {
            id: 'msg-0',
            senderName: 'NASA Capcom',
            senderRole: 'commander',
            text: isTr
              ? 'Tüm uçuş kontrolörleri devrede. Sistemleri doğrulayın ve yük takaslarını koordine edin.'
              : 'All flight controllers online. Verify systems and coordinate payload trade-offs.',
            timestamp: Date.now() - 30000,
            type: 'system',
          },
        ],
      });
    },

    missionState: initialMissionState,
    telemetry: calculateMissionTelemetry(initialMissionState),
    mode: 'solo',
    setMode: (mode: 'solo' | 'multiplayer') => set({ mode }),
    activeRole: 'commander',
    isMultiplayer: false,
    roomCode: '',
    isHost: false,
    isConnecting: false,
    connectionError: null,
    players: [initialPlayer],
    myPlayerInfo: initialPlayer,

    flightStage: 'design',
    countdownSeconds: 10,
    simAltitudeKm: 0,
    simVelocityMps: 0,
    simDownlinkPercent: 0,
    simScienceCollected: 0,
    missionLog: [
      '[SYS] ByteCore Mission Control System initialized.',
      '[SYS] telemetry link online. Select target mission scenario to begin design.',
    ],

    chatMessages: [
      {
        id: 'msg-0',
        senderName: 'NASA Capcom',
        senderRole: 'commander',
        text: 'All flight controllers online. Verify systems and coordinate payload trade-offs.',
        timestamp: Date.now() - 30000,
        type: 'system',
      },
    ],
    budgetProposals: [],

    setScenario: (scenarioId: MissionId) => {
      const scenario = MISSION_SCENARIOS.find((s) => s.id === scenarioId);
      const recommendedOrbit = scenario?.recommendedOrbit || ORBIT_PROFILES[0].id;

      get().updateMissionState({
        scenarioId,
        orbitId: recommendedOrbit,
      });

      const isTr = get().locale === 'tr';
      get().addLogMessage(
        isTr
          ? `[KOMUTA] Görev senaryosu seçildi: ${scenario?.name}`
          : `[COMMAND] Mission scenario set to: ${scenario?.name}`
      );
    },

    updateMissionState: (changes: Partial<MissionState>, syncToNetwork = true) => {
      let stateMerged: MissionState = { ...get().missionState, ...changes };
      const currentPlayers = get().players;
      const simulatedCoPilots = currentPlayers.filter((p) => p.peerId.startsWith('sim-copilot'));

      if (simulatedCoPilots.length > 0) {
        const simRoles = new Set<PlayerRole>();
        simulatedCoPilots.forEach((p) => {
          simRoles.add(p.role);
          if (p.secondaryRole) simRoles.add(p.secondaryRole);
        });

        const scenario = MISSION_SCENARIOS.find((s) => s.id === stateMerged.scenarioId) || MISSION_SCENARIOS[0];
        const orbit = ORBIT_PROFILES.find((o) => o.id === stateMerged.orbitId) || ORBIT_PROFILES[0];
        const isTr = get().locale === 'tr';
        const coPilotChanges: Partial<MissionState> = {};
        const coPilotLogs: string[] = [];

        // 1. Engineer Co-Pilot: Rebalances Propulsion, Power & Battery for Delta-V and positive energy
        if (simRoles.has('engineer')) {
          const testTel = calculateMissionTelemetry(stateMerged, get().locale);
          if (!testTel.deltaVSufficient || testTel.deltaVMarginPercent < 5) {
            const neededDeltaV = orbit.deltaVRequiredMps || scenario.requiredDeltaV;
            let targetProp = stateMerged.propulsionId;
            if (neededDeltaV > 5000) {
              targetProp = 'prop-ion';
            } else if (neededDeltaV > 2500) {
              targetProp = 'prop-biprop';
            } else if (neededDeltaV > 800) {
              targetProp = 'prop-biprop';
            } else {
              targetProp = 'prop-monoprop';
            }
            if (targetProp !== stateMerged.propulsionId) {
              coPilotChanges.propulsionId = targetProp;
            }
          }

          const powerCheckState = { ...stateMerged, ...coPilotChanges };
          const pwrTel = calculateMissionTelemetry(powerCheckState, get().locale);
          if (!pwrTel.powerPositive || pwrTel.netPowerW < 10) {
            let targetPower = stateMerged.powerId;
            if (scenario.solarIntensity < 0.2 || orbit.id.includes('europa') || scenario.id === 'europa-explorer') {
              targetPower = 'power-rtg';
            } else if (scenario.solarIntensity < 0.6) {
              targetPower = 'power-gallium';
            } else {
              targetPower = 'power-deployable';
            }
            if (targetPower !== stateMerged.powerId) {
              coPilotChanges.powerId = targetPower;
            }
            if (stateMerged.batteryId === 'batt-standard') {
              coPilotChanges.batteryId = 'batt-advanced';
            }
          }

          if (coPilotChanges.propulsionId || coPilotChanges.powerId || coPilotChanges.batteryId) {
            coPilotLogs.push(
              isTr
                ? `[CO-PİLOT MÜHENDİS] İtki motorunu ve güç hattını Delta-V gereksinimine (${orbit.deltaVRequiredMps.toLocaleString()} m/s) göre optimize etti.`
                : `[CO-PILOT ENGINEER] Re-balanced propulsion and power bus to meet Delta-V envelope (${orbit.deltaVRequiredMps.toLocaleString()} m/s).`
            );
          }
        }

        // 2. Commander Co-Pilot: Manages Launch Vehicle payload mass compatibility
        if (simRoles.has('commander')) {
          const rocketCheckState = { ...stateMerged, ...coPilotChanges };
          const rocketTel = calculateMissionTelemetry(rocketCheckState, get().locale);
          if (!rocketTel.launchCompatibility) {
            const suitableRocket = LAUNCH_VEHICLES.find((v) => v.maxPayloadKg >= rocketTel.totalMassKg) || LAUNCH_VEHICLES[LAUNCH_VEHICLES.length - 1];
            if (suitableRocket && suitableRocket.id !== stateMerged.launchVehicleId) {
              coPilotChanges.launchVehicleId = suitableRocket.id;
              coPilotLogs.push(
                isTr
                  ? `[CO-PİLOT KOMUTAN] Fırlatma roketini kütle sınırını karşılamak için ${suitableRocket.name} olarak güncelledi.`
                  : `[CO-PILOT COMMANDER] Upgraded launch vehicle to ${suitableRocket.name} for payload mass margin.`
              );
            }
          }
        }

        // 3. Comms Co-Pilot: Manages High-Gain Antenna & Ground Station
        if (simRoles.has('comms')) {
          if (scenario.commDistanceAU > 0.05) {
            if (stateMerged.antennaId !== 'ant-dish-hga' && stateMerged.antennaId !== 'ant-laser') {
              coPilotChanges.antennaId = 'ant-dish-hga';
            }
            if (stateMerged.groundStationId !== 'ground-dsn') {
              coPilotChanges.groundStationId = 'ground-dsn';
            }
            if (coPilotChanges.antennaId || coPilotChanges.groundStationId) {
              coPilotLogs.push(
                isTr
                  ? `[CO-PİLOT HABERLEŞME] Derin uzay sinyal bağlantısını DSN yüksek kazançlı çanak antene kilitledi.`
                  : `[CO-PILOT COMMS] Locked deep-space downlink to High-Gain DSN antenna.`
              );
            }
          }
        }

        // 4. Scientist Co-Pilot: Manages Scientific Instruments for threshold
        if (simRoles.has('scientist')) {
          const sciCheckState = { ...stateMerged, ...coPilotChanges };
          const sciTel = calculateMissionTelemetry(sciCheckState, get().locale);
          if (sciTel.sciencePoints < scenario.minScienceThreshold) {
            const required = scenario.id === 'europa-explorer'
              ? ['inst-radar-sounder', 'inst-magnetometer', 'inst-spectrometer-vis']
              : scenario.id === 'mars-sample'
              ? ['inst-camera-hires', 'inst-spectrometer-vis', 'inst-neutron-detector']
              : scenario.id === 'asteroid-scout'
              ? ['inst-camera-hires', 'inst-spectrometer-vis', 'inst-laser-altimeter']
              : ['inst-camera-hires', 'inst-spectrometer-vis', 'inst-neutron-detector'];

            const newInstruments = Array.from(new Set([...stateMerged.selectedInstrumentIds, ...required]));
            coPilotChanges.selectedInstrumentIds = newInstruments;
            coPilotLogs.push(
              isTr
                ? `[CO-PİLOT BİLİM] Görev hedefini karşılamak için bilimsel enstrüman paketini genişletti.`
                : `[CO-PILOT SCIENTIST] Augmented science suite to meet minimum mission payload threshold.`
            );
          }
        }

        if (Object.keys(coPilotChanges).length > 0) {
          stateMerged = { ...stateMerged, ...coPilotChanges };
          coPilotLogs.forEach((log) => get().addLogMessage(log));
        }
      }

      const telemetry = calculateMissionTelemetry(stateMerged, get().locale);

      set({
        missionState: stateMerged,
        telemetry,
      });

      if (syncToNetwork && get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'MISSION_STATE_UPDATE',
          state: stateMerged,
          updatedByRole: get().activeRole,
        });

        if (get().isHost) {
          multiplayerService.broadcastPacket({
            type: 'ROOM_STATE_SYNC',
            players: get().players,
            missionState: stateMerged,
            hostPeerId: get().myPlayerInfo.peerId,
            destinations: get().destinations,
          });
        }
      }
    },

    toggleInstrument: (instrumentId: string) => {
      const { selectedInstrumentIds } = get().missionState;
      let updated: string[];

      if (selectedInstrumentIds.includes(instrumentId)) {
        updated = selectedInstrumentIds.filter((id) => id !== instrumentId);
      } else {
        updated = [...selectedInstrumentIds, instrumentId];
      }

      get().updateMissionState({ selectedInstrumentIds: updated });
    },

    setActiveRole: (role: PlayerRole) => {
      set({ activeRole: role });
      if (get().isMultiplayer) {
        get().claimRole(role);
      }
    },

    createRoom: async (roomCode: string, playerName: string, initialRole: PlayerRole, initialSecondaryRole?: PlayerRole) => {
      set({ isConnecting: true, connectionError: null });
      try {
        const cleanCode = multiplayerService.normalizeRoomCode(roomCode);
        const hostPeerId = `bytecore-mission-${cleanCode}-host`;
        const hostPlayer: PlayerInfo = {
          peerId: hostPeerId,
          name: playerName.trim() || 'Flight Director',
          role: initialRole,
          secondaryRole: initialSecondaryRole,
          isHost: true,
          isReady: true,
          color: '#54b9ff',
        };

        set({
          myPlayerInfo: hostPlayer,
          roomCode: cleanCode,
        });

        await multiplayerService.createRoom(cleanCode, hostPlayer);

        set({
          mode: 'multiplayer',
          isMultiplayer: true,
          isHost: true,
          roomCode: cleanCode,
          isConnecting: false,
          myPlayerInfo: hostPlayer,
          players: [hostPlayer],
          activeRole: initialRole,
        });

        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ÇOKLU] ${cleanCode} odası oluşturuldu. Oda kodunu ekip arkadaşlarınızla paylaşın!`
            : `[MULTI] Room ${cleanCode} created. Share room code with teammates!`
        );
      } catch (err: any) {
        set({
          isConnecting: false,
          connectionError: err?.message || (get().locale === 'tr' ? 'Sinyal ağında oda oluşturulamadı.' : 'Failed to establish peer room on signaling network.'),
        });
      }
    },

    joinRoom: async (roomCode: string, playerName: string, initialRole: PlayerRole, initialSecondaryRole?: PlayerRole) => {
      set({ isConnecting: true, connectionError: null });
      try {
        const cleanCode = multiplayerService.normalizeRoomCode(roomCode);
        const clientId = `bytecore-mission-${cleanCode}-client-${Math.random().toString(36).substring(2, 7)}`;
        const clientPlayer: PlayerInfo = {
          peerId: clientId,
          name: playerName.trim() || 'Controller',
          role: initialRole,
          secondaryRole: initialSecondaryRole,
          isHost: false,
          isReady: false,
          color: '#4bf3c8',
        };

        set({
          myPlayerInfo: clientPlayer,
          roomCode: cleanCode,
        });

        await multiplayerService.joinRoom(cleanCode, clientPlayer);

        set({
          mode: 'multiplayer',
          isMultiplayer: true,
          isHost: false,
          roomCode: cleanCode,
          isConnecting: false,
          myPlayerInfo: clientPlayer,
          activeRole: initialRole,
        });

        const isTr = get().locale === 'tr';
        get().addLogMessage(
          isTr
            ? `[ÇOKLU] ${cleanCode} odasına ${initialRole.toUpperCase()} olarak bağlanıldı.`
            : `[MULTI] Connected to Room ${cleanCode} as ${initialRole.toUpperCase()}.`
        );
      } catch (err: any) {
        set({
          isConnecting: false,
          connectionError: err?.message || (get().locale === 'tr' ? 'Odaya bağlanılamadı. Kurucunun çevrimiçi olduğundan ve kodun doğruluğundan emin olun.' : 'Failed to join room. Verify host is online and room code is correct.'),
        });
      }
    },

    leaveRoom: () => {
      const state = get();
      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'PLAYER_LEAVE',
          peerId: state.myPlayerInfo.peerId,
        });
      }
      multiplayerService.disconnect();
      set({
        mode: 'solo',
        isMultiplayer: false,
        isHost: false,
        roomCode: '',
        players: [initialPlayer],
        myPlayerInfo: initialPlayer,
        currentView: 'landing',
        isDestinationLocked: false,
        launchPoll: null,
      });
      const isTr = state.locale === 'tr';
      get().addLogMessage(
        isTr
          ? `[ÇOK OYUNCULU] Odadan çıkış yapıldı. Tekli moda dönüldü.`
          : `[MULTI] Disconnected from room. Solo mode active.`
      );
    },

    claimRole: (role: PlayerRole) => {
      const { myPlayerInfo, players, isHost } = get();
      // If claimed role was previously secondary role, clear secondary role
      const secondaryRole = myPlayerInfo.secondaryRole === role ? undefined : myPlayerInfo.secondaryRole;
      const updatedPlayer: PlayerInfo = { ...myPlayerInfo, role, secondaryRole };
      const updatedPlayers = players.map((p) =>
        p.peerId === myPlayerInfo.peerId ? updatedPlayer : p
      );

      set({
        myPlayerInfo: updatedPlayer,
        players: updatedPlayers,
        activeRole: role,
      });

      if (get().isMultiplayer) {
        if (isHost) {
          multiplayerService.broadcastPacket({
            type: 'ROOM_STATE_SYNC',
            players: updatedPlayers,
            missionState: get().missionState,
            hostPeerId: myPlayerInfo.peerId,
            destinations: get().destinations,
          });
        } else {
          multiplayerService.sendPacket({
            type: 'ROLE_CLAIM',
            peerId: myPlayerInfo.peerId,
            role,
            secondaryRole,
            name: myPlayerInfo.name,
          });
        }
      }
    },

    claimSecondaryRole: (role: PlayerRole | undefined) => {
      const { myPlayerInfo, players, isHost } = get();
      // Cannot set primary role as secondary role
      if (role && role === myPlayerInfo.role) return;
      const updatedPlayer: PlayerInfo = { ...myPlayerInfo, secondaryRole: role };
      const updatedPlayers = players.map((p) =>
        p.peerId === myPlayerInfo.peerId ? updatedPlayer : p
      );

      set({
        myPlayerInfo: updatedPlayer,
        players: updatedPlayers,
      });

      if (get().isMultiplayer) {
        if (isHost) {
          multiplayerService.broadcastPacket({
            type: 'ROOM_STATE_SYNC',
            players: updatedPlayers,
            missionState: get().missionState,
            hostPeerId: myPlayerInfo.peerId,
            destinations: get().destinations,
          });
        } else {
          multiplayerService.sendPacket({
            type: 'ROLE_CLAIM',
            peerId: myPlayerInfo.peerId,
            role: myPlayerInfo.role,
            secondaryRole: role,
            name: myPlayerInfo.name,
          });
        }
      }
    },

    toggleReady: () => {
      const { myPlayerInfo, players, isHost } = get();
      const newReady = !myPlayerInfo.isReady;
      const updatedPlayer = { ...myPlayerInfo, isReady: newReady };
      const updatedPlayers = players.map((p) =>
        p.peerId === myPlayerInfo.peerId || p.name === myPlayerInfo.name ? updatedPlayer : p
      );

      set({
        myPlayerInfo: updatedPlayer,
        players: updatedPlayers,
      });

      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'READY_TOGGLE',
          peerId: myPlayerInfo.peerId,
          isReady: newReady,
        });

        if (isHost) {
          multiplayerService.broadcastPacket({
            type: 'ROOM_STATE_SYNC',
            players: updatedPlayers,
            missionState: get().missionState,
            hostPeerId: myPlayerInfo.peerId,
            destinations: get().destinations,
          });
        }
      }
    },

    sendChatMessage: (text: string) => {
      if (!text.trim()) return;
      const msg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        senderName: get().myPlayerInfo.name,
        senderRole: get().activeRole,
        text: text.trim(),
        timestamp: Date.now(),
        type: 'chat',
      };

      set({ chatMessages: [...get().chatMessages, msg] });

      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'CHAT_MSG',
          message: msg,
        });
      }
    },

    proposeBudgetChange: (description: string, costDeltaM: number, changes: Partial<MissionState>) => {
      const proposal: BudgetProposal = {
        id: `prop-${Date.now()}`,
        proposedByRole: get().activeRole,
        proposedByName: get().myPlayerInfo.name,
        changeDescription: description,
        costDeltaM,
        newState: changes,
        votes: { [get().myPlayerInfo.peerId]: 'approve' },
        status: 'pending',
      };

      set({ budgetProposals: [proposal, ...get().budgetProposals] });

      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'BUDGET_PROPOSAL',
          proposal,
        });
      }
    },

    voteBudgetProposal: (proposalId: string, vote: 'approve' | 'reject') => {
      const { budgetProposals, myPlayerInfo, isHost } = get();
      const updated = budgetProposals.map((prop) => {
        if (prop.id !== proposalId) return prop;
        const newVotes = { ...prop.votes, [myPlayerInfo.peerId]: vote };
        const approveCount = Object.values(newVotes).filter((v) => v === 'approve').length;
        
        let newStatus = prop.status;
        if (approveCount >= 2) {
          newStatus = 'approved';
          if (isHost) {
            get().updateMissionState(prop.newState, true);
          }
        } else if (Object.values(newVotes).filter((v) => v === 'reject').length >= 2) {
          newStatus = 'rejected';
        }
        return { ...prop, votes: newVotes, status: newStatus };
      });

      set({ budgetProposals: updated });

      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'BUDGET_VOTE',
          proposalId,
          peerId: myPlayerInfo.peerId,
          vote,
        });
      }
    },

    startCountdown: () => {
      set({
        flightStage: 'countdown',
        countdownSeconds: 10,
        simAltitudeKm: 0,
        simVelocityMps: 0,
        simDownlinkPercent: 0,
        simScienceCollected: 0,
      });

      if (get().isMultiplayer && get().isHost) {
        multiplayerService.sendPacket({
          type: 'LAUNCH_START',
        });
      }

      get().addLogMessage('[LAUNCH] Terminal countdown started: T-minus 10 seconds.');
    },

    setFlightStage: (stage: FlightStage) => {
      set({ flightStage: stage });
      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'LAUNCH_STAGE_UPDATE',
          stage,
          timestamp: Date.now(),
        });
      }
    },

    updateSimTelemetry: (deltaAlt: number, deltaVel: number, deltaDownlink: number, deltaScience: number) => {
      set((s) => ({
        simAltitudeKm: Math.max(0, s.simAltitudeKm + deltaAlt),
        simVelocityMps: Math.max(0, s.simVelocityMps + deltaVel),
        simDownlinkPercent: Math.min(100, Math.max(0, s.simDownlinkPercent + deltaDownlink)),
        simScienceCollected: Math.max(0, s.simScienceCollected + deltaScience),
      }));
    },

    resetToDesign: () => {
      set({
        flightStage: 'design',
        countdownSeconds: 10,
        simAltitudeKm: 0,
        simVelocityMps: 0,
        simDownlinkPercent: 0,
        simScienceCollected: 0,
        burnExecution: null,
        activeAnomaly: null,
        anomalyVotes: {},
        asymmetricAnomaly: null,
        activeAssistancePings: [],
      });

      if (get().isMultiplayer && get().isHost) {
        multiplayerService.sendPacket({
          type: 'RESET_TO_DESIGN',
        });
      }

      get().addLogMessage('[SYSTEM] Simulation reset. Returned to Mission Architect console.');
    },

    addLogMessage: (msg: string) => {
      const timestamp = new Date().toLocaleTimeString();
      set((s) => ({
        missionLog: [`[${timestamp}] ${msg}`, ...s.missionLog.slice(0, 49)],
      }));
    },

    // Navigation & Destination Lock
    destinations: ['lunar-recon'] as MissionId[],
    setDestinations: (destinations: MissionId[]) => {
      const primary = destinations[0] || get().missionState.scenarioId;
      set({ destinations });
      get().setScenario(primary);
      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'CAMPAIGN_QUEUE_UPDATE',
          destinations,
        });
      }
    },
    removeCampaignDestination: (destId: MissionId) => {
      const current = get().destinations;
      const next = current.filter((id) => id !== destId);
      set({ destinations: next });
      if (next.length > 0) {
        get().setScenario(next[0]);
      }
      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'CAMPAIGN_QUEUE_UPDATE',
          destinations: next,
        });
      }
    },
    toggleCampaignDestination: (destId: MissionId) => {
      const current = get().destinations;
      let next: MissionId[];
      if (current.includes(destId)) {
        next = current.filter((id) => id !== destId);
      } else {
        // Enforce maximum 2 missions as requested:
        // "2 tane görev seçebilmek olsun seçince diğeri silinmesin çarpıya basarak silebilsin"
        if (current.length >= 2) {
          return;
        }
        next = [...current, destId];
      }
      set({ destinations: next });
      if (next.length > 0) {
        get().setScenario(next[0]);
      }
      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'CAMPAIGN_QUEUE_UPDATE',
          destinations: next,
        });
      }
    },
    currentView: 'landing',
    isDestinationLocked: false,
    setCurrentView: (view: 'landing' | 'bridge' | 'academy') => set({ currentView: view }),
    openAcademy: () => set({ currentView: 'academy' }),
    closeAcademy: () => set({ currentView: 'landing' }),
    setIsDestinationLocked: (locked: boolean) => set({ isDestinationLocked: locked }),

    startMultiplayerMission: () => {
      const { players, isHost, missionState, destinations } = get();
      // Hard constraint: The "Start Mission" button must remain LOCKED / DISABLED until at least 2 players are present in the lobby.
      if (players.length < 2) return;
      const activeDestinations = destinations.length > 0 ? destinations : [missionState.scenarioId];
      set({
        mode: 'multiplayer',
        isMultiplayer: true,
        currentView: 'bridge',
        isDestinationLocked: true,
        destinations: activeDestinations,
      });
      if (isHost) {
        multiplayerService.broadcastPacket({
          type: 'ENTER_MISSION',
          scenarioId: activeDestinations[0],
          destinations: activeDestinations,
        });
      }
      get().addLogMessage(`[MISSION] Operations underway. Campaign locked: ${activeDestinations.join(' -> ').toUpperCase()}`);
    },

    startSoloMission: () => {
      const { missionState, destinations } = get();
      const activeDestinations = destinations.length > 0 ? destinations : [missionState.scenarioId];
      set({
        mode: 'solo',
        isMultiplayer: false,
        currentView: 'bridge',
        isDestinationLocked: true,
        destinations: activeDestinations,
      });
      get().addLogMessage(`[MISSION] Solo Flight Commander operations initiated for ${activeDestinations.join(' -> ').toUpperCase()}`);
    },

    abortToLanding: () => {
      const { isHost } = get();
      set({ currentView: 'landing' });
      if (isHost) {
        multiplayerService.broadcastPacket({
          type: 'ABORT_TO_HOME',
        });
      }
      get().addLogMessage('[MISSION] Mission aborted. Returned to gateway floor.');
    },

    addSimulatedCoPilot: () => {
      const state = get();
      if (state.players.length >= 4) return;
      const roles: PlayerRole[] = ['engineer', 'scientist', 'comms', 'commander'];
      const availableRole = roles.find(
        (r) => !state.players.some((p) => p.role === r || p.secondaryRole === r)
      ) || 'engineer';

      const simulatedPlayer: PlayerInfo = {
        peerId: `sim-copilot-${Date.now().toString(36)}`,
        name: `Co-Pilot (${availableRole === 'engineer' ? 'Mühendis' : availableRole === 'scientist' ? 'Bilim' : availableRole === 'comms' ? 'Haberleşme' : 'Komutan'})`,
        role: availableRole,
        isHost: false,
        isReady: true,
        color: '#4bf3c8',
      };

      // Perform autonomous role-based subsystem modifications
      let subStateChanges: Partial<MissionState> = {};
      const scenario = MISSION_SCENARIOS.find((s) => s.id === state.missionState.scenarioId) || MISSION_SCENARIOS[0];

      if (availableRole === 'engineer') {
        subStateChanges = {
          propulsionId: scenario.requiredDeltaV > 5000 ? 'prop-ion' : 'prop-biprop',
          powerId: scenario.solarIntensity < 0.1 ? 'power-rtg' : 'power-deployable',
          batteryId: 'batt-advanced',
        };
      } else if (availableRole === 'scientist') {
        subStateChanges = {
          selectedInstrumentIds: ['inst-camera-hires', 'inst-neutron-detector', 'inst-spectrometer-vis'],
        };
      } else if (availableRole === 'comms') {
        subStateChanges = {
          antennaId: 'ant-dish-hga',
          groundStationId: 'ground-dsn',
        };
      } else if (availableRole === 'commander') {
        subStateChanges = {
          launchVehicleId: 'rocket-falcon9',
          busId: 'bus-smallsat',
          orbitId: scenario.recommendedOrbit || 'orbit-lunar-polar',
        };
      }

      const nextMissionState: MissionState = { ...state.missionState, ...subStateChanges };
      const telemetry = calculateMissionTelemetry(nextMissionState, state.locale);

      const updatedPlayers = [...state.players, simulatedPlayer];
      set({
        players: updatedPlayers,
        missionState: nextMissionState,
        telemetry,
      });

      if (state.isHost) {
        multiplayerService.broadcastPacket({
          type: 'ROOM_STATE_SYNC',
          players: updatedPlayers,
          missionState: nextMissionState,
          hostPeerId: state.myPlayerInfo.peerId,
          destinations: state.destinations,
        });
      } else {
        multiplayerService.sendPacket({
          type: 'MISSION_STATE_UPDATE',
          state: subStateChanges,
          updatedByRole: availableRole,
        });
      }

      const isTr = state.locale === 'tr';
      state.addLogMessage(
        isTr
          ? `[CO-PILOT] ${simulatedPlayer.name} göreve katıldı ve ${availableRole.toUpperCase()} alt sistemlerini optimize etti.`
          : `[CO-PILOT] ${simulatedPlayer.name} joined duty and optimized ${availableRole.toUpperCase()} subsystems.`
      );
    },

    optimizeWithAI: () => {
      const state = get();
      const scenario = MISSION_SCENARIOS.find((s) => s.id === state.missionState.scenarioId) || MISSION_SCENARIOS[0];
      const isTr = state.locale === 'tr';

      let optimizedState: Partial<MissionState> = {};

      if (scenario.id === 'europa-explorer') {
        optimizedState = {
          orbitId: scenario.recommendedOrbit || 'orbit-europa-science',
          launchVehicleId: 'rocket-sls',
          busId: 'bus-flagship',
          propulsionId: 'prop-ion',
          powerId: 'power-rtg',
          batteryId: 'batt-advanced',
          antennaId: 'ant-dish-hga',
          groundStationId: 'ground-dsn',
          selectedInstrumentIds: ['inst-radar-sounder', 'inst-magnetometer', 'inst-spectrometer-vis'],
        };
      } else if (scenario.id === 'mars-sample') {
        optimizedState = {
          orbitId: scenario.recommendedOrbit || 'orbit-mars-polar',
          launchVehicleId: 'rocket-falcon-heavy',
          busId: 'bus-medium',
          propulsionId: 'prop-biprop',
          powerId: 'power-gallium',
          batteryId: 'batt-advanced',
          antennaId: 'ant-dish-hga',
          groundStationId: 'ground-dsn',
          selectedInstrumentIds: ['inst-camera-hires', 'inst-spectrometer-vis', 'inst-neutron-detector'],
        };
      } else if (scenario.id === 'asteroid-scout') {
        optimizedState = {
          orbitId: scenario.recommendedOrbit || 'orbit-asteroid-rendezvous',
          launchVehicleId: 'rocket-falcon9',
          busId: 'bus-smallsat',
          propulsionId: 'prop-biprop',
          powerId: 'power-deployable',
          batteryId: 'batt-advanced',
          antennaId: 'ant-dish-hga',
          groundStationId: 'ground-dsn',
          selectedInstrumentIds: ['inst-camera-hires', 'inst-lidar', 'inst-spectrometer-vis'],
        };
      } else {
        // Lunar Recon & default
        optimizedState = {
          orbitId: scenario.recommendedOrbit || 'orbit-lunar-polar',
          launchVehicleId: 'rocket-falcon9',
          busId: 'bus-smallsat',
          propulsionId: 'prop-biprop',
          powerId: 'power-deployable',
          batteryId: 'batt-standard',
          antennaId: 'ant-dish-hga',
          groundStationId: 'ground-dsn',
          selectedInstrumentIds: ['inst-camera-hires', 'inst-neutron-detector', 'inst-spectrometer-vis'],
        };
      }

      const nextState: MissionState = {
        ...state.missionState,
        ...optimizedState,
      };

      const telemetry = calculateMissionTelemetry(nextState, state.locale);

      set({
        missionState: nextState,
        telemetry,
      });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'MISSION_STATE_UPDATE',
          state: optimizedState,
          updatedByRole: state.activeRole,
        });
      }

      state.addLogMessage(
        isTr
          ? `[YAPAY ZEKA] Otonom Uçuş Asistanı tüm sistemleri optimize etti: Delta-V, Güç ve Bilim hedefleri sağlandı.`
          : `[AI] Autonomous Flight Assistant optimized all systems: Delta-V, Power, and Science thresholds satisfied.`
      );
    },

    // -----------------------------------------------------------------------
    // MODULE 1: ACTIVE ORBITAL TIMING BURN
    // -----------------------------------------------------------------------
    burnExecution: null,

    executeInsertionBurn: (cursorPercent: number) => {
      const state = get();
      const isTr = state.locale === 'tr';
      const offset = cursorPercent - 50;
      const absOffset = Math.abs(offset);

      let rating: BurnAccuracyRating = 'nominal';
      let deltaVPenaltyMps = 0;
      let message = '';

      if (absOffset <= 4) {
        rating = 'perfect';
        deltaVPenaltyMps = 0;
        message = isTr
          ? 'MÜKEMMEL YÖRÜNGE GİRİŞ ATEŞLEMESİ! Sıfır yakıt kaybı ile hedef yörüngeye kilitlenildi.'
          : 'PERFECT INJECTION BURN! Orbital trajectory locked with zero delta-v penalty.';
      } else if (absOffset <= 9) {
        rating = 'nominal';
        deltaVPenaltyMps = 75;
        message = isTr
          ? 'NOMİNAL YÖRÜNGE GİRİŞİ. Küçük yön düzeltme ateşi icra edildi (-75 m/s Δv).'
          : 'NOMINAL ORBIT INSERTION. Minor trajectory trim burn executed (-75 m/s Δv).';
      } else if (cursorPercent < 41) {
        rating = 'early';
        deltaVPenaltyMps = 280;
        message = isTr
          ? 'ERKEN ATEŞLEME! Apoapsis öncesi ateşleme; yörünge düşüşünü önlemek için fazla yakıt harcandı (-280 m/s Δv).'
          : 'PREMATURE BURN! Fired before apoapsis; heavy propellant penalty to prevent orbital decay (-280 m/s Δv).';
      } else if (cursorPercent > 59 && cursorPercent <= 76) {
        rating = 'late';
        deltaVPenaltyMps = 420;
        message = isTr
          ? 'GEÇ ATEŞLEME! Pericenter aşımı; stabil yörünge için kritik itki rezervi harcandı (-420 m/s Δv).'
          : 'LATE INSERTION BURN! High pericenter overshoot; critical propellant reserves expended (-420 m/s Δv).';
      } else {
        rating = 'critical-overshoot';
        deltaVPenaltyMps = 850;
        message = isTr
          ? 'HİPERBOLİK KAÇIŞ RİSKİ! Yörünge daireselleştirilemedi; kaçış vektörü uyarısı (-850 m/s Δv).'
          : 'HYPERBOLIC ESCAPE RISK! Failed circularization; severe flyby trajectory deviation (-850 m/s Δv).';
      }

      const currentRemaining = Math.max(0, state.telemetry.availableDeltaVMps - deltaVPenaltyMps);
      const fuelPct = Math.max(0, Math.min(100, Math.round((currentRemaining / Math.max(1, state.telemetry.availableDeltaVMps)) * 100)));
      const scenarios = MISSION_SCENARIOS;
      const orbits = ORBIT_PROFILES;
      const currentScenario = scenarios.find((s) => s.id === state.missionState.scenarioId) || scenarios[0];
      const currentOrbit = orbits.find((o) => o.id === state.missionState.orbitId) || orbits[0];

      const achievedAlt =
        rating === 'perfect'
          ? currentOrbit.altitudeKm
          : rating === 'nominal'
          ? Math.round(currentOrbit.altitudeKm * 1.05)
          : rating === 'early'
          ? Math.round(currentOrbit.altitudeKm * 0.78)
          : Math.round(currentOrbit.altitudeKm * 1.45);

      const result: BurnExecutionResult = {
        timingOffsetPercent: Math.round(offset),
        rating,
        deltaVPenaltyMps,
        achievedAltitudeKm: achievedAlt,
        fuelRemainingPercent: fuelPct,
        message,
      };

      // Update telemetry
      const updatedTelemetry = {
        ...state.telemetry,
        availableDeltaVMps: currentRemaining,
        deltaVSufficient: currentRemaining >= currentOrbit.deltaVRequiredMps,
        overallSuccessRate: Math.max(15, Math.min(100, state.telemetry.overallSuccessRate + (rating === 'perfect' ? 10 : rating === 'nominal' ? 0 : -25))),
      };

      set({
        burnExecution: result,
        telemetry: updatedTelemetry,
      });

      if (state.isMultiplayer) {
        multiplayerService.broadcastPacket({
          type: 'EXECUTE_INSERTION_BURN',
          result,
        });
      }

      state.addLogMessage(`[BURN] ${result.message}`);
      return result;
    },

    // -----------------------------------------------------------------------
    // MODULE 2: IN-FLIGHT ANOMALIES & CRISIS MANAGEMENT
    // -----------------------------------------------------------------------
    activeAnomaly: null,
    anomalyCountdown: 15,
    anomalyVotes: {},

    triggerAnomaly: () => {
      const state = get();
      const anomalies = getLocalizedAnomalies(state.locale);

      // Dynamic probability weighting based on flight parameters
      let selectedAnomaly = anomalies[Math.floor(Math.random() * anomalies.length)];

      if (state.telemetry.netPowerW <= 30 && Math.random() < 0.75) {
        selectedAnomaly = anomalies.find((a) => a.id === 'anomaly-electrical-harness') || selectedAnomaly;
      } else if (state.telemetry.deltaVMarginPercent <= 15 && Math.random() < 0.75) {
        selectedAnomaly = anomalies.find((a) => a.id === 'anomaly-propellant-cavitation') || selectedAnomaly;
      } else if (!state.telemetry.radiationSafe && Math.random() < 0.75) {
        selectedAnomaly = anomalies.find((a) => a.id === 'anomaly-solar-storm' || a.id === 'anomaly-seu-bitflip') || selectedAnomaly;
      } else if (state.environmentalTests.tvacScore < 80 && Math.random() < 0.7) {
        selectedAnomaly = anomalies.find((a) => a.id === 'anomaly-battery-thermal') || selectedAnomaly;
      } else if (state.environmentalTests.vibrationScore < 80 && Math.random() < 0.7) {
        selectedAnomaly = anomalies.find((a) => a.id === 'anomaly-electrical-harness') || selectedAnomaly;
      }

      set({
        activeAnomaly: selectedAnomaly,
        anomalyCountdown: selectedAnomaly.urgencySeconds,
        anomalyVotes: {},
      });

      if (state.isMultiplayer && state.isHost) {
        multiplayerService.broadcastPacket({
          type: 'ANOMALY_TRIGGERED',
          anomaly: selectedAnomaly,
        });
      }

      state.addLogMessage(`[ANOMALY TRIGGERED] ${selectedAnomaly.title}`);
    },

    voteAnomalyChoice: (choiceId: string) => {
      const state = get();
      const anomaly = state.activeAnomaly;
      if (!anomaly) return;

      const myPeerId = state.myPlayerInfo.peerId;
      const newVotes = { ...state.anomalyVotes, [myPeerId]: choiceId };
      set({ anomalyVotes: newVotes });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'ANOMALY_VOTE',
          anomalyId: anomaly.id,
          choiceId,
          peerId: myPeerId,
          role: state.myPlayerInfo.role,
        });

        // If host, check if all players have voted
        if (state.isHost) {
          const totalCrew = Math.max(1, state.players.length);
          if (Object.keys(newVotes).length >= totalCrew) {
            get().tallyAndResolveAnomaly();
          }
        }
      } else {
        // Solo mode: immediately resolve with chosen action
        get().resolveAnomaly(choiceId);
      }
    },

    tallyAndResolveAnomaly: () => {
      const state = get();
      const anomaly = state.activeAnomaly;
      if (!anomaly || anomaly.choices.length === 0) return;

      const voteCounts: Record<string, number> = {};
      anomaly.choices.forEach((c) => {
        voteCounts[c.id] = 0;
      });

      const commander = state.players.find((p) => p.role === 'commander');
      const commanderPeerId = commander ? commander.peerId : null;
      let commanderVote: string | null = null;

      Object.entries(state.anomalyVotes).forEach(([peerId, choiceId]) => {
        if (voteCounts[choiceId] !== undefined) {
          voteCounts[choiceId]++;
        }
        if (commanderPeerId && peerId === commanderPeerId) {
          commanderVote = choiceId;
        }
      });

      // Find choice with max votes
      let maxVotes = -1;
      let winningChoiceId = anomaly.choices[0].id;
      Object.entries(voteCounts).forEach(([choiceId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          winningChoiceId = choiceId;
        } else if (count === maxVotes && commanderVote === choiceId) {
          winningChoiceId = choiceId;
        }
      });

      get().resolveAnomaly(winningChoiceId);
    },

    resolveAnomaly: (choiceId: string) => {
      const state = get();
      const anomaly = state.activeAnomaly;
      if (!anomaly) return;

      const choice = anomaly.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      const isTr = state.locale === 'tr';
      const updatedTelemetry: TelemetryMetrics = {
        ...state.telemetry,
        availableDeltaVMps: Math.max(0, state.telemetry.availableDeltaVMps - choice.deltaVCostMps),
        sciencePoints: Math.max(0, state.telemetry.sciencePoints + choice.scienceDelta),
        netPowerW: state.telemetry.netPowerW + choice.powerDeltaW,
        overallSuccessRate: Math.max(10, Math.min(100, state.telemetry.overallSuccessRate + choice.successRateDelta)),
      };

      set({
        activeAnomaly: null,
        anomalyVotes: {},
        telemetry: updatedTelemetry,
        simScienceCollected: Math.max(0, state.simScienceCollected + choice.scienceDelta),
      });

      if (state.isMultiplayer) {
        multiplayerService.broadcastPacket({
          type: 'ANOMALY_RESOLVED',
          choiceId,
          resolvedByName: state.myPlayerInfo.name,
          resolvedByRole: state.myPlayerInfo.role,
        });
      }

      state.addLogMessage(
        isTr
          ? `[ANOMALİ ÇÖZÜMÜ] ${choice.label} uygulandı. ${choice.effectDescription}`
          : `[ANOMALY ACTION] ${choice.label} executed. ${choice.effectDescription}`
      );
    },

    // -----------------------------------------------------------------------
    // PRE-LAUNCH: ROLE-LOCKED SUBSYSTEMS & PEER AUTHORIZATIONS
    // -----------------------------------------------------------------------
    unlockedAdvancedComponents: [],
    clearanceRequests: [],

    requestTechClearance: (componentId: string, componentName: string, targetRole: PlayerRole) => {
      const state = get();
      const newRequest: TechClearanceRequest = {
        id: `clearance-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        componentId,
        componentName,
        requestedByRole: state.myPlayerInfo.role,
        requestedByName: state.myPlayerInfo.name,
        targetRole,
        status: 'pending',
      };

      set({ clearanceRequests: [...state.clearanceRequests, newRequest] });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'TECH_CLEARANCE_REQUEST',
          request: newRequest,
        });
      }

      const isTr = state.locale === 'tr';
      state.addLogMessage(
        isTr
          ? `[YETKİ İSTENDİ] ${componentName} için onay talebi iletildi.`
          : `[CLEARANCE REQUESTED] Authorization requested for ${componentName}.`
      );
    },

    respondTechClearance: (requestId: string, approve: boolean) => {
      const state = get();
      const req = state.clearanceRequests.find((r) => r.id === requestId);
      if (!req) return;

      const updatedRequests = state.clearanceRequests.map((r) =>
        r.id === requestId ? { ...r, status: approve ? ('approved' as const) : ('rejected' as const) } : r
      );
      const unlocked = approve
        ? Array.from(new Set([...state.unlockedAdvancedComponents, req.componentId]))
        : state.unlockedAdvancedComponents;

      set({
        clearanceRequests: updatedRequests,
        unlockedAdvancedComponents: unlocked,
      });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'TECH_CLEARANCE_RESPONSE',
          requestId,
          componentId: req.componentId,
          approved: approve,
          authorizedByName: state.myPlayerInfo.name,
        });
      }
    },

    // -----------------------------------------------------------------------
    // ASYMMETRIC CO-OP "KEEP TALKING" ANOMALY
    // -----------------------------------------------------------------------
    asymmetricAnomaly: null,

    triggerAsymmetricAnomaly: () => {
      const state = get();
      const isTr = state.locale === 'tr';
      const players = state.players;

      let diagPeerId = state.myPlayerInfo.peerId;
      let diagRole = state.myPlayerInfo.role;
      let resPeerId = state.myPlayerInfo.peerId;
      let resRole: PlayerRole = 'engineer';

      if (state.isMultiplayer && players.length >= 2) {
        diagPeerId = players[0].peerId;
        diagRole = players[0].role;
        resPeerId = players[1].peerId;
        resRole = players[1].role;
      }

      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      const anomalyObj: AsymmetricAnomalyState = {
        id: `asym-anomaly-${Date.now()}`,
        title: isTr ? 'KRİTİK AVİYONİK VE VERİ HATTI KİLİTLENMESİ' : 'CRITICAL AVIONICS & BUS GIMBAL LOCK',
        description: isTr
          ? 'Donanım hatası ana veri hattını kilitledi. Teşhis ekranındaki acil durum şifresini Müdahale terminaline girin!'
          : 'Hardware seizure locked the primary bus. Read the emergency passkey from Diagnostic terminal and input on Resolution keypad!',
        diagnosticPeerId: diagPeerId,
        resolutionPeerId: resPeerId,
        diagnosticRole: diagRole,
        resolutionRole: resRole,
        passkey: randomCode,
        hintCode: `${randomCode.slice(0, 2)}**`,
        timeRemaining: 20,
        isSolved: false,
        failedAttempts: 0,
      };

      set({ asymmetricAnomaly: anomalyObj });

      if (state.isMultiplayer && state.isHost) {
        multiplayerService.broadcastPacket({
          type: 'ASYMMETRIC_ANOMALY_INIT',
          anomaly: anomalyObj,
        });
      }

      state.addLogMessage(
        isTr
          ? `[ACİL EŞZAMANSIZ ARIZA] ${anomalyObj.title} - ${diagRole.toUpperCase()} (Teşhis) <-> ${resRole.toUpperCase()} (Müdahale)`
          : `[ASYMMETRIC EMERGENCY] ${anomalyObj.title} - ${diagRole.toUpperCase()} (Diag) <-> ${resRole.toUpperCase()} (Res)`
      );
    },

    submitAsymmetricInput: (input: string) => {
      const state = get();
      const anomaly = state.asymmetricAnomaly;
      if (!anomaly) return false;

      if (input.trim() === anomaly.passkey) {
        set({
          asymmetricAnomaly: null,
          simScienceCollected: state.simScienceCollected + 25,
        });

        if (state.isMultiplayer) {
          multiplayerService.sendPacket({
            type: 'ASYMMETRIC_ANOMALY_SOLVED',
            solvedByPeerId: state.myPlayerInfo.peerId,
            solvedByName: state.myPlayerInfo.name,
          });
        }

        const isTr = state.locale === 'tr';
        state.addLogMessage(
          isTr
            ? `[MÜDAHALE BAŞARILI] Doğru acil durum şifresi girildi (${anomaly.passkey}). Sistemler nominal duruma döndü!`
            : `[RESOLUTION SUCCESSFUL] Correct failsafe code entered (${anomaly.passkey}). Systems restored to nominal!`
        );
        return true;
      } else {
        set({
          asymmetricAnomaly: {
            ...anomaly,
            failedAttempts: anomaly.failedAttempts + 1,
          },
        });
        return false;
      }
    },

    resolveAsymmetricAnomaly: (success: boolean) => {
      const state = get();
      const anomaly = state.asymmetricAnomaly;
      if (!anomaly) return;

      if (success) {
        state.submitAsymmetricInput(anomaly.passkey);
      } else {
        // Failsafe penalty
        set({
          asymmetricAnomaly: null,
          telemetry: {
            ...state.telemetry,
            availableDeltaVMps: Math.max(0, state.telemetry.availableDeltaVMps - 80),
          },
        });
        const isTr = state.locale === 'tr';
        state.addLogMessage(
          isTr
            ? '[SÜRE DOLDU] Arıza zamanında çözülemedi. -80 m/s Delta-V kaybı yaşandı.'
            : '[TIMEOUT] Anomaly timer expired. -80 m/s Delta-V lost due to trajectory drift.'
        );
      }
    },

    // -----------------------------------------------------------------------
    // TEAMMATE ASSISTANCE PINGS
    // -----------------------------------------------------------------------
    activeAssistancePings: [],

    sendAssistancePing: (stationName: string) => {
      const state = get();
      const ping: AssistancePing = {
        id: `ping-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderName: state.myPlayerInfo.name,
        senderRole: state.myPlayerInfo.role,
        stationName,
        timestamp: Date.now(),
      };

      set({ activeAssistancePings: [...state.activeAssistancePings, ping] });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'TEAMMATE_ASSISTANCE_PING',
          ping,
        });
      }
    },

    dismissAssistancePing: (id: string) => {
      set({ activeAssistancePings: get().activeAssistancePings.filter((p) => p.id !== id) });
    },

    // -----------------------------------------------------------------------
    // MODULE 4: PRE-FLIGHT ENVIRONMENTAL TEST LAB
    // -----------------------------------------------------------------------
    environmentalTests: {
      vibrationPassed: false,
      tvacPassed: false,
      vibrationScore: 0,
      tvacScore: 0,
      vibrationTested: false,
      tvacTested: false,
    },

    runVibrationTest: () => {
      const state = get();
      const isTr = state.locale === 'tr';
      const isPassed = state.telemetry.launchCompatibility && state.telemetry.totalMassKg <= 5000;
      const score = isPassed ? Math.round(91 + Math.random() * 8) : Math.round(35 + Math.random() * 15);

      const tests: EnvironmentalTestState = {
        ...state.environmentalTests,
        vibrationTested: true,
        vibrationPassed: isPassed,
        vibrationScore: score,
        lastVibrationFrequencyHz: isPassed ? 142 : 68,
      };

      set({ environmentalTests: tests });

      if (state.isMultiplayer) {
        multiplayerService.broadcastPacket({
          type: 'ENV_TEST_UPDATE',
          testType: 'vibration',
          passed: isPassed,
          score,
        });
      }

      state.addLogMessage(
        isTr
          ? `[TEST LAB] Titreşim Masası Testi: ${isPassed ? 'BAŞARILI (AKUSTİK REZONANS NOMİNAL)' : 'BAŞARISIZ (KÜTLE LİMİTİ AŞIMI)'} (Skor: ${score}%)`
          : `[TEST LAB] Vibration Table Test: ${isPassed ? 'PASSED (Acoustic Resonance Nominal)' : 'FAILED (Mass Exceeds Shear Limits)'} (Score: ${score}%)`
      );

      return { passed: isPassed, score };
    },

    runTvacTest: () => {
      const state = get();
      const isTr = state.locale === 'tr';
      const isPassed = state.telemetry.powerPositive && state.telemetry.radiationSafe;
      const score = isPassed ? Math.round(93 + Math.random() * 6) : Math.round(40 + Math.random() * 12);

      const tests: EnvironmentalTestState = {
        ...state.environmentalTests,
        tvacTested: true,
        tvacPassed: isPassed,
        tvacScore: score,
        lastTvacTempRangeC: [-115, 128],
      };

      set({ environmentalTests: tests });

      if (state.isMultiplayer) {
        multiplayerService.broadcastPacket({
          type: 'ENV_TEST_UPDATE',
          testType: 'tvac',
          passed: isPassed,
          score,
        });
      }

      state.addLogMessage(
        isTr
          ? `[TEST LAB] Termal Vakum (TVAC) Testi: ${isPassed ? 'BAŞARILI (ISITICI VE RADYATÖR DENGESİ DOĞRULANDI)' : 'BAŞARISIZ (TERMAL DONMA VEYA RADYASYON AÇIĞI)'} (Skor: ${score}%)`
          : `[TEST LAB] Thermal Vacuum (TVAC) Test: ${isPassed ? 'PASSED (Thermal Heater Loop Verified)' : 'FAILED (Power Deficit / Thermal Freeze)'} (Score: ${score}%)`
      );

      return { passed: isPassed, score };
    },

    // -----------------------------------------------------------------------
    // MODULE 3: VIEWPORT OVERLAYS (CENTER OF MASS & THERMAL OVERLAY)
    // -----------------------------------------------------------------------
    showCenterOfMass: false,
    toggleCenterOfMass: () => set((s) => ({ showCenterOfMass: !s.showCenterOfMass })),

    showThermalOverlay: false,
    toggleThermalOverlay: () => set((s) => ({ showThermalOverlay: !s.showThermalOverlay })),

    // Cooperative Go-For-Launch Consensus
    launchPoll: null,
    isFlightModalOpen: false,
    setIsFlightModalOpen: (open: boolean) => {
      set({ isFlightModalOpen: open });
      if (get().isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'LAUNCH_MODAL_SYNC',
          isOpen: open,
        });
      }
    },
    dismissLaunchPoll: () => set({ launchPoll: null }),

    requestLaunchConsensus: () => {
      const state = get();
      const myId = state.myPlayerInfo.peerId;
      const initialVotes: Record<string, 'go' | 'abort'> = {};

      // Initiator votes 'go' automatically
      initialVotes[myId] = 'go';

      // Auto-vote 'go' for any simulated co-pilots
      state.players.forEach((p) => {
        if (p.peerId.startsWith('sim-copilot')) {
          initialVotes[p.peerId] = 'go';
        }
      });

      const poll: LaunchPoll = {
        id: `poll-${Date.now()}`,
        initiatedByPeerId: myId,
        initiatedByName: state.myPlayerInfo.name,
        status: 'voting',
        votes: initialVotes,
      };

      set({ launchPoll: poll });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'LAUNCH_POLL_INIT',
          poll,
        });
      }

      // Check if all players have already voted (e.g. 1 human player + bots)
      const allVotedGo = state.players.every((p) => initialVotes[p.peerId] === 'go');
      if (allVotedGo) {
        get().finalizeLaunch();
      } else {
        const isTr = state.locale === 'tr';
        state.addLogMessage(
          isTr
            ? `[FIRLATMA] ${state.myPlayerInfo.name} ortak fırlatma yetkilendirmesi başlattı. Tüm istasyonların GO onayı bekleniyor.`
            : `[LAUNCH] ${state.myPlayerInfo.name} initiated cooperative launch poll. All stations must confirm GO.`
        );
      }
    },

    voteLaunchConsensus: (vote: 'go' | 'abort') => {
      const state = get();
      if (!state.launchPoll) return;
      const myId = state.myPlayerInfo.peerId;

      const newVotes = {
        ...state.launchPoll.votes,
        [myId]: vote,
      };

      const hasAbort = Object.values(newVotes).includes('abort');
      const allVotedGo = state.players.every((p) => newVotes[p.peerId] === 'go');

      let newStatus: 'voting' | 'approved' | 'aborted' = state.launchPoll.status;
      if (hasAbort) {
        newStatus = 'aborted';
      } else if (allVotedGo) {
        newStatus = 'approved';
      }

      const updatedPoll: LaunchPoll = {
        ...state.launchPoll,
        status: newStatus,
        votes: newVotes,
      };

      set({ launchPoll: updatedPoll });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'LAUNCH_POLL_VOTE',
          pollId: updatedPoll.id,
          peerId: myId,
          vote,
        });
      }

      const isTr = state.locale === 'tr';
      if (hasAbort) {
        state.addLogMessage(
          isTr
            ? `[FIRLATMA] Fırlatma iptal edildi: ${state.myPlayerInfo.name} bekleme verdi.`
            : `[LAUNCH] Launch poll aborted: ${state.myPlayerInfo.name} voted NO-GO.`
        );
        setTimeout(() => {
          set({ launchPoll: null });
        }, 1800);
      } else if (allVotedGo) {
        get().finalizeLaunch();
      }
    },

    finalizeLaunch: () => {
      const state = get();
      const activeDestinations = state.destinations.length > 0 ? state.destinations : [state.missionState.scenarioId];

      set({
        currentView: 'bridge',
        isDestinationLocked: true,
        destinations: activeDestinations,
        isFlightModalOpen: true,
        flightStage: 'design',
        launchPoll: null,
      });

      if (state.isMultiplayer) {
        multiplayerService.sendPacket({
          type: 'ENTER_MISSION',
          scenarioId: activeDestinations[0],
          destinations: activeDestinations,
        });
        multiplayerService.sendPacket({
          type: 'LAUNCH_MODAL_SYNC',
          isOpen: true,
        });
        multiplayerService.sendPacket({
          type: 'LAUNCH_STAGE_UPDATE',
          stage: 'design',
          timestamp: Date.now(),
        });
      }

      const isTr = state.locale === 'tr';
      get().addLogMessage(
        isTr
          ? `[FIRLATMA] Tüm istasyonlar GO verdi! Uçuş simülasyon köprüsüne geçildi.`
          : `[LAUNCH] All stations GO! Transitioned to flight simulation deck.`
      );
    },

    // Audio & Sound
    audioEnabled: true,
    toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
    audioVolume: 80,
    setAudioVolume: (v: number) => set({ audioVolume: v }),
  };
});
