package com.kei.review.flashcards;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.config.SeedData;
import com.kei.review.flashcards.dto.FlashcardQueueSummaryResponse;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardReviewQueueResponse;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class FlashcardServiceImplTest {
    private FlashcardRepository flashcardRepository;
    private UserRepository userRepository;
    private FlashcardServiceImpl service;

    @BeforeEach
    void setUp() {
        flashcardRepository = mock(FlashcardRepository.class);
        userRepository = mock(UserRepository.class);
        service = new FlashcardServiceImpl(
            flashcardRepository,
            mock(TopicRepository.class),
            userRepository
        );
    }

    @Test
    void listDueReturnsSeedFallbackCardsWhenUserHasNoPersonalFlashcards() {
        UUID userId = UUID.randomUUID();
        Flashcard newSeed = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL);
        Flashcard dueSeed = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL);
        dueSeed.setNextReview(LocalDate.now().minusDays(1));

        when(flashcardRepository.findByUserId(userId)).thenReturn(List.of());
        when(flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(List.of(newSeed, dueSeed));

        List<FlashcardResponse> due = service.listDue(userId, null);

        assertEquals(List.of(dueSeed.getId(), newSeed.getId()), due.stream().map(FlashcardResponse::id).toList());
    }

    @Test
    void summaryReportsSeedFallbackCardsWhenUserHasNoPersonalFlashcards() {
        UUID userId = UUID.randomUUID();
        List<Flashcard> seedCards = IntStream.range(0, 25)
            .mapToObj(index -> {
                Flashcard flashcard = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL);
                flashcard.setFront("Front " + index);
                return flashcard;
            })
            .toList();
        when(flashcardRepository.findByUserId(userId)).thenReturn(List.of());
        when(flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(seedCards);

        FlashcardQueueSummaryResponse summary = service.summary(userId, null);

        assertEquals(25L, summary.due());
        assertEquals(25L, summary.newCards());
        assertEquals(0L, summary.mastered());
    }

    @Test
    void listAppliesTopicFilterToSeedFallbackCards() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        Flashcard seedFlashcard = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL, topicId);

        when(flashcardRepository.findByUserIdAndTopicId(userId, topicId)).thenReturn(List.of());
        when(flashcardRepository.findByUserEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId))
            .thenReturn(List.of(seedFlashcard));

        List<FlashcardResponse> flashcards = service.list(userId, topicId);

        assertEquals(1, flashcards.size());
        assertEquals(seedFlashcard.getId(), flashcards.get(0).id());
        assertEquals(topicId, flashcards.get(0).topicId());
    }

    @Test
    void listSuppressesSeedCardsThatMatchPersonalCardsByTopicAndFront() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        Flashcard seedCopy = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL, topicId);
        seedCopy.setFront("Reviewed Seed");
        Flashcard otherSeed = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL, topicId);
        otherSeed.setFront("Unreviewed Seed");
        Flashcard personalCopy = flashcard(userId, UUID.randomUUID(), "user@example.com", topicId);
        personalCopy.setFront(" reviewed seed ");

        when(flashcardRepository.findByUserId(userId)).thenReturn(List.of(personalCopy));
        when(flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(List.of(seedCopy, otherSeed));

        List<FlashcardResponse> flashcards = service.list(userId, null);

        assertEquals(List.of(otherSeed.getId(), personalCopy.getId()), flashcards.stream().map(FlashcardResponse::id).toList());
    }

    @Test
    void listDueAppliesTopicFilterToPersonalCards() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        Flashcard newPersonal = flashcard(userId, UUID.randomUUID(), "user@example.com", topicId);
        Flashcard duePersonal = flashcard(userId, UUID.randomUUID(), "user@example.com", topicId);
        duePersonal.setNextReview(LocalDate.now().minusDays(1));

        when(flashcardRepository.findByUserIdAndTopicId(userId, topicId)).thenReturn(List.of(newPersonal, duePersonal));
        when(flashcardRepository.findByUserEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId)).thenReturn(List.of());

        List<FlashcardResponse> due = service.listDue(userId, topicId);

        assertEquals(List.of(duePersonal.getId(), newPersonal.getId()), due.stream().map(FlashcardResponse::id).toList());
    }

    @Test
    void summaryAppliesTopicFilterToSeedFallbackCards() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        List<Flashcard> newCards = IntStream.range(0, 5)
            .mapToObj(index -> {
                Flashcard flashcard = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL, topicId);
                flashcard.setFront("New " + index);
                return flashcard;
            })
            .toList();
        List<Flashcard> scheduledDue = IntStream.range(0, 2)
            .mapToObj(index -> {
                Flashcard flashcard = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL, topicId);
                flashcard.setFront("Due " + index);
                flashcard.setNextReview(LocalDate.now().minusDays(1));
                return flashcard;
            })
            .toList();
        List<Flashcard> mastered = IntStream.range(0, 3)
            .mapToObj(index -> {
                Flashcard flashcard = flashcard(UUID.randomUUID(), UUID.randomUUID(), SeedData.SYSTEM_USER_EMAIL, topicId);
                flashcard.setFront("Mastered " + index);
                flashcard.setNextReview(LocalDate.now().plusDays(7));
                flashcard.setConfidence(FlashcardConfidence.HIGH);
                return flashcard;
            })
            .toList();
        List<Flashcard> seedCards = new java.util.ArrayList<Flashcard>();
        seedCards.addAll(newCards);
        seedCards.addAll(scheduledDue);
        seedCards.addAll(mastered);
        when(flashcardRepository.findByUserIdAndTopicId(userId, topicId)).thenReturn(List.of());
        when(flashcardRepository.findByUserEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId))
            .thenReturn(seedCards);

        FlashcardQueueSummaryResponse summary = service.summary(userId, topicId);

        assertEquals(7L, summary.due());
        assertEquals(5L, summary.newCards());
        assertEquals(3L, summary.mastered());
    }

    @Test
    void reviewOfSeedFallbackCardCreatesUserOwnedCopyAndSchedulesIt() {
        UUID userId = UUID.randomUUID();
        UUID seedCardId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").passwordHash("hash").fullName("User").build();
        Flashcard seedFlashcard = flashcard(UUID.randomUUID(), seedCardId, SeedData.SYSTEM_USER_EMAIL);
        when(flashcardRepository.findById(seedCardId)).thenReturn(Optional.of(seedFlashcard));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.review(userId, seedCardId, new FlashcardReviewRequest(FlashcardConfidence.MEDIUM));

        ArgumentCaptor<Flashcard> captor = ArgumentCaptor.forClass(Flashcard.class);
        verify(flashcardRepository).save(captor.capture());
        Flashcard saved = captor.getValue();
        assertEquals(user, saved.getUser());
        assertEquals(seedFlashcard.getTopic(), saved.getTopic());
        assertEquals(seedFlashcard.getFront(), saved.getFront());
        assertEquals(seedFlashcard.getBack(), saved.getBack());
        assertEquals(FlashcardConfidence.MEDIUM, saved.getConfidence());
        assertEquals(FlashcardReviewState.REVIEW, saved.getReviewState());
        assertEquals(1, saved.getIntervalDays());
        assertNotNull(saved.getNextReview());
        assertTrue(!saved.getNextReview().isBefore(LocalDate.now().plusDays(1)));
    }

    @Test
    void reviewUpdatesUserOwnedFlashcardAndSchedulesNextReview() {
        UUID userId = UUID.randomUUID();
        UUID flashcardId = UUID.randomUUID();
        Flashcard flashcard = flashcard(userId, flashcardId, "user@example.com");
        when(flashcardRepository.findById(flashcardId)).thenReturn(Optional.of(flashcard));
        when(flashcardRepository.save(flashcard)).thenReturn(flashcard);

        service.review(userId, flashcardId, new FlashcardReviewRequest(FlashcardConfidence.HIGH));

        ArgumentCaptor<Flashcard> captor = ArgumentCaptor.forClass(Flashcard.class);
        verify(flashcardRepository).save(captor.capture());
        Flashcard saved = captor.getValue();
        assertEquals(FlashcardConfidence.HIGH, saved.getConfidence());
        assertEquals(FlashcardReviewState.REVIEW, saved.getReviewState());
        assertEquals(4, saved.getIntervalDays());
        assertNotNull(saved.getNextReview());
        assertTrue(!saved.getNextReview().isBefore(LocalDate.now().plusDays(4)));
    }

    @Test
    void listDuePrioritizesLearningThenWeakOverdueReviewCardsThenNewCards() {
        UUID userId = UUID.randomUUID();
        Flashcard newPersonal = flashcard(userId, UUID.randomUUID(), "user@example.com");
        newPersonal.setFront("New");
        newPersonal.setReviewState(FlashcardReviewState.NEW);

        Flashcard normalDue = flashcard(userId, UUID.randomUUID(), "user@example.com");
        normalDue.setFront("Normal");
        normalDue.setReviewState(FlashcardReviewState.REVIEW);
        normalDue.setDueAt(java.time.Instant.now().minusSeconds(60 * 60));
        normalDue.setEaseFactor(2500);

        Flashcard weakDue = flashcard(userId, UUID.randomUUID(), "user@example.com");
        weakDue.setFront("Weak");
        weakDue.setReviewState(FlashcardReviewState.REVIEW);
        weakDue.setDueAt(java.time.Instant.now().minusSeconds(60));
        weakDue.setEaseFactor(1600);
        weakDue.setLapseCount(2);

        Flashcard relearningDue = flashcard(userId, UUID.randomUUID(), "user@example.com");
        relearningDue.setFront("Relearning");
        relearningDue.setReviewState(FlashcardReviewState.RELEARNING);
        relearningDue.setDueAt(java.time.Instant.now().minusSeconds(30));
        relearningDue.setEaseFactor(1300);

        when(flashcardRepository.findByUserId(userId)).thenReturn(List.of(newPersonal, normalDue, weakDue, relearningDue));
        when(flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(List.of());

        List<FlashcardResponse> due = service.listDue(userId, null);

        assertEquals(
            List.of(relearningDue.getId(), weakDue.getId(), normalDue.getId(), newPersonal.getId()),
            due.stream().map(FlashcardResponse::id).toList()
        );
    }

    @Test
    void reviewQueueReturnsDueCardsWithoutFallbackWhenDueCardsExist() {
        UUID userId = UUID.randomUUID();
        Flashcard dueCard = flashcard(userId, UUID.randomUUID(), "user@example.com");
        dueCard.setReviewState(FlashcardReviewState.REVIEW);
        dueCard.setDueAt(Instant.now().minusSeconds(60));
        dueCard.setConfidence(FlashcardConfidence.MEDIUM);

        Flashcard futureWeakCard = flashcard(userId, UUID.randomUUID(), "user@example.com");
        futureWeakCard.setReviewState(FlashcardReviewState.REVIEW);
        futureWeakCard.setDueAt(Instant.now().plusSeconds(3600));
        futureWeakCard.setConfidence(FlashcardConfidence.LOW);
        futureWeakCard.setEaseFactor(1600);

        when(flashcardRepository.findByUserId(userId)).thenReturn(List.of(futureWeakCard, dueCard));
        when(flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(List.of());

        FlashcardReviewQueueResponse queue = service.reviewQueue(userId, null, 20);

        assertEquals(FlashcardReviewQueueMode.DUE, queue.mode());
        assertEquals(1L, queue.dueCount());
        assertEquals(0L, queue.fallbackCount());
        assertEquals(List.of(dueCard.getId()), queue.cards().stream().map(FlashcardResponse::id).toList());
        assertEquals(futureWeakCard.getDueAt(), queue.nextDueAt());
    }

    @Test
    void reviewQueueFallsBackToWeakestFutureCardsWhenNothingIsDue() {
        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();
        Flashcard highConfidence = flashcard(userId, UUID.randomUUID(), "user@example.com");
        highConfidence.setReviewState(FlashcardReviewState.REVIEW);
        highConfidence.setDueAt(now.plusSeconds(60));
        highConfidence.setConfidence(FlashcardConfidence.HIGH);
        highConfidence.setEaseFactor(2500);

        Flashcard lowConfidence = flashcard(userId, UUID.randomUUID(), "user@example.com");
        lowConfidence.setReviewState(FlashcardReviewState.REVIEW);
        lowConfidence.setDueAt(now.plusSeconds(3600));
        lowConfidence.setConfidence(FlashcardConfidence.LOW);
        lowConfidence.setEaseFactor(1600);
        lowConfidence.setLapseCount(2);

        Flashcard mediumConfidence = flashcard(userId, UUID.randomUUID(), "user@example.com");
        mediumConfidence.setReviewState(FlashcardReviewState.REVIEW);
        mediumConfidence.setDueAt(now.plusSeconds(1800));
        mediumConfidence.setConfidence(FlashcardConfidence.MEDIUM);
        mediumConfidence.setEaseFactor(2000);

        when(flashcardRepository.findByUserId(userId)).thenReturn(List.of(highConfidence, lowConfidence, mediumConfidence));
        when(flashcardRepository.findByUserEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(List.of());

        FlashcardReviewQueueResponse queue = service.reviewQueue(userId, null, 2);

        assertEquals(FlashcardReviewQueueMode.WEAK_FALLBACK, queue.mode());
        assertEquals(0L, queue.dueCount());
        assertEquals(3L, queue.fallbackCount());
        assertEquals(
            List.of(lowConfidence.getId(), mediumConfidence.getId()),
            queue.cards().stream().map(FlashcardResponse::id).toList()
        );
        assertEquals(highConfidence.getDueAt(), queue.nextDueAt());
    }

    @Test
    void reviewQueueFallbackRespectsTopicFilter() {
        UUID userId = UUID.randomUUID();
        UUID selectedTopicId = UUID.randomUUID();
        Flashcard selectedTopicCard = flashcard(userId, UUID.randomUUID(), "user@example.com", selectedTopicId);
        selectedTopicCard.setReviewState(FlashcardReviewState.REVIEW);
        selectedTopicCard.setDueAt(Instant.now().plusSeconds(3600));
        selectedTopicCard.setConfidence(FlashcardConfidence.LOW);

        when(flashcardRepository.findByUserIdAndTopicId(userId, selectedTopicId)).thenReturn(List.of(selectedTopicCard));
        when(flashcardRepository.findByUserEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, selectedTopicId)).thenReturn(List.of());

        FlashcardReviewQueueResponse queue = service.reviewQueue(userId, selectedTopicId, 20);

        assertEquals(FlashcardReviewQueueMode.WEAK_FALLBACK, queue.mode());
        assertEquals(List.of(selectedTopicCard.getId()), queue.cards().stream().map(FlashcardResponse::id).toList());
    }

    @Test
    void reviewOfAnotherUsersNonSeedFlashcardIsRejected() {
        UUID userId = UUID.randomUUID();
        UUID flashcardId = UUID.randomUUID();
        Flashcard flashcard = flashcard(UUID.randomUUID(), flashcardId, "other@example.com");
        when(flashcardRepository.findById(flashcardId)).thenReturn(Optional.of(flashcard));

        assertThrows(
            IllegalStateException.class,
            () -> service.review(userId, flashcardId, new FlashcardReviewRequest(FlashcardConfidence.LOW))
        );
        verify(flashcardRepository, never()).save(any(Flashcard.class));
    }

    private Flashcard flashcard(UUID userId, UUID flashcardId, String email) {
        return flashcard(userId, flashcardId, email, UUID.randomUUID());
    }

    private Flashcard flashcard(UUID userId, UUID flashcardId, String email, UUID topicId) {
        return Flashcard.builder()
            .id(flashcardId)
            .user(User.builder().id(userId).email(email).passwordHash("hash").fullName("User").build())
            .topic(Topic.builder().id(topicId).name("Topic").slug("topic").color("blue").build())
            .front("Front")
            .back("Back")
            .build();
    }
}
