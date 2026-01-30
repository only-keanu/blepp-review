package com.kei.review.topics;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTopicRepository extends JpaRepository<UserTopic, UUID> {
    List<UserTopic> findByUserId(UUID userId);
    Optional<UserTopic> findByUserIdAndTopicId(UUID userId, UUID topicId);
}
