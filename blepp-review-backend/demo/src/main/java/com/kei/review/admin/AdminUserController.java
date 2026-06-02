package com.kei.review.admin;

import com.kei.review.admin.dto.AdminAccessUpdateRequest;
import com.kei.review.admin.dto.AdminUserPageResponse;
import com.kei.review.admin.dto.AdminUserResponse;
import com.kei.review.auth.UserPrincipal;
import com.kei.review.users.AccessService;
import com.kei.review.users.UserAccessStatus;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final AdminUserService adminUserService;
    private final AccessService accessService;

    public AdminUserController(AdminUserService adminUserService, AccessService accessService) {
        this.adminUserService = adminUserService;
        this.accessService = accessService;
    }

    @GetMapping
    public ResponseEntity<AdminUserPageResponse> searchUsers(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) UserAccessStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireAdmin(principal.getId());
        return ResponseEntity.ok(adminUserService.searchUsers(query, status, page, size));
    }

    @PatchMapping("/{userId}/access")
    public ResponseEntity<AdminUserResponse> updateAccess(
        @PathVariable UUID userId,
        @Valid @RequestBody AdminAccessUpdateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireAdmin(principal.getId());
        return ResponseEntity.ok(adminUserService.updateAccess(userId, request));
    }
}
