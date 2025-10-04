'use client';

import { useRef } from 'react';
import { useTimers } from '@/hooks/useTimers';
import { useKeyboardShortcuts, createTimerShortcuts } from '@/hooks/useKeyboardShortcuts';
import { TimerForm } from '@/components/TimerForm';
import { TimerList } from '@/components/TimerList';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

export default function Home() {
  const { timers, addTimer, dismissTimer, removeTimer, repeatTimer, pauseAllTimers, resumeAllTimers, resetAllTimers, pauseTimer, resumeTimer, reviveTimer, restartTimer } = useTimers();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const hasRunningTimers = timers.some(timer => timer.status === 'running');
  const hasPausedTimers = timers.some(timer => timer.status === 'paused');
  const hasActiveTimers = hasRunningTimers || hasPausedTimers;
  const hasAnyTimers = timers.length > 0;

  // Setup keyboard shortcuts
  const shortcuts = createTimerShortcuts({
    pauseAll: hasRunningTimers ? pauseAllTimers : undefined,
    resumeAll: hasPausedTimers ? resumeAllTimers : undefined,
    resetAll: hasAnyTimers ? resetAllTimers : undefined,
    focusNameInput: () => nameInputRef.current?.focus(),
  });

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" className="w-full h-full">
                <defs>
                  <radialGradient id="headerBg" cx="0.5" cy="0.3" r="0.8">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#f1f5f9"/>
                  </radialGradient>
                </defs>
                <circle cx="16" cy="16" r="15" fill="url(#headerBg)" stroke="#e2e8f0" strokeWidth="1"/>
                <circle cx="16" cy="16" r="10" fill="none" stroke="#cbd5e1" strokeWidth="1.5"/>
                <line x1="16" y1="16" x2="22" y2="10" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="2" fill="#10b981"/>
                <circle cx="16" cy="7" r="1" fill="#94a3b8"/>
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Named Timers
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Create and manage multiple named timers efficiently
          </p>
        </header>

        <div className="space-y-8">
          <TimerForm onAddTimer={addTimer} nameInputRef={nameInputRef} />

          {hasAnyTimers && (
            <div className="flex justify-center gap-3">
              {hasRunningTimers && (
                <button
                  onClick={pauseAllTimers}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 rounded-lg hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                  Pause All
                </button>
              )}
              {hasPausedTimers && (
                <button
                  onClick={resumeAllTimers}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 rounded-lg hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Resume All
                </button>
              )}
              <button
                onClick={resetAllTimers}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border border-slate-200 rounded-lg hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"/>
                </svg>
                Reset All
              </button>
            </div>
          )}

          <TimerList
            timers={timers}
            onDismiss={dismissTimer}
            onRemove={removeTimer}
            onRepeat={repeatTimer}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onRevive={reviveTimer}
            onRestart={restartTimer}
          />
        </div>

        <KeyboardShortcutsHelp />
      </div>
    </div>
  );
}
