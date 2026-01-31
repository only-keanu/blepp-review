import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ReadinessWidget } from '../components/dashboard/ReadinessWidget';
import { DailyPlanWidget } from '../components/dashboard/DailyPlanWidget';
import { DueQuestionsWidget } from '../components/dashboard/DueQuestionsWidget';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { BookOpen, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Topic } from '../types';
export function DashboardPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [readiness, setReadiness] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setError('');
      try {
        const [topicsData, readinessData, flashcards, masteryData] = await Promise.all([
          apiFetch<any[]>('/api/topics'),
          apiFetch<any>('/api/analytics/readiness'),
          apiFetch<any[]>('/api/flashcards'),
          apiFetch<any>('/api/analytics/topic-mastery')
        ]);
        const masteryMap = new Map<string, number>();
        (masteryData?.topics ?? []).forEach((stat: any) => {
          if (stat?.name) {
            masteryMap.set(stat.name, stat.masteryPct ?? 0);
          }
        });
        const mergedTopics = topicsData.map((topic) => ({
          ...topic,
          masteryPct: masteryMap.get(topic.name) ?? (topic as any).masteryPct ?? 0
        }));
        setTopics(mergedTopics);
        setReadiness(readinessData.score ?? 0);

        const today = new Date();
        const due = flashcards.filter((fc) => {
          if (!fc.nextReview) return false;
          return new Date(fc.nextReview) <= today;
        }).length;
        setDueCount(due);
      } catch (err) {
        setError('Failed to load dashboard data.');
      }
    };
    loadData();
  }, []);

  const planItems = useMemo(() => {
    const withMastery = topics.map((t) => ({
      id: t.id,
      subject: t.name,
      count: 10,
      type: 'questions' as const,
      completed: false,
      mastery: (t as any).masteryPct ?? 0
    }));
    const sorted = [...withMastery].sort((a, b) => a.mastery - b.mastery);
    const base = sorted.slice(0, 3);
    const items = base.map(({ id, subject, count, type, completed, mastery }) => ({
      id,
      subject,
      count,
      type,
      completed,
      mastery
    }));
    if (dueCount > 0) {
      items.push({
        id: 'flashcards-due',
        subject: 'Flashcard Review',
        count: dueCount,
        type: 'flashcards' as const,
        completed: false
      });
    }
    return items;
  }, [topics, dueCount]);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {user?.fullName.split(' ')[0]}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              You're on a 5-day streak. Keep it up!
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              <span>Goal: {user?.dailyStudyHours}h/day</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Level 3</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Readiness & Due Items */}
          <div className="space-y-6">
            <div className="h-64">
              <ReadinessWidget score={readiness} />
            </div>
            <div className="h-64">
              <DueQuestionsWidget
                count={dueCount}
                actionHref="/dashboard/study/flashcards"
                cardHref="/dashboard/study/flashcards"
              />
            </div>
          </div>

          {/* Column 2: Daily Plan */}
          <div className="lg:col-span-1 h-full">
            <DailyPlanWidget
              items={planItems}
              actionHref="/dashboard/study/practice"
              cardHref="/dashboard/study/practice"
            />
          </div>

          {/* Column 3: Topic Progress */}
          <div className="md:col-span-2 lg:col-span-1">
            <Card
              title="Topic Mastery"
              description="Your progress across board subjects">

              <div className="space-y-6">
                {topics.map((topic) => {
                  const progress = (topic as any).masteryPct ?? 0;
                  return (
                  <div key={topic.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {topic.name}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {progress}%
                      </span>
                    </div>
                    <Progress
                    value={progress}
                    variant={progress > 50 ? 'success' : 'default'}
                    size="sm" />

                  </div>
                  );
                })}

                <Link
                  to="/dashboard/study/topics"
                  className="w-full mt-4 text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center justify-center gap-1">
                  View all topics <BookOpen className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>);

}
