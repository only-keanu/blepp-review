package com.kei.review.topics.dto;

import jakarta.validation.constraints.NotBlank;

public record TopicCreateRequest(
    @NotBlank String name,
    String color
) {
}
