package com.kei.review.exams;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.exams.dto.ExamAnswerRequest;
import com.kei.review.exams.dto.ExamResponse;
import com.kei.review.exams.dto.ExamSessionResponse;
import com.kei.review.exams.dto.ExamSubmitResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public ResponseEntity<List<ExamResponse>> listExams() {
        return ResponseEntity.ok(examService.listExams());
    }

    @PostMapping("/{examId}/session")
    public ResponseEntity<ExamSessionResponse> startSession(
        @PathVariable UUID examId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(examService.startSession(principal.getId(), examId));
    }

    @PostMapping("/session/{sessionId}/answer")
    public ResponseEntity<Void> recordAnswer(
        @PathVariable UUID sessionId,
        @RequestBody ExamAnswerRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        examService.recordAnswer(principal.getId(), sessionId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/submit")
    public ResponseEntity<ExamSubmitResponse> submit(
        @PathVariable UUID sessionId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(examService.submit(principal.getId(), sessionId));
    }
}
