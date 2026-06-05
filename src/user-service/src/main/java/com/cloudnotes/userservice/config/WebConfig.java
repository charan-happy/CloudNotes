package com.cloudnotes.userservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Global CORS so the browser frontend can reach every endpoint (health, users, actuator). */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String origins;

    public WebConfig(@Value("${CORS_ORIGINS:http://localhost:3000}") String origins) {
        this.origins = origins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(origins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
