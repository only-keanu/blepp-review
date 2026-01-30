package com.kei.review.practice;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.practice.dto.AnswerAttemptRequest;
import com.kei.review.practice.dto.CreatePracticeSessionRequest;
import com.kei.review.practice.dto.PracticeSessionResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {
    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @PostMapping("/session")
    public ResponseEntity<PracticeSessionResponse> startSession(
        @RequestBody CreatePracticeSessionRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(practiceService.startSession(principal.getId(), request));
    }

    @PostMapping("/attempt")
    public ResponseEntity<Void> recordAttempt(
        @RequestBody AnswerAttemptRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        practiceService.recordAttempt(principal.getId(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/mistakes")
    public ResponseEntity<List<UUID>> listMistakes(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(practiceService.listMistakeQuestionIds(principal.getId()));
    }
}
