package com.systeme.irrigation.capteur_service.Repositories;

import com.systeme.irrigation.capteur_service.Entities.Capteur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CapteurRepository extends JpaRepository<Capteur, Long> {
}
