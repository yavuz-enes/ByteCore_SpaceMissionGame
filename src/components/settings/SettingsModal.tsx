import React, { useState } from 'react';
import {
  X,
  Globe,
  Volume2,
  VolumeX,
  Users,
  Wifi,
  Copy,
  Check,
  Eye,
  Sliders,
  LogOut,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMultiplayer?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenMultiplayer,
}) => {
  const {
    locale,
    setLocale,
    audioEnabled,
    toggleAudio,
    audioVolume,
    setAudioVolume,
    isMultiplayer,
    roomCode,
    players,
    leaveRoom,
    showCenterOfMass,
    toggleCenterOfMass,
    showThermalOverlay,
    toggleThermalOverlay,
  } = useMissionStore();

  const [copied, setCopied] = useState(false);
  const isTr = locale === 'tr';

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0E1422] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B0F17]">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="font-mono font-bold text-sm tracking-widest uppercase text-white">
              {isTr ? 'GÖREV KONTROL AYARLARI' : 'MISSION CONTROL SETTINGS'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
            title={isTr ? 'Kapat' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* 1. Language Preference */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0B0F17]/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-300 font-semibold tracking-wider uppercase">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{isTr ? 'DİL SEÇİMİ' : 'LANGUAGE (LOCALE)'}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {locale === 'en' ? 'ENGLISH' : 'TÜRKÇE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocale('en')}
                className={`py-2 px-4 rounded-full font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  locale === 'en'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'border border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>ENGLISH</span>
              </button>
              <button
                onClick={() => setLocale('tr')}
                className={`py-2 px-4 rounded-full font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  locale === 'tr'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'border border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>TÜRKÇE</span>
              </button>
            </div>
          </div>

          {/* 2. Audio & SFX Controls */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0B0F17]/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-300 font-semibold tracking-wider uppercase">
                {audioEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{isTr ? 'SES & HABERLEŞME SFX' : 'AUDIO & COMMS SFX'}</span>
              </span>

              <button
                onClick={toggleAudio}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  audioEnabled
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'border border-slate-700 text-slate-400'
                }`}
              >
                {audioEnabled ? (isTr ? 'AÇIK' : 'ACTIVE') : (isTr ? 'SESSİZ' : 'MUTED')}
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume}
                onChange={(e) => setAudioVolume(Number(e.target.value))}
                disabled={!audioEnabled}
                className="w-full accent-sky-400 cursor-pointer disabled:opacity-40"
              />
              <span className="w-10 text-right text-slate-300 tabular-nums font-semibold">
                {audioVolume}%
              </span>
            </div>
          </div>

          {/* 3. Multiplayer Connection Status */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0B0F17]/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-300 font-semibold tracking-wider uppercase">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>{isTr ? 'AĞ VE ÇOKLU BAĞLANTI' : 'NETWORK & MULTIPLAYER'}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  isMultiplayer
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'border border-slate-700 text-slate-400'
                }`}
              >
                {isMultiplayer ? (isTr ? 'ÇOKLU ODA' : 'MULTIPLAYER') : (isTr ? 'SOLO MOD' : 'SOLO')}
              </span>
            </div>

            {isMultiplayer ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between border border-slate-800 rounded-full px-3 py-1.5 bg-[#080C14]">
                  <span className="text-slate-400">
                    {isTr ? 'ODA KODU' : 'ROOM CODE'}: <strong className="text-white">{roomCode}</strong>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400">
                      {players.length}/4 {isTr ? 'KİŞİ' : 'CREW'}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                      title={isTr ? 'Kodu Kopyala' : 'Copy Room Code'}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {onOpenMultiplayer && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMultiplayer();
                      }}
                      className="px-4 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
                    >
                      {isTr ? 'Lobi Konsolunu Aç' : 'Open Lobby Console'}
                    </button>
                  )}
                  <button
                    onClick={leaveRoom}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer ml-auto"
                  >
                    <LogOut className="w-3 h-3 text-slate-400" />
                    <span>{isTr ? 'Odadan Ayrıl' : 'Disconnect'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {isTr ? 'Tekli Komutan modunda çalışıyorsunuz.' : 'Running in Solo Commander session.'}
                </span>
                {onOpenMultiplayer && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMultiplayer();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white text-slate-950 font-semibold text-[11px] hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                  >
                    {isTr ? 'Oda Oluştur / Katıl' : 'Create / Join Room'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. 3D Viewport Overlays */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0B0F17]/80 space-y-3">
            <span className="flex items-center space-x-2 text-slate-300 font-semibold tracking-wider uppercase">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>{isTr ? '3D VİZÖR GÖRSEL KATMANLARI' : '3D VIEWPORT HUD OVERLAYS'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={toggleCenterOfMass}
                className={`py-2 px-3 rounded-full font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  showCenterOfMass
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'border border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{isTr ? 'AĞIRLIK MERKEZİ' : 'CENTER OF MASS'}</span>
              </button>

              <button
                onClick={toggleThermalOverlay}
                className={`py-2 px-3 rounded-full font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  showThermalOverlay
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'border border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{isTr ? 'TERMAL ISI HARİTASI' : 'THERMAL OVERLAY'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
