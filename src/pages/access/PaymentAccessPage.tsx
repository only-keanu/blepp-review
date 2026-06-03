import React from 'react';
import { CheckCircle2, Clock, Copy, MessageCircle, RotateCcw, Smartphone } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { AccessStatusCard, formatDateTime } from '../../components/access/AccessStatusCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

const paymentMethods = [
  {
    name: 'GCash payment',
    detail: 'Pay PHP 299 to the posted GCash account for 30 days of BLEPP Review access.',
    icon: Smartphone
  },
  {
    name: 'Facebook proof',
    detail: 'Message the Facebook page with your account email and payment proof for verification.',
    icon: MessageCircle
  },
  {
    name: '24-hour activation',
    detail: 'Access is activated within 24 hours after your payment proof is verified.',
    icon: Clock
  }
];

export function PaymentAccessPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access and payment</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            The 30-Day BLEPP Review Pass is PHP 299 and is verified manually through GCash and Facebook.
          </p>
        </div>

        <AccessStatusCard user={user} />

        {user?.access && (
          <Card title="Access diagnostics">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Diagnostic label="Email" value={user.email} />
              <Diagnostic label="Admin" value={user.admin ? 'Yes' : 'No'} />
              <Diagnostic label="Status" value={user.access.accessStatus} />
              <Diagnostic label="Role" value={user.access.role} />
              <Diagnostic label="Trial ends" value={formatDateTime(user.access.trialEndsAt)} />
              <Diagnostic label="Paid until" value={formatDateTime(user.access.paidUntil)} />
            </div>
          </Card>
        )}

        <Card title="30-Day BLEPP Review Pass">
          <div className="grid gap-4 sm:grid-cols-3">
            <Diagnostic label="Price" value="PHP 299" />
            <Diagnostic label="Duration" value="30 days" />
            <Diagnostic label="Refund window" value="7 days" />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Includes practice, flashcards, mock exams, mistake review, question bank, lessons, and readiness/progress analytics. AI question generation is coming soon and is not included in the current launch pass.
          </p>
        </Card>

        <Card title="Manual payment steps">
          <div className="space-y-4">
            {[
              'Send PHP 299 through GCash to the posted BLEPP Review payment account.',
              'Message the Facebook page with your account email, GCash reference number, sender name or screenshot, and payment date/time.',
              'After verification, 30 days of paid access is added to your account within 24 hours.'
            ].map((step, index) => (
              <div key={step} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-200">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {paymentMethods.map((method) => (
            <Card key={method.name}>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <method.icon className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                  <Badge variant="outline" size="sm">Manual</Badge>
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{method.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{method.detail}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card title="What unlocks with paid access">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Practice sessions and mistake review',
              'Flashcard review and flashcard management',
              'Question bank review and custom questions',
              'Mock exams and question-bank exams',
              'Lessons and progress analytics',
              'Readiness tracking'
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              AI question generation is coming soon and is not unlocked by the current launch pass.
            </p>
          </div>
        </Card>

        {user?.email && (
          <Card title="Account email">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all text-sm font-medium text-slate-900 dark:text-slate-100">{user.email}</p>
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(user.email)}
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
              >
                <Copy className="h-4 w-4" />
                Copy email
              </button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function Diagnostic({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words font-medium text-slate-900 dark:text-slate-100">{value || 'not set'}</p>
    </div>
  );
}
