import React from 'react';
interface ExamProgressProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: Record<number, number>; // index -> selected choice index
  flagged: number[];
  onJumpToQuestion: (index: number) => void;
}
export function ExamProgress({
  totalQuestions,
  currentQuestionIndex,
  answers,
  flagged,
  onJumpToQuestion
}: ExamProgressProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {Array.from({
        length: totalQuestions
      }).map((_, idx) => {
        const isAnswered = answers[idx] !== undefined;
        const isFlagged = flagged.includes(idx);
        const isCurrent = currentQuestionIndex === idx;
        return (
          <button
            key={idx}
            onClick={() => onJumpToQuestion(idx)}
            className={`
              h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center transition-colors relative
              ${isCurrent ? 'ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900 z-10' : ''}
              ${isAnswered ? 'bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'}
            `}>

            {idx + 1}
            {isFlagged &&
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-amber-400 rounded-full border border-white dark:border-slate-900" />
            }
          </button>);

      })}
    </div>);

}
