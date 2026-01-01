package com.systeme.irrigation.capteur_service.Controllers;

import com.systeme.irrigation.capteur_service.Entities.Capteur;
import com.systeme.irrigation.capteur_service.Services.CapteurService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/capteurs")
@RequiredArgsConstructor
public class CapteurController {
    private final CapteurService service;

    @PostMapping
    public Capteur create(@RequestBody Capteur c) {
        return service.save(c);
    }

    @GetMapping
    public List<Capteur> getAll() {
        return service.findAll();
    }
}
