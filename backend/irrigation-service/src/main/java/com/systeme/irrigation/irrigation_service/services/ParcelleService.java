package com.systeme.irrigation.irrigation_service.services;



import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import com.systeme.irrigation.irrigation_service.Entities.MesureCourante;
import com.systeme.irrigation.irrigation_service.Entities.Parcelle;
import com.systeme.irrigation.irrigation_service.Repositories.ActionIrrigationRepository;
import com.systeme.irrigation.irrigation_service.Repositories.MesureCouranteRepository;
import com.systeme.irrigation.irrigation_service.Repositories.ParcelleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ParcelleService {

    private final ParcelleRepository parcelleRepo;
    private final MesureCouranteRepository mesureRepo;
    private final ActionIrrigationRepository actionRepo;

    // Créer une parcelle
    public Parcelle create(Parcelle parcelle) {
        return parcelleRepo.save(parcelle);
    }

    // Toutes les parcelles
    public List<Parcelle> findAll() {
        return parcelleRepo.findAll();
    }

    // Parcelle par ID
    public Optional<Parcelle> findById(Long id) {
        return parcelleRepo.findById(id);
    }

    // Mesure en temps réel
    public Optional<MesureCourante> getMesureCourante(Long parcelleId) {
        return mesureRepo.findById(parcelleId);
    }

    // Historique des irrigations
    public List<ActionIrrigation> getHistorique(Long parcelleId) {
        return actionRepo.findByParcelleId(parcelleId);
    }

    // Mise à jour
    public Optional<Parcelle> update(Long id, Parcelle details) {
        return parcelleRepo.findById(id)
                .map(parcelle -> {
                    parcelle.setNom(details.getNom());
                    parcelle.setSuperficie(details.getSuperficie());
                    parcelle.setSeuilHumiditeMin(details.getSeuilHumiditeMin());
                    parcelle.setSeuilHumiditeMax(details.getSeuilHumiditeMax());
                    return parcelleRepo.save(parcelle);
                });
    }

    // Suppression avec règle métier
    public void delete(Long id) {

        if (!parcelleRepo.existsById(id)) {
            throw new IllegalArgumentException("Parcelle non trouvée");
        }

        if (!actionRepo.findByParcelleId(id).isEmpty()) {
            throw new IllegalStateException(
                    "Impossible de supprimer la parcelle : irrigations existantes");
        }

        parcelleRepo.deleteById(id);
    }
}

