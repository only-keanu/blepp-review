package com.kei.review.users;

import com.kei.review.users.dto.UpdateProfileRequest;
import com.kei.review.users.dto.UserProfileResponse;
import java.util.UUID;

public interface UserService {
    UserProfileResponse getProfile(UUID userId);
    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
}
