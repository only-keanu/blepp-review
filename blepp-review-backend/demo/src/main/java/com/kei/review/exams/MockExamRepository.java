package com.kei.review.exams;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockExamRepository extends JpaRepository<MockExam, UUID> {
}
