package com.systeme.irrigation.irrigation_service.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class ActionIrrigation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long parcelleId;
    private LocalDateTime dateDebut;
    private Integer duree; // minutes
    private Double volumeEau;
    private String statut; // PLANIFIEE, EN_COURS, TERMINEE
}
