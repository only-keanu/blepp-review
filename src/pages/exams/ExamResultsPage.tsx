import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ScoreBreakdown } from '../../components/exams/ScoreBreakdown';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Clock, Flag, RotateCw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

type ExamResult = {
  score: number;
  totalQuestions: number;
  correctCount: number;
  unansweredCount: number;
  timeTakenSeconds: number | null;
  topicScores: { topicName: string; correct: number; total: number }[];
  questions: Array<{
    questionId: string;
    topicName: string;
    text: string;
    choices: string[];
    selectedAnswerIndex: number | null;
    correctAnswerIndex: number;
    correct: boolean;
    flagged: boolean;
    explanation: string;
  }>;
};

export function ExamResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<ExamResult>(`/api/exams/session/${id}/results`);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam results.');
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, [id]);

  const scoreBreakdown = result
    ? {
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctCount: result.correctCount,
        topicScores: result.topicScores.map((t) => ({
          name: t.topicName,
          score: t.correct,
          total: t.total
        }))
      }
    : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/exams"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </Link>
          <Button
            variant="outline"
            leftIcon={<RotateCw className="h-4 w-4" />}
            onClick={() => navigate('/dashboard/exams')}>
            Retake Exam
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Exam Results
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Completed on {new Date().toLocaleDateString()}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : scoreBreakdown ? (
          <div className="space-y-6">
            <ScoreBreakdown {...scoreBreakdown} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultStat label="Unanswered" value={result?.unansweredCount ?? 0} />
              <ResultStat label="Flagged" value={result?.questions.filter((q) => q.flagged).length ?? 0} />
              <ResultStat
                label="Time Taken"
                value={formatTime(result?.timeTakenSeconds ?? null)}
                icon={<Clock className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <div className="space-y-3">
              {result?.questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span>Question {index + 1}</span>
                        <span>·</span>
                        <span>{question.topicName}</span>
                        {question.flagged && <Flag className="h-4 w-4 text-amber-500" />}
                      </div>
                      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                        {question.text}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${question.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {question.correct ? 'Correct' : 'Review'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                      Selected: {question.selectedAnswerIndex === null ? 'Unanswered' : question.choices[question.selectedAnswerIndex]}
                    </div>
                    <div>
                      Correct: {question.choices[question.correctAnswerIndex]}
                    </div>
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
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            No results available.
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link to="/dashboard/study/mistakes">
            <Button size="lg">Review Incorrect Answers</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

function ResultStat({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

function formatTime(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return 'Not recorded';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
