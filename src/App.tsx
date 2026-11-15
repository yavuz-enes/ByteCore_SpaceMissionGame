import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from './store/missionStore';
import { Header } from './components/layout/Header';
import { TelemetryBar } from './components/dashboard/TelemetryBar';
import { RoleNavigation } from './components/roles/RoleNavigation';
import { CommanderConsole } from './components/roles/CommanderConsole';
import { EngineerConsole } from './components/roles/EngineerConsole';
import { ScientistConsole } from './components/roles/ScientistConsole';
import { CommsConsole } from './components/roles/CommsConsole';
import { SpaceCanvas } from './components/canvas/SpaceCanvas';
import { MultiplayerLobbyModal } from './components/multiplayer/MultiplayerLobbyModal';
import { FlightSimulationModal } from './components/flight/FlightSimulationModal';
import { LandingPage } from './components/landing/LandingPage';
import { ClearanceBanner } from './components/minigames/ClearanceBanner';
import { AssistanceNotification } from './components/minigames/AssistanceNotification';
import { AsymmetricAnomalyModal } from './components/minigames/AsymmetricAnomalyModal';
import { LaunchConsensusModal } from './components/multiplayer/LaunchConsensusModal';
import { SpaceAcademyStandalone } from './components/academy/SpaceAcademyStandalone';
import { StarfieldBackground } from './components/layout/StarfieldBackground';
import { TRANSLATIONS } from './i18n/translations';

export const App: React.FC = () => {
  const {
    currentView,
    activeRole,
    telemetry,
    missionLog,
    locale,
    isMultiplayer,
    myPlayerInfo,
    isFlightModalOpen,
    setIsFlightModalOpen,
  } = useMissionStore();
  const t = TRANSLATIONS[locale].advisory;

  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);

  // In multiplayer, players can seamlessly switch between their primary and secondary duty stations
  const effectiveRole = activeRole;

  // If in Academy view, render the dedicated Space Academy Campus
  if (currentView === 'academy') {
    return (
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-transparent relative">
        <StarfieldBackground />
        <SpaceAcademyStandalone />
      </div>
    );
  }

  // If in Landing Gateway view, render Landing Page + Consensus Modal
  if (currentView === 'landing') {
    return (
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-transparent relative">
        <StarfieldBackground />
        <LandingPage />
        <LaunchConsensusModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-white flex flex-col font-sans relative">
      <StarfieldBackground />
      {/* Ambient Deep Space, Cockpit Canopy & Space Grid Overlays (strictly behind content) */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
        style={{ backgroundImage: `url('./flight-kit/bg-hero-deepspace.webp')` }}
      />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#070B14]/45" />
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-15"
        style={{ backgroundImage: `url('./flight-kit/orbital-grid-pattern.svg')`, backgroundSize: '320px' }}
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center opacity-20 mix-blend-screen"
        style={{ backgroundImage: `url('./flight-kit/bg-cockpit-overlay.png')` }}
      />

      {/* Top Navigation & Status */}
      <Header
        onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
        onOpenFlightModal={() => setIsFlightModalOpen(true)}
      />

      {/* Persistent Mission Telemetry Bar */}
      <TelemetryBar />

      {/* Station Role Selection Navigation */}
      <RoleNavigation />

      {/* Main Mission Control Bridge Floor */}
      <main className="relative z-10 flex-1 max-w-[1360px] w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center Work Area: Active Role Console (7 cols) */}
          <div className="lg:col-span-7 w-full min-w-0 max-w-full">
            {/* Peer Clearance Approval Banner */}
            <ClearanceBanner />

            <AnimatePresence mode="wait">
              <motion.div
                key={effectiveRole}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {effectiveRole === 'commander' && <CommanderConsole />}
                {effectiveRole === 'engineer' && <EngineerConsole />}
                {effectiveRole === 'scientist' && <ScientistConsole />}
                {effectiveRole === 'comms' && <CommsConsole />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: 3D Celestial Orbit Viewport & Mission Log (5 cols) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 w-full min-w-0 max-w-full">
            {/* 3D Interactive Planet & Orbit Scene */}
            <div className="h-[360px] w-full border border-white/10 rounded-2xl overflow-hidden bg-[#080C14]">
              <SpaceCanvas />
            </div>

            {/* Tactical Advisory & Engineering Constraints */}
            <div className="border border-white/10 rounded-2xl overflow-hidden p-4 space-y-2.5 bg-[#0E1422]">
              <div className="pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  {t.title}
                </span>
              </div>

              {telemetry.validationErrors.length === 0 && telemetry.validationWarnings.length === 0 ? (
                <div className="p-3 text-xs font-mono text-emerald-400 border border-emerald-500/30 rounded-2xl overflow-hidden bg-[#0B0F17]">
                  {t.allNominal}
                </div>
              ) : (
                <div className="space-y-2">
                  {telemetry.validationErrors.map((err, i) => (
                    <div
                      key={`err-${i}`}
                      className="p-2.5 text-xs font-mono text-rose-300 border border-rose-500/30 rounded-2xl overflow-hidden bg-[#0B0F17] leading-relaxed"
                    >
                      • {err}
                    </div>
                  ))}
                  {telemetry.validationWarnings.map((warn, i) => (
                    <div
                      key={`warn-${i}`}
                      className="p-2.5 text-xs font-mono text-amber-300 border border-amber-500/30 rounded-2xl overflow-hidden bg-[#0B0F17] leading-relaxed"
                    >
                      • {warn}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mission Control Flight Recorder Terminal */}
            <div className="border border-white/10 rounded-2xl overflow-hidden p-3.5 font-mono text-xs bg-[#0E1422]">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400 text-[11px]">
                <span className="tracking-wider uppercase font-bold text-white">{t.flightRecorder}</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">{t.online}</span>
              </div>

              <div className="mt-2.5 h-32 overflow-y-auto space-y-1 text-[11px] text-slate-400 leading-relaxed pr-1 tabular-nums">
                {missionLog.map((log, idx) => (
                  <div key={idx} className="font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MultiplayerLobbyModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
      />

      <FlightSimulationModal
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
      />

      {/* Asymmetric Co-op Failsafe Modal */}
      <AsymmetricAnomalyModal />

      {/* Teammate Assistance Pings */}
      <AssistanceNotification />

      {/* Cooperative All-Stations Launch Consensus Poll */}
      <LaunchConsensusModal />
    </div>
  );
};
