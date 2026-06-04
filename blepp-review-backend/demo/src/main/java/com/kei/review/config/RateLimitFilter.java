package com.kei.review.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 30)
public class RateLimitFilter extends OncePerRequestFilter {
    private final RateLimitProperties properties;
    private final Clock clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitFilter(RateLimitProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        Rule rule = ruleFor(request);
        if (!properties.isEnabled() || rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        long now = clock.millis();
        long windowMs = Math.max(1, rule.windowSeconds()) * 1000L;
        String key = rule.name() + ":" + clientIp(request);
        Window window = windows.compute(key, (unused, current) -> {
            if (current == null || now >= current.resetAtMillis) {
                return new Window(1, now + windowMs);
            }
            current.count++;
            return current;
        });

        long retryAfterSeconds = Math.max(1, (window.resetAtMillis - now + 999) / 1000);
        response.setHeader("X-RateLimit-Limit", String.valueOf(rule.capacity()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, rule.capacity() - window.count)));
        response.setHeader("X-RateLimit-Reset", String.valueOf((window.resetAtMillis + 999) / 1000));

        if (window.count > rule.capacity()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.getWriter().write("""
                {"timestamp":"%s","status":429,"error":"Too Many Requests","message":"Too many requests. Please wait before trying again.","path":"%s"}"""
                .formatted(Instant.now(clock), jsonEscape(request.getRequestURI())));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Rule ruleFor(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        if (path.equals("/api/auth/login")
            || path.equals("/api/auth/register")
            || path.equals("/api/auth/oauth/google")
            || path.equals("/api/auth/oauth/facebook")) {
            return new Rule("auth", properties.getAuthCapacity(), properties.getAuthWindowSeconds());
        }
        if (path.equals("/api/auth/refresh") || path.equals("/api/auth/logout")) {
            return new Rule("refresh", properties.getRefreshCapacity(), properties.getRefreshWindowSeconds());
        }
        if (("POST".equals(method) || "PATCH".equals(method) || "DELETE".equals(method))
            && path.startsWith("/api/generation")) {
            return new Rule("generation", properties.getGenerationCapacity(), properties.getGenerationWindowSeconds());
        }
        if (("POST".equals(method) || "PATCH".equals(method) || "DELETE".equals(method))
            && isStudyWritePath(path)) {
            return new Rule("study-write", properties.getStudyWriteCapacity(), properties.getStudyWriteWindowSeconds());
        }
        return null;
    }

    private boolean isStudyWritePath(String path) {
        return path.startsWith("/api/practice")
            || path.startsWith("/api/flashcards")
            || path.startsWith("/api/questions")
            || path.startsWith("/api/topics")
            || path.startsWith("/api/lessons/progress")
            || path.startsWith("/api/exams")
            || path.startsWith("/api/admin/users");
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String jsonEscape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private record Rule(String name, int capacity, int windowSeconds) {
    }

    private static class Window {
        private int count;
        private final long resetAtMillis;

        private Window(int count, long resetAtMillis) {
            this.count = count;
            this.resetAtMillis = resetAtMillis;
        }
    }
}
