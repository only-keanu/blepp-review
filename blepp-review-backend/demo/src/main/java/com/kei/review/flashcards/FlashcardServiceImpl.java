package com.kei.review.flashcards;

import com.kei.review.config.SeedData;
import com.kei.review.flashcards.dto.FlashcardCreateRequest;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardReviewQueueResponse;
import com.kei.review.flashcards.dto.FlashcardQueueSummaryResponse;
import com.kei.review.flashcards.dto.FlashcardUpdateRequest;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class FlashcardServiceImpl implements FlashcardService {
    private final FlashcardRepository flashcardRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final FlashcardScheduler scheduler = new FlashcardScheduler();

    public FlashcardServiceImpl(
        FlashcardRepository flashcardRepository,
        TopicRepository topicRepository,
        UserRepository userRepository
    ) {
        this.flashcardRepository = flashcardRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<FlashcardResponse> list(UUID userId, UUID topicId) {
        return effectiveFlashcards(userId, topicId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<FlashcardResponse> listDue(UUID userId, UUID topicId) {
        Instant now = Instant.now();
        return effectiveFlashcards(userId, topicId).stream()
            .filter(flashcard -> scheduler.isDue(flashcard, now))
            .sorted(dueComparator())
            .map(this::toResponse)
            .toList();
    }

    @Override
    public FlashcardReviewQueueResponse reviewQueue(UUID userId, UUID topicId, int limit) {
        Instant now = Instant.now();
        int effectiveLimit = Math.max(1, Math.min(limit, 100));
        List<Flashcard> flashcards = effectiveFlashcards(userId, topicId);
        List<Flashcard> dueCards = flashcards.stream()
            .filter(flashcard -> scheduler.isDue(flashcard, now))
            .sorted(dueComparator())
            .toList();
        Instant nextDueAt = nextDueAt(flashcards, now);

        if (!dueCards.isEmpty()) {
            return new FlashcardReviewQueueResponse(
                FlashcardReviewQueueMode.DUE,
                dueCards.stream().limit(effectiveLimit).map(this::toResponse).toList(),
                dueCards.size(),
                0,
                nextDueAt
            );
        }

        List<Flashcard> fallbackCards = flashcards.stream()
            .filter(flashcard -> isWeakFallbackCandidate(flashcard, now))
            .sorted(weakFallbackComparator())
            .toList();

        return new FlashcardReviewQueueResponse(
            FlashcardReviewQueueMode.WEAK_FALLBACK,
            fallbackCards.stream().limit(effectiveLimit).map(this::toResponse).toList(),
            0,
            fallbackCards.size(),
            nextDueAt
        );
    }

    @Override
    public FlashcardQueueSummaryResponse summary(UUID userId, UUID topicId) {
        Instant now = Instant.now();
        List<Flashcard> flashcards = effectiveFlashcards(userId, topicId);
        long newCards = flashcards.stream()
            .filter(flashcard -> scheduler.reviewState(flashcard) == FlashcardReviewState.NEW)
            .count();
        long scheduledDue = flashcards.stream()
            .filter(flashcard -> scheduler.isDue(flashcard, now) && scheduler.reviewState(flashcard) != FlashcardReviewState.NEW)
            .count();
        long mastered = flashcards.stream()
            .filter(flashcard -> FlashcardConfidence.HIGH == flashcard.getConfidence())
            .count();
        long learningCards = flashcards.stream()
            .filter(flashcard -> scheduler.reviewState(flashcard) == FlashcardReviewState.LEARNING
                || scheduler.reviewState(flashcard) == FlashcardReviewState.RELEARNING)
            .count();
        long reviewCards = flashcards.stream()
            .filter(flashcard -> scheduler.reviewState(flashcard) == FlashcardReviewState.REVIEW)
            .count();
        long overdueCards = flashcards.stream()
            .filter(flashcard -> {
                Instant dueAt = scheduler.effectiveDueAt(flashcard);
                return dueAt != null && dueAt.isBefore(now);
            })
            .count();
        return new FlashcardQueueSummaryResponse(newCards + scheduledDue, newCards, mastered, learningCards, reviewCards,
            overdueCards);
    }

    @Override
    public FlashcardResponse create(UUID userId, FlashcardCreateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Topic topic = topicRepository.findById(request.topicId())
            .orElseThrow(() -> new IllegalStateException("Topic not found"));

        Flashcard flashcard = Flashcard.builder()
            .user(user)
            .topic(topic)
            .front(request.front())
            .back(request.back())
            .category(request.category())
            .confidence(null)
            .nextReview(null)
            .createdAt(Instant.now())
            .build();
        scheduler.initializeNewCard(flashcard);

        return toResponse(flashcardRepository.save(flashcard));
    }

    @Override
    public FlashcardResponse update(UUID userId, UUID flashcardId, FlashcardUpdateRequest request) {
        Flashcard flashcard = flashcardRepository.findById(flashcardId)
            .orElseThrow(() -> new IllegalStateException("Flashcard not found"));
        if (!flashcard.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Flashcard not found");
        }

        if (request.front() != null) {
            flashcard.setFront(request.front());
        }
        if (request.back() != null) {
            flashcard.setBack(request.back());
        }
        if (request.category() != null) {
            flashcard.setCategory(request.category());
        }

        return toResponse(flashcardRepository.save(flashcard));
    }

    @Override
    public void delete(UUID userId, UUID flashcardId) {
        Flashcard flashcard = flashcardRepository.findById(flashcardId)
            .orElseThrow(() -> new IllegalStateException("Flashcard not found"));
        if (!flashcard.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Flashcard not found");
        }
        flashcardRepository.delete(flashcard);
    }

    @Override
    public FlashcardResponse review(UUID userId, UUID flashcardId, FlashcardReviewRequest request) {
        Flashcard flashcard = flashcardRepository.findById(flashcardId)
            .orElseThrow(() -> new IllegalStateException("Flashcard not found"));
        if (!flashcard.getUser().getId().equals(userId)) {
            if (!isSeedFlashcard(flashcard)) {
                throw new IllegalStateException("Flashcard not found");
            }
            flashcard = copySeedFlashcard(userId, flashcard);
        }

        scheduler.applyReview(flashcard, effectiveRating(request), Instant.now());
        return toResponse(flashcardRepository.save(flashcard));
    }

    private List<Flashcard> findPersonal(UUID userId, UUID topicId) {
        if (topicId == null) {
            return flashcardRepository.findByUserId(userId);
        }
        return flashcardRepository.findByUserIdAndTopicId(userId, topicId);
    }

    private List<Flashcard> findSystem(UUID topicId) {
        if (topicId == null) {
            return flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL);
        }
        return flashcardRepository.findByUserEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId);
    }

    private List<Flashcard> effectiveFlashcards(UUID userId, UUID topicId) {
        List<Flashcard> personal = findPersonal(userId, topicId);
        Set<String> personalKeys = new HashSet<>();
        for (Flashcard flashcard : personal) {
            personalKeys.add(duplicateKey(flashcard));
        }

        List<Flashcard> effective = new ArrayList<>();
        for (Flashcard seedFlashcard : findSystem(topicId)) {
            if (!personalKeys.contains(duplicateKey(seedFlashcard))) {
                effective.add(seedFlashcard);
            }
        }
        effective.addAll(personal);
        return effective;
    }

    private String duplicateKey(Flashcard flashcard) {
        UUID topicId = flashcard.getTopic() == null ? null : flashcard.getTopic().getId();
        String front = flashcard.getFront() == null
            ? ""
            : flashcard.getFront().trim().toLowerCase(Locale.ROOT);
        return topicId + "\u0000" + front;
    }

    private boolean isSeedFlashcard(Flashcard flashcard) {
        return SeedData.SYSTEM_USER_EMAIL.equals(flashcard.getUser().getEmail());
    }

    private Flashcard copySeedFlashcard(UUID userId, Flashcard seedFlashcard) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Flashcard flashcard = Flashcard.builder()
            .user(user)
            .topic(seedFlashcard.getTopic())
            .front(seedFlashcard.getFront())
            .back(seedFlashcard.getBack())
            .category(seedFlashcard.getCategory())
            .confidence(null)
            .nextReview(null)
            .createdAt(Instant.now())
            .build();
        scheduler.initializeNewCard(flashcard);
        return flashcard;
    }

    private Comparator<Flashcard> dueComparator() {
        return Comparator
            .comparingInt((Flashcard flashcard) -> scheduler.duePriority(flashcard))
            .thenComparingInt(scheduler::easeFactor)
            .thenComparing(Comparator.comparingInt((Flashcard flashcard) -> scheduler.lapseCount(flashcard)).reversed())
            .thenComparing(flashcard -> {
                Instant dueAt = scheduler.effectiveDueAt(flashcard);
                return dueAt == null ? Instant.MAX : dueAt;
            })
            .thenComparing(flashcard -> flashcard.getCreatedAt() == null ? Instant.MAX : flashcard.getCreatedAt());
    }

    private Comparator<Flashcard> weakFallbackComparator() {
        return Comparator
            .comparingInt((Flashcard flashcard) -> confidencePriority(flashcard.getConfidence()))
            .thenComparingInt(scheduler::easeFactor)
            .thenComparing(Comparator.comparingInt((Flashcard flashcard) -> scheduler.lapseCount(flashcard)).reversed())
            .thenComparing(flashcard -> {
                Instant dueAt = scheduler.effectiveDueAt(flashcard);
                return dueAt == null ? Instant.MAX : dueAt;
            })
            .thenComparing(flashcard -> flashcard.getLastReviewedAt() == null ? Instant.MAX : flashcard.getLastReviewedAt())
            .thenComparing(flashcard -> flashcard.getCreatedAt() == null ? Instant.MAX : flashcard.getCreatedAt());
    }

    private boolean isWeakFallbackCandidate(Flashcard flashcard, Instant now) {
        Instant dueAt = scheduler.effectiveDueAt(flashcard);
        return scheduler.reviewState(flashcard) != FlashcardReviewState.NEW
            && dueAt != null
            && dueAt.isAfter(now);
    }

    private Instant nextDueAt(List<Flashcard> flashcards, Instant now) {
        return flashcards.stream()
            .map(scheduler::effectiveDueAt)
            .filter(dueAt -> dueAt != null && dueAt.isAfter(now))
            .min(Instant::compareTo)
            .orElse(null);
    }

    private int confidencePriority(FlashcardConfidence confidence) {
        if (confidence == FlashcardConfidence.LOW) {
            return 0;
        }
        if (confidence == FlashcardConfidence.MEDIUM) {
            return 1;
        }
        if (confidence == FlashcardConfidence.HIGH) {
            return 2;
        }
        return 3;
    }

    private FlashcardRating effectiveRating(FlashcardReviewRequest request) {
        if (request.rating() != null) {
            return request.rating();
        }
        if (request.confidence() == null) {
            throw new IllegalArgumentException("rating is required");
        }
        return switch (request.confidence()) {
            case LOW -> FlashcardRating.AGAIN;
            case MEDIUM -> FlashcardRating.GOOD;
            case HIGH -> FlashcardRating.EASY;
        };
    }

    private FlashcardResponse toResponse(Flashcard flashcard) {
        return new FlashcardResponse(
            flashcard.getId(),
            flashcard.getTopic().getId(),
            flashcard.getTopic().getName(),
            flashcard.getFront(),
            flashcard.getBack(),
            flashcard.getCategory(),
            flashcard.getConfidence(),
            flashcard.getNextReview(),
            scheduler.reviewState(flashcard),
            scheduler.effectiveDueAt(flashcard),
            flashcard.getIntervalDays(),
            scheduler.easeFactor(flashcard),
            flashcard.getRepetitionCount(),
            scheduler.lapseCount(flashcard),
            flashcard.getLastReviewedAt()
        );
    }
}
