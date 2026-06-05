package com.kei.review.flashcards;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

class FlashcardScheduler {
    static final int INITIAL_EASE_FACTOR = 2500;
    static final int MIN_EASE_FACTOR = 1300;

    private static final int AGAIN_EASE_DELTA = -200;
    private static final int HARD_EASE_DELTA = -150;
    private static final int EASY_EASE_DELTA = 150;
    private static final ZoneId SYSTEM_ZONE = ZoneId.systemDefault();

    void applyReview(Flashcard flashcard, FlashcardRating rating, Instant reviewedAt) {
        FlashcardRating effectiveRating = rating == null ? FlashcardRating.AGAIN : rating;
        FlashcardReviewState state = reviewState(flashcard);
        int intervalDays = intervalDays(flashcard);
        int easeFactor = easeFactor(flashcard);
        int repetitions = repetitionCount(flashcard);
        int lapses = lapseCount(flashcard);

        if (effectiveRating == FlashcardRating.AGAIN) {
            flashcard.setReviewState(state == FlashcardReviewState.NEW
                ? FlashcardReviewState.LEARNING
                : FlashcardReviewState.RELEARNING);
            flashcard.setDueAt(reviewedAt.plus(10, ChronoUnit.MINUTES));
            flashcard.setIntervalDays(0);
            flashcard.setEaseFactor(adjustEase(easeFactor, AGAIN_EASE_DELTA));
            flashcard.setRepetitionCount(0);
            flashcard.setLapseCount(state == FlashcardReviewState.NEW ? lapses : lapses + 1);
            setReviewMetadata(flashcard, reviewedAt, FlashcardConfidence.LOW);
            return;
        }

        if (effectiveRating == FlashcardRating.HARD) {
            int nextInterval = state == FlashcardReviewState.NEW || state == FlashcardReviewState.LEARNING
                ? 1
                : Math.max(intervalDays + 1, Math.round(intervalDays * 1.2f));
            graduate(flashcard, reviewedAt, nextInterval, adjustEase(easeFactor, HARD_EASE_DELTA), repetitions, lapses,
                FlashcardConfidence.LOW);
            return;
        }

        if (effectiveRating == FlashcardRating.GOOD) {
            int nextInterval = goodInterval(intervalDays, repetitions, state, easeFactor);
            graduate(flashcard, reviewedAt, nextInterval, easeFactor, repetitions, lapses, FlashcardConfidence.MEDIUM);
            return;
        }

        int nextInterval = easyInterval(intervalDays, repetitions, state, easeFactor);
        graduate(flashcard, reviewedAt, nextInterval, adjustEase(easeFactor, EASY_EASE_DELTA), repetitions, lapses,
            FlashcardConfidence.HIGH);
    }

    boolean isDue(Flashcard flashcard, Instant now) {
        Instant dueAt = effectiveDueAt(flashcard);
        return dueAt == null || !dueAt.isAfter(now);
    }

    Instant effectiveDueAt(Flashcard flashcard) {
        if (flashcard.getDueAt() != null) {
            return flashcard.getDueAt();
        }
        LocalDate nextReview = flashcard.getNextReview();
        if (nextReview == null) {
            return null;
        }
        return nextReview.atStartOfDay(SYSTEM_ZONE).toInstant();
    }

    int duePriority(Flashcard flashcard) {
        FlashcardReviewState state = reviewState(flashcard);
        if (state == FlashcardReviewState.LEARNING || state == FlashcardReviewState.RELEARNING) {
            return 0;
        }
        if (state == FlashcardReviewState.REVIEW || effectiveDueAt(flashcard) != null) {
            return 1;
        }
        return 2;
    }

    int easeFactor(Flashcard flashcard) {
        return flashcard.getEaseFactor() == null ? INITIAL_EASE_FACTOR : flashcard.getEaseFactor();
    }

    int lapseCount(Flashcard flashcard) {
        return flashcard.getLapseCount() == null ? 0 : flashcard.getLapseCount();
    }

    FlashcardReviewState reviewState(Flashcard flashcard) {
        FlashcardReviewState state = flashcard.getReviewState();
        if (state != null && state != FlashcardReviewState.NEW) {
            return state;
        }
        if (flashcard.getDueAt() != null || flashcard.getNextReview() != null || flashcard.getConfidence() != null) {
            return FlashcardReviewState.REVIEW;
        }
        return FlashcardReviewState.NEW;
    }

    void initializeNewCard(Flashcard flashcard) {
        if (flashcard.getReviewState() == null) {
            flashcard.setReviewState(FlashcardReviewState.NEW);
        }
        if (flashcard.getIntervalDays() == null) {
            flashcard.setIntervalDays(0);
        }
        if (flashcard.getEaseFactor() == null) {
            flashcard.setEaseFactor(INITIAL_EASE_FACTOR);
        }
        if (flashcard.getRepetitionCount() == null) {
            flashcard.setRepetitionCount(0);
        }
        if (flashcard.getLapseCount() == null) {
            flashcard.setLapseCount(0);
        }
    }

    private void graduate(
        Flashcard flashcard,
        Instant reviewedAt,
        int nextInterval,
        int easeFactor,
        int repetitions,
        int lapses,
        FlashcardConfidence confidence
    ) {
        int interval = Math.max(1, nextInterval);
        flashcard.setReviewState(FlashcardReviewState.REVIEW);
        flashcard.setIntervalDays(interval);
        flashcard.setEaseFactor(easeFactor);
        flashcard.setRepetitionCount(repetitions + 1);
        flashcard.setLapseCount(lapses);
        flashcard.setDueAt(reviewedAt.plus(interval, ChronoUnit.DAYS));
        setReviewMetadata(flashcard, reviewedAt, confidence);
    }

    private void setReviewMetadata(Flashcard flashcard, Instant reviewedAt, FlashcardConfidence confidence) {
        flashcard.setConfidence(confidence);
        flashcard.setLastReviewedAt(reviewedAt);
        flashcard.setNextReview(LocalDate.ofInstant(flashcard.getDueAt(), SYSTEM_ZONE));
    }

    private int goodInterval(int currentInterval, int repetitions, FlashcardReviewState state, int easeFactor) {
        if (state == FlashcardReviewState.NEW || state == FlashcardReviewState.LEARNING
            || state == FlashcardReviewState.RELEARNING) {
            return 1;
        }
        if (repetitions <= 1) {
            return 6;
        }
        return Math.round(Math.max(1, currentInterval) * (easeFactor / 1000.0f));
    }

    private int easyInterval(int currentInterval, int repetitions, FlashcardReviewState state, int easeFactor) {
        if (state == FlashcardReviewState.NEW || state == FlashcardReviewState.LEARNING
            || state == FlashcardReviewState.RELEARNING) {
            return 4;
        }
        if (repetitions <= 1) {
            return 7;
        }
        return Math.round(Math.max(1, currentInterval) * ((easeFactor + EASY_EASE_DELTA) / 1000.0f) * 1.3f);
    }

    private int intervalDays(Flashcard flashcard) {
        return flashcard.getIntervalDays() == null ? 0 : flashcard.getIntervalDays();
    }

    private int repetitionCount(Flashcard flashcard) {
        return flashcard.getRepetitionCount() == null ? 0 : flashcard.getRepetitionCount();
    }

    private int adjustEase(int easeFactor, int delta) {
        return Math.max(MIN_EASE_FACTOR, easeFactor + delta);
    }
}
