import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { ArrowRight, BookOpen, Brain, Activity, Users, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
const TOPICS = [{
  id: '1',
  name: 'General Psychology',
  slug: 'general',
  progress: 45,
  color: 'blue',
  icon: Brain,
  questions: 120
}, {
  id: '2',
  name: 'Abnormal Psychology',
  slug: 'abnormal',
  progress: 30,
  color: 'purple',
  icon: Activity,
  questions: 85
}, {
  id: '3',
  name: 'Psychological Assessment',
  slug: 'assessment',
  progress: 15,
  color: 'amber',
  icon: Scale,
  questions: 90
}, {
  id: '4',
  name: 'Industrial/Org Psychology',
  slug: 'industrial',
  progress: 60,
  color: 'green',
  icon: Users,
  questions: 110
}, {
  id: '5',
  name: 'Ethics (RA 10029)',
  slug: 'ethics',
  progress: 25,
  color: 'red',
  icon: BookOpen,
  questions: 45
}];
export function TopicsPage() {
  return <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Study Topics</h1>
          <p className="text-slate-500 mt-1">
            Select a subject to start practicing questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map(topic => <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${topic.color}-100 text-${topic.color}-600`}>
                  <topic.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {topic.questions} Qs
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
                {topic.name}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mastery</span>
                  <span className="font-medium text-slate-900">
                    {topic.progress}%
                  </span>
                </div>
                <Progress value={topic.progress} size="sm" />
              </div>

              <div className="flex gap-3">
                <Link to="/dashboard/study/practice" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    Practice
                  </Button>
                </Link>
                <Link to="/dashboard/study/flashcards" className="flex-1">
                  <Button variant="ghost" className="w-full" size="sm">
                    Flashcards
                  </Button>
                </Link>
              </div>
            </Card>)}
        </div>
      </div>
    </AppLayout>;
}