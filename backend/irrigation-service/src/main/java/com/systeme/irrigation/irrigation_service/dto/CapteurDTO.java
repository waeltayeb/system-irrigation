package com.systeme.irrigation.irrigation_service.dto;

import lombok.Data;

@Data
public class CapteurDTO {
    private Long id;
    private String type;
    private String etat;
    private String localisation;
}
