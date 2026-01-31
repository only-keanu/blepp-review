import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, PlayCircle, BookOpen } from 'lucide-react';
interface PlanItem {
  id: string;
  subject: string;
  count: number;
  type: 'questions' | 'flashcards';
  completed: boolean;
}
interface DailyPlanWidgetProps {
  items: PlanItem[];
  actionHref?: string;
  cardHref?: string;
}
export function DailyPlanWidget({ items, actionHref, cardHref }: DailyPlanWidgetProps) {
  const actionButton = (
    <Button
      className="w-full"
      rightIcon={<PlayCircle className="h-4 w-4" />}>
      Start Session
    </Button>
  );
  const card = (
    <Card
      title="Today's Study Plan"
      description="Recommended tasks based on your weak areas"
      className="h-full"
      footer={
      actionHref ? <a href={actionHref}>{actionButton}</a> : actionButton
      }>

      <div className="space-y-4">
        {items.map((item) =>
        <div
          key={item.id}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors group">

            <div className="flex items-center gap-3">
              <div
              className={`
                h-8 w-8 rounded-full flex items-center justify-center
                ${item.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'}
              `}>

                {item.completed ?
              <CheckCircle2 className="h-5 w-5" /> :

              <BookOpen className="h-4 w-4" />
              }
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.subject}
                </p>
                <p className="text-xs text-slate-500">
                  {item.count} {item.type}
                </p>
              </div>
            </div>

            <Badge
            variant={item.type === 'questions' ? 'primary' : 'warning'}
            size="sm">

              {item.type === 'questions' ? 'Quiz' : 'Review'}
            </Badge>
          </div>
        )}

        {items.length === 0 &&
        <div className="text-center py-8 text-slate-500">
            <p>No study items scheduled for today.</p>
            <Button variant="outline" size="sm" className="mt-2">
              Generate Plan
            </Button>
          </div>
        }
      </div>
    </Card>);

  return cardHref ? <a href={cardHref}>{card}</a> : card;

}
