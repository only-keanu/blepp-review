package com.kei.review.practice;

import com.kei.review.practice.dto.AnswerAttemptRequest;
import com.kei.review.practice.dto.CreatePracticeSessionRequest;
import com.kei.review.practice.dto.PracticeSessionResponse;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import com.kei.review.topics.UserTopic;
import com.kei.review.topics.UserTopicRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class PracticeServiceImpl implements PracticeService {
    private final PracticeSessionRepository practiceSessionRepository;
    private final AnswerAttemptRepository answerAttemptRepository;
    private final TopicRepository topicRepository;
    private final UserTopicRepository userTopicRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    public PracticeServiceImpl(
        PracticeSessionRepository practiceSessionRepository,
        AnswerAttemptRepository answerAttemptRepository,
        TopicRepository topicRepository,
        UserTopicRepository userTopicRepository,
        UserRepository userRepository,
        QuestionRepository questionRepository
    ) {
        this.practiceSessionRepository = practiceSessionRepository;
        this.answerAttemptRepository = answerAttemptRepository;
        this.topicRepository = topicRepository;
        this.userTopicRepository = userTopicRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public PracticeSessionResponse startSession(UUID userId, CreatePracticeSessionRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Topic topic = topicRepository.findById(request.topicId())
            .orElseThrow(() -> new IllegalStateException("Topic not found"));

        PracticeSession session = PracticeSession.builder()
            .user(user)
            .topic(topic)
            .difficulty(request.difficulty())
            .questionCount(request.questionCount())
            .createdAt(Instant.now())
            .build();

        PracticeSession saved = practiceSessionRepository.save(session);
        return new PracticeSessionResponse(
            saved.getId(),
            topic.getId(),
            topic.getName(),
            saved.getQuestionCount(),
            saved.getCreatedAt()
        );
    }

    @Override
    public void recordAttempt(UUID userId, AnswerAttemptRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        Question question = questionRepository.findById(request.questionId())
            .orElseThrow(() -> new IllegalStateException("Question not found"));
        PracticeSession session = practiceSessionRepository.findById(request.sessionId())
            .orElseThrow(() -> new IllegalStateException("Practice session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Practice session not found");
        }

        if (!question.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Question not found");
        }

        boolean correct = request.selectedAnswerIndex() != null
            && request.selectedAnswerIndex().equals(question.getCorrectAnswerIndex());

        AnswerAttempt attempt = AnswerAttempt.builder()
            .user(user)
            .question(question)
            .practiceSession(session)
            .selectedAnswerIndex(request.selectedAnswerIndex())
            .correct(correct)
            .timeTakenSeconds(request.timeTakenSeconds())
            .createdAt(Instant.now())
            .build();

        answerAttemptRepository.save(attempt);

        Topic topic = question.getTopic();
        UserTopic userTopic = userTopicRepository.findByUserIdAndTopicId(userId, topic.getId())
            .orElseGet(() -> UserTopic.builder()
                .user(user)
                .topic(topic)
                .weak(false)
                .masteryPct(0)
                .build()
            );

        long totalAttempts = answerAttemptRepository.countByUserIdAndQuestionTopicId(userId, topic.getId());
        long correctAttempts = answerAttemptRepository.countByUserIdAndQuestionTopicIdAndCorrectTrue(userId, topic.getId());
        int masteryPct = totalAttempts == 0 ? 0 : (int) Math.round((correctAttempts * 100.0) / totalAttempts);
        userTopic.setMasteryPct(masteryPct);
        userTopicRepository.save(userTopic);
    }

    @Override
    public List<UUID> listMistakeQuestionIds(UUID userId) {
        return answerAttemptRepository.findByUserIdAndCorrectFalse(userId)
            .stream()
            .map(attempt -> attempt.getQuestion().getId())
            .distinct()
            .toList();
    }
}
