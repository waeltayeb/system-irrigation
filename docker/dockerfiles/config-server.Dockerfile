# ====== STAGE 1 : BUILD ======
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# ====== STAGE 2 : RUN ======
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java","-jar","app.jar"]
