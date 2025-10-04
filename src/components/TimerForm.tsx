'use client';

import { useState, FormEvent } from 'react';
import { TimerFormData } from '@/types/timer';

interface TimerFormProps {
  onAddTimer: (name: string, durationInSeconds: number) => void;
  nameInputRef?: React.RefObject<HTMLInputElement>;
}

export const TimerForm = ({ onAddTimer, nameInputRef }: TimerFormProps) => {
  const [formData, setFormData] = useState<TimerFormData>({
    name: '',
    minutes: 3,
    seconds: 0,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const totalSeconds = formData.minutes * 60 + formData.seconds;
    if (totalSeconds <= 0) return;

    onAddTimer(formData.name.trim(), totalSeconds);

    // Reset form
    setFormData({
      name: '',
      minutes: 3,
      seconds: 0,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="bg-muted rounded-lg border p-6">
      <h2 className="text-lg font-medium mb-6 text-foreground">
        Create New Timer
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="timer-name" className="block text-sm font-medium text-foreground mb-2">
            Timer Name
          </label>
          <input
            id="timer-name"
            ref={nameInputRef}
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder="Enter timer name..."
            className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-muted-foreground transition-colors"
            autoFocus
          />
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="minutes" className="block text-sm font-medium text-foreground mb-2">
              Minutes
            </label>
            <input
              id="minutes"
              type="number"
              min="0"
              max="999"
              value={formData.minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="seconds" className="block text-sm font-medium text-foreground mb-2">
              Seconds
            </label>
            <input
              id="seconds"
              type="number"
              min="0"
              max="59"
              value={formData.seconds}
              onChange={(e) => setFormData(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!formData.name.trim() || (formData.minutes === 0 && formData.seconds === 0)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start Timer
          </button>
        </div>
      </form>
    </div>
  );
};