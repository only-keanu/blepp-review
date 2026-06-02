package com.kei.review.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.exams.MockExam;
import com.kei.review.exams.MockExamRepository;
import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class ExamSeederTest {
    @Test
    void seedsMissingMockExamsByTitle() {
        MockExamRepository mockExamRepository = mock(MockExamRepository.class);
        TopicRepository topicRepository = mock(TopicRepository.class);
        ExamSeeder seeder = new ExamSeeder(mockExamRepository, topicRepository);

        when(topicRepository.findAll()).thenReturn(List.of(
            topic("general-psychology"),
            topic("abnormal-psychology"),
            topic("psychological-assessment"),
            topic("industrial-organizational-psychology"),
            topic("ethics-ra-10029")
        ));
        when(mockExamRepository.findByTitle(anyString())).thenAnswer(invocation -> {
            String title = invocation.getArgument(0);
            if ("Quick Practice".equals(title)) {
                return Optional.of(MockExam.builder().title(title).totalQuestions(25).build());
            }
            return Optional.empty();
        });

        seeder.run();

        ArgumentCaptor<MockExam> examCaptor = ArgumentCaptor.forClass(MockExam.class);
        verify(mockExamRepository, times(7)).save(examCaptor.capture());
        List<MockExam> savedExams = examCaptor.getAllValues();

        assertEquals(
            List.of(
                "Full BLEPP Simulation",
                "General Psychology Mock Exam",
                "Abnormal Psychology Mock Exam",
                "Industrial/Organizational Psychology Mock Exam",
                "Psychological Assessment Mock Exam",
                "Ethics and Professional Practice Mock Exam",
                "Quick Practice"
            ),
            savedExams.stream().map(MockExam::getTitle).toList()
        );
        assertEquals(50, savedExams.get(0).getTotalQuestions());
        assertEquals(10, savedExams.get(savedExams.size() - 1).getTotalQuestions());
        MockExam ethicsExam = savedExams.get(savedExams.size() - 2);
        assertNotNull(ethicsExam.getTopic());
        assertEquals("ethics-ra-10029", ethicsExam.getTopic().getSlug());
    }

    private Topic topic(String slug) {
        return Topic.builder()
            .name(slug)
            .slug(slug)
            .color("blue")
            .build();
    }
}
