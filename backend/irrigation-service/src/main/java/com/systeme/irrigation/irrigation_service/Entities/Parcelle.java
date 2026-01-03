package com.systeme.irrigation.irrigation_service.Entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Parcelle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private Double superficie;

    private Double seuilHumiditeMin;
    private Double seuilHumiditeMax;
}
