import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { QuestionCard } from '../../components/study/QuestionCard';
import { AnswerFeedback } from '../../components/study/AnswerFeedback';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ArrowLeft, CheckCircle2, Flag, RotateCcw } from 'lucide-react';
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

type PracticeResult = {
  sessionId: string;
  score: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  unansweredCount: number;
  questions: Array<{
    questionId: string;
    topicName: string;
    text: string;
    choices: string[];
    selectedAnswerIndex: number | null;
    correctAnswerIndex: number;
    correct: boolean;
    explanation: string;
  }>;
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
  const [result, setResult] = useState<PracticeResult | null>(null);
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
        setError(err instanceof Error ? err.message : 'Failed to load topics.');
      }
    };
    loadTopics();
  }, [location.search]);

  const startSession = async () => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(location.search);
      const mode = params.get('mode');
      const scope = params.get('scope');
      let session: PracticeSessionResponse;
      if (mode === 'mistakes') {
        if (scope === 'all') {
          session = await apiFetch<PracticeSessionResponse>(
            `/api/practice/mistakes/session/all`,
            { method: 'POST' }
          );
        } else {
          session = await apiFetch<PracticeSessionResponse>(
            `/api/practice/mistakes/session?topicId=${encodeURIComponent(selectedTopic)}`,
            { method: 'POST' }
          );
        }
      } else {
        session = await apiFetch<PracticeSessionResponse>('/api/practice/session', {
          method: 'POST',
          body: JSON.stringify({
            topicId: selectedTopic,
            difficulty: 'MEDIUM',
            questionCount: 10
          })
        });
      }
      setSessionId(session.id);
      const data = await apiFetch<any[]>(
        `/api/practice/session/${session.id}/questions`
      );
      const mapped = data.map((q) => ({
        id: q.questionId,
        topicId: q.topicId,
        topicName: q.topicName,
        text: q.text,
        choices: q.choices,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        difficulty: q.difficulty.toLowerCase(),
        source: 'manual',
        tags: [],
        category: q.topicName,
        readOnly: false
      })) as Question[];
      setQuestions(mapped);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setSessionProgress(0);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start practice session.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      startSession();
    }
  }, [selectedTopic, location.search]);

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

  const handleNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setSessionProgress(((nextIndex + 1) / totalQuestions) * 100);
    } else {
      if (!sessionId) return;
      try {
        const completed = await apiFetch<PracticeResult>(
          `/api/practice/session/${sessionId}/complete`,
          { method: 'POST' }
        );
        setResult(completed);
        setSessionProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete practice session.');
      }
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
        {result ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link
                to="/dashboard/study/topics"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Topics
              </Link>
              <Button
                variant="outline"
                leftIcon={<RotateCcw className="h-4 w-4" />}
                onClick={startSession}>
                Practice Again
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-teal-100 dark:bg-teal-950 p-3">
                  <CheckCircle2 className="h-7 w-7 text-teal-700 dark:text-teal-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Practice Complete
                  </h1>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {result.correctCount} of {result.totalQuestions} correct, {result.unansweredCount} unanswered
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-4xl font-bold text-teal-700 dark:text-teal-300">
                    {result.score}%
                  </div>
                  <div className="text-sm text-slate-500">Score</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {result.questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Question {index + 1} · {question.topicName}
                      </div>
                      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                        {question.text}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${question.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {question.correct ? 'Correct' : 'Review'}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Your answer: {question.selectedAnswerIndex === null ? 'Unanswered' : question.choices[question.selectedAnswerIndex]}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Correct answer: {question.choices[question.correctAnswerIndex]}
                  </div>
                  {question.explanation && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/study/topics"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Link>
          <div className="flex items-center gap-4">
            <select
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}>
              {topicOptions}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
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
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : !currentQuestion ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
