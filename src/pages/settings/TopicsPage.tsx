import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
const INITIAL_TOPICS = [
{
  id: '1',
  name: 'General Psychology',
  isWeak: false
},
{
  id: '2',
  name: 'Abnormal Psychology',
  isWeak: true
},
{
  id: '3',
  name: 'Psychological Assessment',
  isWeak: true
},
{
  id: '4',
  name: 'Industrial/Organizational Psychology',
  isWeak: false
},
{
  id: '5',
  name: 'Ethics (RA 10029)',
  isWeak: false
}];

export function TopicsSettingsPage() {
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const toggleWeak = (id: string) => {
    setTopics((prev) =>
    prev.map((t) =>
    t.id === id ?
    {
      ...t,
      isWeak: !t.isWeak
    } :
    t
    )
    );
  };
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Study Priorities</h1>
        <p className="text-slate-500">
          Mark topics as "Weak Areas" to prioritize them in your daily study
          plan and spaced repetition algorithm.
        </p>

        <Card>
          <div className="space-y-2">
            {topics.map((topic) =>
            <div
              key={topic.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">

                <span className="font-medium text-slate-900">{topic.name}</span>
                <button
                onClick={() => toggleWeak(topic.id)}
                className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${topic.isWeak ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                  `}>

                  {topic.isWeak ? 'Weak Area' : 'Normal Priority'}
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>);

}