import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ReadinessWidget } from '../../components/dashboard/ReadinessWidget';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
export function ReadinessPage() {
  const [readiness, setReadiness] = useState({
    score: 0,
    accuracy: 0,
    consistency: 0,
    coverage: 0,
    mockExams: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReadiness = async () => {
      setError('');
      try {
        const data = await apiFetch<any>('/api/analytics/readiness');
        setReadiness({
          score: data.score ?? 0,
          accuracy: data.accuracy ?? 0,
          consistency: data.consistency ?? 0,
          coverage: data.coverage ?? 0,
          mockExams: data.mockExams ?? 0
        });
      } catch (err) {
        setError('Failed to load readiness data.');
      }
    };

    loadReadiness();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Exam Readiness Assessment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Your score is calculated based on 4 key components. Aim for 85%+ to
            be exam-ready.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <div className="w-full max-w-md h-80">
            <ReadinessWidget score={readiness.score} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ComponentCard
            title="Accuracy"
            score={readiness.accuracy}
            desc="Percentage of correct answers in quizzes"
            status={statusFor(readiness.accuracy)} />

          <ComponentCard
            title="Consistency"
            score={readiness.consistency}
            desc="Regularity of daily study sessions"
            status={statusFor(readiness.consistency)} />

          <ComponentCard
            title="Coverage"
            score={readiness.coverage}
            desc="Percentage of total syllabus covered"
            status={statusFor(readiness.coverage)} />

          <ComponentCard
            title="Mock Exams"
            score={readiness.mockExams}
            desc="Average score in full-length simulations"
            status={statusFor(readiness.mockExams)} />

        </div>
      </div>
    </AppLayout>);

}
function ComponentCard({ title, score, desc, status }: any) {
  const colors = {
    good: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900'
  };
  return (
    <Card
      className={`border-t-4 ${status === 'good' ? 'border-t-green-500' : status === 'warning' ? 'border-t-amber-500' : 'border-t-red-500'}`}>

      <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="flex items-baseline gap-1 my-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{score}%</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{desc}</p>
      <div
        className={`text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-1 ${colors[status as keyof typeof colors]}`}>

        {status === 'good' ?
        <CheckCircle2 className="h-3 w-3" /> :

        <AlertCircle className="h-3 w-3" />
        }
        {status === 'good' ? 'On Track' : 'Needs Work'}
      </div>
    </Card>);

}

function statusFor(score: number) {
  if (score >= 75) return 'good';
  if (score >= 50) return 'warning';
  return 'danger';
}
