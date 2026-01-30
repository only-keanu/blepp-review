import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ReadinessWidget } from '../components/dashboard/ReadinessWidget';
import { DailyPlanWidget } from '../components/dashboard/DailyPlanWidget';
import { DueQuestionsWidget } from '../components/dashboard/DueQuestionsWidget';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { BookOpen, Award, Target } from 'lucide-react';
export function DashboardPage() {
  const { user } = useAuth();
  // Mock data
  const planItems = [
  {
    id: '1',
    subject: 'General Psychology',
    count: 8,
    type: 'questions' as const,
    completed: false
  },
  {
    id: '2',
    subject: 'Abnormal Psychology',
    count: 10,
    type: 'questions' as const,
    completed: false
  },
  {
    id: '3',
    subject: 'Ethics (RA 10029)',
    count: 7,
    type: 'questions' as const,
    completed: true
  },
  {
    id: '4',
    subject: 'Flashcard Review',
    count: 10,
    type: 'flashcards' as const,
    completed: false
  }];

  const topics = [
  {
    name: 'General Psychology',
    progress: 45,
    color: 'blue'
  },
  {
    name: 'Abnormal Psychology',
    progress: 30,
    color: 'purple'
  },
  {
    name: 'Psychological Assessment',
    progress: 15,
    color: 'amber'
  },
  {
    name: 'Industrial Psychology',
    progress: 60,
    color: 'green'
  }];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.fullName.split(' ')[0]}!
            </h1>
            <p className="text-slate-500 mt-1">
              You're on a 5-day streak. Keep it up!
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              <span>Goal: {user?.dailyStudyHours}h/day</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
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
              <ReadinessWidget score={68} />
            </div>
            <div className="h-64">
              <DueQuestionsWidget count={12} />
            </div>
          </div>

          {/* Column 2: Daily Plan */}
          <div className="lg:col-span-1 h-full">
            <DailyPlanWidget items={planItems} />
          </div>

          {/* Column 3: Topic Progress */}
          <div className="md:col-span-2 lg:col-span-1">
            <Card
              title="Topic Mastery"
              description="Your progress across board subjects">

              <div className="space-y-6">
                {topics.map((topic) =>
                <div key={topic.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {topic.name}
                      </span>
                      <span className="text-sm text-slate-500">
                        {topic.progress}%
                      </span>
                    </div>
                    <Progress
                    value={topic.progress}
                    variant={topic.progress > 50 ? 'success' : 'default'}
                    size="sm" />

                  </div>
                )}

                <button className="w-full mt-4 text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center justify-center gap-1">
                  View all topics <BookOpen className="h-3 w-3" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>);

}