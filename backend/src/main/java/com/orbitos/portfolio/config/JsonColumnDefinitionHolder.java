package com.orbitos.portfolio.config;

/**
 * Holder for JSON column definition: "jsonb" (PostgreSQL) or "text" (H2).
 * Set before Hibernate initializes so custom types can choose the correct SQL type.
 */
public final class JsonColumnDefinitionHolder {

    private static volatile String columnDefinition = "text";

    private JsonColumnDefinitionHolder() {}

    public static String getColumnDefinition() {
        return columnDefinition;
    }

    public static void setColumnDefinition(String value) {
        columnDefinition = value != null ? value : "text";
    }
}
