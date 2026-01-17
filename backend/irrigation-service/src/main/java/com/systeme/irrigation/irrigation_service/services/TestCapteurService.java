package com.systeme.irrigation.irrigation_service.services;

import com.systeme.irrigation.irrigation_service.dto.CapteurDTO;
import com.systeme.irrigation.irrigation_service.dto.MesureDTO;
import com.systeme.irrigation.irrigation_service.feign.CapteurClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class TestCapteurService {
    private final CapteurClient capteurClient;
    private final  AlertService alertService;

    public MesureDTO test(Long capteurId) {
        return capteurClient.getDerniereMesure(capteurId);
    }

    public CapteurDTO testCapteur(Long capteurId) {
        return  capteurClient.getCapteur(capteurId);
    }
    @PostConstruct
    public void testAlert() {
        alertService.sendAlert("🚨 Test alert WebSocket OK");
    }

}
