package com.systeme.irrigation.capteur_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class CapteurServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CapteurServiceApplication.class, args);
	}

}
