package com.orbitos.portfolio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * CORS for browser clients. Must be applied via Spring Security ({@code http.cors()});
 * {@code WebMvcConfigurer} alone does not run before the security filter chain, so admin
 * and other API calls would miss {@code Access-Control-Allow-Origin}.
 */
@Configuration
public class CorsConfig {

    private static final List<String> LOCAL_ORIGINS = List.of("http://localhost:3000", "http://localhost:5173");

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:}") String allowedOriginsEnv) {
        List<String> origins = buildAllowedOrigins(allowedOriginsEnv);
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    static List<String> buildAllowedOrigins(String allowedOriginsEnv) {
        return Stream.concat(
                LOCAL_ORIGINS.stream(),
                Arrays.stream(allowedOriginsEnv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
        ).collect(Collectors.toList());
    }
}
