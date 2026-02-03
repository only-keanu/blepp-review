import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, Brain, Activity, Users, Scale, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Question, Topic } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { TOPICS_DATA, TOPIC_SLUG_ALIASES } from './TopicLessonsPage';
import { fetchLessonProgress } from '../../lib/lessonProgressApi';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  blue: Brain,
  purple: Activity,
  amber: Scale,
  green: Users,
  red: BookOpen,
  gray: BookOpen
};
const COLORS = [
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'amber', label: 'Amber' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' }
];

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressByTopic, setProgressByTopic] = useState<Record<string, Set<string>>>({});
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [addError, setAddError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<any[]>('/api/topics');
        setTopics(data);
      } catch (err) {
        setError('Failed to load topics.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTopics();
  }, []);

  useEffect(() => {
    let isActive = true;
    apiFetch<Question[]>('/api/questions')
      .then((data) => {
        if (!isActive) {
          return;
        }
        const counts: Record<string, number> = {};
        data.forEach((question) => {
          counts[question.topicId] = (counts[question.topicId] ?? 0) + 1;
        });
        setQuestionCounts(counts);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setQuestionCounts({});
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchLessonProgress()
      .then((data) => {
        if (!isActive) {
          return;
        }
        const map: Record<string, Set<string>> = {};
        data.forEach((item) => {
          if (!map[item.topicSlug]) {
            map[item.topicSlug] = new Set();
          }
          map[item.topicSlug].add(item.lessonId);
        });
        setProgressByTopic(map);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setProgressByTopic({});
      });
    return () => {
      isActive = false;
    };
  }, []);

  const topicCards = useMemo(() => {
    const queryParam = (searchParams.get('query') || '').trim().toLowerCase();
    const topicParam = searchParams.get('topicId');
    const filtered = topics.filter((topic) => {
      if (topicParam) {
        return topic.id === topicParam;
      }
      if (queryParam) {
        return topic.name.toLowerCase().includes(queryParam);
      }
      return true;
    });

    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
      green: 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300',
      red: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300',
      gray: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
    };

    return filtered.map((topic) => {
      const Icon = ICONS[topic.color] || BookOpen;
      const mastery = (topic as any).masteryPct ?? 0;
      const slug = (topic.slug || topic.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const normalizedSlug = slug.toLowerCase();
      const canonicalSlug = TOPIC_SLUG_ALIASES[normalizedSlug] ?? normalizedSlug;
      const matched = TOPICS_DATA[canonicalSlug as keyof typeof TOPICS_DATA];
      const lessons = matched?.lessons ?? [];
      const completedSet = matched ? (progressByTopic[canonicalSlug] ?? new Set<string>()) : new Set<string>();
      const completedLessons = matched ? lessons.filter((lesson) => completedSet.has(lesson.id)).length : 0;
      const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : mastery;
      const questions = questionCounts[topic.id] ?? lessons.reduce((sum, lesson) => sum + lesson.questionsCount, 0);
      return {
        ...topic,
        Icon,
        mastery,
        colorClass: colorClasses[topic.color] ?? colorClasses.gray,
        topicSlug: canonicalSlug,
        lessonsCount: lessons.length,
        completedLessons,
        progress,
        questions
      };
    });
  }, [topics, searchParams, progressByTopic, questionCounts]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Study Topics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Select a subject to start practicing questions.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsAddOpen(true)}>
            Add Topic
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicCards.map((topic) => {
              return (
                <Card
                  key={topic.id}
                  className="h-full hover:shadow-lg hover:border-teal-200 transition-all duration-200 group cursor-pointer"
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest('[data-card-action=\"true\"]')) {
                      return;
                    }
                    navigate(`/dashboard/study/topics/${topic.topicSlug}`);
                  }}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${topic.colorClass} group-hover:scale-110 transition-transform duration-200`}>
                    <topic.Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" size="sm">
                    {topic.completedLessons}/{topic.lessonsCount || 0} Lessons
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-teal-600 transition-colors">
                  {topic.name}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {topic.questions ? `${topic.questions} practice questions available` : 'Practice questions available'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {topic.progress}%
                    </span>
                  </div>
                  <Progress value={topic.progress} size="sm" />
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-left"
                  data-card-action="true"
                  onClick={() => navigate(`/dashboard/study/topics/${topic.topicSlug}`)}
                >
                  <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700">
                    View Lessons
                  </span>
                  <ChevronRight className="h-5 w-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/dashboard/study/practice?topicId=${topic.id}`}
                    className="flex-1"
                    data-card-action="true"
                    onClick={(event) => event.stopPropagation()}>
                    <Button variant="outline" className="w-full" size="sm">
                      Practice
                    </Button>
                  </Link>
                  <Link
                    to={`/dashboard/study/flashcards?topicId=${topic.id}`}
                    className="flex-1"
                    data-card-action="true"
                    onClick={(event) => event.stopPropagation()}>
                    <Button variant="ghost" className="w-full" size="sm">
                      Flashcards
                    </Button>
                  </Link>
                </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAddError('');
        }}
        title="Add Study Topic"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddOpen(false);
                setAddError('');
              }}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const name = newName.trim();
                if (!name) {
                  setAddError('Topic name is required.');
                  return;
                }
                setIsSaving(true);
                setAddError('');
                try {
                  const created = await apiFetch<any>('/api/topics', {
                    method: 'POST',
                    body: JSON.stringify({ name, color: newColor })
                  });
                  setTopics((prev) => [
                    ...prev,
                    {
                      id: created.id,
                      name: created.name,
                      slug: created.slug,
                      color: created.color,
                      weak: created.weak,
                      masteryPct: created.masteryPct
                    } as Topic
                  ]);
                  setNewName('');
                  setNewColor('blue');
                  setIsAddOpen(false);
                } catch (err) {
                  setAddError('Failed to add topic.');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Topic'}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Topic name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
              placeholder="e.g., Developmental Psychology"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Color
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            >
              {COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {addError && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">
              {addError}
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
}
