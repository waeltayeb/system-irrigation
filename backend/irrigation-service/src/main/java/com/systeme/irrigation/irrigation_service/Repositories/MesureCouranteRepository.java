package com.systeme.irrigation.irrigation_service.Repositories;

import com.systeme.irrigation.irrigation_service.Entities.MesureCourante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesureCouranteRepository extends JpaRepository<MesureCourante,Long> {
}
