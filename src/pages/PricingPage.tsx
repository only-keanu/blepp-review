import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

export function PricingPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            30-Day BLEPP Review Pass
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Unlock the core BLEPP study system for 30 days for PHP 299. Pay
            manually through GCash, send proof through our Facebook page, and
            access is activated within 24 hours after verification.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="mt-8 px-8">
              Start Trial, Then Unlock
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Included In The Launch Pass
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              <PricingFeature>Practice questions and mistake review</PricingFeature>
              <PricingFeature>Flashcards with spaced review</PricingFeature>
              <PricingFeature>Mock exams and results review</PricingFeature>
              <PricingFeature>Progress and readiness analytics</PricingFeature>
              <PricingFeature>Lesson progress tracking</PricingFeature>
              <PricingFeature>Question bank review and custom questions</PricingFeature>
            </ul>
            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
              AI question generation is coming soon and is not included in the
              current launch pass.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            PHP 299 for 30 Days
          </h2>
          <p className="text-teal-100">
            Send payment through GCash, then message the Facebook page with
            your account email, GCash reference number, sender name or
            screenshot, and payment date/time. Activation is completed within 24
            hours after verification. A 7-day refund window applies.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-slate-700">
      <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
