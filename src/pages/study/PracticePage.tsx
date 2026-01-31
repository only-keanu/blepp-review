import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { QuestionCard } from '../../components/study/QuestionCard';
import { AnswerFeedback } from '../../components/study/AnswerFeedback';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ArrowLeft, Flag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Question, Topic } from '../../types';
import { apiFetch } from '../../lib/api';

type PracticeSessionResponse = {
  id: string;
  topicId: string;
  topicName: string;
  questionCount: number;
  createdAt: string;
};

export function PracticePage() {
  const location = useLocation();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await apiFetch<Topic[]>('/api/topics');
        setTopics(data);
        if (data.length > 0) {
          const params = new URLSearchParams(location.search);
          const topicFromUrl = params.get('topicId');
          const match = topicFromUrl && data.find((t) => t.id === topicFromUrl);
          setSelectedTopic(match ? match.id : data[0].id);
        }
      } catch (err) {
        setError('Failed to load topics.');
      }
    };
    loadTopics();
  }, [location.search]);

  const startSession = async () => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setError('');
    try {
      const session = await apiFetch<PracticeSessionResponse>('/api/practice/session', {
        method: 'POST',
        body: JSON.stringify({
          topicId: selectedTopic,
          difficulty: 'MEDIUM',
          questionCount: 10
        })
      });
      setSessionId(session.id);
      const data = await apiFetch<any[]>(
        `/api/questions?topicId=${encodeURIComponent(selectedTopic)}`
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
      setQuestions(mapped.slice(0, 10));
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setSessionProgress(0);
    } catch (err) {
      setError('Failed to start practice session.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      startSession();
    }
  }, [selectedTopic]);

  const handleSelectAnswer = (index: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || selectedAnswer === null || !sessionId) {
      return;
    }
    setIsSubmitted(true);
    try {
      await apiFetch<void>('/api/practice/attempt', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedAnswerIndex: selectedAnswer,
          timeTakenSeconds: 20
        })
      });
    } catch (err) {
      setError('Failed to submit answer.');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setSessionProgress(((nextIndex + 1) / totalQuestions) * 100);
    } else {
      alert('Session Complete!');
    }
  };

  const topicOptions = useMemo(
    () =>
      topics.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      )),
    [topics]
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/study/topics"
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Link>
          <div className="flex items-center gap-4">
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}>
              {topicOptions}
            </select>
            <span className="text-sm font-medium text-slate-600">
              Question {totalQuestions === 0 ? 0 : currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <Button variant="ghost" size="sm" leftIcon={<Flag className="h-4 w-4" />}>
              Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Progress value={sessionProgress} size="sm" className="mb-8" />

        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : !currentQuestion ? (
          <div className="text-center py-16 text-slate-500">
            No questions available for this topic.
          </div>
        ) : !isSubmitted ? (
          <QuestionCard
            question={currentQuestion}
            selectedAnswerIndex={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={handleSubmit}
            isSubmitting={false}
          />
        ) : (
          <AnswerFeedback
            question={currentQuestion}
            selectedAnswerIndex={selectedAnswer!}
            onNext={handleNext}
          />
        )}
      </div>
    </AppLayout>
  );
}
