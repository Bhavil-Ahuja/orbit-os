package com.orbitos.portfolio.security;

import com.orbitos.portfolio.config.AdminAuthProperties;
import com.orbitos.portfolio.exception.InvalidCredentialsException;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AdminAuthServiceTest {

    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder(10);

    @Test
    void loginSucceedsWithCorrectCredentials() {
        String hash = ENCODER.encode("password");
        AdminAuthProperties props = new AdminAuthProperties();
        props.setUsername("admin");
        props.setPasswordHash(hash);
        props.setJwtSecret("test-secret-min-32-bytes-for-hs256-ok");
        props.setJwtExpirationSeconds(3600);

        AdminAuthService service = new AdminAuthService(props, ENCODER, new JwtService(props));
        String token = service.login("admin", "password");
        assertThat(token).isNotBlank();
    }

    @Test
    void loginFailsWithWrongPassword() {
        String hash = ENCODER.encode("password");
        AdminAuthProperties props = new AdminAuthProperties();
        props.setUsername("admin");
        props.setPasswordHash(hash);
        props.setJwtSecret("test-secret-min-32-bytes-for-hs256-ok");

        AdminAuthService service = new AdminAuthService(props, ENCODER, new JwtService(props));
        assertThatThrownBy(() -> service.login("admin", "wrong"))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
