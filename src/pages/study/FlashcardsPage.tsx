import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { FlashcardView } from '../../components/study/FlashcardView';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Card } from '../../components/ui/Card';
import {
  ArrowLeft,
  Settings,
  Trophy,
  Flame,
  RotateCcw,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

interface SessionStats {
  totalCards: number;
  knewIt: number;
  unsure: number;
  forgot: number;
  timeSpent: number;
}

export function FlashcardsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [cards, setCards] = useState<FlashcardViewModel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [stats, setStats] = useState<SessionStats>({
    totalCards: 0,
    knewIt: 0,
    unsure: 0,
    forgot: 0,
    timeSpent: 0
  });
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
        setIsComplete(false);
        setStartTime(Date.now());
        setStats({
          totalCards: filtered.length,
          knewIt: 0,
          unsure: 0,
          forgot: 0,
          timeSpent: 0
        });
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
    setStats((prev) => ({
      ...prev,
      knewIt: confidence === 'high' ? prev.knewIt + 1 : prev.knewIt,
      unsure: confidence === 'medium' ? prev.unsure + 1 : prev.unsure,
      forgot: confidence === 'low' ? prev.forgot + 1 : prev.forgot
    }));
    setCompleted((prev) => prev + 1);

    if (currentIndex < totalCards - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      setStats((prev) => ({
        ...prev,
        timeSpent
      }));
      setTimeout(() => setIsComplete(true), 500);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompleted(0);
    setIsComplete(false);
    setStartTime(Date.now());
    setStats({
      totalCards,
      knewIt: 0,
      unsure: 0,
      forgot: 0,
      timeSpent: 0
    });
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

  if (isComplete) {
    return (
      <AppLayout>
        <FlashcardCompletionScreen
          stats={{ ...stats, totalCards }}
          onRestart={handleRestart}
          onGoHome={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard/study/topics"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-4">
            <select
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
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

function FlashcardCompletionScreen({
  stats,
  onRestart,
  onGoHome
}: {
  stats: SessionStats;
  onRestart: () => void;
  onGoHome: () => void;
}) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const masteryRate = stats.totalCards === 0 ? 0 : Math.round((stats.knewIt / stats.totalCards) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getPerformanceMessage = () => {
    if (masteryRate >= 80) {
      return {
        emoji: '',
        text: 'Excellent work!',
        subtext: "You're mastering this material!"
      };
    }
    if (masteryRate >= 60) {
      return {
        emoji: '',
        text: 'Good progress!',
        subtext: 'Keep practicing to improve retention.'
      };
    }
    if (masteryRate >= 40) {
      return {
        emoji: '',
        text: 'Keep going!',
        subtext: 'Review the cards you missed again.'
      };
    }
    return {
      emoji: '',
      text: 'Room to grow!',
      subtext: "Don't worry, repetition is key to learning."
    };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div
        className={`text-center mb-10 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl scale-150 animate-pulse" />
          <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-teal-500 rounded-full p-1.5 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Review Complete!
        </h1>
        <p className="text-lg text-slate-600">
          {performance.emoji} {performance.text}
        </p>
        <p className="text-sm text-slate-500 mt-1">{performance.subtext}</p>
      </div>

      <div
        className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-150 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats.totalCards}
          </div>
          <div className="text-sm text-slate-500">Cards Reviewed</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-teal-600 mb-1">
            {masteryRate}%
          </div>
          <div className="text-sm text-slate-500">Mastery Rate</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-slate-900 mb-1 flex items-center justify-center gap-1">
            <Clock className="h-5 w-5 text-slate-400" />
            {formatTime(stats.timeSpent)}
          </div>
          <div className="text-sm text-slate-500">Time Spent</div>
        </Card>
      </div>

      <Card
        className={`mb-8 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <h3 className="font-semibold text-slate-900 mb-5">
          Confidence Breakdown
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-24">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <ThumbsUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Knew it
              </span>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: showContent && stats.totalCards > 0
                      ? `${(stats.knewIt / stats.totalCards) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900 w-8 text-right">
              {stats.knewIt}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-24">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Unsure</span>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out delay-100"
                  style={{
                    width: showContent && stats.totalCards > 0
                      ? `${(stats.unsure / stats.totalCards) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900 w-8 text-right">
              {stats.unsure}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-24">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <ThumbsDown className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Forgot</span>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out delay-200"
                  style={{
                    width: showContent && stats.totalCards > 0
                      ? `${(stats.forgot / stats.totalCards) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900 w-8 text-right">
              {stats.forgot}
            </span>
          </div>
        </div>
      </Card>

      {stats.knewIt === stats.totalCards && stats.totalCards > 0 && (
        <div
          className={`bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 mb-8 text-white transition-all duration-700 delay-500 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <Flame className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Perfect Score!</h4>
              <p className="text-amber-100 text-sm">
                You knew every single card. Amazing memory!
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.forgot > 0 && (
        <Card
          className={`mb-8 border-l-4 border-l-teal-500 transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-teal-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Tip for Better Retention
              </h4>
              <p className="text-sm text-slate-600">
                You had {stats.forgot} card{stats.forgot > 1 ? 's' : ''} marked
                as "Forgot". These will appear more frequently in your next
                review session to help you remember them.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div
        className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <Button
          variant="outline"
          className="flex-1"
          onClick={onRestart}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Review Again
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('/dashboard/flashcards')}
          leftIcon={<BookOpen className="h-4 w-4" />}
        >
          Manage Cards
        </Button>
        <Button
          className="flex-1"
          onClick={onGoHome}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
