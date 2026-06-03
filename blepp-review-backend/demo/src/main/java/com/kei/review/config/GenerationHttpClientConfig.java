package com.kei.review.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GenerationHttpClientConfig {
    @Bean
    public RestTemplate generationRestTemplate(
        @Value("${app.generation.connect-timeout-seconds:10}") long connectTimeoutSeconds,
        @Value("${app.generation.read-timeout-seconds:60}") long readTimeoutSeconds
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(connectTimeoutSeconds));
        requestFactory.setReadTimeout(Duration.ofSeconds(readTimeoutSeconds));
        return new RestTemplate(requestFactory);
    }
}
