package com.kei.review.exams;

import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamFlagResponse;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamResultResponse;
import com.kei.review.exams.dto.ExamSessionQuestionResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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
    public ExamSessionResponse startSession(UUID userId, UUID examId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        MockExam exam = mockExamRepository.findById(examId)
            .orElseThrow(() -> new IllegalStateException("Exam not found"));

        ExamSession session = ExamSession.builder()
            .user(user)
            .mockExam(exam)
            .startedAt(Instant.now())
            .build();

        ExamSession saved = examSessionRepository.save(session);
        assignQuestions(saved, userId);
        return new ExamSessionResponse(
            saved.getId(),
            exam.getId(),
            exam.getTotalQuestions(),
            exam.getDurationMinutes()
        );
    }

    @Override
    public void recordAnswer(UUID userId, UUID sessionId, ExamAnswerRequest request) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Session not found");
        }

        Question question = questionRepository.findById(request.questionId())
            .orElseThrow(() -> new IllegalStateException("Question not found"));
        if (!question.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Question not found");
        }
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

        List<ExamAnswer> answers = examAnswerRepository.findByExamSessionId(sessionId);
        long correctCount = answers.stream().filter(ExamAnswer::isCorrect).count();
        int totalQuestions = session.getMockExam().getTotalQuestions() != null
            ? session.getMockExam().getTotalQuestions()
            : answers.size();

        int score = totalQuestions == 0 ? 0 : (int) Math.round((correctCount * 100.0) / totalQuestions);

        session.setScore(score);
        session.setSubmittedAt(Instant.now());
        examSessionRepository.save(session);

        return new ExamSubmitResponse(session.getId(), score, totalQuestions);
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

        return examSessionQuestionRepository.findByExamSessionIdOrderByOrderIndexAsc(sessionId)
            .stream()
            .map(item -> new ExamSessionQuestionResponse(
                item.getQuestion().getId(),
                item.getQuestion().getText(),
                item.getQuestion().getChoices()
            ))
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

        int totalQuestions = sessionQuestions.isEmpty()
            ? session.getMockExam().getTotalQuestions()
            : sessionQuestions.size();

        long correctCount = answers.stream().filter(ExamAnswer::isCorrect).count();
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

        return new ExamResultResponse(score, totalQuestions, (int) correctCount, topicScores);
    }

    private void assignQuestions(ExamSession session, UUID userId) {
        List<Question> pool = questionRepository.findByOwnerId(userId);
        if (pool.isEmpty()) {
            return;
        }
        Collections.shuffle(pool);
        int target = session.getMockExam().getTotalQuestions() != null
            ? session.getMockExam().getTotalQuestions()
            : pool.size();
        int count = Math.min(target, pool.size());

        List<ExamSessionQuestion> items = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            items.add(ExamSessionQuestion.builder()
                .examSession(session)
                .question(pool.get(i))
                .orderIndex(i)
                .build()
            );
        }
        examSessionQuestionRepository.saveAll(items);
    }
}
