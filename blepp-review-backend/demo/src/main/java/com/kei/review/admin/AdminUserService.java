package com.kei.review.admin;

import com.kei.review.admin.dto.AdminAccessUpdateRequest;
import com.kei.review.admin.dto.AdminUserPageResponse;
import com.kei.review.admin.dto.AdminUserResponse;
import com.kei.review.users.AccessService;
import com.kei.review.users.User;
import com.kei.review.users.UserAccessStatus;
import com.kei.review.users.UserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {
    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;
    private final AccessService accessService;
    private final Clock clock;

    public AdminUserService(UserRepository userRepository, AccessService accessService, Clock clock) {
        this.userRepository = userRepository;
        this.accessService = accessService;
        this.clock = clock;
    }

    public AdminUserPageResponse searchUsers(String query, UserAccessStatus status, int page, int size) {
        int boundedPage = Math.max(page, 0);
        int boundedSize = boundPageSize(size);
        PageRequest pageRequest = PageRequest.of(boundedPage, boundedSize);
        Page<AdminUserResponse> users = searchUserPage(normalizeQuery(query), status, pageRequest)
            .map(this::toResponse);

        return new AdminUserPageResponse(
            users.getContent(),
            users.getNumber(),
            users.getSize(),
            users.getTotalElements(),
            users.getTotalPages()
        );
    }

    private Page<User> searchUserPage(String query, UserAccessStatus status, PageRequest pageRequest) {
        Instant now = clock.instant();
        if (status == null) {
            return userRepository.searchUsers(query, pageRequest);
        }
        return switch (status) {
            case PAID -> userRepository.searchPaidUsers(query, now, UserAccessStatus.PAID, pageRequest);
            case TRIAL -> userRepository.searchTrialUsers(query, now, UserAccessStatus.TRIAL, pageRequest);
            case EXPIRED -> userRepository.searchExpiredUsers(
                query,
                now,
                UserAccessStatus.PAID,
                UserAccessStatus.TRIAL,
                UserAccessStatus.EXPIRED,
                pageRequest
            );
        };
    }

    @Transactional
    public AdminUserResponse updateAccess(UUID userId, AdminAccessUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        Instant now = clock.instant();
        if (request.accessStatus() == UserAccessStatus.PAID) {
            user.setAccessStatus(UserAccessStatus.PAID);
            user.setPaidUntil(request.paidUntil() != null ? request.paidUntil() : now.plus(30, ChronoUnit.DAYS));
        } else if (request.accessStatus() == UserAccessStatus.EXPIRED) {
            user.setAccessStatus(UserAccessStatus.EXPIRED);
            user.setPaidUntil(null);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admins can only grant paid access or revoke access.");
        }

        user.setPaymentReference(blankToNull(request.paymentReference()));
        user.setAccessNotes(blankToNull(request.accessNotes()));
        user.setAccessUpdatedAt(now);
        user.setUpdatedAt(now);
        return toResponse(userRepository.save(user));
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getTargetExamDate(),
            user.getDailyStudyHours(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            accessService.toAccessResponse(user)
        );
    }

    private String normalizeQuery(String query) {
        return query == null ? "" : query.trim();
    }

    private int boundPageSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
