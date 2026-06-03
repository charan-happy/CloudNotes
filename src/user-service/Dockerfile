# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache Maven deps before copying source (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Use JRE-only image — ~200MB vs ~400MB for full JDK
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/user-service-*.jar app.jar

EXPOSE 8002

# Tune JVM for containers: respect cgroup memory limits, reduce startup time
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
