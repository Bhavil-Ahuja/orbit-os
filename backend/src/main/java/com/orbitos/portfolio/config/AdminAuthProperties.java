package com.orbitos.portfolio.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Single-user admin auth. Credentials from environment variables.
 * Password: BCrypt hash (ADMIN_PASSWORD_HASH), or for dev only set ADMIN_PASSWORD=password for plain-text.
 */
@Component
@ConfigurationProperties(prefix = "admin.auth")
public class AdminAuthProperties {

    private String username;
    private String passwordHash;
    /** Optional: plain-text password for dev. If set, login accepts this instead of BCrypt (dev only). */
    private String plainPassword;
    private String jwtSecret;
    private long jwtExpirationSeconds = 86400;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPlainPassword() {
        return plainPassword;
    }

    public void setPlainPassword(String plainPassword) {
        this.plainPassword = plainPassword;
    }

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public long getJwtExpirationSeconds() {
        return jwtExpirationSeconds;
    }

    public void setJwtExpirationSeconds(long jwtExpirationSeconds) {
        this.jwtExpirationSeconds = jwtExpirationSeconds;
    }

    @PostConstruct
    public void validate() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("ADMIN_JWT_SECRET must be at least 32 characters");
        }
    }
}
