package com.kei.review.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {
    private boolean enabled = true;
    private int authCapacity = 10;
    private int authWindowSeconds = 60;
    private int refreshCapacity = 30;
    private int refreshWindowSeconds = 60;
    private int generationCapacity = 10;
    private int generationWindowSeconds = 3600;
    private int studyWriteCapacity = 120;
    private int studyWriteWindowSeconds = 60;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getAuthCapacity() {
        return authCapacity;
    }

    public void setAuthCapacity(int authCapacity) {
        this.authCapacity = authCapacity;
    }

    public int getAuthWindowSeconds() {
        return authWindowSeconds;
    }

    public void setAuthWindowSeconds(int authWindowSeconds) {
        this.authWindowSeconds = authWindowSeconds;
    }

    public int getRefreshCapacity() {
        return refreshCapacity;
    }

    public void setRefreshCapacity(int refreshCapacity) {
        this.refreshCapacity = refreshCapacity;
    }

    public int getRefreshWindowSeconds() {
        return refreshWindowSeconds;
    }

    public void setRefreshWindowSeconds(int refreshWindowSeconds) {
        this.refreshWindowSeconds = refreshWindowSeconds;
    }

    public int getGenerationCapacity() {
        return generationCapacity;
    }

    public void setGenerationCapacity(int generationCapacity) {
        this.generationCapacity = generationCapacity;
    }

    public int getGenerationWindowSeconds() {
        return generationWindowSeconds;
    }

    public void setGenerationWindowSeconds(int generationWindowSeconds) {
        this.generationWindowSeconds = generationWindowSeconds;
    }

    public int getStudyWriteCapacity() {
        return studyWriteCapacity;
    }

    public void setStudyWriteCapacity(int studyWriteCapacity) {
        this.studyWriteCapacity = studyWriteCapacity;
    }

    public int getStudyWriteWindowSeconds() {
        return studyWriteWindowSeconds;
    }

    public void setStudyWriteWindowSeconds(int studyWriteWindowSeconds) {
        this.studyWriteWindowSeconds = studyWriteWindowSeconds;
    }
}
