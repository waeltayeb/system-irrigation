package com.systeme.irrigation.irrigation_service.Controllers;

import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import com.systeme.irrigation.irrigation_service.Repositories.ActionIrrigationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/irrigations")
@RequiredArgsConstructor
public class IrrigationController {
    private final ActionIrrigationRepository actionRepo;

    // historique global
    @GetMapping("/history")
    public List<ActionIrrigation> history(){
        return actionRepo.findAll();
    }
    // filtrage par statut
    @GetMapping
    public List<ActionIrrigation> byStatut(@RequestParam String statut){
        return actionRepo.findByStatut(statut);
    }
}
