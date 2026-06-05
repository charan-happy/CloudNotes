package com.cloudnotes.userservice.security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers JwtAuthFilter only on the user data endpoints.
 * Health, info, metrics, and prometheus stay open for probes and scraping.
 */
@Configuration
public class JwtFilterConfig {

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilter(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> reg = new FilterRegistrationBean<>(filter);
        reg.addUrlPatterns("/v1/users", "/v1/users/*");
        reg.setOrder(1);
        return reg;
    }
}
