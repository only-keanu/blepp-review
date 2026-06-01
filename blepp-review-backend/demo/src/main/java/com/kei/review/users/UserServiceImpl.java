package com.kei.review.users;

import com.kei.review.users.dto.ChangePasswordRequest;
import com.kei.review.users.dto.UpdateProfileRequest;
import com.kei.review.users.dto.UserProfileResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));
        return toResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.targetExamDate() != null) {
            user.setTargetExamDate(request.targetExamDate());
        }
        if (request.dailyStudyHours() != null) {
            user.setDailyStudyHours(request.dailyStudyHours());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        user.setUpdatedAt(Instant.now());

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        validatePasswordRequest(request);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalStateException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new IllegalStateException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    private void validatePasswordRequest(ChangePasswordRequest request) {
        if (request == null
            || isBlank(request.currentPassword())
            || isBlank(request.newPassword())
            || isBlank(request.confirmPassword())) {
            throw new IllegalStateException("Current password, new password, and confirmation are required");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalStateException("New password and confirmation do not match");
        }
        if (request.newPassword().length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException("New password must be at least 8 characters");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getTargetExamDate(),
            user.getDailyStudyHours(),
            user.getAvatarUrl()
        );
    }
}
