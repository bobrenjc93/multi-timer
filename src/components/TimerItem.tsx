'use client';

import { useEffect } from 'react';
import { Timer } from '@/types/timer';
import { formatTime } from '@/utils/timeUtils';

interface TimerItemProps {
  timer: Timer;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
  onRepeat: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRevive: (id: string) => void;
  onRestart: (id: string) => void;
}

export const TimerItem = ({ timer, onDismiss, onRemove, onRepeat, onPause, onResume, onRevive, onRestart }: TimerItemProps) => {
  // Add keyboard shortcuts for individual timer actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not focusing on input elements
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Use timer name's first letter + modifier key for quick actions
      const timerKey = timer.name.charAt(0).toLowerCase();

      if (event.key.toLowerCase() === timerKey && event.altKey) {
        event.preventDefault();

        if (timer.status === 'running') {
          onPause(timer.id);
        } else if (timer.status === 'paused') {
          onResume(timer.id);
        } else if (timer.status === 'completed') {
          onRepeat(timer.id);
        } else if (timer.status === 'dismissed') {
          onRevive(timer.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [timer, onPause, onResume, onRepeat, onRevive]);
  const getStatusColor = () => {
    switch (timer.status) {
      case 'running':
        return 'border-l-success';
      case 'paused':
        return 'border-l-amber-500';
      case 'completed':
        return 'border-l-destructive timer-completed';
      case 'dismissed':
        return 'border-l-muted-foreground opacity-60';
      default:
        return 'border-l-border';
    }
  };

  const getStatusBadge = () => {
    switch (timer.status) {
      case 'running':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20">
            Running
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            Completed
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border">
            Dismissed
          </span>
        );
      default:
        return null;
    }
  };

  const getTimeColor = () => {
    switch (timer.status) {
      case 'running':
        return 'text-success';
      case 'paused':
        return 'text-amber-600';
      case 'completed':
        return 'text-destructive';
      case 'dismissed':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={`bg-background border border-l-4 rounded-lg p-4 transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-foreground truncate">
              {timer.name}
            </h3>
            {getStatusBadge()}
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-mono font-semibold tabular-nums ${getTimeColor()}`}>
              {formatTime(timer.remainingTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-wrap">
          {timer.status === 'running' && (
            <button
              onClick={() => onPause(timer.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors text-sm font-medium"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
              Pause
            </button>
          )}

          {timer.status === 'paused' && (
            <>
              <button
                onClick={() => onResume(timer.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors text-sm font-medium"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Resume
              </button>
              <button
                onClick={() => onRestart(timer.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm font-medium"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"/>
                </svg>
                Restart
              </button>
            </>
          )}

          {timer.status === 'completed' && (
            <>
              <button
                onClick={() => onRepeat(timer.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-md hover:bg-success/20 focus:outline-none focus:ring-2 focus:ring-success/20 transition-colors text-sm font-medium"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"/>
                </svg>
                Repeat
              </button>
              <button
                onClick={() => onDismiss(timer.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive/20 transition-colors text-sm font-medium"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Dismiss
              </button>
            </>
          )}

          {timer.status === 'dismissed' && (
            <button
              onClick={() => onRevive(timer.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm font-medium"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"/>
              </svg>
              Revive
            </button>
          )}

          <button
            onClick={() => onRemove(timer.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded-md transition-colors"
            title="Remove timer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {(timer.status === 'running' || timer.status === 'paused') && (
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timer.status === 'running' ? 'bg-success' : 'bg-amber-500'
              }`}
              style={{
                width: `${((timer.duration - timer.remainingTime) / timer.duration) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};