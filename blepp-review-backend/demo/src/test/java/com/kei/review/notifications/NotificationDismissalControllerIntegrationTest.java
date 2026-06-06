package com.kei.review.notifications;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kei.review.auth.AuthService;
import com.kei.review.auth.dto.AuthResponse;
import com.kei.review.auth.dto.RegisterRequest;
import jakarta.servlet.Filter;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class NotificationDismissalControllerIntegrationTest {
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter springSecurityFilterChain;

    @Autowired
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilters(springSecurityFilterChain)
            .build();
    }

    @Test
    void authenticatedUserCanPersistAndListDismissalIdempotently() throws Exception {
        AuthResponse user = register("dismiss");

        dismiss(user, "flashcards-due-3");
        dismiss(user, "flashcards-due-3");

        mockMvc.perform(get("/api/notification-dismissals")
                .header("Authorization", bearer(user)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.notificationIds", contains("flashcards-due-3")));
    }

    @Test
    void dismissalsAreIsolatedByUser() throws Exception {
        AuthResponse firstUser = register("first");
        AuthResponse secondUser = register("second");
        dismiss(firstUser, "exam-session-123");

        mockMvc.perform(get("/api/notification-dismissals")
                .header("Authorization", bearer(secondUser)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.notificationIds", empty()));
    }

    @Test
    void notificationIdIsValidated() throws Exception {
        AuthResponse user = register("invalid");

        mockMvc.perform(post("/api/notification-dismissals")
                .header("Authorization", bearer(user))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notificationId", " "))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("notificationId: must not be blank"));
    }

    @Test
    void endpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/notification-dismissals"))
            .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/notification-dismissals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notificationId", "access-expired"))))
            .andExpect(status().isForbidden());
    }

    private void dismiss(AuthResponse user, String notificationId) throws Exception {
        mockMvc.perform(post("/api/notification-dismissals")
                .header("Authorization", bearer(user))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notificationId", notificationId))))
            .andExpect(status().isNoContent());
    }

    private AuthResponse register(String prefix) {
        return authService.register(new RegisterRequest(
            prefix + "-" + UUID.randomUUID() + "@example.com",
            "strong-password",
            "Notification User",
            null,
            2
        ));
    }

    private String bearer(AuthResponse auth) {
        return "Bearer " + auth.accessToken();
    }
}
