import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { apiFetch } from '../../lib/api';
export function AnalyticsPage() {
  const [overview, setOverview] = useState({
    accuracy: '0%',
    studyStreak: '0 days',
    hoursStudied: '0h',
    questionsDone: '0'
  });
  const [topicStats, setTopicStats] = useState<
    { name: string; mastery: number }[]
  >([]);
  const [trendPoints, setTrendPoints] = useState<
    { label: string; accuracy: number }[]
  >([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      setError('');
      try {
        const [overviewData, masteryData, trendData] = await Promise.all([
          apiFetch<any>('/api/analytics/overview'),
          apiFetch<any>('/api/analytics/topic-mastery'),
          apiFetch<any>('/api/analytics/accuracy-trend')
        ]);

        setOverview({
          accuracy: overviewData.accuracy ?? '0%',
          studyStreak: overviewData.studyStreak ?? '0 days',
          hoursStudied: overviewData.hoursStudied ?? '0h',
          questionsDone: overviewData.questionsDone ?? '0'
        });

        setTopicStats(
          (masteryData?.topics ?? []).map((topic: any) => ({
            name: topic.name,
            mastery: topic.masteryPct ?? 0
          }))
        );

        setTrendPoints(
          (trendData?.points ?? []).map((point: any) => ({
            label: point.label,
            accuracy: point.accuracy ?? 0
          }))
        );
      } catch (err) {
        setError('Failed to load analytics.');
      }
    };

    loadAnalytics();
  }, []);

  const accuracyTrend = useMemo(() => {
    if (trendPoints.length > 0) {
      return trendPoints.map((point) => point.accuracy);
    }
    const value = parseInt(String(overview.accuracy).replace('%', ''), 10);
    if (!Number.isFinite(value)) {
      return [45, 50, 48, 55, 60, 58, 65, 70, 72, 75];
    }
    const start = Math.max(30, value - 20);
    const step = (value - start) / 9;
    return Array.from({ length: 10 }, (_, index) =>
      Math.round(start + step * index)
    );
  }, [overview.accuracy, trendPoints]);

  const trendLabels = useMemo(() => {
    if (trendPoints.length > 0) {
      return {
        start: trendPoints[0]?.label ?? 'Start',
        end: trendPoints[trendPoints.length - 1]?.label ?? 'Today'
      };
    }
    return { start: 'Week 1', end: 'Week 10' };
  }, [trendPoints]);

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
            <div className="h-64 px-4 pb-4 pt-2">
              <div className="h-full relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="accuracyLine" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2"
                    points={accuracyTrend.map((value, index) => {
                      const x = accuracyTrend.length === 1 ? 50 : (index / (accuracyTrend.length - 1)) * 100;
                      const y = 100 - Math.max(0, Math.min(100, value));
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  <polygon
                    fill="url(#accuracyLine)"
                    points={`0,100 ${accuracyTrend.map((value, index) => {
                      const x = accuracyTrend.length === 1 ? 50 : (index / (accuracyTrend.length - 1)) * 100;
                      const y = 100 - Math.max(0, Math.min(100, value));
                      return `${x},${y}`;
                    }).join(' ')} 100,100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-end">
                  {accuracyTrend.map((value, index) => (
                    <div key={index} className="flex-1 h-full relative">
                      <div
                        className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-teal-500"
                        style={{ top: `${100 - Math.max(0, Math.min(100, value))}%` }}
                      />
                      <div className="opacity-0 hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">
                        {trendPoints[index]?.label ? `${trendPoints[index].label}: ` : ''}{value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-4">
              <span>{trendLabels.start}</span>
              <span>{trendLabels.end}</span>
            </div>
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
                  const color =
                    t.mastery >= 70 ? 'success' : t.mastery >= 50 ? 'warning' : 'danger';
                  return (
                    <div key={t.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {t.name}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {t.mastery}%
                        </span>
                      </div>
                      <Progress value={t.mastery} variant={color as any} />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>);

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
