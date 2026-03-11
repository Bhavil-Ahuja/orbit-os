package com.orbitos.portfolio.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * When {@code DATABASE_URL} or {@code DATABASE_PUBLIC_URL} is set, parses it and sets
 * {@code spring.datasource.url}, {@code spring.datasource.username}, {@code spring.datasource.password}.
 * Prefer {@code DATABASE_PUBLIC_URL} when running locally — Railway's {@code DATABASE_URL} uses
 * {@code postgres.railway.internal}, which only resolves inside Railway.
 * When the {@code dev} profile is active, this initializer does nothing so application-dev.yml
 * (localhost Postgres) is used. Otherwise, if a database URL env var is set, it overrides application.yml defaults.
 */
public class DatabaseUrlInitializer implements ApplicationContextInitializer<org.springframework.context.ConfigurableApplicationContext> {

    private static final String DATABASE_PUBLIC_URL = "DATABASE_PUBLIC_URL";
    private static final String DATABASE_URL = "DATABASE_URL";

    @Override
    public void initialize(org.springframework.context.ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment env = applicationContext.getEnvironment();
        if (Arrays.asList(env.getActiveProfiles()).contains("dev")) {
            return;
        }
        String databaseUrl = env.getProperty(DATABASE_PUBLIC_URL);
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = env.getProperty(DATABASE_URL);
        }
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }
        try {
            ParsedDbUrl parsed = parse(databaseUrl.trim());
            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", parsed.jdbcUrl);
            props.put("spring.datasource.username", parsed.username);
            props.put("spring.datasource.password", parsed.password);
            env.getPropertySources().addFirst(new MapPropertySource("databaseUrlInitializer", props));
        } catch (Exception e) {
            throw new IllegalStateException("Invalid database URL (" + DATABASE_PUBLIC_URL + " or " + DATABASE_URL + "): " + e.getMessage(), e);
        }
    }

    static ParsedDbUrl parse(String databaseUrl) throws Exception {
        String normalized = databaseUrl.startsWith("postgres://")
                ? "postgresql://" + databaseUrl.substring("postgres://".length())
                : databaseUrl;
        URI uri = URI.create(normalized);
        String userInfo = uri.getRawUserInfo();
        if (userInfo == null || userInfo.isBlank()) {
            throw new IllegalArgumentException("Missing user:password in URL");
        }
        String[] userPass = userInfo.split(":", 2);
        String username = URLDecoder.decode(userPass[0], StandardCharsets.UTF_8);
        String password = userPass.length > 1 ? URLDecoder.decode(userPass[1], StandardCharsets.UTF_8) : "";
        String host = uri.getHost();
        if (host == null) host = "localhost";
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath();
        String database = (path != null && path.length() > 1) ? path.substring(1) : "railway";
        String query = uri.getQuery();
        String queryPart = query != null && !query.isBlank()
                ? "?" + query
                : (!"localhost".equals(host) && !"127.0.0.1".equals(host) ? "?sslmode=require" : "");
        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + queryPart;
        return new ParsedDbUrl(jdbcUrl, username, password);
    }

    record ParsedDbUrl(String jdbcUrl, String username, String password) {}
}
