package com.systeme.irrigation.irrigation_service.Repositories;

import com.systeme.irrigation.irrigation_service.Entities.Parcelle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParcelleRepository extends JpaRepository<Parcelle, Long> {
}
