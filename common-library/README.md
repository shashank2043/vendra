# Common Library Module

Shared library dependency packaged as a standard JAR file. It is imported by other backend microservice modules to share boilerplate utilities.

## Shared Packages
* `com.pinnacle.vendra.common.dto`: Shared response models (`ApiResponse`, `ErrorResponse`).
* `com.pinnacle.vendra.common.exception`: Base exception handlers and Rest Advice classes mapping validations and Denials to JSON payloads.
* `com.pinnacle.vendra.common.filter`: OncePerRequest filter logging request latency.
* `com.pinnacle.vendra.common.util`: Cryptographic JWT signing, validation, and claim parsing utilities.
