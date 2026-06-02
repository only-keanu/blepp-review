package com.kei.review.questions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.kei.review.config.SeedData;
import com.kei.review.questions.dto.QuestionResponse;
import com.kei.review.questions.dto.QuestionSearchParams;
import com.kei.review.questions.dto.QuestionUpdateRequest;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class QuestionServiceImplTest {
    @Autowired
    private QuestionServiceImpl questionService;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void searchReturnsReadOnlySeedFallbackQuestionsWhenUserHasNoPersonalQuestions() {
        User user = saveUser("empty-bank@example.com");

        List<QuestionResponse> questions = questionService.search(user.getId(), null);

        assertEquals(100, questions.size());
        assertTrue(questions.stream().allMatch(QuestionResponse::readOnly));
    }

    @Test
    void searchReturnsOnlyPersonalQuestionsWhenUserHasPersonalQuestions() {
        User user = saveUser("personal-bank@example.com");
        Topic topic = topicRepository.findBySlug("general-psychology").orElseThrow();
        Question personal = questionRepository.save(question(user, topic, "Personal question about memory"));

        List<QuestionResponse> questions = questionService.search(user.getId(), null);

        assertEquals(1, questions.size());
        assertEquals(personal.getId(), questions.get(0).id());
        assertFalse(questions.get(0).readOnly());
    }

    @Test
    void searchAppliesFiltersToSeedFallbackQuestions() {
        User user = saveUser("filtered-bank@example.com");
        Topic topic = topicRepository.findBySlug("general-psychology").orElseThrow();
        QuestionSearchParams params = new QuestionSearchParams(
            "neurotransmitter",
            topic.getId(),
            QuestionDifficulty.MEDIUM,
            QuestionSource.MANUAL,
            List.of("dopamine")
        );

        List<QuestionResponse> questions = questionService.search(user.getId(), params);

        assertEquals(1, questions.size());
        assertTrue(questions.get(0).text().toLowerCase().contains("neurotransmitter"));
        assertEquals(topic.getId(), questions.get(0).topicId());
        assertEquals(QuestionDifficulty.MEDIUM, questions.get(0).difficulty());
        assertEquals(QuestionSource.MANUAL, questions.get(0).source());
        assertTrue(questions.get(0).tags().contains("dopamine"));
        assertTrue(questions.get(0).readOnly());
    }

    @Test
    void updateAndDeleteRejectSeedFallbackQuestionsForRegularUsers() {
        User user = saveUser("seed-mutation@example.com");
        Question seedQuestion = questionRepository.findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL).get(0);

        assertThrows(
            IllegalStateException.class,
            () -> questionService.update(
                user.getId(),
                seedQuestion.getId(),
                new QuestionUpdateRequest(null, "Updated", null, null, null, null, null, null, null)
            )
        );
        assertThrows(
            IllegalStateException.class,
            () -> questionService.delete(user.getId(), seedQuestion.getId())
        );
    }

    private User saveUser(String email) {
        return userRepository.save(User.builder()
            .email(email)
            .passwordHash("hash")
            .fullName("Test User")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build());
    }

    private Question question(User owner, Topic topic, String text) {
        return Question.builder()
            .owner(owner)
            .topic(topic)
            .text(text)
            .choices(List.of("A", "B", "C", "D"))
            .correctAnswerIndex(0)
            .explanation("Explanation")
            .difficulty(QuestionDifficulty.EASY)
            .source(QuestionSource.MANUAL)
            .tags(List.of("personal"))
            .category("Personal")
            .createdAt(Instant.now())
            .build();
    }
}
