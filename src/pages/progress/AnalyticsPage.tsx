import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { RecentExamSessionsWidget } from '../../components/exams/RecentExamSessionsWidget';
import { fetchRecentExamSessions, RecentExamSession } from '../../lib/examSessionsApi';

type AccuracyTrendPoint = {
  label: string;
  accuracy: number;
  total?: number;
  correct?: number;
  isSynthetic?: boolean;
};

type AccuracyTrendResponse = {
  points?: {
    label?: string;
    accuracy?: number;
    total?: number;
    correct?: number;
  }[];
};

type AnalyticsOverviewResponse = {
  accuracy?: string;
  studyStreak?: string;
  hoursStudied?: string;
  questionsDone?: string;
};

type TopicResponse = {
  id?: string;
  name?: string;
  masteryPct?: number | null;
};

type TopicMasteryResponse = {
  topics?: TopicResponse[];
};

type ProgressTopicRow = {
  id?: string;
  name: string;
  mastery: number;
  hasProgress: boolean;
};

export function AnalyticsPage() {
  const [overview, setOverview] = useState({
    accuracy: '0%',
    studyStreak: '0 days',
    hoursStudied: '0h',
    questionsDone: '0'
  });
  const [topicStats, setTopicStats] = useState<ProgressTopicRow[]>([]);
  const [trendPoints, setTrendPoints] = useState<AccuracyTrendPoint[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentExamSession[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionsError, setSessionsError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      setError('');
      setSessionsError('');
      setIsSessionsLoading(true);
      try {
        const [overviewResult, masteryResult, topicsResult, trendResult, sessionsResult] = await Promise.allSettled([
          apiFetch<AnalyticsOverviewResponse>('/api/analytics/overview'),
          apiFetch<TopicMasteryResponse>('/api/analytics/topic-mastery'),
          apiFetch<TopicResponse[]>('/api/topics'),
          apiFetch<AccuracyTrendResponse>('/api/analytics/accuracy-trend'),
          fetchRecentExamSessions(10)
        ]);

        const topicsAvailable = topicsResult.status === 'fulfilled' && mapTopicRows(topicsResult.value).length > 0;
        const masteryAvailable = masteryResult.status === 'fulfilled' && mapTopicRows(masteryResult.value?.topics ?? []).length > 0;
        if (
          overviewResult.status === 'rejected' ||
          trendResult.status === 'rejected' ||
          (!topicsAvailable && !masteryAvailable && (topicsResult.status === 'rejected' || masteryResult.status === 'rejected'))
        ) {
          setError('Failed to load analytics.');
        }

        const overviewData = overviewResult.status === 'fulfilled' ? overviewResult.value : {};
        const masteryData = masteryResult.status === 'fulfilled' ? masteryResult.value : {};
        const topicsData = topicsResult.status === 'fulfilled' ? topicsResult.value : [];
        const trendData = trendResult.status === 'fulfilled' ? trendResult.value : {};

        setOverview({
          accuracy: overviewData.accuracy ?? '0%',
          studyStreak: overviewData.studyStreak ?? '0 days',
          hoursStudied: overviewData.hoursStudied ?? '0h',
          questionsDone: overviewData.questionsDone ?? '0'
        });

        const allTopicRows = mapTopicRows(topicsData);
        const masteryRows = mapTopicRows(masteryData?.topics ?? []);
        setTopicStats(allTopicRows.length > 0 ? allTopicRows : masteryRows);

        setTrendPoints(
          (trendData?.points ?? []).map((point, index) => ({
            label: point.label ?? `Day ${index + 1}`,
            accuracy: point.accuracy ?? 0,
            total: point.total,
            correct: point.correct
          }))
        );

        if (sessionsResult.status === 'fulfilled') {
          setRecentSessions(sessionsResult.value);
        } else {
          setRecentSessions([]);
          setSessionsError('Failed to load recent exam activity.');
        }
      } catch (err) {
        setError('Failed to load analytics.');
      } finally {
        setIsSessionsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const displayTrendPoints = useMemo<AccuracyTrendPoint[]>(() => {
    if (trendPoints.length > 0) {
      return trendPoints;
    }
    const value = parseInt(String(overview.accuracy).replace('%', ''), 10);
    const finalValue = Number.isFinite(value) ? value : 75;
    const start = Math.max(30, finalValue - 20);
    const step = (finalValue - start) / 9;
    return Array.from({ length: 10 }, (_, index) => ({
      label: index === 0 ? 'Start' : index === 9 ? 'Today' : `Day ${index + 1}`,
      accuracy: Math.round(start + step * index),
      isSynthetic: true
    }));
  }, [overview.accuracy, trendPoints]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Study Analytics</h1>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Accuracy"
            value={overview.accuracy}
            trend="Last 30 days"
            color="blue" />

          <StatCard
            icon={Zap}
            label="Study Streak"
            value={overview.studyStreak}
            trend="Keep it going"
            color="amber" />

          <StatCard
            icon={Calendar}
            label="Hours Studied"
            value={overview.hoursStudied}
            trend="This month"
            color="teal" />

          <StatCard
            icon={TrendingUp}
            label="Questions Done"
            value={overview.questionsDone}
            trend="All-time"
            color="green" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy Trend */}
          <Card title="Accuracy Trend">
            <AccuracyTrendChart points={displayTrendPoints} />
          </Card>

          {/* Topic Mastery */}
          <Card title="Topic Mastery">
            <div className="space-y-6">
              {topicStats.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No topic mastery data yet.
                </p>
              ) : (
                topicStats.map((t) => {
                  const color = topicMasteryVariant(t);
                  return (
                    <div key={t.id ?? t.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {t.name}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          {!t.hasProgress && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              Not started
                            </span>
                          )}
                          <span>{t.mastery}%</span>
                        </span>
                      </div>
                      <Progress value={t.mastery} variant={color} />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <RecentExamSessionsWidget
          sessions={recentSessions}
          isLoading={isSessionsLoading}
          error={sessionsError}
          title="Recent Exam Activity"
          description="Completed exam sessions and exams ready to resume"
          variant="activity"
        />
      </div>
    </AppLayout>);

}

function mapTopicRows(topics: TopicResponse[]): ProgressTopicRow[] {
  return topics
    .filter((topic): topic is TopicResponse & { name: string } => Boolean(topic?.name))
    .map((topic) => {
      const mastery = normalizeMastery(topic.masteryPct);
      return {
        id: topic.id,
        name: topic.name,
        mastery,
        hasProgress: mastery > 0
      };
    });
}

function normalizeMastery(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function topicMasteryVariant(topic: ProgressTopicRow): 'default' | 'success' | 'warning' | 'danger' {
  if (!topic.hasProgress) {
    return 'default';
  }
  if (topic.mastery >= 70) {
    return 'success';
  }
  if (topic.mastery >= 50) {
    return 'warning';
  }
  return 'danger';
}

function AccuracyTrendChart({ points }: { points: AccuracyTrendPoint[] }) {
  const width = 640;
  const height = 280;
  const padding = { top: 34, right: 24, bottom: 52, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const baselineY = padding.top + plotHeight;

  const chartPoints = points.map((point, index) => {
    const hasAttempts = point.isSynthetic || point.total === undefined || point.total > 0;
    const x = points.length === 1
      ? padding.left + plotWidth / 2
      : padding.left + index / (points.length - 1) * plotWidth;
    const y = hasAttempts
      ? padding.top + (100 - clampAccuracy(point.accuracy)) / 100 * plotHeight
      : baselineY;
    return {
      ...point,
      x,
      y,
      hasAttempts
    };
  });

  const activePath = chartPoints.reduce((path, point) => {
    if (!point.hasAttempts) {
      return `${path} `;
    }
    const command = previousPointWasActive(chartPoints, point) ? 'L' : 'M';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '').trim();

  const areaPaths = buildAreaPaths(chartPoints, baselineY);
  const xLabels = getXAxisLabels(chartPoints);

  return (
    <div className="space-y-4">
      <div className="relative h-72 overflow-visible rounded-lg bg-slate-50/70 px-2 pt-2 dark:bg-slate-950/30">
        <svg
          className="h-full w-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Accuracy trend over the last 10 days"
        >
          <defs>
            <linearGradient id="accuracyTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[100, 50, 0].map((tick) => {
            const y = padding.top + (100 - tick) / 100 * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray={tick === 0 ? undefined : '4 6'}
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px] dark:fill-slate-500"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {areaPaths.map((path, index) => (
            <path key={index} d={path} fill="url(#accuracyTrendFill)" />
          ))}

          {activePath && (
            <path
              d={activePath}
              fill="none"
              stroke="#0f766e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chartPoints.map((point, index) => (
            <circle
              key={`${point.label}-${index}`}
              cx={point.x}
              cy={point.y}
              r={point.hasAttempts ? 5 : 4}
              className={point.hasAttempts ? 'fill-white stroke-teal-700 dark:fill-slate-950 dark:stroke-teal-300' : 'fill-slate-300 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-600'}
              strokeWidth={point.hasAttempts ? 3 : 2}
            />
          ))}

          {xLabels.map((point) => (
            <text
              key={point.index}
              x={point.x}
              y={height - 18}
              textAnchor="middle"
              className="fill-slate-400 text-[11px] dark:fill-slate-500"
            >
              {point.label}
            </text>
          ))}
        </svg>

        {chartPoints.map((point, index) => (
          <button
            key={`${point.label}-${index}-tooltip`}
            type="button"
            aria-label={formatTrendAriaLabel(point)}
            className="group absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            style={{
              left: `${point.x / width * 100}%`,
              top: `${point.y / height * 100}%`
            }}
          >
            <span className="sr-only">{formatTrendAriaLabel(point)}</span>
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-44 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs text-white shadow-lg group-hover:block group-focus:block">
              <span className="block font-semibold">{point.label}</span>
              <span className="mt-1 block text-slate-200">
                {point.hasAttempts
                  ? `${clampAccuracy(point.accuracy)}% accuracy`
                  : 'No attempts'}
              </span>
              <span className="mt-1 block text-slate-400">
                {point.isSynthetic
                  ? 'Estimated trend'
                  : point.hasAttempts
                    ? `${point.correct ?? 0}/${point.total ?? 0} correct`
                    : 'Inactive day'}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-600" />
          Active study day
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          No attempts
        </span>
      </div>
    </div>
  );
}

function clampAccuracy(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function previousPointWasActive(points: Array<AccuracyTrendPoint & { hasAttempts: boolean }>, point: AccuracyTrendPoint & { hasAttempts: boolean }) {
  const index = points.indexOf(point);
  return index > 0 && points[index - 1]?.hasAttempts;
}

function buildAreaPaths(points: Array<AccuracyTrendPoint & { x: number; y: number; hasAttempts: boolean }>, baselineY: number) {
  const paths: string[] = [];
  let segment: typeof points = [];

  points.forEach((point) => {
    if (point.hasAttempts) {
      segment.push(point);
      return;
    }
    if (segment.length > 1) {
      paths.push(areaPathForSegment(segment, baselineY));
    }
    segment = [];
  });

  if (segment.length > 1) {
    paths.push(areaPathForSegment(segment, baselineY));
  }

  return paths;
}

function areaPathForSegment(points: Array<{ x: number; y: number }>, baselineY: number) {
  const first = points[0];
  const last = points[points.length - 1];
  return `M ${first.x} ${baselineY} ${points.map((point) => `L ${point.x} ${point.y}`).join(' ')} L ${last.x} ${baselineY} Z`;
}

function getXAxisLabels(points: Array<AccuracyTrendPoint & { x: number }>) {
  if (points.length === 0) {
    return [];
  }
  const middleIndex = Math.floor((points.length - 1) / 2);
  const indexes = Array.from(new Set([0, middleIndex, points.length - 1]));
  return indexes.map((index) => ({
    index,
    label: points[index].label,
    x: points[index].x
  }));
}

function formatTrendAriaLabel(point: AccuracyTrendPoint & { hasAttempts: boolean }) {
  if (!point.hasAttempts) {
    return `${point.label}: no attempts`;
  }
  if (point.isSynthetic) {
    return `${point.label}: estimated ${clampAccuracy(point.accuracy)}% accuracy`;
  }
  return `${point.label}: ${clampAccuracy(point.accuracy)}% accuracy, ${point.correct ?? 0} of ${point.total ?? 0} correct`;
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-950/30 dark:text-teal-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-300'
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClasses[color] ?? colorClasses.blue}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{trend}</p>
      </div>
    </Card>);

}
