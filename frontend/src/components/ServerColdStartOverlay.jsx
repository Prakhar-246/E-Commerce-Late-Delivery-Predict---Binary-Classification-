import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  RefreshCw,
  Server,
  Activity,
  ArrowRight
} from 'lucide-react';

const ESTIMATED_TOTAL_SECONDS = 35;

const DID_YOU_KNOW = [
  "?? Model Threshold: Tuned to 0.20 to catch 86.6% of all late delivery risks ahead of time.",
  "? Instant Subsequent Runs: Once awake, all future predictions execute in under 150ms.",
  "?? Route Intelligence: Auto-computes real road distances between 10 major Indian logistics hubs.",
  "?? Fleet & Warehouse: Analyzes 21 signals including warehouse staff density and vehicle types.",
  "?? Velocity Check: Computes real-time transit pace (km/h) to flag impossible delivery windows."
];

export default function ServerColdStartOverlay({ 
  isConnected, 
  onRetry 
}) {
  const [elapsed, setElapsed] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [justConnected, setJustConnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Timer for elapsed seconds
  useEffect(() => {
    if (isConnected) {
      setJustConnected(true);
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 1800);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Rotate trivia every 6 seconds
  useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(() => {
      setTriviaIndex((prev) => (prev + 1) % DID_YOU_KNOW.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isConnected]);

  if (dismissed) return null;

  // Calculate percentage (reaches 92% at 35s, then crawls until connected)
  const progressPercent = isConnected 
    ? 100 
    : Math.min(Math.round((elapsed / ESTIMATED_TOTAL_SECONDS) * 92), 96);

  const remainingSeconds = Math.max(ESTIMATED_TOTAL_SECONDS - elapsed, 3);

  // Milestones status
  const isStep1Done = elapsed >= 5 || isConnected;
  const isStep2Done = elapsed >= 16 || isConnected;
  const isStep3Done = elapsed >= 28 || isConnected;
  const isStep4Done = isConnected;

  // Minimized Floating Pill
  if (isMinimized && !justConnected) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce-subtle">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-full border border-indigo-500/40 shadow-xl text-xs">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>
          <span className="font-medium text-slate-200">
            Waking AI Engine: <strong className="text-indigo-300">~{remainingSeconds}s</strong> ({progressPercent}%)
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Expand Full Status"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              <Zap className="w-3 h-3 text-indigo-400" />
              Free Cloud Warmup
            </span>
          </div>
          {!justConnected && (
            <button
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Explore Form</span>
            </button>
          )}
        </div>

        {/* Header Content */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 mb-1">
            {justConnected ? (
              <CheckCircle2 className="w-8 h-8 text-white animate-scale-in" />
            ) : (
              <Cpu className="w-7 h-7 animate-pulse text-white" />
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {justConnected ? 'AI Inference Engine Online! ?' : 'Waking Up Delivery Risk Model'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {justConnected 
              ? 'FastAPI & HistGradientBoosting model are fully calibrated and ready.'
              : 'Render free-tier cloud instances sleep when idle. Your AI container is spinning up now.'}
          </p>
        </div>

        {/* Progress & Countdown Section */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Estimated Wait Time
            </span>
            <span className="font-mono font-bold text-indigo-300 text-sm">
              {justConnected ? 'Ready!' : `~${remainingSeconds}s remaining (${progressPercent}%)`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                justConnected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-md shadow-indigo-500/50'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Elapsed: {elapsed}s</span>
            <span>Target: ~{ESTIMATED_TOTAL_SECONDS}s</span>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="space-y-2 mb-6">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Inference Pipeline Initialization:
          </div>

          {/* Step 1 */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
            isStep1Done 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              {isStep1Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              )}
              <span>1. Contacting Render Cloud Node</span>
            </div>
            <span className="text-[10px] font-mono">{isStep1Done ? 'Active' : 'Pending'}</span>
          </div>

          {/* Step 2 */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
            isStep2Done 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : elapsed >= 5 
                ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200' 
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              {isStep2Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : elapsed >= 5 ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
              )}
              <span>2. Booting Python 3.11 Runtime & FastAPI</span>
            </div>
            <span className="text-[10px] font-mono">{isStep2Done ? 'Ready' : elapsed >= 5 ? 'Booting' : 'Waiting'}</span>
          </div>

          {/* Step 3 */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
            isStep3Done 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : elapsed >= 16 
                ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200' 
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              {isStep3Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : elapsed >= 16 ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
              )}
              <span>3. Deserializing HistGradientBoosting Model (21 Features)</span>
            </div>
            <span className="text-[10px] font-mono">{isStep3Done ? 'Loaded' : elapsed >= 16 ? 'Loading' : 'Waiting'}</span>
          </div>

          {/* Step 4 */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
            isStep4Done 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold shadow-sm'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              {isStep4Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
              )}
              <span>4. Operating Threshold (0.20) Synchronized</span>
            </div>
            <span className="text-[10px] font-mono">{isStep4Done ? 'ONLINE ?' : 'Standby'}</span>
          </div>
        </div>

        {/* Trivia / While You Wait Card */}
        <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/50 border border-indigo-500/20 rounded-2xl p-3.5 mb-4 text-xs text-indigo-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
              Project Architecture Highlight
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px] min-h-[32px] transition-all">
              {DID_YOU_KNOW[triviaIndex]}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status Now</span>
          </button>

          {!justConnected && (
            <button
              onClick={() => setIsMinimized(true)}
              className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Explore Form While Waiting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
