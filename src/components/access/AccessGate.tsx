import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppLayout } from '../layout/AppLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AccessStatusCard } from './AccessStatusCard';

interface AccessGateProps {
  children: React.ReactNode;
  requires?: 'study' | 'ai' | 'admin';
}

export function AccessGate({ children, requires = 'study' }: AccessGateProps) {
  const { user } = useAuth();
  const allowed =
    requires === 'admin'
      ? !!user?.admin
      : requires === 'ai'
        ? !!user?.hasAiAccess
        : !!user?.hasStudyAccess;

  if (allowed) {
    return <>{children}</>;
  }

  const title = requires === 'admin'
    ? 'Admin access required'
    : requires === 'ai'
      ? 'AI generation requires paid access'
      : 'Study access is locked';
  const message = requires === 'admin'
    ? 'This page is only available to administrators.'
    : requires === 'ai'
      ? 'Trial accounts can use study tools, but AI content generation unlocks after payment.'
      : 'Your trial has ended. Complete payment to continue practice, flashcards, question bank review, and mock exams.';

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <AccessStatusCard user={user} />
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
              </div>
              {requires !== 'admin' && (
                <Link to="/dashboard/access">
                  <Button>View payment instructions</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
