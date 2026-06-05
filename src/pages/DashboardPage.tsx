import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ReadinessWidget } from '../components/dashboard/ReadinessWidget';
import { DailyPlanWidget } from '../components/dashboard/DailyPlanWidget';
import { DueQuestionsWidget } from '../components/dashboard/DueQuestionsWidget';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { AlertTriangle, BookOpen, CalendarDays, Flame, RotateCcw, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiRequestError, apiFetch } from '../lib/api';
import { Topic } from '../types';
import { AccessStatusCard } from '../components/access/AccessStatusCard';
import { RecentExamSessionsWidget } from '../components/exams/RecentExamSessionsWidget';
import { fetchRecentExamSessions, RecentExamSession } from '../lib/examSessionsApi';

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
  const [recentExamSessions, setRecentExamSessions] = useState<RecentExamSession[]>([]);
  const [isRecentSessionsLoading, setIsRecentSessionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSessionsError, setRecentSessionsError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setError('');
      setRecentSessionsError('');
      if (!user?.hasStudyAccess) {
        setTopics([]);
        setReadiness(0);
        setDueCount(0);
        setStudyStreak('0 days');
        setRecentExamSessions([]);
        setIsRecentSessionsLoading(false);
        return;
      }
      setIsRecentSessionsLoading(true);
      try {
        const [topicsResult, readinessResult, flashcardsResult, masteryResult, overviewResult, sessionsResult] = await Promise.allSettled([
          apiFetch<DashboardTopic[]>('/api/topics'),
          apiFetch<ReadinessResponse>('/api/analytics/readiness'),
          apiFetch<FlashcardResponse[]>('/api/flashcards'),
          apiFetch<TopicMasteryResponse>('/api/analytics/topic-mastery'),
          apiFetch<AnalyticsOverviewResponse>('/api/analytics/overview'),
          fetchRecentExamSessions(5)
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

        if (sessionsResult.status === 'fulfilled') {
          setRecentExamSessions(sessionsResult.value);
        } else {
          setRecentExamSessions([]);
          setRecentSessionsError('Failed to load recent activity.');
        }

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
      } finally {
        setIsRecentSessionsLoading(false);
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

  const weakestTopic = useMemo(() => {
    if (topics.length === 0) {
      return null;
    }
    return [...topics].sort((a, b) => (a.masteryPct ?? 0) - (b.masteryPct ?? 0))[0];
  }, [topics]);

  const readinessStatus = readiness >= 85 ? 'Exam ready' : readiness >= 70 ? 'On track' : readiness >= 50 ? 'Building' : 'Needs focus';

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome back, {user?.fullName.split(' ')[0]}.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Plan today around the items most likely to move your readiness.
            </p>
          </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-100">
                <Flame className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                <div>
                  <p className="font-semibold">{studyStreak}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-300">study streak</p>
                </div>
            </div>
              <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                <div>
                  <p className="font-semibold">{user?.dailyStudyHours ?? 0}h/day</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">daily goal</p>
                </div>
              </div>
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
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardSummaryCard
              icon={TrendingUp}
              label="Readiness"
              value={`${readiness}%`}
              detail={readinessStatus}
              tone="teal"
            />
            <DashboardSummaryCard
              icon={RotateCcw}
              label="Due flashcards"
              value={String(dueCount)}
              detail={dueCount > 0 ? 'review today' : 'nothing due'}
              tone="amber"
            />
            <DashboardSummaryCard
              icon={AlertTriangle}
              label="Weakest topic"
              value={weakestTopic?.name ?? 'No data'}
              detail={weakestTopic ? `${weakestTopic.masteryPct ?? 0}% mastery` : 'start practice'}
              tone="rose"
            />
            <DashboardSummaryCard
              icon={CalendarDays}
              label="Daily goal"
              value={`${user?.dailyStudyHours ?? 0}h`}
              detail="planned study time"
              tone="green"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <DailyPlanWidget
                items={planItems}
                actionHref="/dashboard/study/practice"
                cardHref="/dashboard/study/practice"
              />
            </div>

            <div className="min-h-72">
              <ReadinessWidget score={readiness} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentExamSessionsWidget
                sessions={recentExamSessions}
                isLoading={isRecentSessionsLoading}
                error={recentSessionsError}
                title="Recent Activity"
                description="Resume in-progress exams or review completed results"
                variant="activity"
                className="h-full"
              />
            </div>

            <div className="space-y-6">
              <div className="min-h-72">
                <DueQuestionsWidget
                  count={dueCount}
                  actionHref="/dashboard/study/flashcards"
                  cardHref="/dashboard/study/flashcards"
                />
              </div>

              <TopicMasteryCard topics={topics} />
            </div>
          </div>
        </>
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

function TopicMasteryCard({ topics }: { topics: DashboardTopic[] }) {
  return (
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

        {topics.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No topic mastery data yet.
          </p>
        )}

        <Link
          to="/dashboard/study/topics"
          className="w-full mt-4 text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center justify-center gap-1">
          View all topics <BookOpen className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function DashboardSummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tone: 'teal' | 'amber' | 'rose' | 'green';
}) {
  const toneClasses: Record<typeof tone, string> = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
  };

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <div className={`rounded-lg p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
