package com.orbitos.portfolio.exception;

/**
 * Thrown when admin login fails (wrong username or password).
 * Used so GlobalExceptionHandler does not depend on Spring Security's BadCredentialsException at runtime.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid username or password");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
