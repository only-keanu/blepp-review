package com.kei.review.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.flashcards.Flashcard;
import com.kei.review.flashcards.FlashcardRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class FlashcardSeederTest {
    @Test
    void seedsTwentyFiveSystemOwnedFlashcardsAcrossBleppTopics() {
        FlashcardRepository flashcardRepository = mock(FlashcardRepository.class);
        TopicRepository topicRepository = mock(TopicRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        FlashcardSeeder seeder = new FlashcardSeeder(
            flashcardRepository,
            topicRepository,
            userRepository,
            passwordEncoder
        );

        User owner = User.builder().email(SeedData.SYSTEM_USER_EMAIL).passwordHash("hash").fullName("Seed").build();
        when(userRepository.findByEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(Optional.of(owner));
        when(topicRepository.findAll()).thenReturn(List.of(
            topic("general-psychology"),
            topic("abnormal-psychology"),
            topic("psychological-assessment"),
            topic("industrial-organizational-psychology"),
            topic("ethics-ra-10029")
        ));
        when(flashcardRepository.existsByUserEmailAndFront(anyString(), anyString())).thenReturn(false);

        seeder.run();

        ArgumentCaptor<Flashcard> flashcardCaptor = ArgumentCaptor.forClass(Flashcard.class);
        verify(flashcardRepository, times(25)).save(flashcardCaptor.capture());
        List<Flashcard> flashcards = flashcardCaptor.getAllValues();

        assertEquals(25, flashcards.size());
        assertTrue(flashcards.stream().allMatch(flashcard -> flashcard.getUser() == owner));
        assertTrue(flashcards.stream().allMatch(flashcard -> flashcard.getConfidence() == null));
        assertTrue(flashcards.stream().allMatch(flashcard -> flashcard.getNextReview() == null));
        assertEquals(5, countByTopic(flashcards, "general-psychology"));
        assertEquals(5, countByTopic(flashcards, "abnormal-psychology"));
        assertEquals(5, countByTopic(flashcards, "psychological-assessment"));
        assertEquals(5, countByTopic(flashcards, "industrial-organizational-psychology"));
        assertEquals(5, countByTopic(flashcards, "ethics-ra-10029"));
    }

    @Test
    void skipsDuplicateSystemOwnedFlashcardsOnRerun() {
        FlashcardRepository flashcardRepository = mock(FlashcardRepository.class);
        TopicRepository topicRepository = mock(TopicRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        FlashcardSeeder seeder = new FlashcardSeeder(
            flashcardRepository,
            topicRepository,
            userRepository,
            passwordEncoder
        );

        User owner = User.builder().email(SeedData.SYSTEM_USER_EMAIL).passwordHash("hash").fullName("Seed").build();
        when(userRepository.findByEmail(SeedData.SYSTEM_USER_EMAIL)).thenReturn(Optional.of(owner));
        when(topicRepository.findAll()).thenReturn(List.of(
            topic("general-psychology"),
            topic("abnormal-psychology"),
            topic("psychological-assessment"),
            topic("industrial-organizational-psychology"),
            topic("ethics-ra-10029")
        ));
        when(flashcardRepository.existsByUserEmailAndFront(anyString(), anyString())).thenReturn(true);

        seeder.run();

        verify(flashcardRepository, never()).save(any(Flashcard.class));
    }

    private long countByTopic(List<Flashcard> flashcards, String slug) {
        return flashcards.stream()
            .filter(flashcard -> slug.equals(flashcard.getTopic().getSlug()))
            .count();
    }

    private Topic topic(String slug) {
        return Topic.builder()
            .name(slug)
            .slug(slug)
            .color("blue")
            .build();
    }
}
