import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { MockExamCard } from '../../components/exams/MockExamCard';
import { apiFetch } from '../../lib/api';

type Exam = {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
};

export function MockExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExams = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<Exam[]>('/api/exams');
        setExams(data);
      } catch (err) {
        setError('Failed to load exams.');
      } finally {
        setIsLoading(false);
      }
    };
    loadExams();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mock Exams</h1>
          <p className="text-slate-500 mt-1">
            Simulate the actual board exam experience.
          </p>
        </div>

        {error &&
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        }

        {isLoading ?
        <div className="text-center py-16 text-slate-500">Loading...</div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) =>
          <MockExamCard key={exam.id} {...exam} />
            )}
          </div>
        }
      </div>
    </AppLayout>);

}
