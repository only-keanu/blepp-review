package com.kei.review.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:blepp-review-prod-smoke;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.flyway.enabled=false",
    "app.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "app.cors.allowed-origins=https://blepp-review.example.com",
    "app.admin.emails=admin@example.com",
    "app.openai.api-key=",
    "app.generation.upload-dir=build/prod-smoke-generation"
})
@ActiveProfiles("prod")
class ProductionConfigSmokeTest {
    @Autowired
    private Environment environment;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void prodProfileStartsWithRequiredExternalizedConfig() {
        assertThat(Arrays.asList(environment.getActiveProfiles())).contains("prod");

        CorsConfiguration cors = corsConfigurationSource.getCorsConfiguration(null);
        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOriginPatterns()).containsExactly("https://blepp-review.example.com");
        assertThat(environment.getProperty("app.jwt.secret")).isNotBlank();
        assertThat(environment.getProperty("app.admin.emails")).isEqualTo("admin@example.com");
    }
}
