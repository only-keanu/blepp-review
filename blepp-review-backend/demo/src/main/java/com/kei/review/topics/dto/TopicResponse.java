package com.kei.review.topics.dto;

import java.util.UUID;

public record TopicResponse(UUID id, String name, String slug, String color, boolean weak, Integer masteryPct) {
}
