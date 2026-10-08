package com.wayhome.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory sliding window rate limiting filter to protect endpoints from brute-force & DDoS attacks.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_AUTH_REQUESTS_PER_MINUTE = 25;
    private static final int MAX_GENERAL_REQUESTS_PER_MINUTE = 150;

    private static class RequestCounter {
        long windowStartMs;
        AtomicInteger count;

        RequestCounter(long windowStartMs) {
            this.windowStartMs = windowStartMs;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip static resources or OPTIONS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        boolean isAuthEndpoint = path.startsWith("/api/auth/");

        int limit = isAuthEndpoint ? MAX_AUTH_REQUESTS_PER_MINUTE : MAX_GENERAL_REQUESTS_PER_MINUTE;
        String key = clientIp + ":" + (isAuthEndpoint ? "AUTH" : "GEN");

        long now = System.currentTimeMillis();
        long windowSizeMs = 60_000L; // 1 minute

        RequestCounter counter = requestCounts.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.windowStartMs) > windowSizeMs) {
                return new RequestCounter(now);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > limit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\", \"status\": 429}");
            return;
        }

        // Periodic cleanup to avoid memory leak
        if (requestCounts.size() > 5000) {
            requestCounts.entrySet().removeIf(entry -> (now - entry.getValue().windowStartMs) > windowSizeMs);
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
