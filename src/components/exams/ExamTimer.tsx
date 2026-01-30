import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
interface ExamTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}
export function ExamTimer({ durationMinutes, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 600; // Less than 10 mins
  return (
    <div
      className={`
      flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-medium border
      ${isLowTime ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}
    `}>

      <Clock className="h-4 w-4" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>);

}