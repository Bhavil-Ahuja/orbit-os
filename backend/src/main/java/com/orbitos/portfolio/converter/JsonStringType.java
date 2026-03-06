package com.orbitos.portfolio.converter;

import com.orbitos.portfolio.config.JsonColumnDefinitionHolder;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Objects;

/**
 * Hibernate UserType for a String stored as JSON column (e.g. free-form JSON object).
 * Uses TEXT in H2 and JSONB in PostgreSQL.
 */
public class JsonStringType implements UserType<String> {

    @Override
    public int getSqlType() {
        return "jsonb".equalsIgnoreCase(JsonColumnDefinitionHolder.getColumnDefinition())
                ? Types.OTHER
                : Types.CLOB;
    }

    @Override
    public Class<String> returnedClass() {
        return String.class;
    }

    @Override
    public boolean equals(String x, String y) {
        return Objects.equals(x, y);
    }

    @Override
    public int hashCode(String x) {
        return Objects.hashCode(x);
    }

    @Override
    public String nullSafeGet(ResultSet rs, int position, SharedSessionContractImplementor session, Object owner)
            throws SQLException {
        return rs.getString(position);
    }

    @Override
    public void nullSafeSet(PreparedStatement st, String value, int index, SharedSessionContractImplementor session)
            throws SQLException {
        if (value == null) {
            st.setString(index, "{}");
        } else {
            st.setString(index, value);
        }
    }

    @Override
    public boolean isMutable() {
        return true;
    }

    @Override
    public String deepCopy(String value) {
        return value;
    }

    @Override
    public Serializable disassemble(String value) {
        return value;
    }

    @Override
    public String assemble(Serializable cached, Object owner) {
        return (String) cached;
    }
}
