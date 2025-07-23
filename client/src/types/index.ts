export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

export interface Trial {
  articulation: {
    score: number;
    text: string;
    feedback: string;
  };
  gauntlet: {
    score: number;
    answers: boolean[];
    questions: QuizQuestion[];
  };
  lightning: {
    score: number;
    timeBonus: number;
    answers: boolean[];
    questions: LightningQuestion[];
  };
}

export interface LearningSession {
  id: string;
  topic: string;
  date: string;
  difficulty: number;
  difficultyName: string;
  category: string;
  trials?: Trial;
  rarity: 'normal' | 'rare' | 'legendary' | 'unique';
  chatHistory: Message[];
  vaultContent: string;
  aiExplanation: string;
  finalScore: number;
}

export interface ConstellationNode {
  id: string;
  topic: string;
  category: string;
  difficulty: number;
  rarity: 'normal' | 'rare' | 'legendary' | 'unique';
  x: number;
  y: number;
  connections: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

export interface LightningQuestion {
  statement: string;
  isTrue: boolean;
  userAnswer?: boolean;
}

export type LearningPhase = 
  | 'topic-selection' 
  | 'difficulty-selection' 
  | 'ai-teaching' 
  | 'trial-1' 
  | 'trial-2' 
  | 'trial-3' 
  | 'completed';

export type Difficulty = {
  level: number;
  name: string;
  description: string;
};

export const DIFFICULTIES: Difficulty[] = [
  { level: 1, name: "I'm Too Young to Die", description: "Beginner friendly introduction" },
  { level: 2, name: "Hey, Not Too Rough", description: "Basic concepts and examples" },
  { level: 3, name: "Hurt Me Plenty", description: "Intermediate depth and complexity" },
  { level: 4, name: "Ultra-Violence", description: "Advanced topics and nuances" },
  { level: 5, name: "Nightmare", description: "Expert level analysis" }
];

export const CATEGORIES = [
  'Sciences',
  'Mathematics', 
  'Technology',
  'Humanities',
  'Arts',
  'Skills',
  'Languages'
] as const;

export type Category = typeof CATEGORIES[number];
