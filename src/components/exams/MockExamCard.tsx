import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, HelpCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
interface MockExamCardProps {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  bestScore?: number;
}
export function MockExamCard({
  id,
  title,
  description,
  totalQuestions,
  durationMinutes,
  bestScore
}: MockExamCardProps) {
  const navigate = useNavigate();
  const handleStart = async () => {
    try {
      const session = await apiFetch<{ id: string }>(`/api/exams/${id}/session`, {
        method: 'POST'
      });
      navigate(`/dashboard/exams/take/${session.id}`);
    } catch (err) {
      navigate(`/dashboard/exams/take/${id}`);
    }
  };
  return (
    <Card className="hover:border-teal-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-lg">
          <Trophy className="h-6 w-6 text-teal-600 dark:text-teal-300" />
        </div>
        {bestScore &&
        <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 px-2 py-1 rounded-full">
            Best: {bestScore}%
          </span>
        }
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">{description}</p>

      <div className="flex items-center gap-4 mb-6 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4" />
          <span>{totalQuestions} Qs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{durationMinutes} min</span>
        </div>
      </div>

      <Button className="w-full" onClick={handleStart}>
        Start Exam
      </Button>
    </Card>);

}
