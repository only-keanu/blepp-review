package com.kei.review.config;

import com.kei.review.exams.MockExam;
import com.kei.review.exams.MockExamRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ExamSeeder implements CommandLineRunner {
    private final MockExamRepository mockExamRepository;

    public ExamSeeder(MockExamRepository mockExamRepository) {
        this.mockExamRepository = mockExamRepository;
    }

    @Override
    public void run(String... args) {
        if (mockExamRepository.count() > 0) {
            return;
        }

        List<MockExam> exams = List.of(
            MockExam.builder()
                .title("Full BLEPP Simulation")
                .totalQuestions(150)
                .durationMinutes(180)
                .description("Complete board exam simulation covering all 4 major subjects.")
                .build(),
            MockExam.builder()
                .title("General Psychology Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Focused assessment on General Psychology concepts and theories.")
                .build(),
            MockExam.builder()
                .title("Abnormal Psychology Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Test your mastery of psychological disorders, diagnostics, and treatment.")
                .build(),
            MockExam.builder()
                .title("Industrial/Organizational Psychology Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Workplace psychology, leadership, and organizational behavior practice exam.")
                .build(),
            MockExam.builder()
                .title("Psychological Assessment Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Assessment tools, testing principles, and interpretation review exam.")
                .build(),
            MockExam.builder()
                .title("Quick Practice")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("Short practice session to keep your mind sharp during breaks.")
                .build()
        );

        mockExamRepository.saveAll(exams);
    }
}
