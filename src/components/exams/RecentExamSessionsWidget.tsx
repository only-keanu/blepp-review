import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { RecentExamSession } from '../../lib/examSessionsApi';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface RecentExamSessionsWidgetProps {
  sessions: RecentExamSession[];
  isLoading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'compact' | 'activity';
}

export function RecentExamSessionsWidget({
  sessions,
  isLoading = false,
  error = '',
  title = 'Recent Sessions',
  description = 'Pick up where you left off or review completed results',
  className = '',
  variant = 'compact'
}: RecentExamSessionsWidgetProps) {
  const isActivity = variant === 'activity';

  return (
    <Card title={title} description={description} className={className}>
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading recent sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No exam activity yet.
        </div>
      ) : (
        <div className={isActivity ? 'divide-y divide-slate-100 dark:divide-slate-800' : 'space-y-3'}>
          {sessions.map((session) => {
            const isSubmitted = session.status === 'SUBMITTED';
            const href = isSubmitted
              ? `/dashboard/exams/results/${session.id}`
              : `/dashboard/exams/take/${session.id}`;
            const answeredLabel =
              session.totalQuestions && session.totalQuestions > 0
                ? `${session.answeredCount}/${session.totalQuestions} answered`
                : `${session.answeredCount} answered`;
            const durationLabel = formatDuration(session.timeTakenSeconds, session.durationMinutes);

            return (
              <Link
                key={session.id}
                to={href}
                className={
                  isActivity
                    ? 'block py-4 transition-colors hover:bg-teal-50/40 dark:hover:bg-teal-950/20'
                    : 'block rounded-lg border border-slate-100 p-3 transition-colors hover:border-teal-200 hover:bg-teal-50/30 dark:border-slate-800 dark:hover:border-teal-800 dark:hover:bg-teal-950/20'
                }
              >
                <div className={isActivity ? 'flex items-start gap-4' : 'flex items-start justify-between gap-3'}>
                  {isActivity && (
                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSubmitted ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'}`}>
                      {isSubmitted ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {session.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatDateTime(session.submittedAt ?? session.startedAt)}</span>
                        <span>{answeredLabel}</span>
                        {durationLabel ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {durationLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant={isSubmitted ? 'success' : 'warning'} size="sm">
                        {isSubmitted ? 'Completed' : 'In Progress'}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-300">
                        {isSubmitted ? (
                          <>
                            {!isActivity && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {session.score ?? 0}%
                          </>
                        ) : (
                          <>
                            {!isActivity && <PlayCircle className="h-3.5 w-3.5" />}
                            Resume
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Date unavailable';
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatDuration(timeTakenSeconds: number | null, durationMinutes: number | null) {
  if (timeTakenSeconds && timeTakenSeconds > 0) {
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    if (minutes === 0) {
      return `${seconds}s`;
    }
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  if (durationMinutes && durationMinutes > 0) {
    return `${durationMinutes} min`;
  }
  return '';
}
