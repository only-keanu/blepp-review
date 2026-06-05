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
import { ApiRequestError, apiFetch } from '../lib/api';
import { Topic } from '../types';
import { AccessStatusCard } from '../components/access/AccessStatusCard';

interface DashboardTopic extends Topic {
  masteryPct?: number;
}

interface ReadinessResponse {
  score?: number;
}

interface FlashcardResponse {
  nextReview?: string;
}

interface TopicMasteryResponse {
  topics?: { name?: string; masteryPct?: number }[];
}

interface AnalyticsOverviewResponse {
  studyStreak?: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<DashboardTopic[]>([]);
  const [readiness, setReadiness] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [studyStreak, setStudyStreak] = useState('0 days');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setError('');
      if (!user?.hasStudyAccess) {
        setTopics([]);
        setReadiness(0);
        setDueCount(0);
        setStudyStreak('0 days');
        return;
      }
      try {
        const [topicsResult, readinessResult, flashcardsResult, masteryResult, overviewResult] = await Promise.allSettled([
          apiFetch<DashboardTopic[]>('/api/topics'),
          apiFetch<ReadinessResponse>('/api/analytics/readiness'),
          apiFetch<FlashcardResponse[]>('/api/flashcards'),
          apiFetch<TopicMasteryResponse>('/api/analytics/topic-mastery'),
          apiFetch<AnalyticsOverviewResponse>('/api/analytics/overview')
        ]);
        const topicsData = topicsResult.status === 'fulfilled' ? topicsResult.value : [];
        const readinessData = readinessResult.status === 'fulfilled' ? readinessResult.value : null;
        const flashcards = flashcardsResult.status === 'fulfilled' ? flashcardsResult.value : [];
        const masteryData = masteryResult.status === 'fulfilled' ? masteryResult.value : null;
        const overviewData = overviewResult.status === 'fulfilled' ? overviewResult.value : null;

        const masteryMap = new Map<string, number>();
        (masteryData?.topics ?? []).forEach((stat) => {
          if (stat?.name) {
            masteryMap.set(stat.name, stat.masteryPct ?? 0);
          }
        });
        const mergedTopics = topicsData.map((topic) => ({
          ...topic,
          masteryPct: masteryMap.get(topic.name) ?? topic.masteryPct ?? 0
        }));
        setTopics(mergedTopics);
        setReadiness(readinessData?.score ?? 0);
        setStudyStreak(overviewData?.studyStreak ?? '0 days');

        const today = new Date();
        const due = flashcards.filter((fc) => {
          if (!fc.nextReview) return false;
          return new Date(fc.nextReview) <= today;
        }).length;
        setDueCount(due);

        const failures = [topicsResult, readinessResult, flashcardsResult, masteryResult, overviewResult]
          .filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
        if (failures.length > 0) {
          const accessFailure = failures.find(
            (result) => result.reason instanceof ApiRequestError && result.reason.status === 403
          );
          setError(
            accessFailure?.reason instanceof Error
              ? accessFailure.reason.message
              : 'Some dashboard data could not be loaded.'
          );
        }
      } catch (err) {
        setError('Failed to load dashboard data.');
      }
    };
    loadData();
  }, [user?.hasStudyAccess]);

  const planItems = useMemo(() => {
    const withMastery = topics.map((t) => ({
      id: t.id,
      subject: t.name,
      count: 10,
      type: 'questions' as const,
      completed: false,
      mastery: t.masteryPct ?? 0
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
              You're on a {studyStreak} streak. Keep it up!
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              <span>Goal: {user?.dailyStudyHours ?? 0}h/day</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Level 3</span>
            </div>
          </div>
        </div>

        <AccessStatusCard user={user} hidePaidAccess />

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {error}
          </div>
        )}

        {/* Main Grid */}
        {user?.hasStudyAccess ? (
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
                  const progress = topic.masteryPct ?? 0;
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
        ) : (
        <Card title="Study tools locked" description="Unlock the 30-day BLEPP Review Pass for PHP 299 to continue your review tools.">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Dashboard and settings remain available while access is expired. Payment is verified manually through GCash and the Facebook page.
          </p>
        </Card>
        )}
      </div>
    </AppLayout>);

}
