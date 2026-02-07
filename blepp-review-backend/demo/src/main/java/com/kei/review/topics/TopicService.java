package com.kei.review.topics;

import com.kei.review.topics.dto.TopicResponse;
import com.kei.review.topics.dto.TopicCreateRequest;
import com.kei.review.topics.dto.WeakToggleRequest;
import java.util.List;
import java.util.UUID;

public interface TopicService {
    List<TopicResponse> listTopics(UUID userId);
    TopicResponse updateWeak(UUID userId, UUID topicId, WeakToggleRequest request);
    TopicResponse createTopic(UUID userId, TopicCreateRequest request);
}
