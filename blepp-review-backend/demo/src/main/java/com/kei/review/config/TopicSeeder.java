package com.kei.review.config;

import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TopicSeeder implements CommandLineRunner {
    private final TopicRepository topicRepository;

    public TopicSeeder(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @Override
    public void run(String... args) {
        if (topicRepository.count() > 0) {
            return;
        }

        List<Topic> topics = List.of(
            Topic.builder().name("General Psychology").slug("general-psychology").color("blue").build(),
            Topic.builder().name("Abnormal Psychology").slug("abnormal-psychology").color("purple").build(),
            Topic.builder().name("Psychological Assessment").slug("psychological-assessment").color("amber").build(),
            Topic.builder().name("Industrial/Organizational Psychology").slug("industrial-organizational-psychology").color("green").build(),
            Topic.builder().name("Ethics (RA 10029)").slug("ethics-ra-10029").color("red").build()
        );

        topicRepository.saveAll(topics);
    }
}
