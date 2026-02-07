package com.kei.review.analytics.dto;

import java.util.List;

public record TopicMasteryResponse(List<TopicMasteryStat> topics) {
    public record TopicMasteryStat(String name, Integer masteryPct) {
    }
}
