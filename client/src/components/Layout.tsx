import { useState } from 'react';
import { StorageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: 'chat' | 'constellation' | 'vault';
  onScreenChange: (screen: 'chat' | 'constellation' | 'vault') => void;
}

export function Layout({ children, currentScreen, onScreenChange }: LayoutProps) {
  const [stats] = useState(() => StorageService.getStats());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const screens = ['chat', 'constellation', 'vault'] as const;
      const currentIndex = screens.indexOf(currentScreen);
      const nextIndex = (currentIndex + 1) % screens.length;
      onScreenChange(screens[nextIndex]);
    }
  };

  // Add keyboard event listener
  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="min-h-screen p-4 scan-lines">
      {/* ASCII Header */}
      <div className="text-center mb-6">
        <pre className="text-[var(--terminal-green)] text-sm md:text-base">
{`╔═══════════════════════════════════════════════════════════════════════════════╗
║                           KNOWLEDGE QUEST TERMINAL                           ║
║                        "LEARN • CONQUER • COLLECT"                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}
        </pre>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-[var(--terminal-gray)] p-1 rounded">
          <button
            onClick={() => onScreenChange('chat')}
            className={`tab-button px-6 py-2 rounded font-bold ${
              currentScreen === 'chat' ? 'active' : ''
            }`}
          >
            [CHAT]
          </button>
          <button
            onClick={() => onScreenChange('constellation')}
            className={`tab-button px-6 py-2 rounded ${
              currentScreen === 'constellation' ? 'active' : ''
            }`}
          >
            [CONSTELLATION]
          </button>
          <button
            onClick={() => onScreenChange('vault')}
            className={`tab-button px-6 py-2 rounded ${
              currentScreen === 'vault' ? 'active' : ''
            }`}
          >
            [VAULT]
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--terminal-gray)] border-t border-[var(--terminal-green)] p-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex space-x-4">
            <span>Session: <span className="text-[var(--terminal-green)]">ACTIVE</span></span>
            <span>Nodes: <span className="text-[var(--terminal-green)]">{stats.totalNodes}</span></span>
            <span>Streak: <span className="text-[var(--terminal-green)]">{stats.currentStreak}</span></span>
          </div>
          <div className="flex space-x-4">
            <span>[TAB] Switch | [ESC] Cancel | [ENTER] Submit</span>
            <span className="text-[var(--terminal-green)] animate-pulse">●</span>
          </div>
        </div>
      </div>
    </div>
  );
}
