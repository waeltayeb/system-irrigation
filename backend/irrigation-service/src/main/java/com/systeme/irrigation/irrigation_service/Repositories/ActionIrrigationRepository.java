package com.systeme.irrigation.irrigation_service.Repositories;

import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActionIrrigationRepository extends JpaRepository<ActionIrrigation,Long> {

    Optional<ActionIrrigation> findByParcelleIdAndStatut(Long parcelleId, String statut);
    boolean existsByParcelleIdAndStatut(Long parcelleId, String statut);


    List<ActionIrrigation> findByStatut(String statut);

}
