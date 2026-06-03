package com.kei.review.config;

import java.util.Arrays;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StartupConfigLogger {
    private static final Logger log = LoggerFactory.getLogger(StartupConfigLogger.class);

    private final Environment environment;
    private final ObjectProvider<Flyway> flywayProvider;
    private final String corsAllowedOrigins;
    private final String openAiApiKey;
    private final String generationModel;
    private final String generationUploadDir;

    public StartupConfigLogger(
        Environment environment,
        ObjectProvider<Flyway> flywayProvider,
        @Value("${app.cors.allowed-origins:}") String corsAllowedOrigins,
        @Value("${app.openai.api-key:}") String openAiApiKey,
        @Value("${app.openai.model:gpt-4o-mini}") String generationModel,
        @Value("${app.generation.upload-dir:uploads/generation}") String generationUploadDir
    ) {
        this.environment = environment;
        this.flywayProvider = flywayProvider;
        this.corsAllowedOrigins = corsAllowedOrigins;
        this.openAiApiKey = openAiApiKey;
        this.generationModel = generationModel;
        this.generationUploadDir = generationUploadDir;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupConfig() {
        log.info(
            "startup_config profiles={} cors_allowed_origins={} openai_configured={} generation_model={} generation_upload_dir={}",
            Arrays.toString(environment.getActiveProfiles()),
            corsAllowedOrigins,
            openAiApiKey != null && !openAiApiKey.isBlank(),
            generationModel,
            generationUploadDir
        );
        logFlywayStatus();
    }

    private void logFlywayStatus() {
        Flyway flyway = flywayProvider.getIfAvailable();
        if (flyway == null) {
            log.info("flyway_status enabled=false");
            return;
        }

        try {
            MigrationInfo current = flyway.info().current();
            log.info(
                "flyway_status enabled=true current_version={} current_description={}",
                current == null ? "none" : current.getVersion(),
                current == null ? "none" : current.getDescription()
            );
        } catch (RuntimeException exception) {
            log.warn("flyway_status enabled=true current_version=unknown reason={}", exception.getClass().getSimpleName());
        }
    }
}
