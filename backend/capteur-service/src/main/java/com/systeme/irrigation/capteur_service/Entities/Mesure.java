package com.systeme.irrigation.capteur_service.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Mesure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long capteurId;

    @Column(nullable = false)
    private Double valeur;

    @Column(nullable = false)
    private String unite;

    @Column(nullable = false)
    private LocalDateTime dateMesure;
}
