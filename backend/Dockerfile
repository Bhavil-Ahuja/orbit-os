# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper, pom, and source
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src ./src

# Build (dependencies cached in layer when pom unchanged)
RUN ./mvnw -DskipTests package -B

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Render injects PORT at runtime; application.yml uses ${PORT:8080}
EXPOSE 8080

COPY --from=build /app/target/portfolio-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
