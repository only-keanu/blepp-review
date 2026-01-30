import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { MockExamCard } from '../../components/exams/MockExamCard';
const EXAMS = [
{
  id: '1',
  title: 'Full BLEPP Simulation',
  totalQuestions: 150,
  durationMinutes: 180,
  description:
  'Complete board exam simulation covering all 4 major subjects. Best for gauging readiness.',
  bestScore: 68
},
{
  id: '2',
  title: 'General Psychology Test',
  totalQuestions: 30,
  durationMinutes: 45,
  description:
  'Focused assessment on General Psychology concepts and theories.'
},
{
  id: '3',
  title: 'Quick Practice',
  totalQuestions: 10,
  durationMinutes: 15,
  description:
  'Short practice session to keep your mind sharp during breaks.'
}];

export function MockExamsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mock Exams</h1>
          <p className="text-slate-500 mt-1">
            Simulate the actual board exam experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMS.map((exam) =>
          <MockExamCard key={exam.id} {...exam} />
          )}
        </div>
      </div>
    </AppLayout>);

}