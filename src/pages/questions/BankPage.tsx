import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { QuestionList } from '../../components/questions/QuestionList';
import { TopicFilter } from '../../components/questions/TopicFilter';
import { AddQuestionModal } from '../../components/questions/AddQuestionModal';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Filter, Sparkles, PenLine } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Question, Topic } from '../../types';
import { apiFetch } from '../../lib/api';

type QuestionPayload = {
  text: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
  topicId: string;
  difficulty: Question['difficulty'];
  category?: string;
  tags: string[];
};

export function BankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const queryParam = searchParams.get('query') || '';
    const topicParam = searchParams.get('topicId');
    setSearch(queryParam);
    setTopic(topicParam ?? 'all');
  }, [searchParams]);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await apiFetch<Topic[]>('/api/topics');
        setTopics(data);
      } catch (err) {
        setError('Failed to load topics.');
      }
    };
    loadTopics();
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (search) params.set('query', search);
        if (topic !== 'all') params.set('topicId', topic);
        const data = await apiFetch<any[]>(
          `/api/questions${params.toString() ? `?${params.toString()}` : ''}`
        );
        const mapped = data.map((q) => ({
          id: q.id,
          topicId: q.topicId,
          topicName: q.topicName,
          text: q.text,
          choices: q.choices,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
          difficulty: q.difficulty.toLowerCase(),
          source: q.source.toLowerCase(),
          tags: q.tags || [],
          category: q.category,
          createdAt: q.createdAt
        })) as Question[];
        setQuestions(mapped);
      } catch (err) {
        setError('Failed to load questions.');
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [search, topic]);

  const handleAddQuestion = async (payload: QuestionPayload) => {
    setIsLoading(true);
    setError('');
    try {
      const created = await apiFetch<any>('/api/questions', {
        method: 'POST',
        body: JSON.stringify({
          topicId: payload.topicId,
          text: payload.text,
          choices: payload.choices,
          correctAnswerIndex: payload.correctAnswerIndex,
          explanation: payload.explanation,
          difficulty: payload.difficulty.toUpperCase(),
          source: 'MANUAL',
          tags: payload.tags,
          category: payload.category
        })
      });
      const mapped: Question = {
        id: created.id,
        topicId: created.topicId,
        topicName: created.topicName,
        text: created.text,
        choices: created.choices,
        correctAnswerIndex: created.correctAnswerIndex,
        explanation: created.explanation,
        difficulty: created.difficulty.toLowerCase(),
        source: created.source.toLowerCase(),
        tags: created.tags || [],
        category: created.category,
        createdAt: created.createdAt
      };
      setQuestions((prev) => [mapped, ...prev]);
    } catch (err) {
      setError('Failed to save question.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Question Bank</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {questions.length} questions - Manage and review your practice
              questions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              leftIcon={<PenLine className="h-4 w-4" />}
              onClick={() => setIsAddModalOpen(true)}>
              Add Manually
            </Button>
            <Link to="/dashboard/questions/generate">
              <Button leftIcon={<Sparkles className="h-4 w-4" />}>
                Generate with AI
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <TopicFilter
            selectedTopic={topic}
            onChange={setTopic}
            topics={topics}
          />
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            More Filters
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No questions found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Try adjusting your search or filters, or add a new question.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}>
              Add Your First Question
            </Button>
          </div>
        ) : (
          <QuestionList questions={questions} />
        )}
      </div>

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddQuestion}
        topics={topics}
      />
    </AppLayout>
  );
}
