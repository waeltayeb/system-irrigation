package com.systeme.irrigation.irrigation_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendAlert(String message) {
        messagingTemplate.convertAndSend("/topic/alerts", message);
        System.out.println("Alert sent: " + message);
    }


}
