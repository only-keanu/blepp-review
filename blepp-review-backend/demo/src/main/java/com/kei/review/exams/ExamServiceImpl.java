package com.kei.review.exams;

import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamFlagResponse;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import com.kei.review.questions.Question;
import com.kei.review.questions.QuestionRepository;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ExamServiceImpl implements ExamService {
    private final MockExamRepository mockExamRepository;
    private final ExamSessionRepository examSessionRepository;
    private final ExamAnswerRepository examAnswerRepository;
    private final ExamFlagRepository examFlagRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public ExamServiceImpl(
        MockExamRepository mockExamRepository,
        ExamSessionRepository examSessionRepository,
        ExamAnswerRepository examAnswerRepository,
        ExamFlagRepository examFlagRepository,
        QuestionRepository questionRepository,
        UserRepository userRepository
    ) {
        this.mockExamRepository = mockExamRepository;
        this.examSessionRepository = examSessionRepository;
        this.examAnswerRepository = examAnswerRepository;
        this.examFlagRepository = examFlagRepository;
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

        boolean correct = request.selectedAnswerIndex() != null
            && request.selectedAnswerIndex().equals(question.getCorrectAnswerIndex());

        ExamAnswer answer = ExamAnswer.builder()
            .examSession(session)
            .question(question)
            .selectedAnswerIndex(request.selectedAnswerIndex())
            .correct(correct)
            .build();

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
}
