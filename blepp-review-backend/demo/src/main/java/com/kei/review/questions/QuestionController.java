package com.kei.review.questions;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.questions.dto.QuestionCreateRequest;
import com.kei.review.questions.dto.QuestionResponse;
import com.kei.review.questions.dto.QuestionSearchParams;
import com.kei.review.questions.dto.QuestionUpdateRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> search(
        QuestionSearchParams params,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(questionService.search(principal.getId(), params));
    }

    @PostMapping
    public ResponseEntity<QuestionResponse> create(
        @jakarta.validation.Valid @RequestBody QuestionCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(questionService.create(principal.getId(), request));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<QuestionResponse>> bulkCreate(
        @RequestBody List<QuestionCreateRequest> request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(questionService.bulkCreate(principal.getId(), request));
    }

    @PatchMapping("/{questionId}")
    public ResponseEntity<QuestionResponse> update(
        @PathVariable UUID questionId,
        @jakarta.validation.Valid @RequestBody QuestionUpdateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(questionService.update(principal.getId(), questionId, request));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID questionId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        questionService.delete(principal.getId(), questionId);
        return ResponseEntity.noContent().build();
    }
}
