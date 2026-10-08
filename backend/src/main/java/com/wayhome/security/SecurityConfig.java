package com.wayhome.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final RateLimitingFilter rateLimitingFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, RateLimitingFilter rateLimitingFilter) {
        this.jwtFilter = jwtFilter;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // JWT based application — CSRF is not required
                .csrf(csrf -> csrf.disable())

                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Security Headers (OWASP recommendations)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(contentType -> {})
                        .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(permissions -> permissions.policy("camera=(), microphone=(), geolocation=(self)"))
                )

                // Do not create server sessions
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // -----------------------------
                        // HEALTH / API ROOT
                        // -----------------------------
                        .requestMatchers("/", "/api", "/api/", "/api/health").permitAll()

                        // -----------------------------
                        // PUBLIC PROPERTY LISTINGS (GET only)
                        // -----------------------------
                        .requestMatchers(HttpMethod.GET, "/api/properties", "/api/properties/*").permitAll()

                        // -----------------------------
                        // AUTH
                        // -----------------------------
                        .requestMatchers("/api/auth", "/api/auth/**").permitAll()

                        // -----------------------------
                        // PUBLIC STUDENT ACCOMMODATION
                        // -----------------------------
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/accommodations",
                                "/api/accommodations/**")
                        .permitAll()

                        // -----------------------------
                        // ADMIN & SETTINGS
                        // -----------------------------
                        .requestMatchers("/api/admin", "/api/admin/**").hasRole("ADMIN")

                        // -----------------------------
                        // AUDIT LOGS
                        // -----------------------------
                        .requestMatchers("/api/audit-logs", "/api/audit-logs/**").hasRole("ADMIN")

                        // -----------------------------
                        // ANALYTICS
                        // -----------------------------
                        .requestMatchers("/api/analytics/admin", "/api/analytics/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/analytics/manager", "/api/analytics/manager/**").hasAnyRole("ADMIN", "PROPERTY_MANAGER")

                        // -----------------------------
                        // CURRENT USER PROFILE
                        // -----------------------------
                        .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()

                        // -----------------------------
                        // USER MANAGEMENT
                        // -----------------------------
                        .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")

                        // -----------------------------
                        // PROPERTY OWNER LISTINGS
                        // -----------------------------
                        .requestMatchers("/api/properties/owner", "/api/properties/owner/**").authenticated()

                        // Create property
                        .requestMatchers(HttpMethod.POST, "/api/properties", "/api/properties/**")
                        .hasAnyRole("ADMIN", "PROPERTY_MANAGER")

                        // Update property
                        .requestMatchers(HttpMethod.PATCH, "/api/properties/**")
                        .hasAnyRole("ADMIN", "PROPERTY_MANAGER")

                        // Approve / reject
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/properties/*/approve",
                                "/api/properties/*/reject")
                        .hasRole("ADMIN")

                        // Delete property
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**")
                        .hasAnyRole("ADMIN", "PROPERTY_MANAGER")

                        // -----------------------------
                        // STUDENT ACCOMMODATION CREATION
                        // -----------------------------
                        .requestMatchers(HttpMethod.POST, "/api/accommodations", "/api/accommodations/**")
                        .hasAnyRole("ADMIN", "PROPERTY_MANAGER")

                        // -----------------------------
                        // APPLICATIONS
                        // -----------------------------
                        .requestMatchers("/api/applications", "/api/applications/**").authenticated()

                        // -----------------------------
                        // AGREEMENTS
                        // -----------------------------
                        .requestMatchers(HttpMethod.POST, "/api/agreements", "/api/agreements/**")
                        .hasAnyRole("ADMIN", "PROPERTY_MANAGER")

                        .requestMatchers("/api/agreements", "/api/agreements/**").authenticated()

                        // -----------------------------
                        // TENANT PROFILE & HISTORY
                        // -----------------------------
                        .requestMatchers("/api/tenant", "/api/tenant/**").authenticated()

                        // -----------------------------
                        // MESSAGES
                        // -----------------------------
                        .requestMatchers("/api/messages", "/api/messages/**").authenticated()

                        // -----------------------------
                        // NOTIFICATIONS
                        // -----------------------------
                        .requestMatchers("/api/notifications", "/api/notifications/**").authenticated()

                        // -----------------------------
                        // EVERYTHING ELSE
                        // -----------------------------
                        .anyRequest().authenticated())

                // Rate limiting filter
                .addFilterBefore(
                        rateLimitingFilter,
                        UsernamePasswordAuthenticationFilter.class)

                // JWT filter
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"));

        configuration.setAllowedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"));

        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}