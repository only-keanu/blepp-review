import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AccessStatusCardProps {
  user: User | null;
  compact?: boolean;
}

export function AccessStatusCard({ user, compact = false }: AccessStatusCardProps) {
  if (!user?.access) {
    return null;
  }

  const access = user.access;
  const isTrial = access.accessStatus === 'TRIAL';
  const isPaid = access.accessStatus === 'PAID';
  const isExpired = access.accessStatus === 'EXPIRED';
  const expiry = isPaid ? access.paidUntil : access.trialEndsAt;
  const expiryLabel = formatDateTime(expiry);
  const title = access.admin
    ? 'Admin access'
    : isPaid
      ? 'Paid access active'
      : isTrial
        ? 'Trial access active'
        : 'Payment needed';
  const description = access.admin
    ? 'Admin account. Study tools are available; AI generation is coming soon.'
    : isPaid
      ? `Your 30-day paid pass is active until ${expiryLabel}.`
      : isTrial
        ? `Study tools are available until ${expiryLabel}. Unlock 30 more days for PHP 299 after trial.`
        : 'Your trial has ended. Unlock the 30-day BLEPP Review Pass for PHP 299 to continue study tools.';
  const Icon = isExpired ? AlertTriangle : isPaid || access.admin ? CheckCircle2 : Clock;
  const badgeVariant = isExpired ? 'danger' : isPaid || access.admin ? 'success' : 'warning';

  return (
    <Card className={compact ? '' : 'border-teal-200 dark:border-teal-900'}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${isExpired ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-200'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
              <Badge variant={badgeVariant} size="sm">{access.accessStatus}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          </div>
        </div>
        {!access.admin && (
          <Link to="/dashboard/settings/access" className="shrink-0">
            <Button variant={isExpired ? 'primary' : 'outline'} leftIcon={<CreditCard className="h-4 w-4" />}>
              Payment details
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

export function formatDateTime(value?: string) {
  if (!value) {
    return 'not set';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'not set';
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}
