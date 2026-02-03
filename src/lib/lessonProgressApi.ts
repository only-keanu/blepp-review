import { apiFetch } from './api';

export type LessonProgressResponse = {
  id: string;
  topicSlug: string;
  lessonId: string;
  completedAt: string;
};

export async function fetchLessonProgress(topicSlug?: string) {
  const query = topicSlug ? `?topicSlug=${encodeURIComponent(topicSlug)}` : '';
  return apiFetch<LessonProgressResponse[]>(`/api/lessons/progress${query}`);
}

export async function markLessonComplete(topicSlug: string, lessonId: string) {
  return apiFetch<LessonProgressResponse>('/api/lessons/progress', {
    method: 'POST',
    body: JSON.stringify({ topicSlug, lessonId })
  });
}

export async function deleteLessonProgress(lessonId: string) {
  return apiFetch<void>(`/api/lessons/progress/${encodeURIComponent(lessonId)}`, {
    method: 'DELETE'
  });
}
