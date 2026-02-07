package com.kei.review.flashcards;

import com.kei.review.flashcards.dto.FlashcardCreateRequest;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardUpdateRequest;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
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
    public List<FlashcardResponse> list(UUID userId) {
        return flashcardRepository.findByUserId(userId)
            .stream()
            .map(this::toResponse)
            .toList();
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
            throw new IllegalStateException("Flashcard not found");
        }

        flashcard.setConfidence(request.confidence());
        flashcard.setNextReview(calculateNextReview(request.confidence()));
        return toResponse(flashcardRepository.save(flashcard));
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
