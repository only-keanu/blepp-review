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
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
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

        assertEquals(List.of(newSeed.getId(), dueSeed.getId()), due.stream().map(FlashcardResponse::id).toList());
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

        assertEquals(List.of(newPersonal.getId(), duePersonal.getId()), due.stream().map(FlashcardResponse::id).toList());
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
        assertNotNull(saved.getNextReview());
        assertTrue(!saved.getNextReview().isBefore(LocalDate.now().plusDays(3)));
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
        assertNotNull(saved.getNextReview());
        assertTrue(!saved.getNextReview().isBefore(LocalDate.now().plusDays(7)));
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
