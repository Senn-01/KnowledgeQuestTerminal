import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DifficultySelector } from './DifficultySelector';
import { TrialInterface } from './TrialInterface';
import { AIService } from '../../services/aiService';
import { StorageService } from '../../services/storageService';
import { RarityCalculator } from '../../utils/rarityCalculator';
import type { Message, LearningPhase, Trial, LearningSession } from '../../types';
import { DIFFICULTIES } from '../../types';

export function ChatScreen() {
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('topic-selection');
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Knowledge Quest Terminal v1.0 initialized...',
      timestamp: new Date()
    },
    {
      id: '2', 
      type: 'system',
      content: 'Ready for learning protocol. What knowledge do you seek?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [currentSession, setCurrentSession] = useState<Partial<LearningSession>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPhase]);

  const addMessage = (type: Message['type'], content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleTopicSubmit = async () => {
    if (!inputValue.trim()) return;

    const topic = inputValue.trim();
    setCurrentTopic(topic);
    addMessage('user', topic);
    setInputValue('');

    // Get AI categorization
    try {
      const { category } = await AIService.categorizeTopicAndDetectConnections(topic);
      setCurrentSession(prev => ({ ...prev, topic, category }));
    } catch (err) {
      console.warn('Failed to categorize topic:', err);
      setCurrentSession(prev => ({ ...prev, topic, category: 'Skills' }));
    }

    addMessage('ai', `Excellent choice! "${topic}" detected. Difficulty selection required...`);
    setCurrentPhase('difficulty-selection');
  };

  const handleDifficultySelect = async (difficulty: number) => {
    setCurrentDifficulty(difficulty);
    const difficultyName = DIFFICULTIES[difficulty - 1].name;
    
    addMessage('system', `Difficulty selected: ${difficultyName}`);
    addMessage('system', 'Initializing AI teaching protocol...');
    
    setCurrentSession(prev => ({ 
      ...prev, 
      difficulty, 
      difficultyName,
      date: new Date().toISOString().split('T')[0]
    }));

    setCurrentPhase('ai-teaching');
    await loadAIExplanation();
  };

  const loadAIExplanation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const explanation = await AIService.explainTopic(currentTopic, currentDifficulty);
      setAiExplanation(explanation);
      setCurrentSession(prev => ({ ...prev, aiExplanation: explanation }));
      addMessage('ai', explanation);
      addMessage('system', 'Teaching complete. Ready to begin trials?');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load AI explanation';
      setError(errorMsg);
      addMessage('system', `ERROR: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrials = () => {
    setCurrentPhase('trial-1');
    addMessage('system', 'Initiating trial sequence...');
  };

  const handleTrialsComplete = async (trials: Trial) => {
    setCurrentPhase('completed');
    
    // Calculate rarity and final score
    const { rarity, finalScore } = RarityCalculator.calculateRarity(
      trials,
      currentDifficulty,
      trials.lightning.timeBonus
    );

    // Create complete session
    const session: LearningSession = {
      id: Date.now().toString(),
      topic: currentTopic,
      date: new Date().toISOString().split('T')[0],
      difficulty: currentDifficulty,
      difficultyName: DIFFICULTIES[currentDifficulty - 1].name,
      category: currentSession.category || 'Skills',
      trials,
      rarity,
      chatHistory: messages,
      vaultContent: '',
      aiExplanation,
      finalScore
    };

    try {
      // Generate vault content
      const vaultContent = await AIService.createVaultEntry(session);
      session.vaultContent = vaultContent;
      
      // Save to storage
      StorageService.saveSession(session);
      
      // Add to constellation (simplified positioning for now)
      const constellation = StorageService.getConstellation();
      const nodePosition = generateNodePosition(session.category, constellation.length);
      
      StorageService.updateConstellation({
        id: session.id,
        topic: session.topic,
        category: session.category,
        difficulty: session.difficulty,
        rarity: session.rarity,
        x: nodePosition.x,
        y: nodePosition.y,
        connections: []
      });

      addMessage('system', `Trials completed! Rarity achieved: ${rarity.toUpperCase()}`);
      addMessage('system', `Final score: ${finalScore}/10`);
      addMessage('system', 'Knowledge added to constellation and vault.');
      
    } catch (err) {
      console.error('Failed to save session:', err);
      addMessage('system', 'ERROR: Failed to save learning session');
    }
  };

  const generateNodePosition = (category: string, nodeCount: number) => {
    // Simple radial positioning based on category
    const categoryAngles = {
      'Sciences': 0,
      'Mathematics': Math.PI / 3,
      'Technology': (2 * Math.PI) / 3,
      'Humanities': Math.PI,
      'Arts': (4 * Math.PI) / 3,
      'Skills': (5 * Math.PI) / 3,
      'Languages': (11 * Math.PI) / 6
    };
    
    const baseAngle = categoryAngles[category as keyof typeof categoryAngles] || 0;
    const radius = 100 + (nodeCount % 3) * 50;
    const angleOffset = (nodeCount * 0.3) % (Math.PI / 6);
    
    return {
      x: 400 + radius * Math.cos(baseAngle + angleOffset),
      y: 300 + radius * Math.sin(baseAngle + angleOffset)
    };
  };

  const handleReset = () => {
    setCurrentPhase('topic-selection');
    setCurrentTopic('');
    setCurrentDifficulty(0);
    setInputValue('');
    setError(null);
    setAiExplanation('');
    setCurrentSession({});
    setMessages([
      {
        id: Date.now().toString(),
        type: 'system',
        content: 'System reset. Ready for new learning session.',
        timestamp: new Date()
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentPhase === 'topic-selection') {
      handleTopicSubmit();
    }
    if (e.key === 'Escape') {
      if (currentPhase !== 'topic-selection') {
        handleReset();
      }
    }
  };

  const getPhaseStatus = (phase: LearningPhase): string => {
    const phases: LearningPhase[] = ['topic-selection', 'difficulty-selection', 'ai-teaching', 'trial-1', 'trial-2', 'trial-3', 'completed'];
    const currentIndex = phases.indexOf(currentPhase);
    const phaseIndex = phases.indexOf(phase);
    
    if (phaseIndex < currentIndex) return '[COMPLETE]';
    if (phaseIndex === currentIndex) return '[ACTIVE]';
    return '[LOCKED]';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {currentPhase !== 'trial-1' && currentPhase !== 'trial-2' && currentPhase !== 'trial-3' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal Window */}
          <div className="lg:col-span-2">
            <div className="bg-black terminal-border rounded-lg p-4 h-96 overflow-y-auto">
              <div className="space-y-2">
                {messages.map((message) => (
                  <div key={message.id} className="text-[var(--terminal-green)]">
                    <span className={
                      message.type === 'system' ? 'text-[var(--terminal-yellow)]' :
                      message.type === 'user' ? 'text-blue-400' :
                      'text-orange-400'
                    }>
                      [{message.type.toUpperCase()}]
                    </span>{' '}
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="text-[var(--terminal-green)]">
                    <span className="text-[var(--terminal-yellow)]">[SYSTEM]</span> Processing... <span className="animate-pulse">█</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input Area */}
            {currentPhase === 'topic-selection' && (
              <div className="mt-4">
                <div className="flex">
                  <span className="text-[var(--terminal-green)] mr-2">{'>'}</span>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-transparent border-none outline-none text-[var(--terminal-green)] terminal-cursor"
                    placeholder="What do you want to learn?"
                  />
                </div>
                <div className="border-t border-[var(--terminal-green)] mt-2"></div>
              </div>
            )}

            {currentPhase === 'ai-teaching' && !isLoading && (
              <div className="mt-4 text-center">
                <Button
                  onClick={handleStartTrials}
                  className="bg-[var(--terminal-green)] text-[var(--terminal-bg)] hover:glow font-bold"
                >
                  BEGIN TRIALS
                </Button>
              </div>
            )}

            {currentPhase === 'completed' && (
              <div className="mt-4 text-center">
                <Button
                  onClick={handleReset}
                  className="bg-[var(--terminal-green)] text-[var(--terminal-bg)] hover:glow font-bold"
                >
                  START NEW SESSION
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Difficulty Selector */}
            <DifficultySelector
              onSelect={handleDifficultySelect}
              isVisible={currentPhase === 'difficulty-selection'}
            />

            {/* Learning Progress */}
            <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg p-4">
              <h3 className="text-[var(--terminal-green)] font-bold mb-2">LEARNING PROTOCOL</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Phase 1: AI Teaching</span>
                  <span className={
                    currentPhase === 'topic-selection' || currentPhase === 'difficulty-selection' 
                      ? 'text-[var(--terminal-yellow)]' 
                      : 'text-gray-500'
                  }>
                    {getPhaseStatus('ai-teaching')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phase 2: Articulation</span>
                  <span className="text-gray-500">{getPhaseStatus('trial-1')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phase 3: The Gauntlet</span>
                  <span className="text-gray-500">{getPhaseStatus('trial-2')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phase 4: Lightning Round</span>
                  <span className="text-gray-500">{getPhaseStatus('trial-3')}</span>
                </div>
              </div>
            </div>

            {/* Current Topic Info */}
            {currentTopic && (
              <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg p-4">
                <h3 className="text-[var(--terminal-green)] font-bold mb-2">CURRENT SESSION</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Topic:</strong> {currentTopic}</div>
                  {currentDifficulty > 0 && (
                    <div><strong>Difficulty:</strong> {DIFFICULTIES[currentDifficulty - 1].name}</div>
                  )}
                  {currentSession.category && (
                    <div><strong>Category:</strong> {currentSession.category}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trial Interface */}
      {(currentPhase === 'trial-1' || currentPhase === 'trial-2' || currentPhase === 'trial-3') && (
        <TrialInterface
          topic={currentTopic}
          difficulty={currentDifficulty}
          onComplete={handleTrialsComplete}
          onCancel={handleReset}
        />
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900 border border-red-500 rounded-lg">
          <p className="text-red-300">{error}</p>
          <Button
            onClick={() => setError(null)}
            className="mt-2 bg-red-600 text-white hover:bg-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
