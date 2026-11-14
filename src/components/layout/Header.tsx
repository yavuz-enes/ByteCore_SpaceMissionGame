import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  BookOpen,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { TRANSLATIONS } from '../../i18n/translations';
import { SettingsModal } from '../settings/SettingsModal';
import { NASAOfficialResourcesModal } from './NASAOfficialResourcesModal';

interface HeaderProps {
  onOpenMultiplayer: () => void;
  onOpenFlightModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMultiplayer, onOpenFlightModal }) => {
  const {
    telemetry,
    locale,
    abortToLanding,
    isMultiplayer,
    players,
    requestLaunchConsensus,
  } = useMissionStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const t = TRANSLATIONS[locale].header;
  const isTr = locale === 'tr';

  const handleLaunchClick = () => {
    if (isMultiplayer && players.length > 1) {
      requestLaunchConsensus();
    } else {
      onOpenFlightModal();
    }
  };

  return (
    <>
      <header className="w-full max-w-full overflow-hidden bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/10 px-2.5 sm:px-6 md:px-8 py-2 sm:py-2.5 sticky top-0 z-30">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Brand Logo (Interactive Home Action) */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
            <button
              onClick={abortToLanding}
              className="flex items-center space-x-1.5 sm:space-x-2 -ml-1 sm:-ml-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer group flex-shrink-0"
              title={isTr ? 'Görevi İptal Et / Ana Sayfaya Dön' : 'Return to Landing Gateway'}
            >
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] group-hover:scale-125 transition-transform" />
              <span className="font-display font-bold text-xs sm:text-base md:text-lg tracking-tight text-white group-hover:text-sky-300 transition-colors">
                BYTECORE
              </span>
            </button>
          </div>

          {/* Right: Essential Telemetry Status, Launch CTA & Settings Button */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            {/* NASA & CSA Official Challenge Resources Button */}
            <button
              onClick={() => setIsResourcesOpen(true)}
              className="flex items-center space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.2)] flex-shrink-0"
              title={isTr ? 'Yarışmada Verilen Resmi NASA ve CSA Kaynakları' : 'Official NASA & CSA Challenge Resources'}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{isTr ? 'NASA/CSA Kaynakları' : 'NASA/CSA Sources'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-400 text-slate-950 font-bold">4+4</span>
            </button>

            {/* Single Dedicated Settings Modal Trigger (Positioned to the left of Review Pill) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700/60 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer flex-shrink-0"
              title={isTr ? 'Görev Ayarları' : 'Mission Settings'}
              aria-label="Settings"
            >
              <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>

            {/* High-level Flight Status Pill (Hidden on mobile for compactness) */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono border bg-slate-900/60">
              {telemetry.validationErrors.length === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">{t.nominal}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-medium">
                    {telemetry.validationErrors.length} {t.reviewsNeeded}
                  </span>
                </>
              )}
            </div>

            {/* Launch CTA Button - Compact on mobile */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunchClick}
              className="flex items-center space-x-1 sm:space-x-1.5 bg-white text-slate-950 hover:bg-slate-100 font-semibold text-[11px] sm:text-sm px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current flex-shrink-0" />
              <span className="hidden sm:inline">{t.launchBtn}</span>
              <span className="sm:hidden">{isTr ? 'FIRLAT' : 'LAUNCH'}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Dedicated Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenMultiplayer={onOpenMultiplayer}
      />

      {/* NASA & CSA Official Challenge Resources Modal */}
      <NASAOfficialResourcesModal
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />
    </>
  );
};
