'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Timer } from '@/types/timer';
import { audioManager } from '@/utils/audioUtils';
import { saveTimersToStorage, loadTimersFromStorage, saveGlobalPauseState, loadGlobalPauseState } from '@/utils/storageUtils';
import {
  updateAllTimersWithCurrentTime,
  createRunningTimer,
  pauseTimer as pauseTimerUtil,
  resumeTimer as resumeTimerUtil,
  resetTimer as resetTimerUtil
} from '@/utils/timerCalculations';

export const useTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [isGloballyPaused, setIsGloballyPaused] = useState<boolean>(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  const completedTimersRef = useRef<Set<string>>(new Set());

  // Update all timers based on current time - runs every 100ms for smooth updates
  const updateTimers = useCallback(() => {
    setTimers(currentTimers => {
      const updatedTimers = updateAllTimersWithCurrentTime(currentTimers);

      // Check for newly completed timers and start audio alerts
      updatedTimers.forEach(timer => {
        if (timer.status === 'completed' && !completedTimersRef.current.has(timer.id)) {
          completedTimersRef.current.add(timer.id);
          audioManager.startContinuousAlert(timer.id);
          console.log('Timer completed:', timer.name);
        }
      });

      return updatedTimers;
    });
  }, []);

  // Start the global update loop
  const startUpdateLoop = useCallback(() => {
    if (updateIntervalRef.current) return;

    updateIntervalRef.current = setInterval(updateTimers, 100); // Update every 100ms for smooth UI
    console.log('Timer update loop started');
  }, [updateTimers]);

  // Stop the global update loop
  const stopUpdateLoop = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
      console.log('Timer update loop stopped');
    }
  }, []);

  // Initialize timers from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;

    const savedTimers = loadTimersFromStorage();
    const savedGlobalPause = loadGlobalPauseState();

    if (savedTimers.length > 0) {
      // Update timers based on elapsed time since last save
      const updatedTimers = updateAllTimersWithCurrentTime(savedTimers);
      setTimers(updatedTimers);

      // Track already completed timers and start their alerts
      updatedTimers.forEach(timer => {
        if (timer.status === 'completed') {
          completedTimersRef.current.add(timer.id);
          audioManager.startContinuousAlert(timer.id);
        }
      });

      // Start update loop if there are any active timers
      const hasActiveTimers = updatedTimers.some(t => t.status === 'running' || t.status === 'paused');
      if (hasActiveTimers) {
        startUpdateLoop();
      }
    }

    setIsGloballyPaused(savedGlobalPause);
    isInitialized.current = true;
  }, [startUpdateLoop]);

  const addTimer = useCallback((name: string, durationInSeconds: number) => {
    const timer = createRunningTimer(crypto.randomUUID(), name, durationInSeconds);

    setTimers(prev => [...prev, timer]);

    // Start the update loop if it's not already running
    startUpdateLoop();
  }, [startUpdateLoop]);

  const dismissTimer = useCallback((id: string) => {
    // Stop the continuous audio alert
    audioManager.stopContinuousAlert(id);

    setTimers(prev => prev.map(timer =>
      timer.id === id ? { ...timer, status: 'dismissed' as const } : timer
    ));

    // Remove from completed timers tracking
    completedTimersRef.current.delete(id);
  }, []);

  const removeTimer = useCallback((id: string) => {
    // Stop the continuous audio alert
    audioManager.stopContinuousAlert(id);

    setTimers(prev => {
      const filteredTimers = prev.filter(timer => timer.id !== id);

      // Stop update loop if no active timers remain
      const hasActiveTimers = filteredTimers.some(t => t.status === 'running' || t.status === 'paused');
      if (!hasActiveTimers) {
        stopUpdateLoop();
      }

      return filteredTimers;
    });

    // Remove from completed timers tracking
    completedTimersRef.current.delete(id);
  }, [stopUpdateLoop]);

  const repeatTimer = useCallback((id: string) => {
    // Stop the continuous audio alert
    audioManager.stopContinuousAlert(id);

    setTimers(prev => prev.map(timer =>
      timer.id === id ? resetTimerUtil(timer) : timer
    ));

    // Remove from completed timers tracking so it can complete again
    completedTimersRef.current.delete(id);

    // Ensure update loop is running
    startUpdateLoop();
  }, [startUpdateLoop]);

  const pauseAllTimers = useCallback(() => {
    setTimers(prev => prev.map(timer =>
      timer.status === 'running' ? pauseTimerUtil(timer) : timer
    ));

    setIsGloballyPaused(true);
  }, []);

  const resumeAllTimers = useCallback(() => {
    setTimers(prev => prev.map(timer =>
      timer.status === 'paused' ? resumeTimerUtil(timer) : timer
    ));

    setIsGloballyPaused(false);
    startUpdateLoop(); // Ensure update loop is running
  }, [startUpdateLoop]);

  const resetAllTimers = useCallback(() => {
    // Stop all audio alerts and clear completed tracking
    setTimers(prev => {
      prev.forEach(timer => {
        if (timer.status === 'completed') {
          audioManager.stopContinuousAlert(timer.id);
          completedTimersRef.current.delete(timer.id);
        }
      });

      // Reset ALL timers, including dismissed ones
      const resetTimers = prev.map(timer => resetTimerUtil(timer));

      return resetTimers;
    });

    setIsGloballyPaused(false);
    startUpdateLoop(); // Ensure update loop is running
  }, [startUpdateLoop]);

  const pauseTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === id && timer.status === 'running'
        ? pauseTimerUtil(timer)
        : timer
    ));
  }, []);

  const resumeTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === id && timer.status === 'paused'
        ? resumeTimerUtil(timer)
        : timer
    ));

    startUpdateLoop(); // Ensure update loop is running
  }, [startUpdateLoop]);

  const reviveTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === id && timer.status === 'dismissed'
        ? resetTimerUtil(timer)
        : timer
    ));

    startUpdateLoop(); // Ensure update loop is running
  }, [startUpdateLoop]);

  const restartTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === id && timer.status === 'paused'
        ? resetTimerUtil(timer)
        : timer
    ));

    startUpdateLoop(); // Ensure update loop is running
  }, [startUpdateLoop]);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    if (isInitialized.current) {
      saveTimersToStorage(timers);
    }
  }, [timers]);

  // Save global pause state whenever it changes
  useEffect(() => {
    if (isInitialized.current) {
      saveGlobalPauseState(isGloballyPaused);
    }
  }, [isGloballyPaused]);

  // Handle visibility changes to ensure accurate timing when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, updating timers');
        updateTimers(); // Force immediate update when tab becomes visible
      }
    };

    const handleFocus = () => {
      console.log('Window focused, updating timers');
      updateTimers(); // Force immediate update when window regains focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateTimers]);

  // Manage update loop based on active timers
  useEffect(() => {
    const hasActiveTimers = timers.some(t => t.status === 'running' || t.status === 'paused');

    if (hasActiveTimers && !updateIntervalRef.current) {
      startUpdateLoop();
    } else if (!hasActiveTimers && updateIntervalRef.current) {
      stopUpdateLoop();
    }
  }, [timers, startUpdateLoop, stopUpdateLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopUpdateLoop();
      audioManager.cleanup();
    };
  }, [stopUpdateLoop]);

  return {
    timers,
    addTimer,
    dismissTimer,
    removeTimer,
    repeatTimer,
    pauseAllTimers,
    resumeAllTimers,
    resetAllTimers,
    pauseTimer,
    resumeTimer,
    reviveTimer,
    restartTimer,
  };
};