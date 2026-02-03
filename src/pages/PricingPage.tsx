import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { CheckCircle2, X } from 'lucide-react';

export function PricingPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Simple, Transparent <span className="text-teal-600">Pricing</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your study timeline. All plans include a
            7-day free trial.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-sm text-slate-500 mb-6">
                Get started with basic features
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₱0
                </span>
                <span className="text-slate-500">/month</span>
              </div>
              <Link to="/auth/register">
                <Button variant="outline" className="w-full mb-8">
                  Start Free
                </Button>
              </Link>
              <ul className="space-y-4">
                <PricingFeature included>50 practice questions</PricingFeature>
                <PricingFeature included>
                  Basic flashcards (20 cards)
                </PricingFeature>
                <PricingFeature included>1 mock exam per month</PricingFeature>
                <PricingFeature included>Progress tracking</PricingFeature>
                <PricingFeature>AI question generation</PricingFeature>
                <PricingFeature>Spaced repetition</PricingFeature>
                <PricingFeature>Full lesson content</PricingFeature>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border-2 border-teal-500 p-8 relative shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-teal-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-sm text-slate-500 mb-6">
                Everything you need to pass
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₱299
                </span>
                <span className="text-slate-500">/month</span>
              </div>
              <Link to="/auth/register">
                <Button className="w-full mb-8">Start Free Trial</Button>
              </Link>
              <ul className="space-y-4">
                <PricingFeature included>
                  Unlimited practice questions
                </PricingFeature>
                <PricingFeature included>Unlimited flashcards</PricingFeature>
                <PricingFeature included>Unlimited mock exams</PricingFeature>
                <PricingFeature included>
                  Full progress analytics
                </PricingFeature>
                <PricingFeature included>
                  AI question generation (100/mo)
                </PricingFeature>
                <PricingFeature included>
                  Spaced repetition system
                </PricingFeature>
                <PricingFeature included>Full lesson content</PricingFeature>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Premium</h3>
              <p className="text-sm text-slate-500 mb-6">
                For serious board exam prep
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₱499
                </span>
                <span className="text-slate-500">/month</span>
              </div>
              <Link to="/auth/register">
                <Button variant="outline" className="w-full mb-8">
                  Start Free Trial
                </Button>
              </Link>
              <ul className="space-y-4">
                <PricingFeature included>Everything in Pro</PricingFeature>
                <PricingFeature included>
                  Unlimited AI generation
                </PricingFeature>
                <PricingFeature included>Priority support</PricingFeature>
                <PricingFeature included>
                  Downloadable study materials
                </PricingFeature>
                <PricingFeature included>
                  Early access to new features
                </PricingFeature>
                <PricingFeature included>Study group features</PricingFeature>
                <PricingFeature included>
                  1-on-1 study consultation
                </PricingFeature>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Save with Annual Billing
          </h2>
          <p className="text-teal-100 mb-6">
            Get 2 months free when you pay annually. That's ₱4,990/year for Pro
            (save ₱998).
          </p>
          <Link to="/auth/register">
            <Button
              variant="outline"
              className="bg-white text-teal-600 border-white hover:bg-teal-50"
            >
              Get Annual Plan
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <FAQ
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FAQ
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, GCash, Maya, and bank transfers for Philippine customers."
            />
            <FAQ
              question="Is there a student discount?"
              answer="Yes! Verified students get 20% off any paid plan. Contact us with your school ID to claim your discount."
            />
            <FAQ
              question="What happens after my free trial?"
              answer="After your 7-day trial, you'll be automatically enrolled in the Free plan unless you choose to upgrade. No credit card required for the trial."
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function PricingFeature({
  children,
  included = false
}: {
  children: React.ReactNode;
  included?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-slate-300 flex-shrink-0" />
      )}
      <span className={included ? 'text-slate-700' : 'text-slate-400'}>
        {children}
      </span>
    </li>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-bold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  );
}
