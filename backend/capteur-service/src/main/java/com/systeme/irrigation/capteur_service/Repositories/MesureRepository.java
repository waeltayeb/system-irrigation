package com.systeme.irrigation.capteur_service.Repositories;

import com.systeme.irrigation.capteur_service.Entities.Mesure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface MesureRepository extends JpaRepository<Mesure, Long> {
    List<Mesure> findByCapteurId(Long capteurId);

    Mesure findTopByCapteurIdOrderByDateMesureDesc(Long capteurId);
}
