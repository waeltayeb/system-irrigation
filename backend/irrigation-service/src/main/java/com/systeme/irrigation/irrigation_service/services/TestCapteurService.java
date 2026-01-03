package com.systeme.irrigation.irrigation_service.services;

import com.systeme.irrigation.irrigation_service.dto.MesureDTO;
import com.systeme.irrigation.irrigation_service.feign.CapteurClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestCapteurService {
    private final CapteurClient capteurClient;

    public MesureDTO test(Long capteurId) {
        return capteurClient.getDerniereMesure(capteurId);
    }
}
