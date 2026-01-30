package com.kei.review.questions;

import com.kei.review.questions.dto.QuestionCreateRequest;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public QuestionServiceImpl(
        QuestionRepository questionRepository,
        TopicRepository topicRepository,
        UserRepository userRepository
    ) {
        this.questionRepository = questionRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<QuestionResponse> search(UUID userId, QuestionSearchParams params) {
        Specification<Question> spec = Specification.where((root, query, cb) ->
            cb.equal(root.get("owner").get("id"), userId)
        );

        if (params != null) {
            if (params.query() != null && !params.query().isBlank()) {
                String pattern = "%" + params.query().toLowerCase() + "%";
                spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("text")), pattern)
                );
            }
            if (params.topicId() != null) {
                spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("topic").get("id"), params.topicId())
                );
            }
            if (params.difficulty() != null) {
                spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("difficulty"), params.difficulty())
                );
            }
            if (params.source() != null) {
                spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("source"), params.source())
                );
            }
            if (params.tags() != null && !params.tags().isEmpty()) {
                spec = spec.and((root, query, cb) -> {
                    query.distinct(true);
                    return root.join("tags").in(params.tags());
                });
            }
        }

        return questionRepository.findAll(spec).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public QuestionResponse create(UUID userId, QuestionCreateRequest request) {
        Topic topic = topicRepository.findById(request.topicId())
            .orElseThrow(() -> new IllegalStateException("Topic not found"));
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        validateChoices(request.choices(), request.correctAnswerIndex());

        Question question = Question.builder()
            .topic(topic)
            .owner(owner)
            .text(request.text())
            .choices(request.choices())
            .correctAnswerIndex(request.correctAnswerIndex())
            .explanation(request.explanation())
            .difficulty(request.difficulty())
            .source(request.source())
            .tags(request.tags())
            .category(request.category())
            .createdAt(Instant.now())
            .build();

        return toResponse(questionRepository.save(question));
    }

    @Override
    public QuestionResponse update(UUID userId, UUID questionId, QuestionUpdateRequest request) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new IllegalStateException("Question not found"));
        if (!question.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Question not found");
        }

        if (request.topicId() != null) {
            Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new IllegalStateException("Topic not found"));
            question.setTopic(topic);
        }
        if (request.text() != null) {
            question.setText(request.text());
        }
        if (request.choices() != null) {
            question.setChoices(request.choices());
        }
        if (request.correctAnswerIndex() != null) {
            question.setCorrectAnswerIndex(request.correctAnswerIndex());
        }
        if (request.explanation() != null) {
            question.setExplanation(request.explanation());
        }
        if (request.difficulty() != null) {
            question.setDifficulty(request.difficulty());
        }
        if (request.source() != null) {
            question.setSource(request.source());
        }
        if (request.tags() != null) {
            question.setTags(request.tags());
        }
        if (request.category() != null) {
            question.setCategory(request.category());
        }

        validateChoices(question.getChoices(), question.getCorrectAnswerIndex());

        return toResponse(questionRepository.save(question));
    }

    @Override
    public void delete(UUID userId, UUID questionId) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new IllegalStateException("Question not found"));
        if (!question.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Question not found");
        }
        questionRepository.delete(question);
    }

    @Override
    public List<QuestionResponse> bulkCreate(UUID userId, List<QuestionCreateRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        List<Question> questions = requests.stream()
            .map(request -> {
                Topic topic = topicRepository.findById(request.topicId())
                    .orElseThrow(() -> new IllegalStateException("Topic not found"));
                validateChoices(request.choices(), request.correctAnswerIndex());
                return Question.builder()
                    .topic(topic)
                    .owner(owner)
                    .text(request.text())
                    .choices(request.choices())
                    .correctAnswerIndex(request.correctAnswerIndex())
                    .explanation(request.explanation())
                    .difficulty(request.difficulty())
                    .source(request.source())
                    .tags(request.tags())
                    .category(request.category())
                    .createdAt(Instant.now())
                    .build();
            })
            .toList();

        return questionRepository.saveAll(questions).stream()
            .map(this::toResponse)
            .toList();
    }

    private QuestionResponse toResponse(Question question) {
        return new QuestionResponse(
            question.getId(),
            question.getTopic().getId(),
            question.getTopic().getName(),
            question.getText(),
            question.getChoices(),
            question.getCorrectAnswerIndex(),
            question.getExplanation(),
            question.getDifficulty(),
            question.getSource(),
            question.getTags(),
            question.getCategory(),
            question.getCreatedAt()
        );
    }

    private void validateChoices(List<String> choices, Integer correctAnswerIndex) {
        if (choices == null || choices.isEmpty()) {
            throw new IllegalStateException("Choices are required");
        }
        if (correctAnswerIndex == null || correctAnswerIndex < 0 || correctAnswerIndex >= choices.size()) {
            throw new IllegalStateException("Correct answer index is invalid");
        }
    }
}
