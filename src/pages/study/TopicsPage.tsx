import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { ArrowRight, BookOpen, Brain, Activity, Users, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    return topics.map((topic) => {
      const Icon = ICONS[topic.color] || BookOpen;
      const mastery = (topic as any).masteryPct ?? 0;
      return {
        ...topic,
        Icon,
        mastery
      };
    });
  }, [topics]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Study Topics</h1>
          <p className="text-slate-500 mt-1">
            Select a subject to start practicing questions.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicCards.map((topic) => (
              <Card
                key={topic.id}
                className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-${topic.color}-100 text-${topic.color}-600`}>
                    <topic.Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {topic.slug}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
                  {topic.name}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Mastery</span>
                    <span className="font-medium text-slate-900">
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
