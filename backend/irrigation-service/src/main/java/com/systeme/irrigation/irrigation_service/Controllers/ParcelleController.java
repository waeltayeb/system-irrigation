package com.systeme.irrigation.irrigation_service.Controllers;


import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import com.systeme.irrigation.irrigation_service.Entities.MesureCourante;
import com.systeme.irrigation.irrigation_service.Entities.Parcelle;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.systeme.irrigation.irrigation_service.services.ParcelleService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parcelles")
@RequiredArgsConstructor
public class ParcelleController {
    private final ParcelleService parcelleService;

    @PostMapping
    public ResponseEntity<Parcelle> create(@RequestBody Parcelle parcelle) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(parcelleService.create(parcelle));
    }

    @GetMapping
    public List<Parcelle> findAll() {
        return parcelleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parcelle> findById(@PathVariable Long id) {
        return parcelleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/mesure")
    public ResponseEntity<MesureCourante> getMesureCourante(@PathVariable Long id) {
        return parcelleService.getMesureCourante(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/irrigations")
    public List<ActionIrrigation> getHistorique(@PathVariable Long id) {
        return parcelleService.getHistorique(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parcelle> update(@PathVariable Long id,
                                           @RequestBody Parcelle parcelle) {
        return parcelleService.update(id, parcelle)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            parcelleService.delete(id);
            return ResponseEntity.ok("Parcelle supprimée avec succès");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
