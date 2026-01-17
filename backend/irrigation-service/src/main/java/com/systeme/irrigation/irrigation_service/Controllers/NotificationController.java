package com.systeme.irrigation.irrigation_service.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/test-alert")
    public void sendTest() {
        messagingTemplate.convertAndSend(
                "/topic/alerts",
                "🚨 Alert envoyée après connexion"
        );
    }
}

