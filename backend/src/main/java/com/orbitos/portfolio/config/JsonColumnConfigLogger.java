package com.orbitos.portfolio.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.sql.Types;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Logs JSON column configuration once at application startup.
 */
@Component
public class JsonColumnConfigLogger implements ApplicationRunner, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JsonColumnConfigLogger.class);
    private static final String PREFIX = "[OrbitOS]";

    private final Environment env;

    public JsonColumnConfigLogger(Environment env) {
        this.env = env;
    }

    @Override
    public void run(ApplicationArguments args) {
        String profile = Arrays.stream(env.getActiveProfiles())
                .filter(p -> !p.isEmpty())
                .collect(Collectors.joining(", "));
        if (profile.isEmpty()) {
            profile = "(none)";
        }

        String url = env.getProperty("spring.datasource.url", "");
        String urlDisplay = maskPassword(url);

        String columnDef = JsonColumnDefinitionHolder.getColumnDefinition();
        boolean isJsonb = "jsonb".equalsIgnoreCase(columnDef);
        int sqlType = isJsonb ? Types.OTHER : Types.CLOB;
        String sqlTypeName = isJsonb ? "OTHER (jsonb)" : "CLOB (text)";
        String mode = isJsonb ? "POSTGRESQL (jsonb)" : "H2 (text)";

        log.info("{} JSON storage mode: {}", PREFIX, mode);
        log.info("{} Active profile(s): {}", PREFIX, profile);
        log.info("{} Datasource URL: {}", PREFIX, urlDisplay.isEmpty() ? "(not set)" : urlDisplay);
        log.info("{} JSON column type: {} | Hibernate SQL type: {} ({})",
                PREFIX, columnDef, sqlType, sqlTypeName);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private static String maskPassword(String url) {
        if (url == null || url.isEmpty()) return url;
        int at = url.indexOf('@');
        if (at <= 0) return url;
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) return url;
        schemeEnd += 3;
        String before = url.substring(0, schemeEnd);
        String after = url.substring(at);
        return before + "****:****" + after;
    }
}
