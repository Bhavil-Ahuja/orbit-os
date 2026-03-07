package com.orbitos.portfolio.security;

import com.orbitos.portfolio.config.AdminAuthProperties;
import com.orbitos.portfolio.exception.InvalidCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Single-user admin login. Credentials from AdminAuthProperties (env).
 * Password must be stored as BCrypt hash.
 */
@Service
public class AdminAuthService {

    private final AdminAuthProperties adminAuthProperties;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminAuthService(AdminAuthProperties adminAuthProperties,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService) {
        this.adminAuthProperties = adminAuthProperties;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(String username, String password) {
        if (username == null) username = "";
        if (password == null) password = "";
        username = username.trim();
        password = password.trim();

        if (!adminAuthProperties.getUsername().equals(username)) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        String plain = adminAuthProperties.getPlainPassword();
        if (plain != null && !plain.isBlank()) {
            if (plain.trim().equals(password)) {
                return jwtService.generateToken(username);
            }
            throw new InvalidCredentialsException("Invalid username or password");
        }
        String hash = adminAuthProperties.getPasswordHash();
        if (hash == null || hash.isBlank()) {
            throw new IllegalStateException("admin.auth.passwordHash must be set (BCrypt hash via ADMIN_PASSWORD_HASH)");
        }
        if (!passwordEncoder.matches(password, hash)) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        return jwtService.generateToken(username);
    }
}
