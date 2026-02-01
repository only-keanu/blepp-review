import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';
const COLORS = [
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'amber', label: 'Amber' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' }
];

export function TopicsSettingsPage() {
  const [topics, setTopics] = useState<{ id: string; name: string; isWeak: boolean; color: string }[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      setError('');
      try {
        const data = await apiFetch<any[]>('/api/topics');
        setTopics(
          data.map((topic) => ({
            id: topic.id,
            name: topic.name,
            isWeak: topic.weak,
            color: topic.color
          }))
        );
      } catch (err) {
        setError('Failed to load topics.');
      }
    };
    loadTopics();
  }, []);

  const toggleWeak = async (id: string) => {
    const target = topics.find((t) => t.id === id);
    if (!target) return;
    try {
      const updated = await apiFetch<any>(`/api/topics/${id}/weak`, {
        method: 'PATCH',
        body: JSON.stringify({ weak: !target.isWeak })
      });
      setTopics((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isWeak: updated.weak } : t
        )
      );
    } catch (err) {
      setError('Failed to update topic.');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required.');
      return;
    }
    try {
      const created = await apiFetch<any>('/api/topics', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), color })
      });
      setTopics((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          isWeak: created.weak,
          color: created.color
        }
      ]);
      setName('');
      setColor('blue');
      setError('');
    } catch (err) {
      setError('Failed to add topic.');
    }
  };
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Study Priorities</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Mark topics as "Weak Areas" to prioritize them in your daily study
          plan and spaced repetition algorithm.
        </p>

        <Card title="Add New Topic">
          <form onSubmit={handleAddTopic} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Topic name"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              {COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button type="submit">Add Topic</Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-200">{error}</p>}
        </Card>

        <Card>
          <div className="space-y-2">
            {topics.map((topic) =>
            <div
              key={topic.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">

                <span className="font-medium text-slate-900 dark:text-slate-100">{topic.name}</span>
                <button
                onClick={() => toggleWeak(topic.id)}
                className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${topic.isWeak ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-700 dark:ring-offset-slate-900' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}
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
