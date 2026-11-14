import {
  MissionState,
  PlayerRole,
  BurnExecutionResult,
  MissionAnomaly,
} from './mission';

export interface PlayerInfo {
  peerId: string;
  name: string;
  role: PlayerRole;
  secondaryRole?: PlayerRole;
  isHost: boolean;
  isReady: boolean;
  color: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: PlayerRole;
  text: string;
  timestamp: number;
  type: 'chat' | 'system' | 'proposal';
}

export interface BudgetProposal {
  id: string;
  proposedByRole: PlayerRole;
  proposedByName: string;
  changeDescription: string;
  costDeltaM: number;
  newState: Partial<MissionState>;
  votes: Record<string, 'approve' | 'reject'>;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TechClearanceRequest {
  id: string;
  componentId: string;
  componentName: string;
  requestedByRole: PlayerRole;
  requestedByName: string;
  targetRole: PlayerRole;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AsymmetricAnomalyState {
  id: string;
  title: string;
  description: string;
  diagnosticPeerId: string;
  resolutionPeerId: string;
  diagnosticRole: PlayerRole;
  resolutionRole: PlayerRole;
  passkey: string;
  hintCode: string;
  timeRemaining: number;
  isSolved: boolean;
  failedAttempts: number;
}

export interface AssistancePing {
  id: string;
  senderName: string;
  senderRole: PlayerRole;
  stationName: string;
  timestamp: number;
}

export interface LaunchPoll {
  id: string;
  initiatedByPeerId: string;
  initiatedByName: string;
  status: 'voting' | 'approved' | 'aborted';
  votes: Record<string, 'go' | 'abort'>;
}

export type NetworkPacket = 
  | { type: 'PLAYER_JOIN'; player: PlayerInfo }
  | { type: 'PLAYER_LEAVE'; peerId: string }
  | { type: 'ROOM_STATE_SYNC'; players: PlayerInfo[]; missionState: MissionState; hostPeerId: string; destinations?: string[]; unlockedAdvanced?: string[] }
  | { type: 'MISSION_STATE_UPDATE'; state: Partial<MissionState>; updatedByRole: PlayerRole }
  | { type: 'ROLE_CLAIM'; peerId: string; role: PlayerRole; secondaryRole?: PlayerRole; name?: string }
  | { type: 'READY_TOGGLE'; peerId: string; isReady: boolean }
  | { type: 'CHAT_MSG'; message: ChatMessage }
  | { type: 'BUDGET_PROPOSAL'; proposal: BudgetProposal }
  | { type: 'BUDGET_VOTE'; proposalId: string; peerId: string; vote: 'approve' | 'reject' }
  | { type: 'LAUNCH_START' }
  | { type: 'LAUNCH_STAGE_UPDATE'; stage: string; timestamp: number }
  | { type: 'RESET_TO_DESIGN' }
  | { type: 'ENTER_MISSION'; scenarioId: string; destinations?: string[] }
  | { type: 'CAMPAIGN_QUEUE_UPDATE'; destinations: string[] }
  | { type: 'ABORT_TO_HOME' }
  | { type: 'EXECUTE_INSERTION_BURN'; result: BurnExecutionResult }
  | { type: 'ANOMALY_TRIGGERED'; anomaly: MissionAnomaly }
  | { type: 'ANOMALY_VOTE'; anomalyId: string; choiceId: string; peerId: string; role: PlayerRole }
  | { type: 'ANOMALY_RESOLVED'; choiceId: string; resolvedByName: string; resolvedByRole: PlayerRole }
  | { type: 'ENV_TEST_UPDATE'; testType: 'vibration' | 'tvac'; passed: boolean; score: number }
  | { type: 'TECH_CLEARANCE_REQUEST'; request: TechClearanceRequest }
  | { type: 'TECH_CLEARANCE_RESPONSE'; requestId: string; componentId: string; approved: boolean; authorizedByName: string }
  | { type: 'ASYMMETRIC_ANOMALY_INIT'; anomaly: AsymmetricAnomalyState }
  | { type: 'ASYMMETRIC_ANOMALY_SOLVED'; solvedByPeerId: string; solvedByName: string }
  | { type: 'TEAMMATE_ASSISTANCE_PING'; ping: AssistancePing }
  | { type: 'LAUNCH_POLL_INIT'; poll: LaunchPoll }
  | { type: 'LAUNCH_POLL_VOTE'; pollId: string; peerId: string; vote: 'go' | 'abort' }
  | { type: 'LAUNCH_MODAL_SYNC'; isOpen: boolean };
