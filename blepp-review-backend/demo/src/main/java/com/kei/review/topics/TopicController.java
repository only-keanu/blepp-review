package com.kei.review.topics;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.topics.dto.TopicResponse;
import com.kei.review.topics.dto.WeakToggleRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/topics")
public class TopicController {
    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public ResponseEntity<List<TopicResponse>> listTopics(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(topicService.listTopics(principal.getId()));
    }

    @PatchMapping("/{topicId}/weak")
    public ResponseEntity<TopicResponse> updateWeak(
        @PathVariable UUID topicId,
        @RequestBody WeakToggleRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(topicService.updateWeak(principal.getId(), topicId, request));
    }
}
