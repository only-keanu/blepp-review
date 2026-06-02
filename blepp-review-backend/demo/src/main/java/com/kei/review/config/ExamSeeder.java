package com.kei.review.config;

import com.kei.review.exams.MockExam;
import com.kei.review.exams.MockExamRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class ExamSeeder implements CommandLineRunner {
    private final MockExamRepository mockExamRepository;
    private final TopicRepository topicRepository;

    public ExamSeeder(MockExamRepository mockExamRepository, TopicRepository topicRepository) {
        this.mockExamRepository = mockExamRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public void run(String... args) {
        Map<String, Topic> topicsBySlug = topicRepository.findAll().stream()
            .collect(Collectors.toMap(Topic::getSlug, Function.identity(), (a, b) -> a));

        List<MockExam> exams = List.of(
            MockExam.builder()
                .title("Full BLEPP Simulation")
                .totalQuestions(50)
                .durationMinutes(75)
                .description("Complete MVP board exam simulation covering all seeded BLEPP subjects.")
                .build(),
            MockExam.builder()
                .title("General Psychology Mock Exam")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("Focused assessment on General Psychology concepts and theories.")
                .topic(topicsBySlug.get("general-psychology"))
                .build(),
            MockExam.builder()
                .title("Abnormal Psychology Mock Exam")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("Test your mastery of psychological disorders, diagnostics, and treatment.")
                .topic(topicsBySlug.get("abnormal-psychology"))
                .build(),
            MockExam.builder()
                .title("Industrial/Organizational Psychology Mock Exam")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("Workplace psychology, leadership, and organizational behavior practice exam.")
                .topic(topicsBySlug.get("industrial-organizational-psychology"))
                .build(),
            MockExam.builder()
                .title("Psychological Assessment Mock Exam")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("Assessment tools, testing principles, and interpretation review exam.")
                .topic(topicsBySlug.get("psychological-assessment"))
                .build(),
            MockExam.builder()
                .title("Ethics and Professional Practice Mock Exam")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("RA 10029, professional conduct, consent, confidentiality, and ethical decision-making.")
                .topic(topicsBySlug.get("ethics-ra-10029"))
                .build(),
            MockExam.builder()
                .title("Quick Practice")
                .totalQuestions(10)
                .durationMinutes(15)
                .description("Short practice session to keep your mind sharp during breaks.")
                .build()
        );

        exams.forEach(this::upsertExam);
    }

    private void upsertExam(MockExam seed) {
        MockExam exam = mockExamRepository.findByTitle(seed.getTitle())
            .orElse(seed);
        exam.setTotalQuestions(seed.getTotalQuestions());
        exam.setDurationMinutes(seed.getDurationMinutes());
        exam.setDescription(seed.getDescription());
        exam.setTopic(seed.getTopic());
        mockExamRepository.save(exam);
    }
}
