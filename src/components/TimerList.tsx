'use client';

import { Timer } from '@/types/timer';
import { TimerItem } from './TimerItem';

interface TimerListProps {
  timers: Timer[];
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
  onRepeat: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRevive: (id: string) => void;
  onRestart: (id: string) => void;
}

export const TimerList = ({ timers, onDismiss, onRemove, onRepeat, onPause, onResume, onRevive, onRestart }: TimerListProps) => {
  if (timers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-muted-foreground rounded-full border-t-transparent animate-spin"
               style={{ animationDuration: '3s' }} />
        </div>
        <div className="text-foreground text-lg font-medium mb-2">No timers yet</div>
        <div className="text-muted-foreground text-sm">Create your first timer above to get started</div>
      </div>
    );
  }

  // Sort timers: completed first (to get attention), then running, then paused, then dismissed
  const sortedTimers = [...timers].sort((a, b) => {
    const statusOrder = { completed: 0, running: 1, paused: 2, dismissed: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const activeCount = timers.filter(t => t.status !== 'dismissed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">
          Active Timers
        </h2>
        <span className="text-sm text-muted-foreground">
          {activeCount} active
        </span>
      </div>
      {sortedTimers.map((timer) => (
        <TimerItem
          key={timer.id}
          timer={timer}
          onDismiss={onDismiss}
          onRemove={onRemove}
          onRepeat={onRepeat}
          onPause={onPause}
          onResume={onResume}
          onRevive={onRevive}
          onRestart={onRestart}
        />
      ))}
    </div>
  );
};