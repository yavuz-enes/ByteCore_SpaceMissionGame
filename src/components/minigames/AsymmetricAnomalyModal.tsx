import React, { useState, useEffect } from 'react';
import { ShieldAlert, Radio, KeyRound, CheckCircle2, AlertOctagon, Send } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';

export const AsymmetricAnomalyModal: React.FC = () => {
  const {
    asymmetricAnomaly,
    myPlayerInfo,
    isMultiplayer,
    locale,
    submitAsymmetricInput,
    resolveAsymmetricAnomaly,
    sendChatMessage,
  } = useMissionStore();

  const isTr = locale === 'tr';
  const [enteredCode, setEnteredCode] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [radioSent, setRadioSent] = useState(false);

  useEffect(() => {
    if (!asymmetricAnomaly) {
      setCountdown(45);
      setEnteredCode('');
      return;
    }

    setCountdown(asymmetricAnomaly.timeRemaining || 45);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resolveAsymmetricAnomaly(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [asymmetricAnomaly, resolveAsymmetricAnomaly]);

  if (!asymmetricAnomaly) return null;

  // Determine player's station role in this asymmetric crisis
  const isDiagnosticOfficer =
    !isMultiplayer || myPlayerInfo.peerId === asymmetricAnomaly.diagnosticPeerId;
  const isResolutionOfficer =
    !isMultiplayer || myPlayerInfo.peerId === asymmetricAnomaly.resolutionPeerId;
  const isObserver = !isDiagnosticOfficer && !isResolutionOfficer;

  // Keypad Actions
  const handleDigit = (digit: string) => {
    if (enteredCode.length < 4) {
      setEnteredCode((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    setEnteredCode('');
  };

  const handleSubmit = () => {
    const success = submitAsymmetricInput(enteredCode);
    if (!success) {
      setErrorShake(true);
      setTimeout(() => {
        setErrorShake(false);
        setEnteredCode('');
      }, 700);
    }
  };

  const handleRadioTransmit = () => {
    sendChatMessage(
      isTr
        ? `🚨 [ACİL ŞİFRE] Arıza Müdahale Kodu: ${asymmetricAnomaly.passkey}`
        : `🚨 [OVERRIDE KEY] Emergency Failsafe Code: ${asymmetricAnomaly.passkey}`
    );
    setRadioSent(true);
    setTimeout(() => setRadioSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="border border-rose-500/50 bg-[#0B0F17] rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl relative">
        {/* Top Emergency Banner */}
        <div className="p-4 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase">
              {isTr ? 'EŞZAMANSIZ ÇİFT TARAFLI ACİL DURUM' : 'ASYMMETRIC FAILSAFE CRISIS'}
            </span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400">{isTr ? 'Kalan Süre' : 'Failsafe'}:</span>
            <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-bold tabular-nums text-sm">
              {countdown}s
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 font-mono text-xs">
          <div>
            <h3 className="text-white font-display font-bold text-base">{asymmetricAnomaly.title}</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">{asymmetricAnomaly.description}</p>
          </div>

          {/* ASYMMETRIC VIEW 1: DIAGNOSTIC TERMINAL (Player sees the code) */}
          {(isDiagnosticOfficer || !isMultiplayer) && (
            <div className="p-4 border border-sky-500/30 rounded-2xl bg-[#0E1422] space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sky-300 font-bold uppercase flex items-center space-x-1.5">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span>{isTr ? 'TEŞHİS TERMİNALİ (SADECE SİZ GÖRÜYORSUNUZ)' : 'DIAGNOSTIC TERMINAL (YOU HOLD THE KEY)'}</span>
                </span>
                <span className="text-[10px] text-slate-400">ENCRYPTION: BYPASS</span>
              </div>

              <div className="text-center py-2 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                  {isTr ? 'ACİL MÜDAHALE ŞİFRESİ' : 'RAW EMERGENCY PASSKEY'}
                </span>
                <div className="font-mono text-3xl font-black text-sky-400 tracking-widest bg-[#080C14] py-2 px-4 rounded-xl border border-sky-400/40 inline-block tabular-nums shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  {asymmetricAnomaly.passkey}
                </div>
                <p className="text-[11px] text-slate-300 pt-1">
                  {isMultiplayer
                    ? isTr
                      ? `Bu şifreyi sesli veya telsizden takım arkadaşınıza (${asymmetricAnomaly.resolutionRole.toUpperCase()}) iletin!`
                      : `Communicate this key to your teammate (${asymmetricAnomaly.resolutionRole.toUpperCase()}) to input on their panel!`
                    : isTr
                    ? 'Aşağıdaki müdahale tuş takımına şifreyi girin:'
                    : 'Input this passkey into the resolution keypad below:'}
                </p>
              </div>

              {isMultiplayer && (
                <div className="pt-1 text-center">
                  <button
                    onClick={handleRadioTransmit}
                    disabled={radioSent}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{radioSent ? (isTr ? 'Telsizden İletildi!' : 'Transmitted to Chat!') : (isTr ? 'Telsizle Sohbete İlet' : 'Radio Broadcast to Crew')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ASYMMETRIC VIEW 2: RESOLUTION TERMINAL (Keypad to enter the code) */}
          {(isResolutionOfficer || !isMultiplayer) && (
            <div className="p-4 border border-rose-500/30 rounded-2xl bg-[#0E1422] space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-rose-300 font-bold uppercase flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-rose-400" />
                  <span>{isTr ? 'MÜDAHALE TERMİNALİ (ŞİFRE TUŞ TAKIMI)' : 'RESOLUTION CONTROL KEYPAD'}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {isTr ? 'ŞİFRE GİZLİ' : 'CODE ENCRYPTED'}
                </span>
              </div>

              {isMultiplayer && !isDiagnosticOfficer && (
                <div className="p-2 border border-amber-500/30 rounded-xl bg-amber-500/10 text-amber-300 text-[11px] leading-relaxed">
                  ⚠️ {isTr
                    ? `Şifre sizin ekranınızda gizlidir! Teşhis Subayı (${asymmetricAnomaly.diagnosticRole.toUpperCase()}) şifreyi görür. Ondan kodu isteyin!`
                    : `Passkey is hidden here! Diagnostic Officer (${asymmetricAnomaly.diagnosticRole.toUpperCase()}) has the raw code. Ask them via voice/chat!`}
                </div>
              )}

              {/* Code Display */}
              <div className="flex justify-center">
                <div
                  className={`flex items-center space-x-3 py-2 px-6 rounded-xl border font-mono text-2xl font-bold tracking-widest tabular-nums bg-[#080C14] transition-all ${
                    errorShake ? 'border-rose-500 text-rose-400 animate-shake' : 'border-slate-700 text-white'
                  }`}
                >
                  <span>{enteredCode[0] || '_'}</span>
                  <span>{enteredCode[1] || '_'}</span>
                  <span>{enteredCode[2] || '_'}</span>
                  <span>{enteredCode[3] || '_'}</span>
                </div>
              </div>

              {/* Numeric Keypad */}
              <div className="max-w-[240px] mx-auto grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDigit(digit)}
                    className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-600 bg-[#0B0F17] hover:bg-slate-900 text-white font-mono text-base font-semibold transition-all cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-600 bg-[#0B0F17] text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  {isTr ? 'Sil' : 'CLR'}
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-600 bg-[#0B0F17] hover:bg-slate-900 text-white font-mono text-base font-semibold transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={enteredCode.length !== 4}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  {isTr ? 'GİR' : 'ENT'}
                </button>
              </div>
            </div>
          )}

          {/* OBSERVER VIEW: Neither Diag nor Res */}
          {isObserver && (
            <div className="p-6 border border-slate-800 rounded-2xl bg-[#0E1422] text-center space-y-3 font-mono">
              <span className="text-slate-400 text-xs uppercase tracking-wider block">
                {isTr ? 'MÜRETTEBAT ÇÖZÜM KOORDİNASYONU SÜRÜYOR' : 'CREW COORDINATION IN PROGRESS'}
              </span>
              <div className="flex items-center justify-center space-x-3 text-sm font-bold text-white">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {asymmetricAnomaly.diagnosticRole.toUpperCase()} (TEŞHİS)
                </span>
                <span className="text-slate-500">➔</span>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {asymmetricAnomaly.resolutionRole.toUpperCase()} (MÜDAHALE)
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isTr
                  ? 'Subaylar acil durum şifresini aktarıyor. Telemetri hatlarını açık tutun!'
                  : 'Officers are relaying the cryptographic passkey. Stand by on flight telemetry!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
