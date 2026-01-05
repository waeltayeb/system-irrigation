package com.systeme.irrigation.irrigation_service.Controllers;


import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import com.systeme.irrigation.irrigation_service.Entities.MesureCourante;
import com.systeme.irrigation.irrigation_service.Entities.Parcelle;
import com.systeme.irrigation.irrigation_service.Repositories.ActionIrrigationRepository;
import com.systeme.irrigation.irrigation_service.Repositories.MesureCouranteRepository;
import com.systeme.irrigation.irrigation_service.Repositories.ParcelleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcelles")
@RequiredArgsConstructor
public class ParcelleController {
    private final ParcelleRepository parcelleRepo;
    private final MesureCouranteRepository mesureRepo;
    private final ActionIrrigationRepository actionRepo;

    @PostMapping
    public Parcelle create(@RequestBody Parcelle parcelle){
        return parcelleRepo.save(parcelle);
    }

    @GetMapping
    public List<Parcelle> findAll(){
        return parcelleRepo.findAll();
    }

    // mesure en temps reel
    @GetMapping("/{id}/mesure")
    public MesureCourante getMesureCourante(@PathVariable Long id){
        return mesureRepo.findById(id).orElse(null);
    }

    // historique par parcelle
    @GetMapping("/{id}/irrigations")
    public List<ActionIrrigation> getHistorique(@PathVariable Long id){
        return actionRepo.findByParcelleId(id);
    }

}
