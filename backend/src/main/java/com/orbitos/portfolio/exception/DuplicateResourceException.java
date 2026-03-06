package com.orbitos.portfolio.exception;

/**
 * Thrown when a resource would violate a uniqueness constraint (e.g. duplicate slug).
 * Mapped to HTTP 409 CONFLICT.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
