import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
export function AnalyticsPage() {
  return <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Study Analytics</h1>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Accuracy" value="72%" trend="+5%" color="blue" />
          <StatCard icon={Zap} label="Study Streak" value="12 Days" trend="Best: 15" color="amber" />
          <StatCard icon={Calendar} label="Hours Studied" value="45h" trend="This Month" color="teal" />
          <StatCard icon={TrendingUp} label="Questions Done" value="850" trend="+120 this week" color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy Trend (Mock Chart) */}
          <Card title="Accuracy Trend">
            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
              {[45, 50, 48, 55, 60, 58, 65, 70, 72, 75].map((h, i) => <div key={i} className="w-full bg-teal-100 rounded-t-sm relative group">
                  <div className="absolute bottom-0 w-full bg-teal-500 rounded-t-sm transition-all duration-500" style={{
                height: `${h}%`
              }}></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">
                    {h}%
                  </div>
                </div>)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 px-4">
              <span>Week 1</span>
              <span>Week 10</span>
            </div>
          </Card>

          {/* Topic Mastery */}
          <Card title="Topic Mastery">
            <div className="space-y-6">
              {[{
              name: 'General Psychology',
              val: 75,
              color: 'success'
            }, {
              name: 'Abnormal Psychology',
              val: 45,
              color: 'warning'
            }, {
              name: 'Psychological Assessment',
              val: 30,
              color: 'danger'
            }, {
              name: 'Industrial/Org Psych',
              val: 80,
              color: 'success'
            }].map(t => <div key={t.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {t.name}
                    </span>
                    <span className="text-sm text-slate-500">{t.val}%</span>
                  </div>
                  <Progress value={t.val} variant={t.color as any} />
                </div>)}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>;
}
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color
}: any) {
  return <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400">{trend}</p>
      </div>
    </Card>;
}