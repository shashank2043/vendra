# ---------- BUILD STAGE ----------
FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /build

# copy entire project
COPY . .

# choose service to build
ARG SERVICE_NAME

# build only required module + dependencies
RUN --mount=type=cache,target=/root/.m2 \
    mvn -pl ${SERVICE_NAME} -am clean package -DskipTests


# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:25-jdk-alpine

RUN apk add --no-cache curl

WORKDIR /app

ARG SERVICE_NAME

COPY --from=builder /build/${SERVICE_NAME}/target/*.jar app.jar

ENTRYPOINT ["java","-jar","app.jar"]