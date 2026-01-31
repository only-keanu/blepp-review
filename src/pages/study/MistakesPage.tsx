import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertCircle, ArrowRight, Filter } from 'lucide-react';
const MISTAKES = [
{
  id: '1',
  question:
  'Which neurotransmitter is primarily associated with the regulation of mood and sleep?',
  userAnswer: 'Dopamine',
  correctAnswer: 'Serotonin',
  topic: 'Physiological Psych',
  date: '2 days ago'
},
{
  id: '2',
  question: 'In classical conditioning, the bell starts as a(n):',
  userAnswer: 'Conditioned Stimulus',
  correctAnswer: 'Neutral Stimulus',
  topic: 'Learning',
  date: '3 days ago'
},
{
  id: '3',
  question: 'Who proposed the Hierarchy of Needs?',
  userAnswer: 'Rogers',
  correctAnswer: 'Maslow',
  topic: 'Theories of Personality',
  date: '5 days ago'
}];

export function MistakesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mistake Bank</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review and master questions you missed.
            </p>
          </div>
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            Filter by Topic
          </Button>
        </div>

        <div className="grid gap-4">
          {MISTAKES.map((mistake) =>
          <Card
            key={mistake.id}
            className="hover:border-teal-200 transition-colors">

              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-950/40 rounded-full flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" size="sm">
                      {mistake.topic}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {mistake.date}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    {mistake.question}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900">
                      <span className="text-red-700 dark:text-red-300 font-medium block mb-1">
                        You answered:
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {mistake.userAnswer}
                      </span>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                      <span className="text-green-700 dark:text-green-300 font-medium block mb-1">
                        Correct answer:
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {mistake.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="self-center">
                  <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={<ArrowRight className="h-4 w-4" />}>

                    Review
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>);

}
