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
            Free Beta
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            BLEPP Review is free during beta while we finish the core study
            experience. No subscription, payment method, or trial countdown is
            required.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="mt-8 px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Included In Beta
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              <PricingFeature>Practice questions and mistake review</PricingFeature>
              <PricingFeature>Flashcards with spaced review</PricingFeature>
              <PricingFeature>Mock exams and results review</PricingFeature>
              <PricingFeature>Progress and readiness analytics</PricingFeature>
              <PricingFeature>Lesson progress tracking</PricingFeature>
              <PricingFeature>AI question generation while available</PricingFeature>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-teal-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Billing Is Not Live Yet
          </h2>
          <p className="text-teal-100">
            Paid plans, quotas, and entitlement enforcement will be introduced
            only after those systems are implemented and tested.
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
