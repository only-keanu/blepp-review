export interface User {
  id: string;
  email: string;
  fullName: string;
  targetExamDate: string;
  dailyStudyHours: number;
  avatarUrl?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
}

export interface Question {
  id: string;
  text: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
  topicId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'difficult';
  source: 'pdf' | 'ai' | 'manual';
  tags: string[];
  category?: string;
  createdAt?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  category?: string;
  confidence?: 'low' | 'medium' | 'high';
  nextReview?: string;
  createdAt?: string;
}

export interface AnswerAttempt {
  id: string;
  userId: string;
  questionId: string;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  timestamp: string;
  timeTakenSeconds: number;
}

export interface MockExam {
  id: string;
  title: string;
  totalQuestions: number;
  durationMinutes: number;
  completed: boolean;
  score?: number;
  dateTaken?: string;
}

export interface StudyPlanItem {
  id: string;
  topicId: string;
  topicName: string;
  taskType: 'questions' | 'flashcards' | 'video';
  count: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  date: string;
  items: StudyPlanItem[];
  totalTimeMinutes: number;
}