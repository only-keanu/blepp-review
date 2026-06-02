package com.kei.review.lessons;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.lessons.dto.LessonProgressRequest;
import com.kei.review.lessons.dto.LessonProgressResponse;
import com.kei.review.users.AccessService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lessons/progress")
public class LessonProgressController {
    private final LessonProgressService lessonProgressService;
    private final AccessService accessService;

    public LessonProgressController(LessonProgressService lessonProgressService, AccessService accessService) {
        this.lessonProgressService = lessonProgressService;
        this.accessService = accessService;
    }

    @GetMapping
    public ResponseEntity<List<LessonProgressResponse>> listProgress(
        @RequestParam(required = false) String topicSlug,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(lessonProgressService.listProgress(principal.getId(), topicSlug));
    }

    @PostMapping
    public ResponseEntity<LessonProgressResponse> markComplete(
        @RequestBody LessonProgressRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(lessonProgressService.markComplete(principal.getId(), request));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteProgress(
        @PathVariable String lessonId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        lessonProgressService.deleteProgress(principal.getId(), lessonId);
        return ResponseEntity.noContent().build();
    }
}
