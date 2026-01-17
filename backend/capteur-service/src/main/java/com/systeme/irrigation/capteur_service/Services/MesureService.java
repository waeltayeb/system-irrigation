package com.systeme.irrigation.capteur_service.Services;


import com.systeme.irrigation.capteur_service.Entities.Mesure;
import com.systeme.irrigation.capteur_service.Repositories.MesureRepository;
import com.systeme.irrigation.capteur_service.kafka.MesureProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MesureService {
    private final MesureRepository mesureRepository;
    private final MesureProducer producer;
    public Mesure save(Mesure m) {

        m.setDateMesure(LocalDateTime.now());
        Mesure saved = mesureRepository.save(m);

        // each insert in db send to kafka
        producer.send(saved);
        return saved;

    }

    public List<Mesure> getMesuresByCapteur(Long capteurId) {
        return mesureRepository.findByCapteurId(capteurId);
    }

    public Mesure getDerniereMesure(Long capteurId) {
        return mesureRepository.findTopByCapteurIdOrderByDateMesureDesc(capteurId);
    }
    public List<Mesure> findAll() {
        return mesureRepository.findAll();
    }
}
