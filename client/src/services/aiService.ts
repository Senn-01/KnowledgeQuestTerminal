import type { LearningSession, QuizQuestion, LightningQuestion } from '../types';

const apiRequest = async (endpoint: string, data: any) => {
  // Convert endpoint like '/ai/explain' to 'explain'
  const functionEndpoint = endpoint.replace('/ai/', '');
  const response = await fetch(`/.netlify/functions/api?endpoint=${functionEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

export class AIService {
  static async explainTopic(topic: string, difficulty: number): Promise<string> {
    try {
      const result = await apiRequest('/ai/explain', { topic, difficulty });
      return result.content || "Unable to generate explanation.";
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI explanation. Please check your connection and try again.');
    }
  }

  static async evaluateExplanation(topic: string, userExplanation: string): Promise<{ score: number; feedback: string }> {
    try {
      const result = await apiRequest('/ai/evaluate', { topic, userExplanation });
      return {
        score: result.score,
        feedback: result.feedback
      };
    } catch (error) {
      console.error('AI Evaluation Error:', error);
      throw new Error('Failed to evaluate explanation. Please try again.');
    }
  }

  static async generateQuiz(topic: string, difficulty: number): Promise<QuizQuestion[]> {
    try {
      const result = await apiRequest('/ai/quiz', { topic, difficulty });
      return result.questions || [];
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  }

  static async generateLightningRound(topic: string): Promise<LightningQuestion[]> {
    try {
      const result = await apiRequest('/ai/lightning', { topic });
      return result.statements || [];
    } catch (error) {
      console.error('Lightning Round Generation Error:', error);
      throw new Error('Failed to generate lightning round questions. Please try again.');
    }
  }

  static async createVaultEntry(session: LearningSession): Promise<string> {
    try {
      const result = await apiRequest('/ai/vault', { session });
      return result.content || "Unable to create vault entry.";
    } catch (error) {
      console.error('Vault Entry Creation Error:', error);
      throw new Error('Failed to create vault entry. Please try again.');
    }
  }

  static async categorizeTopicAndDetectConnections(topic: string): Promise<{ category: string; connections: string[] }> {
    try {
      const result = await apiRequest('/ai/categorize', { topic });
      return result;
    } catch (error) {
      console.error('Topic Categorization Error:', error);
      return { category: 'Skills', connections: [] };
    }
  }
}
