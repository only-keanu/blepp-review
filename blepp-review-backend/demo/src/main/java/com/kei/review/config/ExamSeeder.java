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
import org.springframework.stereotype.Component;

@Component
public class ExamSeeder implements CommandLineRunner {
    private final MockExamRepository mockExamRepository;
    private final TopicRepository topicRepository;

    public ExamSeeder(MockExamRepository mockExamRepository, TopicRepository topicRepository) {
        this.mockExamRepository = mockExamRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public void run(String... args) {
        if (mockExamRepository.count() > 0) {
            return;
        }

        Map<String, Topic> topicsBySlug = topicRepository.findAll().stream()
            .collect(Collectors.toMap(Topic::getSlug, Function.identity(), (a, b) -> a));

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
                .topic(topicsBySlug.get("general-psychology"))
                .build(),
            MockExam.builder()
                .title("Abnormal Psychology Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Test your mastery of psychological disorders, diagnostics, and treatment.")
                .topic(topicsBySlug.get("abnormal-psychology"))
                .build(),
            MockExam.builder()
                .title("Industrial/Organizational Psychology Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Workplace psychology, leadership, and organizational behavior practice exam.")
                .topic(topicsBySlug.get("industrial-organizational-psychology"))
                .build(),
            MockExam.builder()
                .title("Psychological Assessment Mock Exam")
                .totalQuestions(40)
                .durationMinutes(60)
                .description("Assessment tools, testing principles, and interpretation review exam.")
                .topic(topicsBySlug.get("psychological-assessment"))
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
