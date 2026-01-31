# API Guide

Base URL: `http://localhost:8080`

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

All protected requests must include:
```
Authorization: Bearer <accessToken>
```

## Users
- `GET /api/me`
- `PATCH /api/me`

## Topics
- `GET /api/topics`
- `PATCH /api/topics/{topicId}/weak`

## Questions
- `GET /api/questions?query=&difficulty=&source=&topicId=&tags=`
- `POST /api/questions`
- `POST /api/questions/bulk`
- `PATCH /api/questions/{questionId}`
- `DELETE /api/questions/{questionId}`

## Practice
- `POST /api/practice/session`
- `POST /api/practice/attempt`
- `GET /api/practice/mistakes`

## Flashcards
- `GET /api/flashcards`
- `POST /api/flashcards`
- `PATCH /api/flashcards/{id}`
- `POST /api/flashcards/{id}/review`
- `DELETE /api/flashcards/{id}`

## Exams (scaffolded)
- `GET /api/exams`
- `POST /api/exams/{examId}/session`
- `POST /api/exams/session/{sessionId}/answer`
- `POST /api/exams/session/{sessionId}/submit`

## Analytics (scaffolded)
- `GET /api/analytics/overview`
- `GET /api/analytics/topic-mastery`
- `GET /api/analytics/readiness`

## Generation (scaffolded)
- `POST /api/generation/upload`
- `POST /api/generation/run`
- `GET /api/generation/{jobId}`
