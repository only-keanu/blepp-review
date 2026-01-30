import React, { memo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, RefreshCw, ArrowRight } from 'lucide-react';
interface DueQuestionsWidgetProps {
  count: number;
}
export function DueQuestionsWidget({ count }: DueQuestionsWidgetProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <RefreshCw className="h-5 w-5 text-teal-400" />
          </div>
          <span className="text-xs font-medium bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full border border-teal-500/30">
            Spaced Repetition
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{count}</span>
            <span className="text-sm text-slate-400">items due</span>
          </div>
          <h3 className="text-lg font-medium text-white mt-1">
            Due for Review
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Items you're likely to forget soon. Review them now to strengthen
            your memory.
          </p>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            className="w-full bg-teal-500 hover:bg-teal-400 text-white border-none"
            rightIcon={<ArrowRight className="h-4 w-4" />}>

            Review Now
          </Button>
        </div>
      </div>
    </Card>);

}