package com.kei.review.topics;

import com.kei.review.topics.dto.TopicResponse;
import com.kei.review.topics.dto.TopicCreateRequest;
import com.kei.review.topics.dto.WeakToggleRequest;
import com.kei.review.users.User;
import com.kei.review.users.UserRepository;
import java.text.Normalizer;
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

    @Override
    public TopicResponse createTopic(UUID userId, TopicCreateRequest request) {
        String name = request.name().trim();
        String color = request.color() == null || request.color().isBlank()
            ? "blue"
            : request.color().trim();

        String baseSlug = toSlug(name);
        String slug = baseSlug;
        int suffix = 2;
        while (topicRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + suffix;
            suffix += 1;
        }

        Topic topic = Topic.builder()
            .name(name)
            .slug(slug)
            .color(color)
            .build();

        Topic saved = topicRepository.save(topic);
        return new TopicResponse(
            saved.getId(),
            saved.getName(),
            saved.getSlug(),
            saved.getColor(),
            false,
            0
        );
    }

    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized
            .toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-");
        return slug.isBlank() ? "topic" : slug;
    }
}
