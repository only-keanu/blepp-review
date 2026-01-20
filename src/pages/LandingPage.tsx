import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BookOpen, Brain, Clock, BarChart3, CheckCircle2, Shield } from 'lucide-react';
export function LandingPage() {
  return <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-teal-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                BLEPP Review
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
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
      <div className="relative overflow-hidden bg-slate-50 pt-16 pb-32">
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
              New: AI-Powered Question Generation
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Master the Psychology Board Exam with{' '}
              <span className="text-teal-600">Intelligent Study</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              The all-in-one review platform for aspiring Psychologists.
              Personalized study plans, active recall quizzes, and AI-generated
              questions from your own materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card required • 7-day free trial
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Everything you need to pass
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Built on learning science principles to maximize retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<Brain className="h-6 w-6 text-teal-600" />} title="AI Question Generator" description="Upload your PDF reviewers and let our AI create board-style multiple choice questions instantly." />
            <FeatureCard icon={<Clock className="h-6 w-6 text-teal-600" />} title="Spaced Repetition" description="Smart algorithms schedule reviews at the perfect time so you never forget what you've learned." />
            <FeatureCard icon={<BarChart3 className="h-6 w-6 text-teal-600" />} title="Readiness Analytics" description="Track your performance by topic and know exactly when you're ready to take the board exam." />
          </div>
        </div>
      </div>

      {/* Social Proof / Trust */}
      <div className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Designed for the Philippine Psychology Licensure Exam
              </h2>
              <ul className="space-y-4">
                {['Covers all 4 major board subjects', 'Updated with latest RA 10029 Ethics', 'Board-style question formatting', 'Mobile-friendly for studying on the go'].map((item, i) => <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>)}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-10 w-10 text-teal-600" />
                <div>
                  <h3 className="font-bold text-slate-900">Secure & Private</h3>
                  <p className="text-sm text-slate-500">
                    Your data is safe with us
                  </p>
                </div>
              </div>
              <p className="text-slate-600 italic">
                "This platform helped me organize my review. The spaced
                repetition feature is a game changer for remembering theories
                and names."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Rina D.</p>
                  <p className="text-xs text-slate-500">
                    RPm, August 2023 Passer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to top the boards?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of psychology students preparing smarter, not harder.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>

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
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
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
    </div>;
}
function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:border-teal-100 hover:shadow-md transition-all">
      <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>;
}