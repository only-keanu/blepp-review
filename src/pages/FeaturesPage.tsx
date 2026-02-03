import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
  Brain,
  Clock,
  BarChart3,
  FileText,
  Layers,
  Smartphone,
  Shield,
  Zap,
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Powerful Features for{' '}
            <span className="text-teal-600">Smarter Studying</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to prepare for the Psychology Board Exam, built
            on proven learning science principles.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Brain className="h-7 w-7 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  AI Question Generator
                </h3>
                <p className="text-slate-600 mb-4">
                  Upload your PDF reviewers and textbooks. Our AI analyzes the
                  content and generates board-style multiple choice questions
                  instantly. Save hours of manual question creation.
                </p>
                <ul className="space-y-2">
                  {[
                    'Supports PDF uploads up to 50MB',
                    'Generates questions in seconds',
                    'Board exam format matching'
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Spaced Repetition System
                </h3>
                <p className="text-slate-600 mb-4">
                  Our algorithm schedules reviews at scientifically optimal
                  intervals. Questions you struggle with appear more often;
                  mastered content fades into longer intervals.
                </p>
                <ul className="space-y-2">
                  {[
                    'Personalized review schedules',
                    'Difficulty-based intervals',
                    'Never forget what you learn'
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Readiness Analytics
                </h3>
                <p className="text-slate-600 mb-4">
                  Know exactly when you're ready to take the exam. Our readiness
                  score combines accuracy, consistency, coverage, and mock exam
                  performance into one clear metric.
                </p>
                <ul className="space-y-2">
                  {[
                    'Topic-by-topic breakdown',
                    'Trend analysis over time',
                    'Personalized recommendations'
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-7 w-7 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Realistic Mock Exams
                </h3>
                <p className="text-slate-600 mb-4">
                  Simulate the actual board exam experience with timed tests
                  covering all subjects. Get detailed score breakdowns and
                  review your mistakes.
                </p>
                <ul className="space-y-2">
                  {[
                    'Full-length 150-question simulations',
                    'Timed exam environment',
                    'Detailed performance reports'
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 text-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <Layers className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Smart Flashcards
                </h3>
                <p className="text-slate-600 mb-4">
                  Create and study flashcards with our beautiful flip-card
                  interface. Rate your confidence and let the system optimize
                  your review schedule.
                </p>
                <ul className="space-y-2">
                  {[
                    'Create unlimited flashcards',
                    'Confidence-based scheduling',
                    'Organize by topic and category'
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Structured Curriculum
                </h3>
                <p className="text-slate-600 mb-4">
                  Follow our expertly designed lesson plans covering all board
                  exam topics. Learn concepts before testing yourself with
                  practice questions.
                </p>
                <ul className="space-y-2">
                  {[
                    '5 major subject areas covered',
                    'Sequential lesson progression',
                    'Key concepts and board tips'
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="h-4 w-4 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            And Much More...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <Smartphone className="h-8 w-8 text-teal-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Mobile Friendly</h3>
              <p className="text-sm text-slate-600">
                Study anywhere on any device with our responsive design.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <Shield className="h-8 w-8 text-teal-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-sm text-slate-600">
                Your data is encrypted and never shared with third parties.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <Zap className="h-8 w-8 text-teal-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Fast & Reliable</h3>
              <p className="text-sm text-slate-600">
                Lightning-fast performance so you can focus on studying.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to experience these features?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Start your free trial today and see the difference.
          </p>
          <Link to="/auth/register">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
