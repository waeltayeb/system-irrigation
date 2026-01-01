package com.systeme.irrigation.capteur_service.Entities;

import jakarta.persistence.*;

import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Capteur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TypeCapteur type;

    private String localisation;
    private String etat;
    private LocalDate dateInstallation;
}
