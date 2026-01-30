import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ScoreBreakdown } from '../../components/exams/ScoreBreakdown';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
export function ExamResultsPage() {
  const mockResults = {
    score: 75,
    totalQuestions: 20,
    correctCount: 15,
    timeTaken: '32:45',
    topicScores: [
    {
      name: 'General Psychology',
      score: 4,
      total: 5
    },
    {
      name: 'Abnormal Psychology',
      score: 3,
      total: 5
    },
    {
      name: 'Psychological Assessment',
      score: 3,
      total: 5
    },
    {
      name: 'Industrial/Org Psych',
      score: 5,
      total: 5
    }]

  };
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
          <Button variant="outline" leftIcon={<RotateCw className="h-4 w-4" />}>
            Retake Exam
          </Button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Exam Results
          </h1>
          <p className="text-slate-500">
            Completed on {new Date().toLocaleDateString()}
          </p>
        </div>

        <ScoreBreakdown {...mockResults} />

        <div className="flex justify-center mt-8">
          <Link to="/dashboard/study/mistakes">
            <Button size="lg">Review Incorrect Answers</Button>
          </Link>
        </div>
      </div>
    </AppLayout>);

}