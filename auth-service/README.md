# Authentication Service

Identity and session microservice running on port `8081`. 

## REST Endpoints
* `POST /auth/register`: Create a new user account.
* `POST /auth/login`: Authenticate username/password, generate tokens, and set HttpOnly refresh cookie.
* `POST /auth/refresh`: Re-issue access and refresh tokens.
* `POST /auth/logout`: Invalidate refresh token session and clear browser cookies.
* `GET /auth/profile`: Look up user details based on gateway routing headers.

## DB Schema
Uses JPA/Hibernate schema auto-generation to generate `users`, `roles`, `user_roles`, and `refresh_tokens` tables in MySQL, with a `DatabaseInitializer` to pre-populate standard admin and user profiles.
