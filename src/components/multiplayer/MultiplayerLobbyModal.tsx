import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Target,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { PlayerRole, MissionStationRole } from '../../types/mission';
import { TRANSLATIONS } from '../../i18n/translations';
import { getLocalizedScenarios, TARGET_TRANSLATIONS } from '../../i18n/missionsLocale';

const ROLE_AVATARS: Record<MissionStationRole, string> = {
  commander: './flight-kit/avatar-commander-hd.webp',
  engineer: './flight-kit/avatar-engineer.png',
  scientist: './flight-kit/avatar-scientist.png',
  comms: './flight-kit/avatar-comms.png',
};

const DESTINATION_ARTWORK: Record<string, string> = {
  'lunar-recon': './flight-kit/scenario-moon-shackleton.webp',
  'mars-recon': './flight-kit/scenario-mars-valles.webp',
  'mars-sample': './flight-kit/scenario-mars-valles.webp',
  'europa-recon': './flight-kit/scenario-europa-ice.webp',
  'europa-ice': './flight-kit/scenario-europa-ice.webp',
  'europa-explorer': './flight-kit/scenario-europa-ice.webp',
  'asteroid-scout': './flight-kit/scenario-asteroid-psyche.webp',
};

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isMultiplayer,
    isHost,
    roomCode,
    destinations,
    players,
    myPlayerInfo,
    isConnecting,
    connectionError,
    createRoom,
    joinRoom,
    leaveRoom,
    claimRole,
    toggleReady,
    chatMessages,
    sendChatMessage,
    locale,
  } = useMissionStore();

  const t = TRANSLATIONS[locale].multiplayer;
  const roleT = TRANSLATIONS[locale].roles;
  const isTr = locale === 'tr';
  const scenarios = getLocalizedScenarios(locale);

  const [activeTab, setActiveTab] = useState<'lobby' | 'campaign'>('lobby');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [inputPlayerName, setInputPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('commander');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const code = (inputRoomCode || Math.random().toString(36).substring(2, 8)).toUpperCase();
    await createRoom(code, inputPlayerName || 'Flight Commander', selectedRole);
  };

  const handleJoin = async () => {
    if (!inputRoomCode.trim()) return;
    await joinRoom(inputRoomCode.trim(), inputPlayerName || 'Controller', selectedRole);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0E1422] border border-white/10 rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0B0F17]">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              {t.title}
            </h3>
            <p className="text-slate-400 text-xs font-mono">
              {t.sub}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isMultiplayer ? (
            /* Join / Create Screen */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Box 1: Host Room */}
              <div className="space-y-4 pr-0 md:pr-6">
                <div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {t.hostTitle}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {t.hostDesc}
                  </p>

                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">{t.callsign}:</label>
                      <input
                        type="text"
                        value={inputPlayerName}
                        onChange={(e) => setInputPlayerName(e.target.value)}
                        placeholder={t.callsignPlaceholder}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">{t.duty}:</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as PlayerRole)}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                      >
                        <option value="commander">{roleT.commander.title}</option>
                        <option value="engineer">{roleT.engineer.title}</option>
                        <option value="scientist">{roleT.scientist.title}</option>
                        <option value="comms">{roleT.comms.title}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">{t.roomCode}:</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={inputRoomCode}
                        onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                        placeholder={t.autoCodePlaceholder}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white uppercase focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isConnecting}
                    onClick={handleCreate}
                    className="w-full py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    {isConnecting ? t.establishing : t.createBtn}
                  </button>
                </div>
              </div>

              {/* Box 2: Join Existing Room */}
              <div className="space-y-4 pt-6 md:pt-0 pl-0 md:pl-6">
                <div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {t.joinTitle}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {t.joinDesc}
                  </p>

                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">{t.roomCode}:</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={inputRoomCode}
                        onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                        placeholder={t.roomCodePlaceholder}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-sm text-white uppercase font-bold tracking-widest focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">{t.callsign}:</label>
                      <input
                        type="text"
                        value={inputPlayerName}
                        onChange={(e) => setInputPlayerName(e.target.value)}
                        placeholder={t.clientCallsignPlaceholder}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">{t.duty}:</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as PlayerRole)}
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                      >
                        <option value="engineer">{roleT.engineer.title}</option>
                        <option value="scientist">{roleT.scientist.title}</option>
                        <option value="comms">{roleT.comms.title}</option>
                        <option value="commander">{roleT.commander.title}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isConnecting || !inputRoomCode.trim()}
                    onClick={handleJoin}
                    className="w-full py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    {isConnecting ? t.connecting : t.connectBtn}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Multiplayer Room Dashboard */
            <div className="space-y-6">
              {/* Room Code & Info Banner */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B0F17]">
                <div className="flex items-center space-x-3">
                  <div className="border border-slate-700 rounded-full px-3.5 py-1.5 font-mono text-sm tracking-widest text-white font-bold flex items-center space-x-2">
                    <span className="text-slate-400 font-normal">{t.code}:</span>
                    <span className="text-white">{roomCode}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                    title="Copy Room Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    {isHost ? t.hostRole : t.clientRole}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleReady}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                      myPlayerInfo.isReady
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {myPlayerInfo.isReady ? t.readyGo : t.readyBtn}
                  </button>

                  <button
                    onClick={leaveRoom}
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                  >
                    {t.leaveBtn}
                  </button>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center space-x-4 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('lobby')}
                  className={`text-xs font-mono transition-colors uppercase font-semibold cursor-pointer ${
                    activeTab === 'lobby'
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.crewStations} ({players.length}/4)
                </button>
                <button
                  onClick={() => setActiveTab('campaign')}
                  className={`text-xs font-mono transition-colors uppercase font-semibold cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'campaign'
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isTr ? 'SEFER PLANI & ROLLER' : 'CAMPAIGN FLIGHT PLAN & ROLES'}</span>
                  {destinations.length > 1 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {destinations.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'lobby' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Crew Station Slots */}
                  <div className="space-y-2 font-mono text-xs">
                    {(['commander', 'engineer', 'scientist', 'comms'] as MissionStationRole[]).map((role) => {
                      const assigned = players.find((p) => p.role === role);

                      return (
                        <div
                          key={role}
                          className={`p-3.5 border rounded-2xl overflow-hidden flex items-center justify-between ${
                            assigned
                              ? 'border-slate-800 bg-[#0B0F17]'
                              : 'border-slate-800/60 border-dashed bg-[#0B0F17]/40'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={assigned?.name.includes('Co-Pilot') ? './flight-kit/avatar-copilot-ai-hd.webp' : ROLE_AVATARS[role]}
                              alt={roleT[role].name}
                              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                            />
                            <div>
                              <div className="text-white font-bold uppercase">{roleT[role].name}</div>
                              <div className="text-slate-400 text-[11px]">
                                {assigned ? assigned.name : t.consoleUncrewed}
                              </div>
                            </div>
                          </div>

                          <div>
                            {assigned ? (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  assigned.isReady
                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                                    : 'border border-slate-700 text-slate-400'
                                }`}
                              >
                                {assigned.isReady ? 'GO' : t.standby}
                              </span>
                            ) : (
                              <button
                                onClick={() => claimRole(role)}
                                className="px-3 py-1 rounded-full border border-slate-700 text-[11px] text-slate-300 hover:text-white hover:border-slate-500 cursor-pointer"
                              >
                                {t.takeStation}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Real-time Crew Comms Chat */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden p-3.5 flex flex-col h-[280px] bg-[#0B0F17]">
                    <div className="text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-white">{t.voiceChat}</span>
                      <span className="text-emerald-400 font-medium">{t.secureFreq}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 text-xs font-mono">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="p-2.5 border border-slate-800 rounded-2xl overflow-hidden bg-[#0E1422]">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <strong className="text-white uppercase">{msg.senderName}</strong>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex space-x-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={t.typeMsg}
                        className="flex-1 bg-[#0E1422] border border-slate-700 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Campaign Flight Plan & Role Authority Tab */
                <div className="space-y-4 font-mono text-xs">
                  {/* Autonomous Authority Notice */}
                  <div className="p-3.5 border border-white/10 rounded-2xl overflow-hidden bg-[#0B0F17] flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-white">
                        {isTr ? 'OTONOM İSTASYON YETKİSİ' : 'AUTONOMOUS ROLE AUTHORITY'}:
                      </strong>{' '}
                      {isTr
                        ? 'Her rol uzmanı (Mühendis, Bilimci, Haberleşme, Komutan) kendi alt sistemlerini beklemeden ve oylama gerekmeden doğrudan anında değiştirebilir. Değişiklikler PeerJS ağı üzerinden tüm ekibe eşzamanlı aktarılır.'
                        : 'Specialists have immediate write access to their own station parameters without team voting or consensus delays. Changes sync instantly across the PeerJS network.'}
                    </div>
                  </div>

                  {/* Multi-Destination Campaign Sequence */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden p-4 bg-[#0B0F17] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-white uppercase flex items-center space-x-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span>{isTr ? 'Uçuş Seferi Hedef Sıralaması' : 'Expedition Campaign Queue'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {destinations.length} {isTr ? 'Aşama Belirlendi' : 'Stage(s) Configured'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {destinations.map((destId, idx) => {
                        const sc = scenarios.find((s) => s.id === destId);
                        const targetName = sc ? (TARGET_TRANSLATIONS[locale][sc.target] || sc.target) : destId;

                        return (
                          <div
                            key={destId}
                            className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0E1422] flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#080C14]">
                                <img
                                  src={DESTINATION_ARTWORK[destId] || './flight-kit/card-moon-shackleton.webp'}
                                  alt={sc?.name || destId}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-bold text-sky-400">#{idx + 1}</span>
                                  <h5 className="font-display font-medium text-white text-sm">
                                    {sc?.name || destId}
                                  </h5>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {isTr ? 'Hedef Cisim' : 'Target'}: <strong className="text-slate-200">{targetName}</strong> • {isTr ? 'Radyasyon' : 'Radiation'}: {sc?.radiationLevel}
                                </div>
                              </div>
                            </div>

                            <div className="text-right text-[11px] tabular-nums">
                              <div className="text-white font-medium">
                                Δv: {sc?.requiredDeltaV.toLocaleString()} m/s
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                {isTr ? 'Bütçe' : 'Budget'}: ${sc?.initialBudget}M
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Isolated Station Responsibilities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] space-y-1">
                      <div className="font-bold text-sky-300 uppercase">
                        {roleT.engineer.title}
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {isTr
                          ? 'Gövde (Bus), itki motorları, güneş panelleri, bataryalar ve TVAC / titreşim testleri üzerinde doğrudan yazma yetkisi.'
                          : 'Direct write authority over bus chassis, thrusters, solar arrays, batteries, and vibration/TVAC test qualifications.'}
                      </p>
                    </div>

                    <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] space-y-1">
                      <div className="font-bold text-sky-300 uppercase">
                        {roleT.scientist.title}
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {isTr
                          ? 'Bilimsel aygıt seçimi, kütle takasları ve görev hedefi bilim puanı eşiği üzerinde doğrudan yazma yetkisi.'
                          : 'Direct write authority over science instrument suite, sensor trade-offs, and mission science target thresholds.'}
                      </p>
                    </div>

                    <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] space-y-1">
                      <div className="font-bold text-sky-300 uppercase">
                        {roleT.comms.title}
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {isTr
                          ? 'Yüksek kazançlı antenler, DSN yer istasyonları ve veri indirme hızı darboğazları üzerinde doğrudan yazma yetkisi.'
                          : 'Direct write authority over antenna arrays, Deep Space Network stations, and telemetry downlink bandwidth.'}
                      </p>
                    </div>

                    <div className="p-3 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B0F17] space-y-1">
                      <div className="font-bold text-sky-300 uppercase">
                        {roleT.commander.title}
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {isTr
                          ? 'Yörünge profili seçimi, fırlatma roketi tahsisi ve terminal geri sayım başlatma yetkisi.'
                          : 'Direct write authority over orbital trajectory selection, launch vehicle assignment, and flight countdown initiation.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {connectionError && (
            <div className="border border-rose-500/30 rounded-2xl overflow-hidden p-3 text-xs text-rose-300 font-mono bg-[#0B0F17]">
              {connectionError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
