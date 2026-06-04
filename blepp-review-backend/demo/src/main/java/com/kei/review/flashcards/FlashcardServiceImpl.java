package com.kei.review.flashcards;

import com.kei.review.config.SeedData;
import com.kei.review.flashcards.dto.FlashcardCreateRequest;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardQueueSummaryResponse;
import com.kei.review.flashcards.dto.FlashcardUpdateRequest;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
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
        LocalDate today = LocalDate.now();
        return effectiveFlashcards(userId, topicId).stream()
            .filter(flashcard -> flashcard.getNextReview() == null || !flashcard.getNextReview().isAfter(today))
            .map(this::toResponse)
            .toList();
    }

    @Override
    public FlashcardQueueSummaryResponse summary(UUID userId, UUID topicId) {
        LocalDate today = LocalDate.now();
        List<Flashcard> flashcards = effectiveFlashcards(userId, topicId);
        long newCards = flashcards.stream()
            .filter(flashcard -> flashcard.getNextReview() == null)
            .count();
        long scheduledDue = flashcards.stream()
            .filter(flashcard -> flashcard.getNextReview() != null && !flashcard.getNextReview().isAfter(today))
            .count();
        long mastered = flashcards.stream()
            .filter(flashcard -> FlashcardConfidence.HIGH == flashcard.getConfidence())
            .count();
        return new FlashcardQueueSummaryResponse(newCards + scheduledDue, newCards, mastered);
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

        flashcard.setConfidence(request.confidence());
        flashcard.setNextReview(calculateNextReview(request.confidence()));
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
        return Flashcard.builder()
            .user(user)
            .topic(seedFlashcard.getTopic())
            .front(seedFlashcard.getFront())
            .back(seedFlashcard.getBack())
            .category(seedFlashcard.getCategory())
            .confidence(null)
            .nextReview(null)
            .createdAt(Instant.now())
            .build();
    }

    private LocalDate calculateNextReview(FlashcardConfidence confidence) {
        LocalDate today = LocalDate.now();
        if (confidence == null) {
            return today.plusDays(1);
        }
        return switch (confidence) {
            case LOW -> today.plusDays(1);
            case MEDIUM -> today.plusDays(3);
            case HIGH -> today.plusDays(7);
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
            flashcard.getNextReview()
        );
    }
}
