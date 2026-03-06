package com.orbitos.portfolio.config;

import org.hibernate.dialect.H2Dialect;
import org.hibernate.engine.jdbc.dialect.spi.DialectResolutionInfo;
import org.hibernate.type.SqlTypes;

/**
 * H2 dialect that maps CLOB to TEXT so JSON list columns are created as TEXT in H2.
 */
public class H2TextDialect extends H2Dialect {

    public H2TextDialect() {
        super();
    }

    public H2TextDialect(DialectResolutionInfo info) {
        super(info);
    }

    @Override
    protected String columnType(int sqlTypeCode) {
        if (sqlTypeCode == SqlTypes.CLOB) {
            return "text";
        }
        return super.columnType(sqlTypeCode);
    }

    @Override
    protected String castType(int sqlTypeCode) {
        if (sqlTypeCode == SqlTypes.CLOB) {
            return "text";
        }
        return super.castType(sqlTypeCode);
    }
}
