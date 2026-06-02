package com.kei.review.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kei.review.topics.Topic;
import com.kei.review.topics.TopicRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class TopicSeederTest {
    @Test
    void upsertsRequiredBleppTopicsIndividually() {
        TopicRepository topicRepository = mock(TopicRepository.class);
        TopicSeeder seeder = new TopicSeeder(topicRepository);
        Topic existing = Topic.builder()
            .name("Old General")
            .slug("general-psychology")
            .color("gray")
            .build();

        when(topicRepository.findBySlug("general-psychology")).thenReturn(Optional.of(existing));
        when(topicRepository.findBySlug("abnormal-psychology")).thenReturn(Optional.empty());
        when(topicRepository.findBySlug("psychological-assessment")).thenReturn(Optional.empty());
        when(topicRepository.findBySlug("industrial-organizational-psychology")).thenReturn(Optional.empty());
        when(topicRepository.findBySlug("ethics-ra-10029")).thenReturn(Optional.empty());

        seeder.run();

        ArgumentCaptor<Topic> topicCaptor = ArgumentCaptor.forClass(Topic.class);
        verify(topicRepository, times(5)).save(topicCaptor.capture());

        assertEquals("General Psychology", existing.getName());
        assertEquals("blue", existing.getColor());
        assertEquals(
            java.util.List.of(
                "general-psychology",
                "abnormal-psychology",
                "psychological-assessment",
                "industrial-organizational-psychology",
                "ethics-ra-10029"
            ),
            topicCaptor.getAllValues().stream().map(Topic::getSlug).toList()
        );
    }
}
