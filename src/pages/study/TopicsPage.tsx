import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { ArrowRight, BookOpen, Brain, Activity, Users, Scale } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Topic } from '../../types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  blue: Brain,
  purple: Activity,
  amber: Scale,
  green: Users,
  red: BookOpen,
  gray: BookOpen
};

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadTopics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<any[]>('/api/topics');
        setTopics(data);
      } catch (err) {
        setError('Failed to load topics.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTopics();
  }, []);

  const topicCards = useMemo(() => {
    const queryParam = (searchParams.get('query') || '').trim().toLowerCase();
    const topicParam = searchParams.get('topicId');
    const filtered = topics.filter((topic) => {
      if (topicParam) {
        return topic.id === topicParam;
      }
      if (queryParam) {
        return topic.name.toLowerCase().includes(queryParam);
      }
      return true;
    });

    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
      green: 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300',
      red: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300',
      gray: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
    };

    return filtered.map((topic) => {
      const Icon = ICONS[topic.color] || BookOpen;
      const mastery = (topic as any).masteryPct ?? 0;
      return {
        ...topic,
        Icon,
        mastery,
        colorClass: colorClasses[topic.color] ?? colorClasses.gray
      };
    });
  }, [topics, searchParams]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Study Topics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Select a subject to start practicing questions.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicCards.map((topic) => (
              <Card
                key={topic.id}
                className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${topic.colorClass}`}>
                    <topic.Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {topic.slug}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-teal-600 transition-colors">
                  {topic.name}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Mastery</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {topic.mastery}%
                    </span>
                  </div>
                  <Progress value={topic.mastery} size="sm" />
                </div>

                <div className="flex gap-3">
                  <Link to={`/dashboard/study/practice?topicId=${topic.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Practice
                    </Button>
                  </Link>
                  <Link to={`/dashboard/study/flashcards?topicId=${topic.id}`} className="flex-1">
                    <Button variant="ghost" className="w-full" size="sm">
                      Flashcards
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
