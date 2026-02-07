package com.kei.review.lessons;

import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class LessonCatalog {
    private final Map<String, Integer> totalLessonsBySlug = Map.of(
        "general-psychology", 12,
        "abnormal-psychology", 10,
        "psychological-assessment", 8,
        "industrial-organizational-psychology", 9,
        "ethics-ra-10029", 6
    );

    public int getTotalLessons(String topicSlug) {
        if (topicSlug == null) {
            return 0;
        }
        return totalLessonsBySlug.getOrDefault(topicSlug, 0);
    }
}
