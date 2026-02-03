import React, { ComponentType, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Activity,
  Users,
  Scale,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  FileText
} from 'lucide-react';
import { Lesson } from '../../types';
import { fetchLessonProgress } from '../../lib/lessonProgressApi';

export const TOPICS_DATA: Record<
  string,
  {
    id: string;
    name: string;
    slug: string;
    color: 'blue' | 'purple' | 'amber' | 'green' | 'red' | 'gray';
    icon: ComponentType<{ className?: string }>;
    description: string;
    lessons: Lesson[];
  }
> = {
  general: {
    id: '1',
    name: 'General Psychology',
    slug: 'general',
    color: 'blue',
    icon: Brain,
    description:
      'Foundations of psychological science, including history, research methods, and core concepts.',
    lessons: [
      {
        id: 'g1',
        topicSlug: 'general',
        number: 1,
        title: 'Introduction to Psychology',
        description: 'History, scope, and goals of psychology as a science',
        duration: 25,
        completed: true,
        questionsCount: 10
      },
      {
        id: 'g2',
        topicSlug: 'general',
        number: 2,
        title: 'Research Methods',
        description:
          'Scientific method, experimental design, and ethics in research',
        duration: 30,
        completed: true,
        questionsCount: 12
      },
      {
        id: 'g3',
        topicSlug: 'general',
        number: 3,
        title: 'Biological Bases of Behavior',
        description: 'Neurons, brain structure, and the nervous system',
        duration: 35,
        completed: true,
        questionsCount: 15
      },
      {
        id: 'g4',
        topicSlug: 'general',
        number: 4,
        title: 'Sensation and Perception',
        description: 'How we sense and interpret the world around us',
        duration: 30,
        completed: true,
        questionsCount: 12
      },
      {
        id: 'g5',
        topicSlug: 'general',
        number: 5,
        title: 'States of Consciousness',
        description: 'Sleep, dreams, hypnosis, and altered states',
        duration: 25,
        completed: true,
        questionsCount: 10
      },
      {
        id: 'g6',
        topicSlug: 'general',
        number: 6,
        title: 'Learning',
        description:
          'Classical conditioning, operant conditioning, and observational learning',
        duration: 35,
        completed: false,
        questionsCount: 14
      },
      {
        id: 'g7',
        topicSlug: 'general',
        number: 7,
        title: 'Memory',
        description: 'Encoding, storage, retrieval, and forgetting',
        duration: 30,
        completed: false,
        questionsCount: 12
      },
      {
        id: 'g8',
        topicSlug: 'general',
        number: 8,
        title: 'Thinking and Intelligence',
        description:
          'Problem solving, decision making, and intelligence theories',
        duration: 35,
        completed: false,
        questionsCount: 13
      },
      {
        id: 'g9',
        topicSlug: 'general',
        number: 9,
        title: 'Motivation and Emotion',
        description: 'Drives, needs, and the psychology of emotions',
        duration: 30,
        completed: false,
        questionsCount: 11
      },
      {
        id: 'g10',
        topicSlug: 'general',
        number: 10,
        title: 'Developmental Psychology',
        description:
          'Physical, cognitive, and social development across the lifespan',
        duration: 40,
        completed: false,
        questionsCount: 15
      },
      {
        id: 'g11',
        topicSlug: 'general',
        number: 11,
        title: 'Personality',
        description: 'Theories of personality and assessment methods',
        duration: 35,
        completed: false,
        questionsCount: 12
      },
      {
        id: 'g12',
        topicSlug: 'general',
        number: 12,
        title: 'Social Psychology',
        description: 'Social influence, attitudes, and group behavior',
        duration: 30,
        completed: false,
        questionsCount: 14
      }
    ]
  },
  abnormal: {
    id: '2',
    name: 'Abnormal Psychology',
    slug: 'abnormal',
    color: 'purple',
    icon: Activity,
    description:
      'Study of psychological disorders, their causes, symptoms, and treatments.',
    lessons: [
      {
        id: 'a1',
        topicSlug: 'abnormal',
        number: 1,
        title: 'Introduction to Abnormal Psychology',
        description: 'Defining abnormality and historical perspectives',
        duration: 25,
        completed: true,
        questionsCount: 8
      },
      {
        id: 'a2',
        topicSlug: 'abnormal',
        number: 2,
        title: 'Classification and Diagnosis',
        description: 'DSM-5 and diagnostic criteria',
        duration: 30,
        completed: true,
        questionsCount: 10
      },
      {
        id: 'a3',
        topicSlug: 'abnormal',
        number: 3,
        title: 'Anxiety Disorders',
        description: 'GAD, panic disorder, phobias, and OCD',
        duration: 35,
        completed: true,
        questionsCount: 12
      },
      {
        id: 'a4',
        topicSlug: 'abnormal',
        number: 4,
        title: 'Mood Disorders',
        description: 'Depression, bipolar disorder, and related conditions',
        duration: 35,
        completed: false,
        questionsCount: 12
      },
      {
        id: 'a5',
        topicSlug: 'abnormal',
        number: 5,
        title: 'Schizophrenia Spectrum',
        description: 'Symptoms, subtypes, and etiology',
        duration: 40,
        completed: false,
        questionsCount: 14
      },
      {
        id: 'a6',
        topicSlug: 'abnormal',
        number: 6,
        title: 'Personality Disorders',
        description: 'Clusters A, B, and C personality disorders',
        duration: 35,
        completed: false,
        questionsCount: 11
      },
      {
        id: 'a7',
        topicSlug: 'abnormal',
        number: 7,
        title: 'Substance-Related Disorders',
        description: 'Addiction, dependence, and treatment approaches',
        duration: 30,
        completed: false,
        questionsCount: 10
      },
      {
        id: 'a8',
        topicSlug: 'abnormal',
        number: 8,
        title: 'Neurodevelopmental Disorders',
        description: 'ADHD, autism spectrum, and learning disorders',
        duration: 35,
        completed: false,
        questionsCount: 12
      },
      {
        id: 'a9',
        topicSlug: 'abnormal',
        number: 9,
        title: 'Trauma and Stress-Related Disorders',
        description: 'PTSD, acute stress, and adjustment disorders',
        duration: 30,
        completed: false,
        questionsCount: 9
      },
      {
        id: 'a10',
        topicSlug: 'abnormal',
        number: 10,
        title: 'Treatment Approaches',
        description:
          'Psychotherapy, pharmacotherapy, and integrative approaches',
        duration: 40,
        completed: false,
        questionsCount: 13
      }
    ]
  },
  assessment: {
    id: '3',
    name: 'Psychological Assessment',
    slug: 'assessment',
    color: 'amber',
    icon: Scale,
    description:
      'Principles and methods of psychological testing and measurement.',
    lessons: [
      {
        id: 'as1',
        topicSlug: 'assessment',
        number: 1,
        title: 'Introduction to Assessment',
        description: 'History and purposes of psychological testing',
        duration: 25,
        completed: true,
        questionsCount: 8
      },
      {
        id: 'as2',
        topicSlug: 'assessment',
        number: 2,
        title: 'Reliability and Validity',
        description: 'Psychometric properties of tests',
        duration: 35,
        completed: false,
        questionsCount: 14
      },
      {
        id: 'as3',
        topicSlug: 'assessment',
        number: 3,
        title: 'Intelligence Testing',
        description: 'IQ tests, theories of intelligence, and interpretation',
        duration: 40,
        completed: false,
        questionsCount: 15
      },
      {
        id: 'as4',
        topicSlug: 'assessment',
        number: 4,
        title: 'Personality Assessment',
        description: 'Objective and projective personality tests',
        duration: 35,
        completed: false,
        questionsCount: 12
      },
      {
        id: 'as5',
        topicSlug: 'assessment',
        number: 5,
        title: 'Neuropsychological Assessment',
        description: 'Cognitive and brain function testing',
        duration: 35,
        completed: false,
        questionsCount: 11
      },
      {
        id: 'as6',
        topicSlug: 'assessment',
        number: 6,
        title: 'Clinical Interviewing',
        description: 'Structured and unstructured interview techniques',
        duration: 30,
        completed: false,
        questionsCount: 10
      },
      {
        id: 'as7',
        topicSlug: 'assessment',
        number: 7,
        title: 'Behavioral Assessment',
        description: 'Observation methods and functional analysis',
        duration: 30,
        completed: false,
        questionsCount: 10
      },
      {
        id: 'as8',
        topicSlug: 'assessment',
        number: 8,
        title: 'Test Administration and Ethics',
        description: 'Standards, ethics, and report writing',
        duration: 35,
        completed: false,
        questionsCount: 12
      }
    ]
  },
  industrial: {
    id: '4',
    name: 'Industrial/Organizational Psychology',
    slug: 'industrial',
    color: 'green',
    icon: Users,
    description:
      'Application of psychology to workplace behavior and organizational effectiveness.',
    lessons: [
      {
        id: 'i1',
        topicSlug: 'industrial',
        number: 1,
        title: 'Introduction to I/O Psychology',
        description: 'History, scope, and career paths',
        duration: 25,
        completed: true,
        questionsCount: 8
      },
      {
        id: 'i2',
        topicSlug: 'industrial',
        number: 2,
        title: 'Job Analysis',
        description: 'Methods and applications of job analysis',
        duration: 30,
        completed: true,
        questionsCount: 10
      },
      {
        id: 'i3',
        topicSlug: 'industrial',
        number: 3,
        title: 'Personnel Selection',
        description: 'Recruitment, selection methods, and decision making',
        duration: 35,
        completed: true,
        questionsCount: 12
      },
      {
        id: 'i4',
        topicSlug: 'industrial',
        number: 4,
        title: 'Training and Development',
        description: 'Learning principles and training program design',
        duration: 30,
        completed: true,
        questionsCount: 11
      },
      {
        id: 'i5',
        topicSlug: 'industrial',
        number: 5,
        title: 'Performance Appraisal',
        description: 'Methods, biases, and feedback systems',
        duration: 35,
        completed: true,
        questionsCount: 13
      },
      {
        id: 'i6',
        topicSlug: 'industrial',
        number: 6,
        title: 'Motivation at Work',
        description: 'Theories of work motivation and job satisfaction',
        duration: 35,
        completed: false,
        questionsCount: 12
      },
      {
        id: 'i7',
        topicSlug: 'industrial',
        number: 7,
        title: 'Leadership',
        description: 'Leadership theories and styles',
        duration: 30,
        completed: false,
        questionsCount: 11
      },
      {
        id: 'i8',
        topicSlug: 'industrial',
        number: 8,
        title: 'Organizational Culture and Climate',
        description: 'Culture, climate, and organizational change',
        duration: 30,
        completed: false,
        questionsCount: 10
      },
      {
        id: 'i9',
        topicSlug: 'industrial',
        number: 9,
        title: 'Occupational Health Psychology',
        description: 'Stress, burnout, and workplace well-being',
        duration: 35,
        completed: false,
        questionsCount: 12
      }
    ]
  },
  ethics: {
    id: '5',
    name: 'Ethics (RA 10029)',
    slug: 'ethics',
    color: 'red',
    icon: BookOpen,
    description:
      'Philippine Psychology Act, Code of Ethics, and professional standards.',
    lessons: [
      {
        id: 'e1',
        topicSlug: 'ethics',
        number: 1,
        title: 'RA 10029 Overview',
        description: 'Philippine Psychology Act of 2009 - key provisions',
        duration: 30,
        completed: true,
        questionsCount: 10
      },
      {
        id: 'e2',
        topicSlug: 'ethics',
        number: 2,
        title: 'Licensure Requirements',
        description: 'Qualifications, examinations, and registration',
        duration: 25,
        completed: false,
        questionsCount: 8
      },
      {
        id: 'e3',
        topicSlug: 'ethics',
        number: 3,
        title: 'Scope of Practice',
        description: 'Psychologist vs. Psychometrician roles and limitations',
        duration: 30,
        completed: false,
        questionsCount: 9
      },
      {
        id: 'e4',
        topicSlug: 'ethics',
        number: 4,
        title: 'Code of Ethics - General Principles',
        description: 'Beneficence, integrity, and professional responsibility',
        duration: 35,
        completed: false,
        questionsCount: 11
      },
      {
        id: 'e5',
        topicSlug: 'ethics',
        number: 5,
        title: 'Confidentiality and Privacy',
        description: 'Ethical standards for client information',
        duration: 30,
        completed: false,
        questionsCount: 10
      },
      {
        id: 'e6',
        topicSlug: 'ethics',
        number: 6,
        title: 'Professional Conduct and Violations',
        description: 'Prohibited acts and penalties',
        duration: 25,
        completed: false,
        questionsCount: 8
      }
    ]
  }
};

const TOPIC_SLUG_ALIASES: Record<string, string> = {
  'general-psychology': 'general',
  'abnormal-psychology': 'abnormal',
  'psychological-assessment': 'assessment',
  'industrial-organizational-psychology': 'industrial',
  'industrial-organizational': 'industrial',
  'ethics-ra-10029': 'ethics',
  'ethics-ra-10029-': 'ethics',
  'ethics-ra': 'ethics'
};

const COLOR_STYLES: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-300' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-300' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-300' },
  green: { bg: 'bg-green-100 dark:bg-green-950/40', text: 'text-green-600 dark:text-green-300' },
  red: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-300' },
  gray: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-300' }
};

export function TopicLessonsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const normalizedSlug = slug ? slug.toLowerCase() : '';
  const resolvedSlug = normalizedSlug ? (TOPIC_SLUG_ALIASES[normalizedSlug] ?? normalizedSlug) : '';
  const topicData = resolvedSlug ? TOPICS_DATA[resolvedSlug] : null;
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isActive = true;
    if (!resolvedSlug) {
      return undefined;
    }
    fetchLessonProgress(resolvedSlug)
      .then((data) => {
        if (!isActive) {
          return;
        }
        setCompletedSet(new Set(data.map((item) => item.lessonId)));
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setCompletedSet(new Set());
      });
    return () => {
      isActive = false;
    };
  }, [resolvedSlug]);

  if (!topicData) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Topic not found</h2>
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

  const derivedLessons = topicData.lessons.map((lesson) => ({
    ...lesson,
    completed: completedSet.has(lesson.id)
  }));
  const completedLessons = derivedLessons.filter((l) => l.completed).length;
  const totalLessons = derivedLessons.length;
  const progress = Math.round((completedLessons / totalLessons) * 100);
  const totalQuestions = derivedLessons.reduce((sum, l) => sum + l.questionsCount, 0);
  const totalDuration = derivedLessons.reduce((sum, l) => sum + l.duration, 0);
  const nextLesson = derivedLessons.find((l) => !l.completed);
  const colorStyle = COLOR_STYLES[topicData.color] ?? COLOR_STYLES.gray;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <Link
            to="/dashboard/study/topics"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl ${colorStyle.bg} ${colorStyle.text}`}>
                <topicData.icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {topicData.name}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {topicData.description}
                </p>
              </div>
            </div>

            {nextLesson && (
              <Button
                size="lg"
                onClick={() =>
                  navigate(`/dashboard/study/lesson/${resolvedSlug}/${nextLesson.id}`)
                }
                leftIcon={<Play className="h-5 w-5" />}
              >
                Continue Learning
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {completedLessons}/{totalLessons}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lessons Completed</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-300">{progress}%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {totalQuestions}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Questions</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(totalDuration / 60)}h {totalDuration % 60}m
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Est. Duration</p>
          </Card>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-slate-900 dark:text-slate-100">Course Progress</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {completedLessons} of {totalLessons} lessons
            </span>
          </div>
          <Progress value={progress} size="md" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Curriculum</h2>
          <div className="space-y-3">
            {derivedLessons.map((lesson, index) => {
              const isLocked =
                index > 0 &&
                !derivedLessons[index - 1].completed &&
                !lesson.completed;
              const isCurrent =
                !lesson.completed &&
                (index === 0 || derivedLessons[index - 1].completed);

              return (
                <div
                  key={lesson.id}
                  className={`
                    bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200
                    ${lesson.completed ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20' : isCurrent ? 'border-teal-300 dark:border-teal-700 shadow-md shadow-teal-100/40' : 'border-slate-200 dark:border-slate-800'}
                    ${!isLocked ? 'hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer' : 'opacity-60'}
                  `}
                  onClick={() => {
                    if (!isLocked) {
                      navigate(`/dashboard/study/lesson/${resolvedSlug}/${lesson.id}`);
                    }
                  }}
                >
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className={`
                      h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg
                      ${lesson.completed ? 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300' : isCurrent ? 'bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-400'}
                    `}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        lesson.number
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Lesson {lesson.number}
                        </span>
                        {isCurrent && (
                          <Badge variant="primary" size="sm">
                            Current
                          </Badge>
                        )}
                        {lesson.completed && (
                          <Badge variant="success" size="sm">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3
                        className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}
                      >
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>{lesson.questionsCount} Qs</span>
                      </div>
                    </div>

                    {!isLocked && (
                      <Button
                        variant={
                          lesson.completed
                            ? 'outline'
                            : isCurrent
                              ? 'primary'
                              : 'ghost'
                        }
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/dashboard/study/lesson/${resolvedSlug}/${lesson.id}`);
                        }}
                      >
                        {lesson.completed
                          ? 'Review'
                          : isCurrent
                            ? 'Start'
                            : 'Preview'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
