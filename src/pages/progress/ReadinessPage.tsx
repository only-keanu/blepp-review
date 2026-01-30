import React, { Component } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ReadinessWidget } from '../../components/dashboard/ReadinessWidget';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
export function ReadinessPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">
            Exam Readiness Assessment
          </h1>
          <p className="text-slate-500 mt-2">
            Your score is calculated based on 4 key components. Aim for 85%+ to
            be exam-ready.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md h-80">
            <ReadinessWidget score={68} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ComponentCard
            title="Accuracy"
            score={85}
            desc="Percentage of correct answers in quizzes"
            status="good" />

          <ComponentCard
            title="Consistency"
            score={60}
            desc="Regularity of daily study sessions"
            status="warning" />

          <ComponentCard
            title="Coverage"
            score={50}
            desc="Percentage of total syllabus covered"
            status="danger" />

          <ComponentCard
            title="Mock Exams"
            score={70}
            desc="Average score in full-length simulations"
            status="warning" />

        </div>
      </div>
    </AppLayout>);

}
function ComponentCard({ title, score, desc, status }: any) {
  const colors = {
    good: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200'
  };
  return (
    <Card
      className={`border-t-4 ${status === 'good' ? 'border-t-green-500' : status === 'warning' ? 'border-t-amber-500' : 'border-t-red-500'}`}>

      <h3 className="font-bold text-slate-900">{title}</h3>
      <div className="flex items-baseline gap-1 my-2">
        <span className="text-3xl font-bold text-slate-900">{score}%</span>
      </div>
      <p className="text-xs text-slate-500 mb-4">{desc}</p>
      <div
        className={`text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-1 ${colors[status as keyof typeof colors]}`}>

        {status === 'good' ?
        <CheckCircle2 className="h-3 w-3" /> :

        <AlertCircle className="h-3 w-3" />
        }
        {status === 'good' ? 'On Track' : 'Needs Work'}
      </div>
    </Card>);

}