package com.kei.review.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class QuestionSeederTest {
    @Test
    void seedsOneHundredSystemOwnedQuestionsAcrossBleppTopics() {
        QuestionRepository questionRepository = mock(QuestionRepository.class);
        TopicRepository topicRepository = mock(TopicRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        QuestionSeeder seeder = new QuestionSeeder(
            questionRepository,
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
        when(questionRepository.existsByOwnerEmailAndText(anyString(), anyString())).thenReturn(false);

        seeder.run();

        ArgumentCaptor<Question> questionCaptor = ArgumentCaptor.forClass(Question.class);
        verify(questionRepository, times(100)).save(questionCaptor.capture());
        List<Question> questions = questionCaptor.getAllValues();

        assertEquals(100, questions.size());
        assertTrue(questions.stream().allMatch(question -> question.getOwner() == owner));
        assertEquals(20, countByTopic(questions, "general-psychology"));
        assertEquals(20, countByTopic(questions, "abnormal-psychology"));
        assertEquals(20, countByTopic(questions, "psychological-assessment"));
        assertEquals(20, countByTopic(questions, "industrial-organizational-psychology"));
        assertEquals(20, countByTopic(questions, "ethics-ra-10029"));
    }

    @Test
    void skipsDuplicateSystemOwnedQuestionsOnRerun() {
        QuestionRepository questionRepository = mock(QuestionRepository.class);
        TopicRepository topicRepository = mock(TopicRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        QuestionSeeder seeder = new QuestionSeeder(
            questionRepository,
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
        when(questionRepository.existsByOwnerEmailAndText(anyString(), anyString())).thenReturn(true);

        seeder.run();

        verify(questionRepository, never()).save(org.mockito.ArgumentMatchers.any(Question.class));
    }

    private long countByTopic(List<Question> questions, String slug) {
        return questions.stream()
            .filter(question -> slug.equals(question.getTopic().getSlug()))
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
