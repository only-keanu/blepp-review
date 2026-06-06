import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ContactBubble } from '../components/contact/ContactBubble';
import {
  BookOpen,
  Brain,
  Clock,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Shield } from
'lucide-react';
export function LandingPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="BLEPP Review home">
              <div className="bg-teal-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                BLEPP Review
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">

                Home
              </Link>
              <Link
                to="/features"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">

                Features
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">

                Pricing
              </Link>
              <a
                href="#faqs"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">

                FAQs
              </a>
              <Link
                to="/auth/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">

                Sign in
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 pt-16 pb-32">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 h-96 w-96 bg-teal-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 h-96 w-96 bg-blue-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Launch pass: PHP 299 for 30 days
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-6">
              Master the Psychology Board Exam with{' '}
              <span className="text-teal-600">Intelligent Study</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
              The all-in-one review platform for aspiring Psychologists.
              Personalized study plans, active recall quizzes, mock exams,
              flashcards, and readiness analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8">

                  PHP 299 Launch Pass
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Create Account
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Try the study tools, then unlock 30 days for PHP 299 through GCash.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Everything you need to pass
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Built on learning science principles to maximize retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-6 w-6 text-teal-600" />}
              title="AI Question Generator"
              description="Coming soon. The current launch pass focuses on the study tools available today." />

            <FeatureCard
              icon={<Clock className="h-6 w-6 text-teal-600" />}
              title="Spaced Repetition"
              description="Smart algorithms schedule reviews at the perfect time so you never forget what you've learned." />

            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-teal-600" />}
              title="Readiness Analytics"
              description="Track your performance by topic and know exactly when you're ready to take the board exam." />

          </div>
        </div>
      </div>

      {/* Social Proof / Trust */}
      <div className="bg-slate-50 dark:bg-slate-900 py-16 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Designed for the Philippine Psychology Licensure Exam
              </h2>
              <ul className="space-y-4">
                {[
                'Covers all 4 major board subjects',
                'Updated with latest RA 10029 Ethics',
                'Board-style question formatting',
                'Mobile-friendly for studying on the go'].
                map((item, i) =>
                <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-10 w-10 text-teal-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Secure & Private</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your data is safe with us
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "This platform helped me organize my review. The spaced
                repetition feature is a game changer for remembering theories
                and names."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Rina D.</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    RPm, August 2023 Passer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Ready to top the boards?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of psychology students preparing smarter, not harder.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="px-8">
              Start Trial
            </Button>
          </Link>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <section
        id="faqs"
        className="scroll-mt-16 border-t border-slate-100 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Need to know more?
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Quick answers about access, payment, and the BLEPP Review study tools.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const answerId = `faq-answer-${faq.id}`;
              const questionId = `faq-question-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-950">
                  <h3>
                    <button
                      id={questionId}
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 dark:text-slate-100 dark:hover:bg-slate-900"
                      aria-expanded={isOpen}
                      aria-controls={answerId}>
                      <span>{faq.question}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 text-teal-600 transition-transform duration-200 dark:text-teal-400 ${
                          isOpen ? 'rotate-180' : ''
                        }`} />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      className="border-t border-slate-100 px-5 py-5 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-teal-500" />
              <span className="text-xl font-bold text-white tracking-tight">
                BLEPP Review
              </span>
            </div>
            <p className="max-w-xs text-sm">
              The intelligent review companion for future Filipino Psychologists
              and Psychometricians.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <ContactBubble />
    </div>);

}

const faqs = [
  {
    id: 'launch-pass-inclusions',
    question: 'What is included in the PHP 299 launch pass?',
    answer:
      'The launch pass includes practice questions, mistake review, flashcards with spaced repetition, mock exams, results review, progress and readiness analytics, lesson tracking, and question bank access.'
  },
  {
    id: 'pass-duration',
    question: 'How long does the BLEPP Review Pass last?',
    answer:
      'Each PHP 299 pass gives you 30 days of access to the core BLEPP Review study tools after your payment has been verified and your access has been activated.'
  },
  {
    id: 'gcash-activation',
    question: 'How does GCash payment and activation work?',
    answer:
      'Pay through GCash, then message the BLEPP Review Facebook page with your account email, GCash reference number, sender name or screenshot, and payment date and time. Access is activated within 24 hours after verification.'
  },
  {
    id: 'trial',
    question: 'Can I try BLEPP Review before paying?',
    answer:
      'Yes. Create an account to start the trial and explore the available study experience. You can then unlock 30 days of core study-tool access with the PHP 299 launch pass.'
  },
  {
    id: 'ai-generation',
    question: 'Is AI question generation available?',
    answer:
      'AI question generation is coming soon and is not included in the current launch pass. The available pass focuses on practice, flashcards, mock exams, lessons, mistake review, and analytics.'
  },
  {
    id: 'mobile',
    question: 'Can I use BLEPP Review on my phone or tablet?',
    answer:
      'Yes. BLEPP Review has a responsive, mobile-friendly design so you can study from a phone, tablet, laptop, or desktop browser.'
  },
  {
    id: 'refunds',
    question: 'What is the refund policy?',
    answer:
      'A 7-day refund window applies to the launch pass. Review the Terms and Conditions for the full policy and eligibility details.'
  }
] as const;

function FeatureCard({
  icon,
  title,
  description




}: {icon: React.ReactNode;title: string;description: string;}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-100 hover:shadow-md transition-all">
      <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>);

}
