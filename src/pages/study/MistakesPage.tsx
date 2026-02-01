import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertCircle, ArrowRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

type Mistake = {
  questionId: string;
  topicId: string;
  topicName: string;
  questionText: string;
  userAnswer?: string | null;
  correctAnswer: string;
  lastAttemptAt?: string | null;
};

export function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMistakes = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<Mistake[]>('/api/practice/mistakes/details');
        setMistakes(data);
      } catch (err) {
        setError('Failed to load mistakes.');
      } finally {
        setIsLoading(false);
      }
    };
    loadMistakes();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mistake Bank</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review and master questions you missed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/dashboard/study/practice?mode=mistakes&scope=all">
              <Button size="sm">Retry All</Button>
            </Link>
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
              Filter by Topic
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : mistakes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No mistakes yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Great job! Keep practicing to build your mastery.
            </p>
            <Link to="/dashboard/study/practice">
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Start Practice</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {mistakes.map((mistake) =>
            <Card
              key={mistake.questionId}
              className="hover:border-teal-200 transition-colors">

              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-950/40 rounded-full flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" size="sm">
                      {mistake.topicName}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {mistake.lastAttemptAt
                        ? new Date(mistake.lastAttemptAt).toLocaleDateString()
                        : 'Recently'}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    {mistake.questionText}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900">
                      <span className="text-red-700 dark:text-red-300 font-medium block mb-1">
                        You answered:
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {mistake.userAnswer || 'No answer recorded'}
                      </span>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                      <span className="text-green-700 dark:text-green-300 font-medium block mb-1">
                        Correct answer:
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {mistake.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="self-center">
                  <Link
                    to={`/dashboard/study/practice?mode=mistakes&topicId=${mistake.topicId}`}>
                    <Button
                    size="sm"
                    variant="ghost"
                    rightIcon={<ArrowRight className="h-4 w-4" />}>

                      Retry
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
          </div>
        )}
      </div>
    </AppLayout>);

}
