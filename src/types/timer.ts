export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  remainingTime: number;
  status: 'running' | 'paused' | 'completed' | 'dismissed';
  createdAt: number;
  finishesAt?: number; // timestamp when timer should complete
  pausedAt?: number; // timestamp when timer was paused
}

export interface TimerFormData {
  name: string;
  minutes: number;
  seconds: number;
}