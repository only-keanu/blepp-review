package com.kei.review.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.kei.review.exams.ExamSessionRepository;
import com.kei.review.practice.AnswerAttempt;
import com.kei.review.practice.AnswerAttemptRepository;
import com.kei.review.topics.UserTopicRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AnalyticsServiceImplTest {
    private AnswerAttemptRepository answerAttemptRepository;
    private AnalyticsServiceImpl service;

    @BeforeEach
    void setUp() {
        answerAttemptRepository = mock(AnswerAttemptRepository.class);
        service = new AnalyticsServiceImpl(
            answerAttemptRepository,
            mock(UserTopicRepository.class),
            mock(ExamSessionRepository.class)
        );
    }

    @Test
    void overviewFormatsEmptyStudyStreakAsZeroDays() {
        UUID userId = UUID.randomUUID();
        when(answerAttemptRepository.findByUserId(userId)).thenReturn(List.of());

        assertEquals("0 days", service.overview(userId).studyStreak());
    }

    @Test
    void overviewFormatsSingleDayStudyStreakAsOneDay() {
        UUID userId = UUID.randomUUID();
        when(answerAttemptRepository.findByUserId(userId)).thenReturn(List.of(attemptDaysAgo(0)));

        assertEquals("1 day", service.overview(userId).studyStreak());
    }

    @Test
    void overviewFormatsMultipleConsecutiveStudyStreakAsDays() {
        UUID userId = UUID.randomUUID();
        when(answerAttemptRepository.findByUserId(userId)).thenReturn(List.of(
            attemptDaysAgo(0),
            attemptDaysAgo(1),
            attemptDaysAgo(2)
        ));

        assertEquals("3 days", service.overview(userId).studyStreak());
    }

    private AnswerAttempt attemptDaysAgo(int daysAgo) {
        return AnswerAttempt.builder()
            .correct(true)
            .createdAt(LocalDate.now()
                .minusDays(daysAgo)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant())
            .build();
    }
}
