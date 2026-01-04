package com.systeme.irrigation.irrigation_service.Repositories;

import com.systeme.irrigation.irrigation_service.Entities.Parcelle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParcelleRepository extends JpaRepository<Parcelle, Long> {
    Optional<Parcelle> findByNom(String nom);
}
