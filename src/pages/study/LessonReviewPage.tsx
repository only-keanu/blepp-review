import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Lightbulb,
  BookMarked,
  GraduationCap,
  AlertCircle,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchLessonProgress, markLessonComplete } from '../../lib/lessonProgressApi';

interface LessonSection {
  id: string;
  title: string;
  content: string;
  keyPoints?: string[];
  example?: {
    title: string;
    description: string;
  };
  tip?: string;
}

interface LessonContent {
  id: string;
  topicSlug: string;
  number: number;
  title: string;
  description: string;
  duration: number;
  objectives: string[];
  sections: LessonSection[];
  summary: string[];
  questionsCount: number;
}

const LESSON_CONTENT: Record<string, LessonContent> = {
  g1: {
    id: 'g1',
    topicSlug: 'general',
    number: 1,
    title: 'Introduction to Psychology',
    description: 'History, scope, and goals of psychology as a science',
    duration: 25,
    objectives: [
      'Define psychology and explain its goals',
      'Trace the historical development of psychology',
      'Identify major schools of thought in psychology',
      'Understand the scientific nature of psychology'
    ],
    sections: [
      {
        id: 's1',
        title: 'What is Psychology?',
        content: 'Psychology is the scientific study of behavior and mental processes. The word comes from the Greek words "psyche" (soul/mind) and "logos" (study of). Modern psychology uses scientific methods to understand, explain, predict, and sometimes change behavior and mental processes.\n\nPsychology encompasses a vast range of topics including perception, cognition, emotion, personality, behavior, and interpersonal relationships. It also examines the unconscious mind and how our experiences shape who we are.',
        keyPoints: [
          'Psychology is a science that studies behavior and mental processes',
          'It uses empirical methods to gather evidence',
          'The field covers both observable behavior and internal mental states',
          'Psychology aims to describe, explain, predict, and control behavior'
        ],
        tip: 'Remember: Psychology is not just about mental illness—it studies all aspects of human experience and behavior.'
      },
      {
        id: 's2',
        title: 'Goals of Psychology',
        content: 'Psychology has four main goals that guide research and practice:\n\n1. Description - Observing and describing behavior accurately. What is happening?\n\n2. Explanation - Understanding why behavior occurs. Why is it happening?\n\n3. Prediction - Anticipating future behavior based on patterns. When will it happen again?\n\n4. Control/Change - Applying knowledge to modify behavior in beneficial ways. How can we change it?\n\nThese goals build upon each other, with description being the foundation and control being the ultimate application of psychological knowledge.',
        keyPoints: [
          'Description: Accurately observing and recording behavior',
          'Explanation: Understanding causes and mechanisms',
          'Prediction: Forecasting future behavior',
          'Control: Applying knowledge to help people'
        ],
        example: {
          title: 'Clinical Application',
          description:
            "A clinical psychologist first describes a patient's symptoms (depression), explains possible causes (cognitive distortions), predicts outcomes (without treatment, symptoms may worsen), and implements control (cognitive-behavioral therapy to change thought patterns)."
        }
      },
      {
        id: 's3',
        title: 'Historical Foundations',
        content: 'Psychology emerged as a formal discipline in 1879 when Wilhelm Wundt established the first psychology laboratory in Leipzig, Germany. However, questions about the mind and behavior date back to ancient philosophers like Plato and Aristotle.\n\nKey Historical Milestones:\n\n- 1879: Wilhelm Wundt opens first psychology lab (Structuralism)\n- 1890: William James publishes "Principles of Psychology" (Functionalism)\n- 1900s: Sigmund Freud develops Psychoanalysis\n- 1913: John Watson introduces Behaviorism\n- 1950s: Humanistic psychology emerges (Maslow, Rogers)\n- 1960s: Cognitive Revolution begins\n- Present: Integration of multiple perspectives',
        keyPoints: [
          'Wilhelm Wundt is the "Father of Modern Psychology"',
          'First psychology lab established in 1879 in Leipzig, Germany',
          'Psychology evolved from philosophy and physiology',
          'Multiple schools of thought developed over time'
        ],
        tip: 'For the board exam, remember key figures and their contributions: Wundt (Structuralism), James (Functionalism), Freud (Psychoanalysis), Watson (Behaviorism), Maslow/Rogers (Humanism).'
      },
      {
        id: 's4',
        title: 'Major Schools of Thought',
        content: 'Throughout its history, psychology has developed several major perspectives or "schools of thought":\n\nStructuralism (Wundt, Titchener) - Focused on breaking down consciousness into basic elements, used introspection.\n\nFunctionalism (William James) - Studied the purpose and function of behavior, influenced by Darwin.\n\nPsychoanalysis (Sigmund Freud) - Emphasized unconscious processes and early childhood experiences.\n\nBehaviorism (Watson, Skinner) - Focused only on observable behavior.\n\nHumanistic Psychology (Maslow, Rogers) - Emphasized free will and self-actualization.\n\nCognitive Psychology - Studies mental processes like thinking, memory, and problem-solving.',
        keyPoints: [
          'Structuralism: Breaking down consciousness into elements',
          'Functionalism: Understanding the purpose of behavior',
          'Psychoanalysis: Unconscious mind and early experiences',
          'Behaviorism: Observable behavior only',
          'Humanism: Free will and self-actualization',
          'Cognitive: Mental processes and information processing'
        ],
        example: {
          title: 'Different Perspectives on Depression',
          description:
            'A behaviorist might focus on learned helplessness, a cognitive psychologist on negative thought patterns, a psychoanalyst on unconscious conflicts, and a humanist on blocked self-actualization. Modern psychology often integrates these perspectives.'
        }
      }
    ],
    summary: [
      'Psychology is the scientific study of behavior and mental processes',
      'The four goals are: describe, explain, predict, and control',
      'Wilhelm Wundt established psychology as a formal discipline in 1879',
      'Major schools include Structuralism, Functionalism, Psychoanalysis, Behaviorism, Humanism, and Cognitive Psychology',
      'Modern psychology integrates multiple perspectives for a comprehensive understanding'
    ],
    questionsCount: 10
  }
};

const getDefaultContent = (topicSlug: string, lessonId: string): LessonContent => ({
  id: lessonId,
  topicSlug,
  number: 1,
  title: 'Lesson Content',
  description: 'This lesson content is being prepared.',
  duration: 30,
  objectives: [
    'Understand the key concepts of this topic',
    'Apply knowledge to practical situations',
    'Prepare for related exam questions'
  ],
  sections: [
    {
      id: 's1',
      title: 'Introduction',
      content:
        'This lesson content is currently being developed. Please check back later for the full content, or proceed to the practice questions to test your existing knowledge.',
      keyPoints: [
        'Content is being prepared',
        'Practice questions are available',
        'Check back for updates'
      ]
    }
  ],
  summary: ['Content coming soon'],
  questionsCount: 10
});

export function LessonReviewPage() {
  const { topicSlug, lessonId } = useParams<{ topicSlug: string; lessonId: string }>();
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;
    if (!topicSlug || !lessonId) {
      return undefined;
    }
    fetchLessonProgress(topicSlug)
      .then((data) => {
        if (!isActive) {
          return;
        }
        setIsCompleted(data.some((item) => item.lessonId === lessonId));
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setIsCompleted(false);
      });
    return () => {
      isActive = false;
    };
  }, [topicSlug, lessonId]);

  const lessonContent =
    lessonId && LESSON_CONTENT[lessonId]
      ? LESSON_CONTENT[lessonId]
      : topicSlug && lessonId
        ? getDefaultContent(topicSlug, lessonId)
        : null;

  if (!lessonContent || !topicSlug) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lesson not found</h2>
          <Link
            to="/dashboard/study/topics"
            className="text-teal-600 hover:underline mt-4 inline-block"
          >
            Back to Topics
          </Link>
        </div>
      </AppLayout>
    );
  }

  const currentSection = lessonContent.sections[currentSectionIndex];
  const totalSections = lessonContent.sections.length;
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;
  const isLastSection = currentSectionIndex === totalSections - 1;

  const handleNextSection = () => {
    setCompletedSections((prev) => new Set([...prev, currentSection.id]));
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkComplete = async () => {
    if (!topicSlug || !lessonId || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await markLessonComplete(topicSlug, lessonId);
      setIsCompleted(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/dashboard/study/topics/${topicSlug}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">
                Lesson {lessonContent.number}
              </Badge>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {lessonContent.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{lessonContent.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4" />
              <span>{lessonContent.duration} min</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reading Progress
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Section {currentSectionIndex + 1} of {totalSections}
            </span>
          </div>
          <Progress value={progress} size="sm" />

          <div className="flex justify-center gap-2 mt-4">
            {lessonContent.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setCurrentSectionIndex(index)}
                className={
                  `h-2.5 rounded-full transition-all ${
                    index === currentSectionIndex
                      ? 'w-8 bg-teal-600'
                      : completedSections.has(section.id)
                        ? 'w-2.5 bg-green-500'
                        : 'w-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                  }`
                }
                title={section.title}
              />
            ))}
          </div>
        </div>

        {currentSectionIndex === 0 && (
          <Card className="mb-6 border-l-4 border-l-teal-500">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Learning Objectives
                </h3>
                <ul className="space-y-1">
                  {lessonContent.objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {currentSection.title}
          </h2>

          <div className="prose prose-slate max-w-none mb-6">
            {currentSection.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          {currentSection.keyPoints && (
            <div className="bg-teal-50 dark:bg-teal-950/40 rounded-lg p-5 mb-6 border border-teal-100 dark:border-teal-900">
              <div className="flex items-center gap-2 mb-3">
                <BookMarked className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-teal-900 dark:text-teal-100">Key Points</h4>
              </div>
              <ul className="space-y-2">
                {currentSection.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-teal-800 dark:text-teal-200">
                    <span className="text-teal-500 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentSection.example && (
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-5 mb-6 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  {currentSection.example.title}
                </h4>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {currentSection.example.description}
              </p>
            </div>
          )}

          {currentSection.tip && (
            <div className="bg-amber-50 dark:bg-amber-950/40 rounded-lg p-5 border border-amber-100 dark:border-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Board Exam Tip
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{currentSection.tip}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {isLastSection && (
          <Card className="mb-6 border-l-4 border-l-green-500">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Lesson Summary
                </h3>
                <ul className="space-y-2">
                  {lessonContent.summary.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-green-500 font-bold">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button
                    variant={isCompleted ? 'outline' : 'primary'}
                    onClick={handleMarkComplete}
                    disabled={isCompleted || isSaving}
                  >
                    {isCompleted ? 'Completed' : isSaving ? 'Saving...' : 'Mark as Complete'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between py-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handlePrevSection}
            disabled={currentSectionIndex === 0}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {isLastSection ? (
              <>
                <Button variant="outline" onClick={() => navigate(`/dashboard/study/topics/${topicSlug}`)}>
                  Back to Lessons
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/dashboard/study/practice?topic=${topicSlug}&lesson=${lessonId}`)
                  }
                  leftIcon={<Play className="h-4 w-4" />}
                >
                  Take Quiz ({lessonContent.questionsCount} Questions)
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNextSection}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next Section
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
