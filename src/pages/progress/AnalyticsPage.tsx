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
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      setError('');
      try {
        const [overviewData, masteryData] = await Promise.all([
          apiFetch<any>('/api/analytics/overview'),
          apiFetch<any>('/api/analytics/topic-mastery')
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
      } catch (err) {
        setError('Failed to load analytics.');
      }
    };

    loadAnalytics();
  }, []);

  const accuracyTrend = useMemo(() => {
    const value = parseInt(String(overview.accuracy).replace('%', ''), 10);
    if (!Number.isFinite(value)) {
      return [45, 50, 48, 55, 60, 58, 65, 70, 72, 75];
    }
    const start = Math.max(30, value - 20);
    const step = (value - start) / 9;
    return Array.from({ length: 10 }, (_, index) =>
      Math.round(start + step * index)
    );
  }, [overview.accuracy]);

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
          {/* Accuracy Trend (Mock Chart) */}
          <Card title="Accuracy Trend">
            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
              {accuracyTrend.map((h, i) =>
              <div
                key={i}
                className="w-full bg-teal-100 dark:bg-teal-950/40 rounded-t-sm relative group">

                  <div
                  className="absolute bottom-0 w-full bg-teal-500 dark:bg-teal-400 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${h}%`
                  }}>
                </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">
                    {h}%
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-4">
              <span>Week 1</span>
              <span>Week 10</span>
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
