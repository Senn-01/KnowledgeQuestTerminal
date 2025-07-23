import type { Trial } from '../types';

export class RarityCalculator {
  static calculateRarity(
    trials: Trial,
    difficulty: number,
    timeBonus: number = 0
  ): { rarity: 'normal' | 'rare' | 'legendary' | 'unique'; finalScore: number } {
    
    // Base scores from trials (out of 10 each)
    const articulationScore = trials.articulation.score;
    const gauntletScore = (trials.gauntlet.score / trials.gauntlet.answers.length) * 10;
    const lightningScore = (trials.lightning.score / trials.lightning.answers.length) * 10;
    
    // Calculate weighted average
    const baseScore = (
      articulationScore * 0.4 +  // 40% weight
      gauntletScore * 0.4 +      // 40% weight  
      lightningScore * 0.2       // 20% weight
    );
    
    // Apply difficulty multiplier
    const difficultyBonus = difficulty * 0.5; // 0.5-2.5 bonus
    
    // Apply time bonus from lightning round
    const speedBonus = timeBonus * 0.1;
    
    // Calculate final score
    const finalScore = Math.min(10, baseScore + difficultyBonus + speedBonus);
    
    // Determine rarity based on final score and difficulty
    let rarity: 'normal' | 'rare' | 'legendary' | 'unique';
    
    const rarityThreshold = this.getRarityThresholds(difficulty);
    
    if (finalScore >= rarityThreshold.unique) {
      rarity = 'unique';
    } else if (finalScore >= rarityThreshold.legendary) {
      rarity = 'legendary';
    } else if (finalScore >= rarityThreshold.rare) {
      rarity = 'rare';
    } else {
      rarity = 'normal';
    }
    
    return { rarity, finalScore: Math.round(finalScore * 100) / 100 };
  }
  
  private static getRarityThresholds(difficulty: number) {
    // Thresholds get harder at higher difficulties
    const baseThresholds = {
      rare: 6.0,
      legendary: 7.5,
      unique: 9.0
    };
    
    // Increase thresholds for higher difficulties
    const difficultyPenalty = (difficulty - 1) * 0.3;
    
    return {
      rare: Math.min(8.5, baseThresholds.rare + difficultyPenalty),
      legendary: Math.min(9.0, baseThresholds.legendary + difficultyPenalty),
      unique: Math.min(9.5, baseThresholds.unique + difficultyPenalty)
    };
  }
  
  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'normal': return 'var(--rarity-normal)';
      case 'rare': return 'var(--rarity-rare)';
      case 'legendary': return 'var(--rarity-legendary)';
      case 'unique': return 'var(--rarity-unique)';
      default: return 'var(--rarity-normal)';
    }
  }
  
  static getRarityGlowClass(rarity: string): string {
    return `rarity-glow-${rarity}`;
  }
}
