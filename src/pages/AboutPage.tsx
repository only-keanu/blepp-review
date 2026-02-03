import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Heart, Target, Users, Award } from 'lucide-react';

export function AboutPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            About <span className="text-teal-600">BLEPP Review</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're on a mission to help every aspiring Filipino Psychologist pass
            the board exam with confidence.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Story</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-6">
              BLEPP Review was born from a simple frustration: preparing for the
              Psychology Licensure Exam shouldn't be this hard. As former board
              exam takers ourselves, we experienced firsthand the challenges of
              scattered review materials, ineffective study methods, and the
              anxiety of not knowing if we were truly ready.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              In 2023, we set out to build the review platform we wished we had.
              Combining modern learning science—spaced repetition, active
              recall, and interleaving—with the power of AI, we created a tool
              that adapts to each student's needs and makes board exam
              preparation more efficient and less stressful.
            </p>
            <p className="text-lg text-slate-600">
              Today, BLEPP Review helps thousands of psychology students across
              the Philippines prepare smarter, not harder. We're proud to be
              part of their journey toward becoming licensed Psychologists and
              Psychometricians.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Student-First</h3>
              <p className="text-sm text-slate-600">
                Every feature we build starts with one question: will this help
                students pass?
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Excellence</h3>
              <p className="text-sm text-slate-600">
                We hold ourselves to the highest standards in content accuracy
                and platform quality.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Accessibility</h3>
              <p className="text-sm text-slate-600">
                Quality board exam prep should be affordable and accessible to
                all Filipino students.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Community</h3>
              <p className="text-sm text-slate-600">
                We're building more than a product—we're building a community of
                future psychologists.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
            Meet the Team
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            We're a small team of educators, psychologists, and engineers
            passionate about transforming how Filipinos prepare for professional
            licensure exams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <TeamMember
              name="Dr. Maria Santos"
              role="Co-Founder & Content Lead"
              bio="Licensed Psychologist with 10+ years in academic psychology. Former PRC board exam reviewer."
            />
            <TeamMember
              name="Juan dela Cruz"
              role="Co-Founder & CEO"
              bio="EdTech entrepreneur and RPm. Passionate about making quality education accessible."
            />
            <TeamMember
              name="Ana Reyes"
              role="Head of Product"
              bio="Former teacher turned product designer. Believes in the power of technology to transform learning."
            />
          </div>
        </div>
      </div>

      <div className="bg-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-teal-100 mb-6">
            Whether you're a student, educator, or just curious about what we're
            building, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button
                variant="outline"
                className="bg-white text-teal-600 border-white hover:bg-teal-50"
              >
                Start Learning
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="ghost"
                className="text-white border-white/30 hover:bg-white/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function TeamMember({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4"></div>
      <h3 className="font-bold text-slate-900">{name}</h3>
      <p className="text-sm text-teal-600 mb-2">{role}</p>
      <p className="text-sm text-slate-600">{bio}</p>
    </div>
  );
}
