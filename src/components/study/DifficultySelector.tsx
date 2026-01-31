import React from 'react';
interface DifficultySelectorProps {
  onSelect: (difficulty: string) => void;
}
export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  const difficulties = [
  {
    id: 'easy',
    label: 'Easy',
    color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-950/50 dark:border-green-900'
  },
  {
    id: 'medium',
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50 dark:border-blue-900'
  },
  {
    id: 'hard',
    label: 'Hard',
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50 dark:border-amber-900'
  },
  {
    id: 'difficult',
    label: 'Difficult',
    color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50 dark:border-red-900'
  }];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {difficulties.map((diff) =>
      <button
        key={diff.id}
        onClick={() => onSelect(diff.id)}
        className={`
            py-3 px-4 rounded-lg font-medium border transition-all transform active:scale-95
            ${diff.color}
          `}>

          {diff.label}
        </button>
      )}
    </div>);

}
