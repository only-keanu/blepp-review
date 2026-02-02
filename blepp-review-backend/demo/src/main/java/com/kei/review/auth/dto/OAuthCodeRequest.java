package com.kei.review.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record OAuthCodeRequest(
    @NotBlank String code,
    @NotBlank String redirectUri
) {
}
