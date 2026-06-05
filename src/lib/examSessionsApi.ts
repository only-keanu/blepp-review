import { apiFetch } from './api';

export type ExamSessionStatus = 'IN_PROGRESS' | 'SUBMITTED';

export type RecentExamSession = {
  id: string;
  examId: string | null;
  title: string;
  status: ExamSessionStatus;
  startedAt: string | null;
  submittedAt: string | null;
  score: number | null;
  totalQuestions: number | null;
  durationMinutes: number | null;
  timeTakenSeconds: number | null;
  answeredCount: number;
};

export async function fetchRecentExamSessions(limit: number) {
  return apiFetch<RecentExamSession[]>(`/api/exams/sessions/recent?limit=${limit}`);
}
