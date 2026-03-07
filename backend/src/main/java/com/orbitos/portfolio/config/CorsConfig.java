package com.orbitos.portfolio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final List<String> LOCAL_ORIGINS = List.of("http://localhost:3000", "http://localhost:5173");

    @Value("${app.cors.allowed-origins:}")
    private String allowedOriginsEnv;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = Stream.concat(
                LOCAL_ORIGINS.stream(),
                Arrays.stream(allowedOriginsEnv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
        ).collect(Collectors.toList());

        registry.addMapping("/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(true);
    }
}
