import { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from './components/Layout';
import { ChatScreen } from './components/Chat/ChatScreen';
import { ConstellationScreen } from './components/Constellation/ConstellationScreen';
import { VaultScreen } from './components/Vault/VaultScreen';

type Screen = 'chat' | 'constellation' | 'vault';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat');

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab cycling (handled in Layout)
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const screens: Screen[] = ['chat', 'constellation', 'vault'];
        const currentIndex = screens.indexOf(currentScreen);
        const nextIndex = (currentIndex + 1) % screens.length;
        setCurrentScreen(screens[nextIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'chat':
        return <ChatScreen />;
      case 'constellation':
        return <ConstellationScreen />;
      case 'vault':
        return <VaultScreen />;
      default:
        return <ChatScreen />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout currentScreen={currentScreen} onScreenChange={setCurrentScreen}>
          {renderScreen()}
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
