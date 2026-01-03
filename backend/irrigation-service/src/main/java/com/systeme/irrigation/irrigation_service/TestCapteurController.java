package com.systeme.irrigation.irrigation_service;

import com.systeme.irrigation.irrigation_service.dto.MesureDTO;
import com.systeme.irrigation.irrigation_service.services.TestCapteurService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-capteur")
@RequiredArgsConstructor
public class TestCapteurController {
    private final TestCapteurService testCapteurService;

    @GetMapping("/{capteurId}")
    public MesureDTO test(@PathVariable Long capteurId) {
        return testCapteurService.test(capteurId);
    }
}
