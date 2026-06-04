package com.kei.review.config;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = {
    "app.rate-limit.enabled=true",
    "app.rate-limit.auth-capacity=2",
    "app.rate-limit.auth-window-seconds=60"
})
class SecurityHardeningIntegrationTest {
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RequestIdFilter requestIdFilter;

    @Autowired
    private SecurityHeadersFilter securityHeadersFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter springSecurityFilterChain;

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilters(requestIdFilter, securityHeadersFilter, rateLimitFilter, springSecurityFilterChain)
            .build();
    }

    @Test
    void requestIdAndSecurityHeadersAreReturned() throws Exception {
        mockMvc.perform(get("/actuator/health").header("X-Request-Id", "test-request-1"))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Request-Id", "test-request-1"))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("X-Frame-Options", "DENY"))
            .andExpect(header().string("Referrer-Policy", "no-referrer"));
    }

    @Test
    void invalidRequestIdIsReplaced() throws Exception {
        mockMvc.perform(get("/actuator/health").header("X-Request-Id", "bad request id"))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Request-Id", matchesPattern("[0-9a-fA-F-]{36}")));
    }

    @Test
    void authEndpointIsRateLimitedWithApiErrorShape() throws Exception {
        postLogin();
        postLogin();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"missing@example.com\",\"password\":\"wrong-password\"}"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().string("Retry-After", "60"))
            .andExpect(jsonPath("$.status").value(429))
            .andExpect(jsonPath("$.message").value("Too many requests. Please wait before trying again."))
            .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    void nonPublicActuatorEndpointsAreNotExposed() throws Exception {
        mockMvc.perform(get("/actuator/env"))
            .andExpect(status().isForbidden());
    }

    private void postLogin() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"missing@example.com\",\"password\":\"wrong-password\"}"))
            .andExpect(status().isBadRequest());
    }
}
