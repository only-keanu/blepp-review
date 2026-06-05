package com.kei.review.flashcards;

import com.kei.review.topics.Topic;
import com.kei.review.users.User;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "flashcards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    private String front;

    private String back;

    private String category;

    @Enumerated(EnumType.STRING)
    private FlashcardConfidence confidence;

    private LocalDate nextReview;

    private Instant createdAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private FlashcardReviewState reviewState = FlashcardReviewState.NEW;

    private Instant dueAt;

    @Builder.Default
    private Integer intervalDays = 0;

    @Builder.Default
    private Integer easeFactor = FlashcardScheduler.INITIAL_EASE_FACTOR;

    @Builder.Default
    private Integer repetitionCount = 0;

    @Builder.Default
    private Integer lapseCount = 0;

    private Instant lastReviewedAt;

    @PrePersist
    @PreUpdate
    void ensureSchedulerDefaults() {
        if (reviewState == null) {
            reviewState = FlashcardReviewState.NEW;
        }
        if (intervalDays == null) {
            intervalDays = 0;
        }
        if (easeFactor == null) {
            easeFactor = FlashcardScheduler.INITIAL_EASE_FACTOR;
        }
        if (repetitionCount == null) {
            repetitionCount = 0;
        }
        if (lapseCount == null) {
            lapseCount = 0;
        }
    }
}
