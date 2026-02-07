package com.kei.review.questions;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, UUID>, JpaSpecificationExecutor<Question> {
    List<Question> findByOwnerId(UUID ownerId);
    List<Question> findByOwnerIdAndTopicId(UUID ownerId, UUID topicId);
}
