import React from 'react';
import { Card } from '../ui/Card';
import { Progress } from '../ui/Progress';
interface TopicScore {
  name: string;
  score: number;
  total: number;
}
interface ScoreBreakdownProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeTaken?: string;
  topicScores: TopicScore[];
}
export function ScoreBreakdown({
  score,
  totalQuestions,
  correctCount,
  timeTaken,
  topicScores
}: ScoreBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Score */}
      <Card className="md:col-span-1 flex flex-col items-center justify-center text-center py-8">
        <div className="relative h-40 w-40 mb-4">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-200 dark:text-slate-800" />

            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#0d9488"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - 440 * score / 100}
              strokeLinecap="round" />

          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{score}%</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Final Score</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 w-full px-4 mt-4">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {correctCount}/{totalQuestions}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Correct
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{timeTaken || '--:--'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Time
            </p>
          </div>
        </div>
      </Card>

      {/* Topic Breakdown */}
      <Card className="md:col-span-2" title="Performance by Topic">
        <div className="space-y-6">
          {topicScores.map((topic) => {
            const percentage = Math.round(topic.score / topic.total * 100);
            return (
              <div key={topic.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {topic.name}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {topic.score}/{topic.total} ({percentage}%)
                  </span>
                </div>
                <Progress
                  value={percentage}
                  variant={
                  percentage >= 75 ?
                  'success' :
                  percentage >= 50 ?
                  'warning' :
                  'danger'
                  } />

              </div>);

          })}
        </div>
      </Card>
    </div>);

}
