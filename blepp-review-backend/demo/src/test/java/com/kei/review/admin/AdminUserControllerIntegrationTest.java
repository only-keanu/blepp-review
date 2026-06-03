package com.kei.review.admin;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kei.review.auth.AuthService;
import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.JwtService;
import com.kei.review.auth.dto.LoginRequest;
import com.kei.review.auth.dto.RegisterRequest;
import com.kei.review.users.UserAccessStatus;
import com.kei.review.users.UserRepository;
import jakarta.servlet.Filter;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = "app.admin.emails=admin-controller@example.com")
class AdminUserControllerIntegrationTest {
    private static final String TEST_SECRET = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter springSecurityFilterChain;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilters(springSecurityFilterChain)
            .build();
    }

    @Test
    void configuredAdminEmailIsReportedByMeAndCanSearchUsers() throws Exception {
        AuthResponse admin = admin();
        register(uniqueEmail("learner"), "Learner User");

        mockMvc.perform(get("/api/me").header("Authorization", bearer(admin)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("admin-controller@example.com"))
            .andExpect(jsonPath("$.admin").value(true))
            .andExpect(jsonPath("$.access.admin").value(true))
            .andExpect(jsonPath("$.hasStudyAccess").value(true))
            .andExpect(jsonPath("$.hasAiAccess").value(true));

        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(admin)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.users").isArray())
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(50));
    }

    @Test
    void nonAdminCannotSearchUsers() throws Exception {
        AuthResponse learner = register(uniqueEmail("non-admin"), "Non Admin");

        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(learner)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("Admin access is required."));
    }

    @Test
    void invalidBearerTokenCannotAccessProtectedRoutes() throws Exception {
        mockMvc.perform(get("/api/me").header("Authorization", "Bearer invalid-access-token"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void expiredBearerTokenCannotAccessProtectedRoutes() throws Exception {
        JwtService expiredTokenService = new JwtService(TEST_SECRET, -1, 43200);
        String expiredAccessToken = expiredTokenService.generateAccessToken(
            "expired-access@example.com",
            Map.of("uid", UUID.randomUUID().toString())
        );

        mockMvc.perform(get("/api/me").header("Authorization", "Bearer " + expiredAccessToken))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidRefreshTokenIsHandledByRefreshEndpoint() throws Exception {
        mockMvc.perform(post("/api/auth/refresh").header("Authorization", "Bearer invalid-refresh-token"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid refresh token"));
    }

    @Test
    void validRefreshTokenCanRefreshOverHttp() throws Exception {
        AuthResponse learner = register(uniqueEmail("refresh-http"), "Refresh Http");

        mockMvc.perform(post("/api/auth/refresh")
                .header("Authorization", "Bearer " + learner.refreshToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(learner.userId().toString()))
            .andExpect(jsonPath("$.accessToken").isString())
            .andExpect(jsonPath("$.refreshToken").isString());
    }

    @Test
    void validRefreshTokenCanRefreshFromJsonBodyOverHttp() throws Exception {
        AuthResponse learner = register(uniqueEmail("refresh-body"), "Refresh Body");

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "refreshToken", learner.refreshToken()
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(learner.userId().toString()))
            .andExpect(jsonPath("$.accessToken").isString())
            .andExpect(jsonPath("$.refreshToken").isString());
    }

    @Test
    void accessTokenCannotRefreshOverHttp() throws Exception {
        AuthResponse learner = register(uniqueEmail("refresh-access"), "Refresh Access");

        mockMvc.perform(post("/api/auth/refresh")
                .header("Authorization", bearer(learner)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid refresh token"));
    }

    @Test
    void refreshTokenCannotAccessProtectedRoutes() throws Exception {
        AuthResponse learner = register(uniqueEmail("refresh-protected"), "Refresh Protected");

        mockMvc.perform(get("/api/me").header("Authorization", "Bearer " + learner.refreshToken()))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void adminGrantAndRevokePaidAccessOverHttp() throws Exception {
        AuthResponse admin = admin();
        AuthResponse learner = register(uniqueEmail("paid-target"), "Paid Target");
        Instant paidUntil = Instant.now().plus(14, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MILLIS);

        mockMvc.perform(patch("/api/admin/users/{userId}/access", learner.userId())
                .header("Authorization", bearer(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "accessStatus", "PAID",
                    "paidUntil", paidUntil.toString(),
                    "paymentReference", "GCASH-123",
                    "accessNotes", "Verified manually"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(learner.userId().toString()))
            .andExpect(jsonPath("$.access.accessStatus").value("PAID"))
            .andExpect(jsonPath("$.access.paidUntil").value(paidUntil.toString()))
            .andExpect(jsonPath("$.access.paymentReference").value("GCASH-123"))
            .andExpect(jsonPath("$.access.accessNotes").value("Verified manually"))
            .andExpect(jsonPath("$.access.accessUpdatedAt").exists())
            .andExpect(jsonPath("$.access.hasStudyAccess").value(true))
            .andExpect(jsonPath("$.access.hasAiAccess").value(true));

        mockMvc.perform(patch("/api/admin/users/{userId}/access", learner.userId())
                .header("Authorization", bearer(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "accessStatus", "EXPIRED",
                    "paymentReference", "",
                    "accessNotes", ""
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.access.accessStatus").value("EXPIRED"))
            .andExpect(jsonPath("$.access.paidUntil").value(Matchers.nullValue()))
            .andExpect(jsonPath("$.access.paymentReference").value(Matchers.nullValue()))
            .andExpect(jsonPath("$.access.accessNotes").value(Matchers.nullValue()))
            .andExpect(jsonPath("$.access.hasStudyAccess").value(false))
            .andExpect(jsonPath("$.access.hasAiAccess").value(false));
    }

    @Test
    void expiredUserCanReadMeButCannotStartStudyOrAiWorkflows() throws Exception {
        AuthResponse learner = register(uniqueEmail("expired"), "Expired User");
        var user = userRepository.findById(learner.userId()).orElseThrow();
        user.setAccessStatus(UserAccessStatus.EXPIRED);
        user.setTrialEndsAt(Instant.now().minus(1, ChronoUnit.DAYS));
        user.setPaidUntil(null);
        userRepository.save(user);

        mockMvc.perform(get("/api/me").header("Authorization", bearer(learner)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.access.accessStatus").value("EXPIRED"))
            .andExpect(jsonPath("$.hasStudyAccess").value(false))
            .andExpect(jsonPath("$.hasAiAccess").value(false));

        mockMvc.perform(post("/api/practice/session")
                .header("Authorization", bearer(learner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "topicId", UUID.randomUUID().toString(),
                    "questionCount", 10
                ))))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("Your trial has ended. Please complete payment to continue."));

        mockMvc.perform(post("/api/generation/run")
                .header("Authorization", bearer(learner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "questionCount", 5,
                    "topicId", UUID.randomUUID().toString()
                ))))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("AI generation requires paid access. Please complete payment to continue."));
    }

    @Test
    void adminSearchCanFilterByEffectiveStatus() throws Exception {
        AuthResponse admin = admin();
        AuthResponse learner = register(uniqueEmail("status-paid"), "Status Paid");
        var user = userRepository.findById(learner.userId()).orElseThrow();
        user.setAccessStatus(UserAccessStatus.PAID);
        user.setPaidUntil(Instant.now().plus(30, ChronoUnit.DAYS));
        userRepository.save(user);

        mockMvc.perform(get("/api/admin/users")
                .param("query", "Status Paid")
                .param("status", "PAID")
                .header("Authorization", bearer(admin)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.users", hasSize(1)))
            .andExpect(jsonPath("$.users[0].email").value(learnerEmail(learner)))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void adminSearchReturnsPaginationMetadata() throws Exception {
        AuthResponse admin = admin();
        register(uniqueEmail("page-one"), "Page One");
        register(uniqueEmail("page-two"), "Page Two");

        mockMvc.perform(get("/api/admin/users")
                .param("query", "Page")
                .param("page", "0")
                .param("size", "1")
                .header("Authorization", bearer(admin)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.users", hasSize(1)))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(1))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void actuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    private AuthResponse admin() {
        String email = "admin-controller@example.com";
        if (userRepository.findByEmail(email).isPresent()) {
            return authService.login(new LoginRequest(email, "strong-password"));
        }
        return register(email, "Admin User");
    }

    private AuthResponse register(String email, String fullName) {
        return authService.register(new RegisterRequest(
            email,
            "strong-password",
            fullName,
            null,
            2
        ));
    }

    private String bearer(AuthResponse auth) {
        return "Bearer " + auth.accessToken();
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID() + "@example.com";
    }

    private String learnerEmail(AuthResponse learner) {
        return userRepository.findById(learner.userId()).orElseThrow().getEmail();
    }
}
