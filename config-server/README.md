# Centralized Config Server

Spring Cloud Config Server running on port `8888`. It distributes configuration profiles to downstream client services.

## Configuration Repository
Configurations are read from the local classpath repository at `src/main/resources/shared`. 

### Shared Profiles:
* `application.yml`: Common database configurations, Eureka service URLs, JWT configuration keys, and default Actuator exposure.
* `api-gateway.yml`: Gateway routing configurations and CORS.
* `auth-service.yml`: Port and OpenAPI config.
* `notification-service.yml`: Port mappings and Kafka bootstrap endpoints.

## Extension
To modify credentials or update ports, edit the YAML files in the `shared` directory and restart the client services. To switch to a remote Git repository, uncomment the Git block in `config-server/src/main/resources/application.yml`.
