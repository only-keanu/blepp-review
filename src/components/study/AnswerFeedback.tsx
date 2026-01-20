import React, { memo } from 'react';
import { Card } from '../ui/Card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { DifficultySelector } from './DifficultySelector';
import { Question } from '../../types';
interface AnswerFeedbackProps {
  question: Question;
  selectedAnswerIndex: number;
  onNext: (difficulty: string) => void;
}
export function AnswerFeedback({
  question,
  selectedAnswerIndex,
  onNext
}: AnswerFeedbackProps) {
  const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;
  return <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {isCorrect ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            <p className="mt-1 text-slate-600">
              The correct answer is{' '}
              <span className="font-bold">
                {String.fromCharCode(65 + question.correctAnswerIndex)}:{' '}
                {question.choices[question.correctAnswerIndex]}
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card title="Explanation">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            {question.explanation}
          </p>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold block mb-1">Learning Tip</span>
            Connect this concept to {question.topicId} principles to strengthen
            your memory.
          </div>
        </div>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <div className="text-center">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            How difficult was this question?
          </h4>
          <DifficultySelector onSelect={onNext} />
        </div>
      </Card>
    </div>;
}