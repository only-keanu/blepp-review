package com.kei.review.users;

import com.kei.review.users.dto.UpdateProfileRequest;
import com.kei.review.users.dto.UserProfileResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
