package com.systeme.irrigation.capteur_service.Controllers;

import com.systeme.irrigation.capteur_service.Entities.Mesure;
import com.systeme.irrigation.capteur_service.Services.MesureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesures")
@RequiredArgsConstructor
public class MesureController {

    private final MesureService mesureService;

    @PostMapping
    public Mesure create(@RequestBody Mesure mesure) {
        return mesureService.save(mesure);
    }

    @GetMapping("/capteur/{capteurId}")
    public List<Mesure> getByCapteur(@PathVariable Long capteurId) {
        return mesureService.getMesuresByCapteur(capteurId);
    }

    @GetMapping("/capteur/{capteurId}/last")
    public Mesure getLast(@PathVariable Long capteurId) {
        return mesureService.getDerniereMesure(capteurId);
    }
}
