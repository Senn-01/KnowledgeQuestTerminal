import type { LearningSession, ConstellationNode } from '../types';

export class StorageService {
  private static readonly SESSIONS_KEY = 'knowledge-quest-sessions';
  private static readonly CONSTELLATION_KEY = 'knowledge-quest-constellation';
  private static readonly STATS_KEY = 'knowledge-quest-stats';

  static saveSession(session: LearningSession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      this.updateStats();
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Unable to save learning session to storage');
    }
  }

  static getSessions(): LearningSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  static getSessionById(id: string): LearningSession | undefined {
    return this.getSessions().find(session => session.id === id);
  }

  static updateConstellation(node: ConstellationNode): void {
    try {
      const constellation = this.getConstellation();
      const existingIndex = constellation.findIndex(n => n.id === node.id);
      
      if (existingIndex >= 0) {
        constellation[existingIndex] = node;
      } else {
        constellation.push(node);
      }
      
      localStorage.setItem(this.CONSTELLATION_KEY, JSON.stringify(constellation));
    } catch (error) {
      console.error('Failed to update constellation:', error);
      throw new Error('Unable to update constellation data');
    }
  }

  static getConstellation(): ConstellationNode[] {
    try {
      const stored = localStorage.getItem(this.CONSTELLATION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load constellation:', error);
      return [];
    }
  }

  static searchVault(query: string): LearningSession[] {
    if (!query.trim()) return this.getSessions();
    
    const sessions = this.getSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => 
      session.topic.toLowerCase().includes(lowerQuery) ||
      session.category.toLowerCase().includes(lowerQuery) ||
      session.vaultContent.toLowerCase().includes(lowerQuery) ||
      session.aiExplanation.toLowerCase().includes(lowerQuery)
    );
  }

  static getStats() {
    const sessions = this.getSessions();
    const rarityCount = sessions.reduce((acc, session) => {
      acc[session.rarity] = (acc[session.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNodes: sessions.length,
      normalNodes: rarityCount.normal || 0,
      rareNodes: rarityCount.rare || 0,
      legendaryNodes: rarityCount.legendary || 0,
      uniqueNodes: rarityCount.unique || 0,
      currentStreak: this.calculateStreak(),
      totalTimeSpent: sessions.reduce((total, session) => {
        // Estimate time based on difficulty and completion
        return total + (session.difficulty * 10); // 10 minutes per difficulty level
      }, 0)
    };
  }

  private static calculateStreak(): number {
    const sessions = this.getSessions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private static updateStats(): void {
    const stats = this.getStats();
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  static exportVault(): string {
    const sessions = this.getSessions();
    return JSON.stringify(sessions, null, 2);
  }

  static exportSession(sessionId: string): string | null {
    const session = this.getSessionById(sessionId);
    return session ? session.vaultContent : null;
  }

  static clearAll(): void {
    localStorage.removeItem(this.SESSIONS_KEY);
    localStorage.removeItem(this.CONSTELLATION_KEY);
    localStorage.removeItem(this.STATS_KEY);
  }
}
