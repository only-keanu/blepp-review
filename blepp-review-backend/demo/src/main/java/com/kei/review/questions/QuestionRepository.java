package com.kei.review.questions;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, UUID>, JpaSpecificationExecutor<Question> {
    List<Question> findByOwnerId(UUID ownerId);
    List<Question> findByOwnerIdAndTopicId(UUID ownerId, UUID topicId);
    List<Question> findByOwnerIdAndTopicIdIn(UUID ownerId, List<UUID> topicIds);
    List<Question> findByOwnerEmail(String ownerEmail);
    List<Question> findByOwnerEmailAndTopicId(String ownerEmail, UUID topicId);
    List<Question> findByOwnerEmailAndTopicIdIn(String ownerEmail, List<UUID> topicIds);
    long countByOwnerId(UUID ownerId);
    boolean existsByOwnerEmailAndText(String ownerEmail, String text);
}
