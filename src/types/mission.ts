export type MissionId = 
  | 'lunar-recon'
  | 'mars-sample'
  | 'europa-explorer'
  | 'asteroid-scout'
  | 'sandbox';

export type PlayerRole = 'commander' | 'engineer' | 'scientist' | 'comms';

export interface MissionScenario {
  id: MissionId;
  name: string;
  tagline: string;
  target: 'Moon' | 'Mars' | 'Europa' | 'Asteroid' | 'Earth Orbit';
  description: string;
  initialBudget: number; // in Millions USD ($M)
  requiredDeltaV: number; // in m/s
  radiationLevel: 'Low' | 'Moderate' | 'Severe' | 'Extreme';
  minScienceThreshold: number; // points
  solarIntensity: number; // 1.0 at Earth, 0.43 at Mars, 0.04 at Jupiter
  commDistanceAU: number; // Distance in Astronomical Units (1 AU = 150M km)
  recommendedOrbit: string;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  manufacturer: string;
  costM: number;
  maxPayloadKg: number;
  maxDeltaVBonus: number;
  reliability: number; // percentage
  description: string;
  stages: number;
}

export interface SpacecraftBus {
  id: string;
  name: string;
  dryMassKg: number;
  costM: number;
  maxPayloadCapacityKg: number;
  radiationShieldingRating: number; // 1 to 5
  description: string;
}

export interface PropulsionSystem {
  id: string;
  name: string;
  type: string;
  costM: number;
  dryMassKg: number;
  fuelMassKg: number;
  ispSeconds: number; // Specific Impulse
  thrustN: number;
  powerDrawW: number;
  description: string;
}

export interface PowerSystem {
  id: string;
  name: string;
  type: string;
  costM: number;
  massKg: number;
  basePowerW: number; // At 1 AU
  worksInDeepSpace: boolean; // RTG vs Solar
  description: string;
}

export interface BatterySystem {
  id: string;
  name: string;
  capacityWh: number;
  costM: number;
  massKg: number;
  dischargeRateC: number;
  description: string;
}

export interface ScientificInstrument {
  id: string;
  name: string;
  category: string;
  costM: number;
  massKg: number;
  powerDrawW: number;
  dataRateKbps: number;
  scienceValue: number; // Points towards mission objective
  description: string;
}

export interface AntennaSystem {
  id: string;
  name: string;
  type: 'Low-Gain Omni' | 'Medium-Gain Horn' | 'High-Gain 2.4m Dish' | 'Deep-Space Laser Optical';
  frequencyBand: 'S-Band' | 'X-Band' | 'Ka-Band' | 'Optical Infrared';
  costM: number;
  massKg: number;
  powerDrawW: number;
  maxThroughputKbps: number; // At 1 AU
  description: string;
}

export interface GroundStationNetwork {
  id: string;
  name: string;
  coveragePercent: number;
  costM: number;
  latencySeconds: number;
  description: string;
}

export interface OrbitProfile {
  id: string;
  name: string;
  altitudeKm: number;
  inclinationDeg: number;
  deltaVRequiredMps: number;
  sunlightExposurePercent: number;
  commContactWindowPercent: number;
  observationResolutionMultiplier: number;
  description: string;
}

export interface MissionState {
  scenarioId: MissionId;
  orbitId: string;
  launchVehicleId: string;
  busId: string;
  propulsionId: string;
  powerId: string;
  batteryId: string;
  antennaId: string;
  groundStationId: string;
  selectedInstrumentIds: string[];
}

export type FlightStage = 
  | 'design'
  | 'countdown'
  | 'liftoff'
  | 'max-q'
  | 'stage-sep'
  | 'transfer-cruise'
  | 'orbital-burn'
  | 'insertion-burn'
  | 'solar-deploy'
  | 'science-pass'
  | 'mission-complete'
  | 'mission-failed';

export type BurnAccuracyRating = 'perfect' | 'nominal' | 'early' | 'late' | 'critical-overshoot';

export interface BurnExecutionResult {
  timingOffsetPercent: number; // -50 to +50 (0 = dead center)
  rating: BurnAccuracyRating;
  deltaVPenaltyMps: number;
  achievedAltitudeKm: number;
  fuelRemainingPercent: number;
  message: string;
}

export interface AnomalyChoice {
  id: string;
  label: string;
  description: string;
  effectDescription: string;
  deltaVCostMps: number;
  scienceDelta: number;
  successRateDelta: number;
  powerDeltaW: number;
}

export interface MissionAnomaly {
  id: string;
  type:
    | 'solar-storm'
    | 'reaction-wheel'
    | 'deep-eclipse'
    | 'solar-array-misalignment'
    | 'thruster-thermal-overload'
    | 'cosmic-ray-upset'
    | 'star-tracker-loss';
  title: string;
  description: string;
  urgencySeconds: number;
  choices: [AnomalyChoice, AnomalyChoice];
}

export interface EnvironmentalTestState {
  vibrationPassed: boolean;
  tvacPassed: boolean;
  vibrationScore: number; // 0-100
  tvacScore: number; // 0-100
  vibrationTested: boolean;
  tvacTested: boolean;
  lastVibrationFrequencyHz?: number;
  lastTvacTempRangeC?: [number, number];
}

export interface TelemetryMetrics {
  totalMassKg: number;
  totalCostM: number;
  remainingBudgetM: number;
  netPowerW: number;
  availableDeltaVMps: number;
  deltaVMarginPercent: number;
  dataThroughputKbps: number;
  sciencePoints: number;
  launchCompatibility: boolean;
  powerPositive: boolean;
  deltaVSufficient: boolean;
  budgetValid: boolean;
  radiationSafe: boolean;
  overallSuccessRate: number; // 0 - 100%
  validationErrors: string[];
  validationWarnings: string[];
}
