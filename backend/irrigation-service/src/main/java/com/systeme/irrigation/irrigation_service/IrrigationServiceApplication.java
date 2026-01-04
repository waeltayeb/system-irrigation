package com.systeme.irrigation.irrigation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
@EnableKafka
@EnableScheduling
public class IrrigationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(IrrigationServiceApplication.class, args);
	}

}
