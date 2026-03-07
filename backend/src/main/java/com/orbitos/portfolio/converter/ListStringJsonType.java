package com.orbitos.portfolio.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Hibernate UserType for List&lt;String&gt; stored as JSON in a TEXT column.
 * Uses LONGVARCHAR so PostgreSQL creates TEXT (CLOB maps to oid and rejects string bind).
 */
public class ListStringJsonType implements UserType<List<String>> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<String>> LIST_TYPE = new TypeReference<>() {};

    @Override
    public int getSqlType() {
        return Types.LONGVARCHAR;
    }

    @Override
    public Class<List<String>> returnedClass() {
        return (Class<List<String>>) (Class<?>) List.class;
    }

    @Override
    public boolean equals(List<String> x, List<String> y) {
        return Objects.equals(x, y);
    }

    @Override
    public int hashCode(List<String> x) {
        return Objects.hashCode(x);
    }

    @Override
    public List<String> nullSafeGet(ResultSet rs, int position, SharedSessionContractImplementor session, Object owner)
            throws SQLException {
        String value = rs.getString(position);
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(value, LIST_TYPE);
        } catch (JsonProcessingException e) {
            throw new SQLException("Cannot deserialize JSON to list", e);
        }
    }

    @Override
    public void nullSafeSet(PreparedStatement st, List<String> value, int index, SharedSessionContractImplementor session)
            throws SQLException {
        if (value == null || value.isEmpty()) {
            st.setString(index, "[]");
            return;
        }
        try {
            st.setString(index, MAPPER.writeValueAsString(value));
        } catch (JsonProcessingException e) {
            throw new SQLException("Cannot serialize list to JSON", e);
        }
    }

    @Override
    public boolean isMutable() {
        return true;
    }

    @Override
    public List<String> deepCopy(List<String> value) {
        return value == null ? null : List.copyOf(value);
    }

    @Override
    public Serializable disassemble(List<String> value) {
        return (Serializable) deepCopy(value);
    }

    @Override
    public List<String> assemble(Serializable cached, Object owner) {
        return deepCopy((List<String>) cached);
    }
}
