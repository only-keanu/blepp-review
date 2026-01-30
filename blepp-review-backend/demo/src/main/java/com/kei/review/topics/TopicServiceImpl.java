package com.kei.review.topics;

import com.kei.review.topics.dto.TopicResponse;
import com.kei.review.topics.dto.WeakToggleRequest;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class TopicServiceImpl implements TopicService {
    private final TopicRepository topicRepository;
    private final UserTopicRepository userTopicRepository;
    private final UserRepository userRepository;

    public TopicServiceImpl(
        TopicRepository topicRepository,
        UserTopicRepository userTopicRepository,
        UserRepository userRepository
    ) {
        this.topicRepository = topicRepository;
        this.userTopicRepository = userTopicRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<TopicResponse> listTopics(UUID userId) {
        List<Topic> topics = topicRepository.findAll();
        Map<UUID, UserTopic> userTopicMap = userTopicRepository.findByUserId(userId)
            .stream()
            .collect(Collectors.toMap(ut -> ut.getTopic().getId(), ut -> ut));

        return topics.stream()
            .map(topic -> {
                UserTopic userTopic = userTopicMap.get(topic.getId());
                boolean weak = userTopic != null && userTopic.isWeak();
                Integer mastery = userTopic != null && userTopic.getMasteryPct() != null
                    ? userTopic.getMasteryPct()
                    : 0;
                return new TopicResponse(
                    topic.getId(),
                    topic.getName(),
                    topic.getSlug(),
                    topic.getColor(),
                    weak,
                    mastery
                );
            })
            .toList();
    }

    @Override
    public TopicResponse updateWeak(UUID userId, UUID topicId, WeakToggleRequest request) {
        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new IllegalStateException("Topic not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        UserTopic userTopic = userTopicRepository.findByUserIdAndTopicId(userId, topicId)
            .orElseGet(() -> UserTopic.builder()
                .user(user)
                .topic(topic)
                .masteryPct(0)
                .weak(false)
                .build()
            );

        userTopic.setWeak(request.weak());
        if (userTopic.getMasteryPct() == null) {
            userTopic.setMasteryPct(0);
        }
        UserTopic saved = userTopicRepository.save(userTopic);

        return new TopicResponse(
            topic.getId(),
            topic.getName(),
            topic.getSlug(),
            topic.getColor(),
            saved.isWeak(),
            saved.getMasteryPct()
        );
    }
}
