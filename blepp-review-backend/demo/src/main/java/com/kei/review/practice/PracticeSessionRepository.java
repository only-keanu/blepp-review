package com.kei.review.practice;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, UUID> {
}
