package com.systeme.irrigation.irrigation_service.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class MesureCourante {
    @Id
    private Long parcelleId;

    private String typeCapteur;
    private double valeur;
    private String unite;
    private LocalDateTime dateMesure;
}
