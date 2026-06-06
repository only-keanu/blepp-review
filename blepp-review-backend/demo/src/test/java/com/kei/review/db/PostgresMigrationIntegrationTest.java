package com.kei.review.db;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class PostgresMigrationIntegrationTest {
    @Container
    static final PostgreSQLContainer postgres = new PostgreSQLContainer(
        DockerImageName.parse("postgres:16-alpine")
    );

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Test
    void flywayAppliesPostgresMigrationsAndQueryPathIndexes() {
        Integer accessMigrationCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '10' AND success = true",
            Integer.class
        );
        Integer schedulerMigrationCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '12' AND success = true",
            Integer.class
        );
        Integer notificationMigrationCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '13' AND success = true",
            Integer.class
        );
        List<String> examSessionColumns = jdbcTemplate.queryForList(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'exam_sessions'",
            String.class
        );
        String mockExamNullable = jdbcTemplate.queryForObject(
            "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_name = 'exam_sessions' AND column_name = 'mock_exam_id'",
            String.class
        );
        List<String> indexes = jdbcTemplate.queryForList(
            "SELECT indexname FROM pg_indexes WHERE schemaname = 'public'",
            String.class
        );
        List<String> userColumns = jdbcTemplate.queryForList(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'",
            String.class
        );
        List<String> flashcardColumns = jdbcTemplate.queryForList(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'flashcards'",
            String.class
        );
        List<String> notificationDismissalColumns = jdbcTemplate.queryForList(
            "SELECT column_name FROM information_schema.columns " +
                "WHERE table_name = 'notification_dismissals'",
            String.class
        );
        Integer notificationUniqueConstraintCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.table_constraints " +
                "WHERE table_name = 'notification_dismissals' " +
                "AND constraint_name = 'uk_notification_dismissals_user_key' " +
                "AND constraint_type = 'UNIQUE'",
            Integer.class
        );

        assertThat(accessMigrationCount).isEqualTo(1);
        assertThat(schedulerMigrationCount).isEqualTo(1);
        assertThat(notificationMigrationCount).isEqualTo(1);
        assertThat(indexes).contains(
            "idx_questions_owner_topic",
            "idx_answer_attempts_user_created_at",
            "idx_exam_session_questions_session_order",
            "idx_flashcards_user_next_review",
            "idx_flashcards_user_due_at",
            "idx_flashcards_user_review_state_due_at",
            "idx_lesson_progress_user_topic",
            "idx_generation_jobs_user_created_at",
            "idx_notification_dismissals_user"
        );
        assertThat(examSessionColumns).contains("total_questions", "duration_minutes");
        assertThat(mockExamNullable).isEqualTo("YES");
        assertThat(userColumns).contains(
            "role",
            "access_status",
            "trial_ends_at",
            "paid_until",
            "access_updated_at",
            "access_notes",
            "payment_reference"
        );
        assertThat(flashcardColumns).contains(
            "review_state",
            "due_at",
            "interval_days",
            "ease_factor",
            "repetition_count",
            "lapse_count",
            "last_reviewed_at"
        );
        assertThat(notificationDismissalColumns).contains(
            "id",
            "user_id",
            "notification_key",
            "dismissed_at"
        );
        assertThat(notificationUniqueConstraintCount).isEqualTo(1);
    }
}
