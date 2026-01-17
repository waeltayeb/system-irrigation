package com.systeme.irrigation.capteur_service.kafka;

import com.systeme.irrigation.capteur_service.Entities.Mesure;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MesureProducer {
    private  final KafkaTemplate<String,Mesure> kafkaTemplate;

    private static final String TOPIC = "capteurs.mesures";

    public void send(Mesure mesure) {
        kafkaTemplate.send(TOPIC, mesure);
        System.out.println("Sent mesure to kafka : " + mesure);
    }
}
