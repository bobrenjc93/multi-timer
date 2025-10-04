'use client';

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s =>
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.metaKey === event.metaKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts for common actions
export const createTimerShortcuts = (actions: {
  pauseAll?: () => void;
  resumeAll?: () => void;
  resetAll?: () => void;
  focusNameInput?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.pauseAll) {
    shortcuts.push({
      key: 'p',
      ctrlKey: true,
      action: actions.pauseAll,
      description: 'Pause all timers'
    });
  }

  if (actions.resumeAll) {
    shortcuts.push({
      key: 'r',
      ctrlKey: true,
      action: actions.resumeAll,
      description: 'Resume all timers'
    });
  }

  if (actions.resetAll) {
    shortcuts.push({
      key: 'Backspace',
      ctrlKey: true,
      action: actions.resetAll,
      description: 'Reset all timers'
    });
  }

  if (actions.focusNameInput) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      action: actions.focusNameInput,
      description: 'Focus timer name input'
    });
  }

  // Add help shortcut
  shortcuts.push({
    key: '?',
    action: () => {
      const event = new CustomEvent('toggle-shortcuts-help');
      document.dispatchEvent(event);
    },
    description: 'Toggle keyboard shortcuts help'
  });

  return shortcuts;
};