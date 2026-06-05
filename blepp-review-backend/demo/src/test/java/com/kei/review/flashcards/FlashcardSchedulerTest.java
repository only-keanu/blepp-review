package com.kei.review.flashcards;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class FlashcardSchedulerTest {
    private final FlashcardScheduler scheduler = new FlashcardScheduler();
    private final Instant now = Instant.parse("2026-06-05T00:00:00Z");

    @Test
    void againOnReviewCardMovesToRelearningSoonAndCountsLapse() {
        Flashcard flashcard = Flashcard.builder()
            .reviewState(FlashcardReviewState.REVIEW)
            .intervalDays(10)
            .easeFactor(2500)
            .repetitionCount(3)
            .lapseCount(1)
            .build();

        scheduler.applyReview(flashcard, FlashcardRating.AGAIN, now);

        assertEquals(FlashcardReviewState.RELEARNING, flashcard.getReviewState());
        assertEquals(0, flashcard.getIntervalDays());
        assertEquals(2300, flashcard.getEaseFactor());
        assertEquals(0, flashcard.getRepetitionCount());
        assertEquals(2, flashcard.getLapseCount());
        assertEquals(FlashcardConfidence.LOW, flashcard.getConfidence());
        assertEquals(now.plusSeconds(600), flashcard.getDueAt());
        assertNotNull(flashcard.getNextReview());
    }

    @Test
    void goodOnReviewCardUsesEaseFactorToGrowInterval() {
        Flashcard flashcard = Flashcard.builder()
            .reviewState(FlashcardReviewState.REVIEW)
            .intervalDays(6)
            .easeFactor(2400)
            .repetitionCount(2)
            .lapseCount(0)
            .build();

        scheduler.applyReview(flashcard, FlashcardRating.GOOD, now);

        assertEquals(FlashcardReviewState.REVIEW, flashcard.getReviewState());
        assertEquals(14, flashcard.getIntervalDays());
        assertEquals(2400, flashcard.getEaseFactor());
        assertEquals(3, flashcard.getRepetitionCount());
        assertEquals(FlashcardConfidence.MEDIUM, flashcard.getConfidence());
        assertEquals(now.plusSeconds(14L * 24 * 60 * 60), flashcard.getDueAt());
    }

    @Test
    void hardReviewDoesNotDropEaseBelowMinimum() {
        Flashcard flashcard = Flashcard.builder()
            .reviewState(FlashcardReviewState.REVIEW)
            .intervalDays(3)
            .easeFactor(1300)
            .repetitionCount(2)
            .build();

        scheduler.applyReview(flashcard, FlashcardRating.HARD, now);

        assertEquals(FlashcardReviewState.REVIEW, flashcard.getReviewState());
        assertTrue(flashcard.getIntervalDays() >= 4);
        assertEquals(FlashcardScheduler.MIN_EASE_FACTOR, flashcard.getEaseFactor());
        assertEquals(FlashcardConfidence.LOW, flashcard.getConfidence());
    }

    @Test
    void easyNewCardGraduatesToFourDayReview() {
        Flashcard flashcard = Flashcard.builder().build();

        scheduler.applyReview(flashcard, FlashcardRating.EASY, now);

        assertEquals(FlashcardReviewState.REVIEW, flashcard.getReviewState());
        assertEquals(4, flashcard.getIntervalDays());
        assertEquals(2650, flashcard.getEaseFactor());
        assertEquals(1, flashcard.getRepetitionCount());
        assertEquals(FlashcardConfidence.HIGH, flashcard.getConfidence());
    }
}
