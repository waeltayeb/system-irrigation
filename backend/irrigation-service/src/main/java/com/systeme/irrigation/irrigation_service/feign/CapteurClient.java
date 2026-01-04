

package com.systeme.irrigation.irrigation_service.feign;

import com.systeme.irrigation.irrigation_service.dto.CapteurDTO;
import com.systeme.irrigation.irrigation_service.dto.MesureDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "capteur-service") // NOM EUREKA
public interface CapteurClient {

    @GetMapping("/api/mesures/capteur/{capteurId}/last")
    MesureDTO getDerniereMesure(@PathVariable Long capteurId);

    @GetMapping("/api/capteurs/{id}")
    CapteurDTO getCapteur(@PathVariable Long id);
}

