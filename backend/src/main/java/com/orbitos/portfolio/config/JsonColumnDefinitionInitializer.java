package com.orbitos.portfolio.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.core.env.Environment;

/**
 * Sets {@link JsonColumnDefinitionHolder} from datasource URL or property before
 * Hibernate starts, so JSON columns use JSONB in PostgreSQL and TEXT in H2.
 */
public class JsonColumnDefinitionInitializer
        implements ApplicationContextInitializer<org.springframework.context.ConfigurableApplicationContext> {

    @Override
    public void initialize(org.springframework.context.ConfigurableApplicationContext applicationContext) {
        Environment env = applicationContext.getEnvironment();
        String explicit = env.getProperty("app.json.column-definition");
        if (explicit != null && !explicit.isBlank()) {
            JsonColumnDefinitionHolder.setColumnDefinition(explicit.strip());
            return;
        }
        String url = env.getProperty("spring.datasource.url", "");
        boolean postgres = url.contains("postgresql");
        JsonColumnDefinitionHolder.setColumnDefinition(postgres ? "jsonb" : "text");
    }
}
