'use client';

import { useState, useEffect } from 'react';

export const KeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for the keyboard shortcut to toggle help
  useEffect(() => {
    const handleToggleHelp = () => {
      setIsOpen(prev => !prev);
    };

    document.addEventListener('toggle-shortcuts-help', handleToggleHelp);
    return () => document.removeEventListener('toggle-shortcuts-help', handleToggleHelp);
  }, []);

  const shortcuts = [
    { keys: ['Ctrl', 'N'], description: 'Focus timer name input' },
    { keys: ['Ctrl', 'P'], description: 'Pause all running timers' },
    { keys: ['Ctrl', 'R'], description: 'Resume all paused timers' },
    { keys: ['Ctrl', 'Backspace'], description: 'Reset all timers' },
    { keys: ['Alt', '[First Letter]'], description: 'Toggle timer (e.g., Alt+T for "Tea")' },
    { keys: ['Enter'], description: 'Submit timer form' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-muted border rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-accent transition-colors shadow-lg"
        title="View keyboard shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex}>
                        <kbd className="px-2 py-1 bg-muted border rounded text-xs font-mono">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-muted-foreground">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground flex-1 text-right">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted border rounded">?</kbd> to toggle this help
            </div>
          </div>
        </div>
      )}
    </>
  );
};