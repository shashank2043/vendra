# API Gateway Service

Spring Cloud Gateway running on port `8080`. It intercepts incoming client traffic, verifies security credentials, and handles load balancing.

## Key Features
1. **JWT Verification**: A Global Filter (`JwtAuthenticationFilter`) intercepting non-public paths, verifying JWT signatures, and injecting identity claims (`X-User-Name`, `X-User-Roles`) into downstream headers.
2. **CORS Config**: Exposes pre-flight mappings.
3. **Structured Logs**: Traces request durations, paths, and status outputs reactively.
