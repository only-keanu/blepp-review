import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ScoreBreakdown } from '../../components/exams/ScoreBreakdown';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

type ExamResult = {
  score: number;
  totalQuestions: number;
  correctCount: number;
  topicScores: { topicName: string; correct: number; total: number }[];
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
        setError('Failed to load exam results.');
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
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
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

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Exam Results
          </h1>
          <p className="text-slate-500">
            Completed on {new Date().toLocaleDateString()}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : scoreBreakdown ? (
          <ScoreBreakdown {...scoreBreakdown} />
        ) : (
          <div className="text-center py-16 text-slate-500">
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
