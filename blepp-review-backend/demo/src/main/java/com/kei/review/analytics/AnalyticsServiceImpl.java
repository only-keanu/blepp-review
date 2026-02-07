package com.kei.review.analytics;

import com.kei.review.analytics.dto.AnalyticsOverviewResponse;
import com.kei.review.analytics.dto.AccuracyTrendResponse;
import com.kei.review.analytics.dto.ReadinessResponse;
import com.kei.review.analytics.dto.TopicMasteryResponse;
import com.kei.review.exams.ExamSession;
import com.kei.review.exams.ExamSessionRepository;
import com.kei.review.practice.AnswerAttempt;
import com.kei.review.practice.AnswerAttemptRepository;
import com.kei.review.topics.UserTopicRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    private final AnswerAttemptRepository answerAttemptRepository;
    private final UserTopicRepository userTopicRepository;
    private final ExamSessionRepository examSessionRepository;

    public AnalyticsServiceImpl(
        AnswerAttemptRepository answerAttemptRepository,
        UserTopicRepository userTopicRepository,
        ExamSessionRepository examSessionRepository
    ) {
        this.answerAttemptRepository = answerAttemptRepository;
        this.userTopicRepository = userTopicRepository;
        this.examSessionRepository = examSessionRepository;
    }

    @Override
    public AnalyticsOverviewResponse overview(UUID userId) {
        List<AnswerAttempt> attempts = answerAttemptRepository.findByUserId(userId);
        long total = attempts.size();
        long correct = attempts.stream().filter(AnswerAttempt::isCorrect).count();
        int accuracy = total == 0 ? 0 : (int) Math.round((correct * 100.0) / total);
        int streak = calculateStudyStreak(attempts);
        String hoursStudied = formatHoursStudied(attempts);

        return new AnalyticsOverviewResponse(
            accuracy + "%",
            streak + " days",
            hoursStudied,
            String.valueOf(total)
        );
    }

    @Override
    public TopicMasteryResponse topicMastery(UUID userId) {
        List<TopicMasteryResponse.TopicMasteryStat> topics = userTopicRepository.findByUserId(userId)
            .stream()
            .map(ut -> new TopicMasteryResponse.TopicMasteryStat(
                ut.getTopic().getName(),
                ut.getMasteryPct() == null ? 0 : ut.getMasteryPct()
            ))
            .toList();
        return new TopicMasteryResponse(topics);
    }

    @Override
    public ReadinessResponse readiness(UUID userId) {
        long total = answerAttemptRepository.countByUserId(userId);
        long correct = answerAttemptRepository.countByUserIdAndCorrectTrue(userId);
        int accuracy = total == 0 ? 0 : (int) Math.round((correct * 100.0) / total);
        int consistency = calculateConsistency(userId);
        int coverage = calculateCoverage(userId);
        int mockExams = calculateMockExamAverage(userId);
        int score = (int) Math.round(
            accuracy * 0.5 +
            consistency * 0.2 +
            coverage * 0.2 +
            mockExams * 0.1
        );

        return new ReadinessResponse(score, accuracy, consistency, coverage, mockExams);
    }

    @Override
    public AccuracyTrendResponse accuracyTrend(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(9);
        Instant since = start.atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<AnswerAttempt> attempts = answerAttemptRepository.findByUserIdAndCreatedAtAfter(userId, since);

        var attemptsByDay = attempts.stream()
            .filter(attempt -> attempt.getCreatedAt() != null)
            .collect(Collectors.groupingBy(attempt ->
                attempt.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate()
            ));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d");
        List<AccuracyTrendResponse.AccuracyPoint> points = start.datesUntil(today.plusDays(1))
            .map(date -> {
                List<AnswerAttempt> dayAttempts = attemptsByDay.getOrDefault(date, List.of());
                long total = dayAttempts.size();
                long correct = dayAttempts.stream().filter(AnswerAttempt::isCorrect).count();
                int accuracy = total == 0 ? 0 : (int) Math.round((correct * 100.0) / total);
                return new AccuracyTrendResponse.AccuracyPoint(
                    formatter.format(date),
                    accuracy,
                    (int) total,
                    (int) correct
                );
            })
            .toList();

        return new AccuracyTrendResponse(points);
    }

    private int calculateConsistency(UUID userId) {
        Instant since = Instant.now().minusSeconds(14L * 24 * 60 * 60);
        List<AnswerAttempt> attempts = answerAttemptRepository.findByUserIdAndCreatedAtAfter(userId, since);
        Set<LocalDate> activeDays = attempts.stream()
            .map(AnswerAttempt::getCreatedAt)
            .filter(value -> value != null)
            .map(value -> value.atZone(ZoneId.systemDefault()).toLocalDate())
            .collect(Collectors.toSet());
        int daysActive = activeDays.size();
        return (int) Math.round((daysActive / 14.0) * 100);
    }

    private int calculateStudyStreak(List<AnswerAttempt> attempts) {
        if (attempts.isEmpty()) {
            return 0;
        }
        Set<LocalDate> activeDays = attempts.stream()
            .map(AnswerAttempt::getCreatedAt)
            .filter(value -> value != null)
            .map(value -> value.atZone(ZoneId.systemDefault()).toLocalDate())
            .collect(Collectors.toSet());
        LocalDate cursor = LocalDate.now();
        int streak = 0;
        while (activeDays.contains(cursor)) {
            streak += 1;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private String formatHoursStudied(List<AnswerAttempt> attempts) {
        int seconds = attempts.stream()
            .map(AnswerAttempt::getTimeTakenSeconds)
            .filter(value -> value != null && value > 0)
            .mapToInt(Integer::intValue)
            .sum();
        if (seconds == 0) {
            return "0h";
        }
        double hours = seconds / 3600.0;
        return String.format("%.1fh", hours);
    }

    private int calculateCoverage(UUID userId) {
        var topics = userTopicRepository.findByUserId(userId);
        if (topics.isEmpty()) {
            return 0;
        }
        long covered = topics.stream()
            .filter(t -> t.getMasteryPct() != null && t.getMasteryPct() >= 50)
            .count();
        return (int) Math.round((covered * 100.0) / topics.size());
    }

    private int calculateMockExamAverage(UUID userId) {
        List<ExamSession> sessions = examSessionRepository.findByUserId(userId);
        List<Integer> scores = sessions.stream()
            .map(ExamSession::getScore)
            .filter(score -> score != null)
            .toList();
        if (scores.isEmpty()) {
            return 0;
        }
        double avg = scores.stream().mapToInt(Integer::intValue).average().orElse(0);
        return (int) Math.round(avg);
    }
}
