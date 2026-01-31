import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { FlashcardView } from '../../components/study/FlashcardView';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Topic } from '../../types';

type FlashcardApi = {
  id: string;
  topicId: string;
  topicName: string;
  front: string;
  back: string;
  category?: string;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  nextReview?: string;
};

type FlashcardViewModel = {
  id: string;
  front: string;
  back: string;
  topic: string;
};

export function FlashcardsPage() {
  const location = useLocation();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [cards, setCards] = useState<FlashcardViewModel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await apiFetch<Topic[]>('/api/topics');
        setTopics(data);
        const params = new URLSearchParams(location.search);
        const topicFromUrl = params.get('topicId');
        if (topicFromUrl && data.find((t) => t.id === topicFromUrl)) {
          setSelectedTopic(topicFromUrl);
        }
      } catch (err) {
        setError('Failed to load topics.');
      }
    };
    loadTopics();
  }, [location.search]);

  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<FlashcardApi[]>('/api/flashcards');
        const mapped = data.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          topic: card.topicName
        }));
        const filtered = selectedTopic === 'all'
          ? mapped
          : mapped.filter((card) => card.topic === topics.find((t) => t.id === selectedTopic)?.name);
        setCards(filtered);
        setCurrentIndex(0);
        setCompleted(0);
      } catch (err) {
        setError('Failed to load flashcards.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCards();
  }, [selectedTopic, topics]);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progress = totalCards === 0 ? 0 : (completed / totalCards) * 100;

  const handleRate = (confidence: 'low' | 'medium' | 'high') => {
    setCompleted((prev) => prev + 1);
    if (currentIndex < totalCards - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    } else {
      alert('Review Complete!');
    }
  };

  const topicOptions = useMemo(
    () =>
      [
        <option key="all" value="all">All Topics</option>,
        ...topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))
      ],
    [topics]
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard/study/topics"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-4">
            <select
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}>
              {topicOptions}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Card {totalCards === 0 ? 0 : currentIndex + 1} / {totalCards}
            </span>
            <Button variant="ghost" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Options
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="mb-12">
          <Progress value={progress} size="sm" />
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        ) : !currentCard ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
            No flashcards available.
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <FlashcardView
              key={currentCard.id}
              card={currentCard}
              onRate={handleRate}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
