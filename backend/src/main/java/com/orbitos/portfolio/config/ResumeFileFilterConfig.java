package com.orbitos.portfolio.config;

import com.orbitos.portfolio.security.ResumeFileServletFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Registers ResumeFileServletFilter to run before Spring Security so GET /resume-file
 * is served without any auth check (no 401).
 */
@Configuration
public class ResumeFileFilterConfig {

    @Bean
    public FilterRegistrationBean<ResumeFileServletFilter> resumeFileFilter() {
        FilterRegistrationBean<ResumeFileServletFilter> bean = new FilterRegistrationBean<>(new ResumeFileServletFilter());
        bean.addUrlPatterns("/resume-file");
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
