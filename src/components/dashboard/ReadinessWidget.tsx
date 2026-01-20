import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, AlertCircle } from 'lucide-react';
interface ReadinessWidgetProps {
  score: number;
}
export function ReadinessWidget({
  score
}: ReadinessWidgetProps) {
  // Determine color based on score
  let colorClass = 'text-red-500';
  let strokeClass = 'stroke-red-500';
  let bgClass = 'bg-red-50';
  let status = 'Needs Improvement';
  if (score > 85) {
    colorClass = 'text-green-600';
    strokeClass = 'stroke-green-600';
    bgClass = 'bg-green-50';
    status = 'Exam Ready';
  } else if (score > 70) {
    colorClass = 'text-blue-600';
    strokeClass = 'stroke-blue-600';
    bgClass = 'bg-blue-50';
    status = 'On Track';
  } else if (score > 50) {
    colorClass = 'text-amber-500';
    strokeClass = 'stroke-amber-500';
    bgClass = 'bg-amber-50';
    status = 'Getting There';
  }
  const circumference = 2 * Math.PI * 40; // radius 40
  const strokeDashoffset = circumference - score / 100 * circumference;
  return <Card className="h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Readiness Score
          </h3>
          <p className="text-sm text-slate-500">Predicted performance</p>
        </div>
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <TrendingUp className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative h-40 w-40">
          {/* Background circle */}
          <svg className="h-full w-full transform -rotate-90">
            <circle cx="80" cy="80" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
            {/* Progress circle */}
            <circle cx="80" cy="80" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`${strokeClass} transition-all duration-1000 ease-out`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colorClass}`}>{score}%</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${bgClass} ${colorClass}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500">
            Based on your accuracy, consistency, and topic coverage. Not
            affiliated with PRC.
          </p>
        </div>
      </div>
    </Card>;
}