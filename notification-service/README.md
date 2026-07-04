# Notification Service

Notification hub skeleton running on port `8082`. 

## Components
* **Interfaces**: Templates for `EmailService`, `SmsService`, and `PushNotificationService` with logger implementations.
* **REST Endpoints**: `POST /notifications` to trigger dispatching messages, and `GET /notifications/history/{recipient}` to query log histories.
* **Kafka Integration**: Concrete templates for `@KafkaListener` consumer and `KafkaTemplate` producer. Enable Kafka inside configuration profiles during Vendras.
