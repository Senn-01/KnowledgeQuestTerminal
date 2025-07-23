import { DIFFICULTIES } from '../../types';

interface DifficultySelectorProps {
  onSelect: (difficulty: number) => void;
  isVisible: boolean;
}

export function DifficultySelector({ onSelect, isVisible }: DifficultySelectorProps) {
  if (!isVisible) return null;

  const getDifficultyColor = (level: number): string => {
    const colors = [
      'text-green-400',
      'text-blue-400', 
      'text-yellow-400',
      'text-orange-400',
      'text-red-400'
    ];
    return colors[level - 1] || 'text-gray-400';
  };

  return (
    <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg p-4">
      <h3 className="text-[var(--terminal-green)] font-bold mb-4 text-center">
        ╔══ SELECT DIFFICULTY ══╗
      </h3>
      <div className="space-y-2">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff.level}
            onClick={() => onSelect(diff.level)}
            className={`w-full text-left p-2 border border-gray-600 rounded hover:border-[var(--terminal-green)] hover:bg-[var(--terminal-gray)] ${getDifficultyColor(diff.level)} transition-colors`}
          >
            [{diff.level}] {diff.name}
          </button>
        ))}
      </div>
    </div>
  );
}
