package com.kei.review.exams;

import com.kei.review.config.SeedData;
import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamFlagResponse;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamResultResponse;
import com.kei.review.exams.dto.ExamSessionQuestionResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSessionSummaryResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import com.kei.review.exams.dto.QuestionBankExamSessionRequest;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ExamServiceImpl implements ExamService {
    private final MockExamRepository mockExamRepository;
    private final ExamSessionRepository examSessionRepository;
    private final ExamAnswerRepository examAnswerRepository;
    private final ExamFlagRepository examFlagRepository;
    private final ExamSessionQuestionRepository examSessionQuestionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public ExamServiceImpl(
        MockExamRepository mockExamRepository,
        ExamSessionRepository examSessionRepository,
        ExamAnswerRepository examAnswerRepository,
        ExamFlagRepository examFlagRepository,
        ExamSessionQuestionRepository examSessionQuestionRepository,
        QuestionRepository questionRepository,
        UserRepository userRepository
    ) {
        this.mockExamRepository = mockExamRepository;
        this.examSessionRepository = examSessionRepository;
        this.examAnswerRepository = examAnswerRepository;
        this.examFlagRepository = examFlagRepository;
        this.examSessionQuestionRepository = examSessionQuestionRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ExamResponse> listExams() {
        return mockExamRepository.findAll().stream()
            .map(exam -> new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getTotalQuestions(),
                exam.getDurationMinutes(),
                exam.getDescription()
            ))
            .toList();
    }

    @Override
    public List<ExamSessionSummaryResponse> listRecentSessions(UUID userId, Integer limit) {
        int boundedLimit = normalizeRecentSessionLimit(limit);
        return examSessionRepository.findByUserIdOrderByStartedAtDesc(userId, PageRequest.of(0, boundedLimit))
            .stream()
            .map(this::toSessionSummaryResponse)
            .toList();
    }

    @Override
    public ExamSessionResponse getSession(UUID userId, UUID sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }
        return toSessionResponse(session, assignedQuestionCount(session));
    }

    @Override
    public ExamSessionResponse startSession(UUID userId, UUID examId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        MockExam exam = mockExamRepository.findById(examId)
            .orElseThrow(() -> new IllegalStateException("Exam not found"));

        ExamSession session = ExamSession.builder()
            .user(user)
            .mockExam(exam)
            .totalQuestions(exam.getTotalQuestions())
            .durationMinutes(exam.getDurationMinutes())
            .startedAt(Instant.now())
            .build();

        ExamSession saved = examSessionRepository.save(session);
        int assignedCount = assignQuestions(saved, userId);
        saved.setTotalQuestions(assignedCount);
        examSessionRepository.save(saved);
        return toSessionResponse(saved, assignedCount);
    }

    @Override
    public ExamSessionResponse startQuestionBankSession(UUID userId, QuestionBankExamSessionRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        int requestedCount = normalizeQuestionCount(request == null ? null : request.questionCount());
        int durationMinutes = normalizeDurationMinutes(request == null ? null : request.durationMinutes());
        List<UUID> topicIds = normalizeTopicIds(request == null ? null : request.topicIds());
        List<Question> pool = buildQuestionBankPool(userId, topicIds);
        if (pool.isEmpty()) {
            throw new IllegalStateException("No questions found");
        }

        Collections.shuffle(pool);
        int assignedCount = Math.min(requestedCount, pool.size());
        ExamSession session = ExamSession.builder()
            .user(user)
            .mockExam(null)
            .totalQuestions(assignedCount)
            .durationMinutes(durationMinutes)
            .startedAt(Instant.now())
            .build();

        ExamSession saved = examSessionRepository.save(session);
        saveAssignedQuestions(saved, pool.subList(0, assignedCount));
        return toSessionResponse(saved, assignedCount);
    }

    @Override
    public void recordAnswer(UUID userId, UUID sessionId, ExamAnswerRequest request) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }
        if (session.getSubmittedAt() != null) {
            throw new IllegalStateException("Submitted exam sessions are locked");
        }

        Question question = questionRepository.findById(request.questionId())
            .orElseThrow(() -> new IllegalStateException("Question not found"));
        examSessionQuestionRepository.findByExamSessionIdAndQuestionId(sessionId, question.getId())
            .orElseThrow(() -> new IllegalStateException("Question not in session"));

        boolean correct = request.selectedAnswerIndex() != null
            && request.selectedAnswerIndex().equals(question.getCorrectAnswerIndex());

        ExamAnswer answer = examAnswerRepository.findByExamSessionIdAndQuestionId(sessionId, question.getId())
            .orElseGet(() -> ExamAnswer.builder()
                .examSession(session)
                .question(question)
                .build()
            );
        answer.setSelectedAnswerIndex(request.selectedAnswerIndex());
        answer.setCorrect(correct);
        examAnswerRepository.save(answer);

        ExamFlag flag = examFlagRepository
            .findByExamSessionIdAndQuestionId(sessionId, question.getId())
            .orElseGet(() -> ExamFlag.builder()
                .examSession(session)
                .question(question)
                .flagged(false)
                .build()
            );
        flag.setFlagged(request.flagged());
        examFlagRepository.save(flag);
    }

    @Override
    public ExamSubmitResponse submit(UUID userId, UUID sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }
        if (session.getSubmittedAt() != null) {
            throw new IllegalStateException("Submitted exam sessions are locked");
        }

        List<ExamAnswer> answers = examAnswerRepository.findByExamSessionId(sessionId);
        long correctCount = answers.stream().filter(ExamAnswer::isCorrect).count();
        int assignedQuestions = examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(sessionId).size();
        int totalQuestions = assignedQuestions > 0
            ? assignedQuestions
            : totalQuestionsFor(session, answers.size());
        int unansweredCount = Math.max(0, totalQuestions - answers.size());

        int score = totalQuestions == 0 ? 0 : (int) Math.round((correctCount * 100.0) / totalQuestions);

        Instant submittedAt = Instant.now();
        session.setScore(score);
        session.setSubmittedAt(submittedAt);
        if (session.getStartedAt() != null) {
            session.setTimeTakenSeconds((int) Duration.between(session.getStartedAt(), submittedAt).toSeconds());
        }
        examSessionRepository.save(session);

        return new ExamSubmitResponse(
            session.getId(),
            score,
            totalQuestions,
            (int) correctCount,
            unansweredCount,
            session.getTimeTakenSeconds()
        );
    }

    @Override
    public List<ExamFlagResponse> listFlags(UUID userId, UUID sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }

        return examFlagRepository.findByExamSessionId(sessionId).stream()
            .map(flag -> new ExamFlagResponse(flag.getQuestion().getId(), flag.isFlagged()))
            .toList();
    }

    @Override
    public List<ExamSessionQuestionResponse> listSessionQuestions(UUID userId, UUID sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }

        Map<UUID, ExamAnswer> answerByQuestion = examAnswerRepository.findByExamSessionId(sessionId).stream()
            .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (a, b) -> a));
        Map<UUID, ExamFlag> flagByQuestion = examFlagRepository.findByExamSessionId(sessionId).stream()
            .collect(Collectors.toMap(f -> f.getQuestion().getId(), f -> f, (a, b) -> a));

        return examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(sessionId)
            .stream()
            .map(item -> {
                UUID questionId = item.getQuestion().getId();
                ExamAnswer answer = answerByQuestion.get(questionId);
                ExamFlag flag = flagByQuestion.get(questionId);
                return new ExamSessionQuestionResponse(
                    questionId,
                    item.getQuestion().getText(),
                    item.getQuestion().getChoices(),
                    answer == null ? null : answer.getSelectedAnswerIndex(),
                    flag != null && flag.isFlagged()
                );
            })
            .toList();
    }

    @Override
    public ExamResultResponse results(UUID userId, UUID sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }

        List<ExamSessionQuestion> sessionQuestions =
            examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(sessionId);
        List<ExamAnswer> answers = examAnswerRepository.findByExamSessionId(sessionId);

        Map<UUID, ExamAnswer> answerByQuestion = answers.stream()
            .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (a, b) -> a));
        Map<UUID, ExamFlag> flagByQuestion = examFlagRepository.findByExamSessionId(sessionId).stream()
            .collect(Collectors.toMap(f -> f.getQuestion().getId(), f -> f, (a, b) -> a));

        int totalQuestions = !sessionQuestions.isEmpty()
            ? sessionQuestions.size()
            : totalQuestionsFor(session, answers.size());

        long correctCount = answers.stream().filter(ExamAnswer::isCorrect).count();
        int unansweredCount = Math.max(0, totalQuestions - answers.size());
        int score = totalQuestions == 0 ? 0 : (int) Math.round((correctCount * 100.0) / totalQuestions);

        Map<String, List<ExamSessionQuestion>> byTopic = sessionQuestions.stream()
            .collect(Collectors.groupingBy(q -> q.getQuestion().getTopic().getName()));

        List<ExamResultResponse.TopicScore> topicScores = new ArrayList<>();
        for (Map.Entry<String, List<ExamSessionQuestion>> entry : byTopic.entrySet()) {
            String topicName = entry.getKey();
            List<ExamSessionQuestion> items = entry.getValue();
            int total = items.size();
            int correct = (int) items.stream()
                .filter(item -> {
                    ExamAnswer answer = answerByQuestion.get(item.getQuestion().getId());
                    return answer != null && answer.isCorrect();
                })
                .count();
            topicScores.add(new ExamResultResponse.TopicScore(topicName, correct, total));
        }

        List<ExamResultResponse.QuestionReview> questionReviews = sessionQuestions.stream()
            .map(item -> {
                Question question = item.getQuestion();
                ExamAnswer answer = answerByQuestion.get(question.getId());
                ExamFlag flag = flagByQuestion.get(question.getId());
                return new ExamResultResponse.QuestionReview(
                    question.getId(),
                    question.getTopic().getName(),
                    question.getText(),
                    question.getChoices(),
                    answer == null ? null : answer.getSelectedAnswerIndex(),
                    question.getCorrectAnswerIndex(),
                    answer != null && answer.isCorrect(),
                    flag != null && flag.isFlagged(),
                    question.getExplanation()
                );
            })
            .toList();

        return new ExamResultResponse(
            score,
            totalQuestions,
            (int) correctCount,
            unansweredCount,
            session.getTimeTakenSeconds(),
            topicScores,
            questionReviews
        );
    }

    private int assignQuestions(ExamSession session, UUID userId) {
        List<Question> pool = buildQuestionPool(session, userId);
        if (pool.isEmpty()) {
            return 0;
        }
        Collections.shuffle(pool);
        int target = session.getTotalQuestions() != null
            ? session.getTotalQuestions()
            : pool.size();
        int count = Math.min(target, pool.size());

        saveAssignedQuestions(session, pool.subList(0, count));
        return count;
    }

    private List<Question> buildQuestionPool(ExamSession session, UUID userId) {
        UUID topicId = session.getMockExam().getTopic() == null
            ? null
            : session.getMockExam().getTopic().getId();
        int target = session.getMockExam().getTotalQuestions() == null
            ? Integer.MAX_VALUE
            : session.getMockExam().getTotalQuestions();
        List<Question> userQuestions = topicId == null
            ? questionRepository.findByOwnerId(userId)
            : questionRepository.findByOwnerIdAndTopicId(userId, topicId);
        if (userQuestions.size() >= target) {
            return new ArrayList<>(userQuestions);
        }

        List<Question> seedQuestions = topicId == null
            ? questionRepository.findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL)
            : questionRepository.findByOwnerEmailAndTopicId(SeedData.SYSTEM_USER_EMAIL, topicId);
        Map<UUID, Question> byId = new LinkedHashMap<>();
        userQuestions.forEach(question -> byId.put(question.getId(), question));
        seedQuestions.forEach(question -> byId.putIfAbsent(question.getId(), question));
        return new ArrayList<>(byId.values());
    }

    private List<Question> buildQuestionBankPool(UUID userId, List<UUID> topicIds) {
        List<Question> userQuestions = topicIds.isEmpty()
            ? questionRepository.findByOwnerId(userId)
            : questionRepository.findByOwnerIdAndTopicIdIn(userId, topicIds);
        List<Question> seedQuestions = topicIds.isEmpty()
            ? questionRepository.findByOwnerEmail(SeedData.SYSTEM_USER_EMAIL)
            : questionRepository.findByOwnerEmailAndTopicIdIn(SeedData.SYSTEM_USER_EMAIL, topicIds);

        Map<UUID, Question> byId = new LinkedHashMap<>();
        userQuestions.forEach(question -> byId.put(question.getId(), question));
        seedQuestions.forEach(question -> byId.putIfAbsent(question.getId(), question));
        return new ArrayList<>(byId.values());
    }

    private void saveAssignedQuestions(ExamSession session, List<Question> questions) {
        List<ExamSessionQuestion> items = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            items.add(ExamSessionQuestion.builder()
                .examSession(session)
                .question(questions.get(i))
                .orderIndex(i)
                .build()
            );
        }
        examSessionQuestionRepository.saveAll(items);
    }

    private int assignedQuestionCount(ExamSession session) {
        return examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(session.getId()).size();
    }

    private ExamSessionResponse toSessionResponse(ExamSession session, int assignedCount) {
        return new ExamSessionResponse(
            session.getId(),
            session.getMockExam() == null ? null : session.getMockExam().getId(),
            assignedCount > 0 ? assignedCount : totalQuestionsFor(session, 0),
            durationMinutesFor(session)
        );
    }

    private ExamSessionSummaryResponse toSessionSummaryResponse(ExamSession session) {
        MockExam exam = session.getMockExam();
        long answeredCount = examAnswerRepository.countByExamSessionId(session.getId());
        return new ExamSessionSummaryResponse(
            session.getId(),
            exam == null ? null : exam.getId(),
            exam == null ? "Question Bank Review" : exam.getTitle(),
            session.getSubmittedAt() == null ? "IN_PROGRESS" : "SUBMITTED",
            session.getStartedAt(),
            session.getSubmittedAt(),
            session.getScore(),
            totalQuestionsFor(session, 0),
            durationMinutesFor(session),
            session.getTimeTakenSeconds(),
            answeredCount
        );
    }

    private int totalQuestionsFor(ExamSession session, int fallback) {
        if (session.getTotalQuestions() != null) {
            return session.getTotalQuestions();
        }
        if (session.getMockExam() != null && session.getMockExam().getTotalQuestions() != null) {
            return session.getMockExam().getTotalQuestions();
        }
        return fallback;
    }

    private int durationMinutesFor(ExamSession session) {
        if (session.getDurationMinutes() != null) {
            return session.getDurationMinutes();
        }
        if (session.getMockExam() != null && session.getMockExam().getDurationMinutes() != null) {
            return session.getMockExam().getDurationMinutes();
        }
        return 45;
    }

    private int normalizeQuestionCount(Integer requested) {
        if (requested == null) {
            return 10;
        }
        return Math.max(1, Math.min(requested, 100));
    }

    private int normalizeDurationMinutes(Integer requested) {
        if (requested == null) {
            return 30;
        }
        return Math.max(1, Math.min(requested, 180));
    }

    private List<UUID> normalizeTopicIds(List<UUID> topicIds) {
        if (topicIds == null || topicIds.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(new LinkedHashSet<>(topicIds));
    }

    private int normalizeRecentSessionLimit(Integer limit) {
        if (limit == null) {
            return 10;
        }
        return Math.max(1, Math.min(limit, 20));
    }
}
