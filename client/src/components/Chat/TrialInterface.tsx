import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useTimer } from '../../hooks/useTimer';
import { AIService } from '../../services/aiService';
import type { QuizQuestion, LightningQuestion, Trial } from '../../types';

interface TrialInterfaceProps {
  topic: string;
  difficulty: number;
  onComplete: (trials: Trial) => void;
  onCancel: () => void;
}

type TrialPhase = 'articulation' | 'gauntlet' | 'lightning' | 'completed';

export function TrialInterface({ topic, difficulty, onComplete, onCancel }: TrialInterfaceProps) {
  const [currentPhase, setCurrentPhase] = useState<TrialPhase>('articulation');
  const [userExplanation, setUserExplanation] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [lightningQuestions, setLightningQuestions] = useState<LightningQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trial results
  const [trials, setTrials] = useState<Partial<Trial>>({});

  // Timers for each phase
  const articulationTimer = useTimer(3, 0);
  const gauntletTimer = useTimer(5, 0);
  const lightningTimer = useTimer(2, 0);

  useEffect(() => {
    if (currentPhase === 'articulation') {
      articulationTimer.start();
    } else if (currentPhase === 'gauntlet') {
      loadQuizQuestions();
      gauntletTimer.start();
    } else if (currentPhase === 'lightning') {
      loadLightningQuestions();
      lightningTimer.start();
    }
  }, [currentPhase]);

  // Handle timer expiration
  useEffect(() => {
    if (articulationTimer.isExpired && currentPhase === 'articulation') {
      handleArticulationSubmit();
    }
  }, [articulationTimer.isExpired]);

  useEffect(() => {
    if (gauntletTimer.isExpired && currentPhase === 'gauntlet') {
      handleGauntletComplete();
    }
  }, [gauntletTimer.isExpired]);

  useEffect(() => {
    if (lightningTimer.isExpired && currentPhase === 'lightning') {
      handleLightningComplete();
    }
  }, [lightningTimer.isExpired]);

  const loadQuizQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const questions = await AIService.generateQuiz(topic, difficulty);
      setQuizQuestions(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz questions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLightningQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const questions = await AIService.generateLightningRound(topic);
      setLightningQuestions(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lightning questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticulationSubmit = async () => {
    if (!userExplanation.trim()) return;
    
    setIsLoading(true);
    try {
      const evaluation = await AIService.evaluateExplanation(topic, userExplanation);
      setTrials(prev => ({
        ...prev,
        articulation: {
          score: evaluation.score,
          text: userExplanation,
          feedback: evaluation.feedback
        }
      }));
      setCurrentPhase('gauntlet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate explanation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[currentQuestionIndex].userAnswer = answerIndex;
    setQuizQuestions(updatedQuestions);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleGauntletComplete();
    }
  };

  const handleGauntletComplete = () => {
    const correctAnswers = quizQuestions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    
    setTrials(prev => ({
      ...prev,
      gauntlet: {
        score: correctAnswers,
        answers: quizQuestions.map(q => q.userAnswer === q.correctAnswer),
        questions: quizQuestions
      }
    }));
    setCurrentPhase('lightning');
  };

  const handleLightningAnswer = (answer: boolean) => {
    const updatedQuestions = [...lightningQuestions];
    updatedQuestions[currentQuestionIndex].userAnswer = answer;
    setLightningQuestions(updatedQuestions);

    if (currentQuestionIndex < lightningQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleLightningComplete();
    }
  };

  const handleLightningComplete = () => {
    const correctAnswers = lightningQuestions.filter(
      q => q.userAnswer === q.isTrue
    ).length;
    
    const timeBonus = lightningTimer.timeLeft > 0 ? Math.floor(lightningTimer.timeLeft / 6) : 0;
    
    const finalTrials: Trial = {
      ...trials,
      lightning: {
        score: correctAnswers,
        timeBonus,
        answers: lightningQuestions.map(q => q.userAnswer === q.isTrue),
        questions: lightningQuestions
      }
    } as Trial;

    onComplete(finalTrials);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-black terminal-border rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">ERROR</h2>
            <p className="text-[var(--terminal-green)] mb-4">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={onCancel} variant="destructive">
                ABORT TRIAL
              </Button>
              <Button onClick={() => setError(null)} className="bg-[var(--terminal-green)] text-[var(--terminal-bg)] hover:glow">
                RETRY
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-black terminal-border rounded-lg p-6">
          <div className="text-center">
            <div className="text-[var(--terminal-green)] text-xl mb-4">PROCESSING...</div>
            <div className="animate-spin text-2xl">⟲</div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentTimer = () => {
    switch (currentPhase) {
      case 'articulation': return articulationTimer;
      case 'gauntlet': return gauntletTimer;
      case 'lightning': return lightningTimer;
      default: return articulationTimer;
    }
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'articulation': return 'TRIAL 1: ARTICULATION CHAMBER';
      case 'gauntlet': return 'TRIAL 2: THE GAUNTLET';
      case 'lightning': return 'TRIAL 3: LIGHTNING ROUND';
      default: return '';
    }
  };

  const getCurrentTimer_display = getCurrentTimer();

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-black border-2 border-orange-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-400">{getPhaseTitle()}</h2>
          <div className={`text-xl font-bold ${getCurrentTimer_display.colorClass}`}>
            Time: {getCurrentTimer_display.formattedTime}
          </div>
        </div>

        {/* Articulation Phase */}
        {currentPhase === 'articulation' && (
          <div>
            <p className="text-[var(--terminal-green)] mb-2">
              Explain what you learned about {topic} in your own words:
            </p>
            <Textarea
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              className="w-full h-32 bg-[var(--terminal-bg)] border border-[var(--terminal-green)] text-[var(--terminal-green)] p-2 resize-none"
              placeholder="Type your explanation here..."
            />
            <div className="flex justify-between mt-4">
              <Button onClick={onCancel} variant="destructive">
                ABORT TRIAL
              </Button>
              <Button
                onClick={handleArticulationSubmit}
                className="bg-[var(--terminal-green)] text-[var(--terminal-bg)] hover:glow font-bold"
                disabled={!userExplanation.trim() || isLoading}
              >
                SUBMIT EXPLANATION
              </Button>
            </div>
          </div>
        )}

        {/* Gauntlet Phase */}
        {currentPhase === 'gauntlet' && quizQuestions.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[var(--terminal-green)]">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </span>
                <div className="bg-[var(--terminal-gray)] px-2 py-1 rounded">
                  Score: {quizQuestions.slice(0, currentQuestionIndex).filter(q => q.userAnswer === q.correctAnswer).length}/{currentQuestionIndex}
                </div>
              </div>
              <div className="w-full bg-[var(--terminal-gray)] h-2 rounded">
                <div 
                  className="bg-[var(--terminal-green)] h-2 rounded transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-[var(--terminal-green)] text-lg mb-4">
                {quizQuestions[currentQuestionIndex]?.question}
              </h3>
              <div className="space-y-2">
                {quizQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    className="w-full text-left p-3 border border-gray-600 rounded hover:border-[var(--terminal-green)] hover:bg-[var(--terminal-gray)] transition-colors"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={onCancel} variant="destructive">
                ABORT TRIAL
              </Button>
              <Button
                onClick={handleGauntletComplete}
                className="bg-[var(--terminal-green)] text-[var(--terminal-bg)] hover:glow font-bold"
              >
                FINISH EARLY
              </Button>
            </div>
          </div>
        )}

        {/* Lightning Phase */}
        {currentPhase === 'lightning' && lightningQuestions.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[var(--terminal-green)]">
                  Statement {currentQuestionIndex + 1} of {lightningQuestions.length}
                </span>
                <div className="bg-[var(--terminal-gray)] px-2 py-1 rounded">
                  Score: {lightningQuestions.slice(0, currentQuestionIndex).filter(q => q.userAnswer === q.isTrue).length}/{currentQuestionIndex}
                </div>
              </div>
              <div className="w-full bg-[var(--terminal-gray)] h-2 rounded">
                <div 
                  className="bg-[var(--terminal-green)] h-2 rounded transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / lightningQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-6 text-center">
              <h3 className="text-[var(--terminal-green)] text-xl mb-6">
                {lightningQuestions[currentQuestionIndex]?.statement}
              </h3>
              <div className="flex justify-center space-x-8">
                <button
                  onClick={() => handleLightningAnswer(true)}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
                >
                  TRUE
                </button>
                <button
                  onClick={() => handleLightningAnswer(false)}
                  className="px-8 py-4 bg-red-600 text-white rounded-lg text-xl font-bold hover:bg-red-700 transition-colors"
                >
                  FALSE
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={onCancel} variant="destructive">
                ABORT TRIAL
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
