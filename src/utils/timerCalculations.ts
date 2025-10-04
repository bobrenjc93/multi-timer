import { Timer } from '@/types/timer';

/**
 * Calculate the current remaining time for a timer based on timestamps
 * This approach is immune to browser tab throttling
 */
export const calculateRemainingTime = (timer: Timer, currentTime: number = Date.now()): number => {
  if (timer.status !== 'running' || !timer.finishesAt) {
    return timer.remainingTime;
  }

  // Calculate remaining time until finish
  const remainingMilliseconds = timer.finishesAt - currentTime;
  const remainingSeconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));

  return remainingSeconds;
};

/**
 * Update a timer with calculated remaining time and status
 */
export const updateTimerWithCurrentTime = (timer: Timer, currentTime: number = Date.now()): Timer => {
  if (timer.status !== 'running') {
    return timer;
  }

  const newRemainingTime = calculateRemainingTime(timer, currentTime);

  if (newRemainingTime <= 0) {
    return {
      ...timer,
      remainingTime: 0,
      status: 'completed' as const,
      finishesAt: undefined
    };
  }

  return {
    ...timer,
    remainingTime: newRemainingTime
  };
};

/**
 * Update all timers with current time calculations
 */
export const updateAllTimersWithCurrentTime = (timers: Timer[], currentTime: number = Date.now()): Timer[] => {
  return timers.map(timer => updateTimerWithCurrentTime(timer, currentTime));
};

/**
 * Create a new running timer with proper timestamps
 */
export const createRunningTimer = (id: string, name: string, durationInSeconds: number): Timer => {
  const now = Date.now();
  return {
    id,
    name,
    duration: durationInSeconds,
    remainingTime: durationInSeconds,
    status: 'running',
    createdAt: now,
    finishesAt: now + (durationInSeconds * 1000)
  };
};

/**
 * Pause a timer and record the pause timestamp
 */
export const pauseTimer = (timer: Timer): Timer => {
  if (timer.status !== 'running') {
    return timer;
  }

  const now = Date.now();
  const updatedTimer = updateTimerWithCurrentTime(timer, now);

  return {
    ...updatedTimer,
    status: 'paused',
    pausedAt: now,
    finishesAt: undefined
  };
};

/**
 * Resume a paused timer
 */
export const resumeTimer = (timer: Timer): Timer => {
  if (timer.status !== 'paused') {
    return timer;
  }

  const now = Date.now();
  return {
    ...timer,
    status: 'running',
    finishesAt: now + (timer.remainingTime * 1000),
    pausedAt: undefined
  };
};

/**
 * Reset a timer to its original duration
 */
export const resetTimer = (timer: Timer): Timer => {
  const now = Date.now();
  return {
    ...timer,
    remainingTime: timer.duration,
    status: 'running',
    finishesAt: now + (timer.duration * 1000),
    pausedAt: undefined
  };
};