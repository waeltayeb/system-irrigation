package com.systeme.irrigation.capteur_service.Services;


import com.systeme.irrigation.capteur_service.Entities.Mesure;
import com.systeme.irrigation.capteur_service.Repositories.MesureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MesureService {
    private final MesureRepository mesureRepository;
    public Mesure save(Mesure mesure) {
        return mesureRepository.save(mesure);
    }

    public List<Mesure> getMesuresByCapteur(Long capteurId) {
        return mesureRepository.findByCapteurId(capteurId);
    }

    public Mesure getDerniereMesure(Long capteurId) {
        return mesureRepository.findTopByCapteurIdOrderByDateMesureDesc(capteurId);
    }
}
