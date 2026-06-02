package com.kei.review.config;

import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class TopicSeeder implements CommandLineRunner {
    private final TopicRepository topicRepository;

    public TopicSeeder(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @Override
    public void run(String... args) {
        topics().forEach(seed -> {
            Topic topic = topicRepository.findBySlug(seed.getSlug())
                .orElseGet(Topic::new);
            topic.setName(seed.getName());
            topic.setSlug(seed.getSlug());
            topic.setColor(seed.getColor());
            topicRepository.save(topic);
        });
    }

    private List<Topic> topics() {
        return List.of(
            Topic.builder().name("General Psychology").slug("general-psychology").color("blue").build(),
            Topic.builder().name("Abnormal Psychology").slug("abnormal-psychology").color("purple").build(),
            Topic.builder().name("Psychological Assessment").slug("psychological-assessment").color("amber").build(),
            Topic.builder().name("Industrial/Organizational Psychology").slug("industrial-organizational-psychology").color("green").build(),
            Topic.builder().name("Ethics (RA 10029)").slug("ethics-ra-10029").color("red").build()
        );
    }
}
