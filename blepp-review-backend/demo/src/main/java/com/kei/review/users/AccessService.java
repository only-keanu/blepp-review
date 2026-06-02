package com.kei.review.users;

import com.kei.review.users.dto.UserAccessResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccessService {
    public static final String STUDY_ACCESS_MESSAGE = "Your trial has ended. Please complete payment to continue.";
    public static final String AI_ACCESS_MESSAGE = "AI generation requires paid access. Please complete payment to continue.";

    private final UserRepository userRepository;
    private final Clock clock;
    private final Set<String> adminEmails;

    public AccessService(
        UserRepository userRepository,
        Clock clock,
        @Value("${app.admin.emails:${APP_ADMIN_EMAILS:}}") String adminEmails
    ) {
        this.userRepository = userRepository;
        this.clock = clock;
        this.adminEmails = parseEmails(adminEmails);
    }

    public void initializeTrial(User user) {
        Instant now = clock.instant();
        user.setRole(UserRole.USER);
        user.setAccessStatus(UserAccessStatus.TRIAL);
        user.setTrialEndsAt(now.plus(1, ChronoUnit.DAYS));
        user.setPaidUntil(null);
        user.setAccessUpdatedAt(now);
    }

    public boolean isAdmin(User user) {
        return user != null
            && (user.getRole() == UserRole.ADMIN || adminEmails.contains(normalizeEmail(user.getEmail())));
    }

    public boolean hasStudyAccess(User user) {
        return isAdmin(user) || switch (effectiveStatus(user)) {
            case TRIAL, PAID -> true;
            case EXPIRED -> false;
        };
    }

    public boolean hasAiAccess(User user) {
        return isAdmin(user) || effectiveStatus(user) == UserAccessStatus.PAID;
    }

    public void requireStudyAccess(UUID userId) {
        User user = findUser(userId);
        if (!hasStudyAccess(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, STUDY_ACCESS_MESSAGE);
        }
    }

    public void requireAiAccess(UUID userId) {
        User user = findUser(userId);
        if (!hasAiAccess(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, AI_ACCESS_MESSAGE);
        }
    }

    public void requireAdmin(UUID userId) {
        User user = findUser(userId);
        if (!isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required.");
        }
    }

    public UserAccessResponse toAccessResponse(User user) {
        boolean admin = isAdmin(user);
        boolean hasStudyAccess = hasStudyAccess(user);
        boolean hasAiAccess = hasAiAccess(user);
        UserRole effectiveRole = admin ? UserRole.ADMIN : UserRole.USER;
        return new UserAccessResponse(
            effectiveRole,
            effectiveStatus(user),
            user.getTrialEndsAt(),
            user.getPaidUntil(),
            user.getAccessUpdatedAt(),
            user.getAccessNotes(),
            user.getPaymentReference(),
            hasStudyAccess,
            hasAiAccess,
            admin
        );
    }

    public UserAccessStatus effectiveStatus(User user) {
        if (user == null || user.getAccessStatus() == null) {
            return UserAccessStatus.EXPIRED;
        }

        Instant now = clock.instant();
        if (user.getAccessStatus() == UserAccessStatus.PAID) {
            return user.getPaidUntil() != null && user.getPaidUntil().isAfter(now)
                ? UserAccessStatus.PAID
                : UserAccessStatus.EXPIRED;
        }
        if (user.getAccessStatus() == UserAccessStatus.TRIAL) {
            return user.getTrialEndsAt() != null && user.getTrialEndsAt().isAfter(now)
                ? UserAccessStatus.TRIAL
                : UserAccessStatus.EXPIRED;
        }
        return UserAccessStatus.EXPIRED;
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private Set<String> parseEmails(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(value.split(","))
            .map(this::normalizeEmail)
            .filter(email -> !email.isBlank())
            .collect(Collectors.toUnmodifiableSet());
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
