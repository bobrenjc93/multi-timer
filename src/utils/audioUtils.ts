class AudioNotificationManager {
  private audioContext: AudioContext | null = null;
  private oscillatorIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized: boolean = false;
  private pendingAlerts: Set<string> = new Set();
  private fallbackAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudio();
    }
  }

  private initializeAudio() {
    try {
      // @ts-ignore - handling browser compatibility
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Set up user interaction handler
      this.setupUserInteractionHandler();

      console.log('Audio context created:', this.audioContext.state);
    } catch (error) {
      console.warn('Web Audio API not supported, trying fallback audio');
      this.initializeFallbackAudio();
    }
  }

  private initializeFallbackAudio() {
    try {
      // Create a data URL for a simple beep sound
      const audioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTmS1/LNeSsFJH7H8N+QQAoRXrPp6KlYFQlAmN/zuGEiBjiS2e/NeSsFJH7H8N+QQwoRXbTo6KlYFQlBl9/zuGEiBziS2e/NeSsFJH7H8N+QQwkQXrPo6KlYFQlBl9/zuGEiBziS2e/NeSsFJH7H8N+QQwkQXrPo6KlYFQlBl9/zuGEiBziS2e/NeSsFJH7H8N+QQwkQXrPo6KlYFQlBl9/zuGEiBjiS2e/NeSsFJH7H8N+QQwkQXrPo6KlYFQlBl9/zuGEiBjiS2e/NeSsFJH7H8N+QQwkQXrPo6Kh';

      this.fallbackAudio = new Audio(audioData);
      this.fallbackAudio.volume = 0.3;
      console.log('Fallback audio initialized');
    } catch (error) {
      console.warn('Fallback audio also failed, timer sounds will be silent');
    }
  }

  private setupUserInteractionHandler() {
    if (!this.audioContext) return;

    const resumeAudio = async () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('Audio context resumed from', this.audioContext.state);
          this.isInitialized = true;

          // Start any pending alerts
          for (const timerId of this.pendingAlerts) {
            this.startContinuousAlert(timerId);
          }
          this.pendingAlerts.clear();

        } catch (error) {
          console.warn('Failed to resume audio context:', error);
        }
      } else if (this.audioContext && this.audioContext.state === 'running') {
        this.isInitialized = true;
        console.log('Audio context already running');
      }

      // Remove the listeners after first successful interaction
      if (this.isInitialized) {
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('keydown', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
        document.removeEventListener('focus', resumeAudio);
        window.removeEventListener('focus', resumeAudio);
      }
    };

    // Add multiple event listeners for better coverage
    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    document.addEventListener('focus', resumeAudio);
    window.addEventListener('focus', resumeAudio);

    // Also try to initialize immediately if possible
    resumeAudio();
  }

  private async playBeep() {
    // Try Web Audio API first
    if (this.audioContext) {
      try {
        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
          console.log('Attempting to resume suspended audio context');
          await this.audioContext.resume();
        }

        if (this.audioContext.state === 'running') {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          // Create a more prominent notification sound
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);

          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.4);

          console.log('Web Audio beep played successfully');
          return true;
        } else {
          console.warn('Audio context not running, state:', this.audioContext.state);
        }
      } catch (error) {
        console.warn('Web Audio API failed:', error);
      }
    }

    // Fallback to HTML5 Audio
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.currentTime = 0;
        const playPromise = this.fallbackAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        console.log('Fallback audio beep played successfully');
        return true;
      } catch (error) {
        console.warn('Fallback audio failed:', error);
      }
    }

    console.warn('No audio method available');
    return false;
  }

  startContinuousAlert(timerId: string) {
    console.log('Starting continuous alert for timer:', timerId);

    // Don't start if already playing
    if (this.oscillatorIntervals.has(timerId)) {
      console.log('Alert already playing for timer:', timerId);
      return;
    }

    // Check if audio context is ready
    if (!this.audioContext || this.audioContext.state === 'suspended') {
      console.log('Audio context not ready, adding to pending alerts:', timerId);
      this.pendingAlerts.add(timerId);
      return;
    }

    // Play immediately
    this.playBeep().then(success => {
      if (!success) {
        console.warn('Failed to play initial beep for timer:', timerId);
      }
    });

    // Then play every 2 seconds
    const intervalId = setInterval(async () => {
      const success = await this.playBeep();
      if (!success) {
        console.warn('Failed to play beep for timer:', timerId);
        // Try to re-initialize audio if it failed
        if (this.audioContext && this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume();
            console.log('Audio context resumed after failure');
          } catch (error) {
            console.warn('Failed to resume audio context after failure:', error);
          }
        }
      }
    }, 2000);

    this.oscillatorIntervals.set(timerId, intervalId);
    console.log('Continuous alert started for timer:', timerId);
  }

  stopContinuousAlert(timerId: string) {
    console.log('Stopping continuous alert for timer:', timerId);

    const intervalId = this.oscillatorIntervals.get(timerId);
    if (intervalId) {
      clearInterval(intervalId);
      this.oscillatorIntervals.delete(timerId);
      console.log('Continuous alert stopped for timer:', timerId);
    }

    // Also remove from pending alerts if it was there
    this.pendingAlerts.delete(timerId);
  }

  stopAllAlerts() {
    console.log('Stopping all alerts');
    this.oscillatorIntervals.forEach(intervalId => clearInterval(intervalId));
    this.oscillatorIntervals.clear();
    this.pendingAlerts.clear();
  }

  cleanup() {
    console.log('Cleaning up audio manager');
    this.stopAllAlerts();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }

  // Add a method to test audio
  async testAudio() {
    console.log('Testing audio...');
    const success = await this.playBeep();
    console.log('Audio test result:', success);
    return success;
  }

  // Add a method to get current state info
  getAudioState() {
    return {
      hasAudioContext: !!this.audioContext,
      audioState: this.audioContext?.state,
      isInitialized: this.isInitialized,
      activeAlerts: this.oscillatorIntervals.size,
      pendingAlerts: this.pendingAlerts.size
    };
  }
}

// Create a singleton instance
export const audioManager = new AudioNotificationManager();