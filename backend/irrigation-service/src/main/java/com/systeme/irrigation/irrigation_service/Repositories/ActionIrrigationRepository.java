package com.systeme.irrigation.irrigation_service.Repositories;

import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionIrrigationRepository extends JpaRepository<ActionIrrigation,Long> {
}
