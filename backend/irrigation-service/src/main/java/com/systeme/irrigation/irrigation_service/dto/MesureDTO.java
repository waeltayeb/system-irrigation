package com.systeme.irrigation.irrigation_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MesureDTO {
    private Long id;
    private Long capteurId;
    private Double valeur;
    private String unite;
    private LocalDateTime dateMesure;
}
