import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Question } from '../../types';
interface QuestionCardProps {
  question: Question;
  selectedAnswerIndex: number | null;
  onSelectAnswer: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}
export function QuestionCard({
  question,
  selectedAnswerIndex,
  onSelectAnswer,
  onSubmit,
  isSubmitting
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-200 mb-4">
          {question.topicId} {/* In real app, map ID to name */}
        </span>
        <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
          {question.text}
        </h2>
      </div>

      <div className="space-y-3 mb-8">
        {question.choices.map((choice, index) =>
        <button
          key={index}
          onClick={() => onSelectAnswer(index)}
          className={`
              w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center
              ${selectedAnswerIndex === index ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100' : 'border-slate-200 dark:border-slate-700 hover:border-teal-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}
            `}>

            <div
            className={`
              h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0
              ${selectedAnswerIndex === index ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'}
            `}>

              {String.fromCharCode(65 + index)}
            </div>
            <span className="text-base">{choice}</span>
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={selectedAnswerIndex === null || isSubmitting}
          size="lg"
          className="w-full sm:w-auto px-8">

          Submit Answer
        </Button>
      </div>
    </Card>);

}
