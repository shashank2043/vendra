package com.pinnacle.vendra.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.pinnacle.vendra.auth", "com.pinnacle.vendra.common"})
@EnableDiscoveryClient
@EnableJpaRepositories(basePackages = "com.pinnacle.vendra.auth.repository")
@EntityScan(basePackages = "com.pinnacle.vendra.auth.entity")
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
