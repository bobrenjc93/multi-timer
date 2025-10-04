import { Timer } from '@/types/timer';

const TIMERS_STORAGE_KEY = 'named-timers-state';
const GLOBAL_PAUSE_KEY = 'named-timers-global-pause';

export interface TimerState {
  timers: Timer[];
  lastSaved: number;
}

export const saveTimersToStorage = (timers: Timer[]): void => {
  try {
    const state: TimerState = {
      timers,
      lastSaved: Date.now(),
    };
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save timers to localStorage:', error);
  }
};

export const loadTimersFromStorage = (): Timer[] => {
  try {
    const stored = localStorage.getItem(TIMERS_STORAGE_KEY);
    if (!stored) return [];

    const state: TimerState = JSON.parse(stored);
    if (!state.timers || !Array.isArray(state.timers)) return [];

    const now = Date.now();
    const timeSinceLastSave = Math.floor((now - state.lastSaved) / 1000);

    // Update remaining time for running timers based on elapsed time
    const updatedTimers = state.timers.map(timer => {
      if (timer.status === 'running' && timer.remainingTime > 0) {
        const newRemainingTime = Math.max(0, timer.remainingTime - timeSinceLastSave);

        // If timer would have completed while away, mark as completed
        if (newRemainingTime === 0) {
          return { ...timer, remainingTime: 0, status: 'completed' as const };
        }

        return { ...timer, remainingTime: newRemainingTime };
      }
      return timer;
    });

    return updatedTimers;
  } catch (error) {
    console.warn('Failed to load timers from localStorage:', error);
    return [];
  }
};

export const saveGlobalPauseState = (isGloballyPaused: boolean): void => {
  try {
    localStorage.setItem(GLOBAL_PAUSE_KEY, JSON.stringify(isGloballyPaused));
  } catch (error) {
    console.warn('Failed to save global pause state:', error);
  }
};

export const loadGlobalPauseState = (): boolean => {
  try {
    const stored = localStorage.getItem(GLOBAL_PAUSE_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.warn('Failed to load global pause state:', error);
    return false;
  }
};

export const clearTimerStorage = (): void => {
  try {
    localStorage.removeItem(TIMERS_STORAGE_KEY);
    localStorage.removeItem(GLOBAL_PAUSE_KEY);
  } catch (error) {
    console.warn('Failed to clear timer storage:', error);
  }
};