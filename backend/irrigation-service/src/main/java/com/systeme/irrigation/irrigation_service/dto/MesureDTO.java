package com.systeme.irrigation.irrigation_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MesureDTO {
    private Long id;
    private Long capteurId;
    private Double valeur;
    private String unite;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateMesure;
}
