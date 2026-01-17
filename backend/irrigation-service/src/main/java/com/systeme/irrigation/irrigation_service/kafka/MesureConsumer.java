package com.systeme.irrigation.irrigation_service.kafka;

import com.systeme.irrigation.irrigation_service.Entities.ActionIrrigation;
import com.systeme.irrigation.irrigation_service.Entities.MesureCourante;
import com.systeme.irrigation.irrigation_service.Entities.Parcelle;
import com.systeme.irrigation.irrigation_service.Repositories.ActionIrrigationRepository;
import com.systeme.irrigation.irrigation_service.Repositories.MesureCouranteRepository;
import com.systeme.irrigation.irrigation_service.Repositories.ParcelleRepository;
import com.systeme.irrigation.irrigation_service.dto.CapteurDTO;
import com.systeme.irrigation.irrigation_service.dto.MesureDTO;
import com.systeme.irrigation.irrigation_service.feign.CapteurClient;
import com.systeme.irrigation.irrigation_service.services.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MesureConsumer {

    private final ParcelleRepository parcelleRepo;
    private final ActionIrrigationRepository actionRepo;
    private final CapteurClient capteurClient;
    private final MesureCouranteRepository mesureRepo;
    private final AlertService alertService;

    // ==================================================
    // CONSUMER KAFKA
    // ==================================================
    @Transactional
    @KafkaListener(topics = "capteurs.mesures", groupId = "irrigation-group")
    public void consume(MesureDTO mesure) {

        //  Récupérer le capteur (synchrone REST)
        CapteurDTO capteur = capteurClient.getCapteur(mesure.getCapteurId());

        //  Règle commune : capteur actif uniquement
        if (!"ACTIF".equalsIgnoreCase(capteur.getEtat())) {
            return;
        }

        //  Trouver la parcelle via la localisation du capteur
        Parcelle parcelle = parcelleRepo
                .findByNom(capteur.getLocalisation())
                .orElseThrow(() -> new RuntimeException("Parcelle inconnue"));

        MesureCourante mc = new MesureCourante();
        mc.setParcelleId(parcelle.getId());
        mc.setTypeCapteur(capteur.getType());
        mc.setValeur(mesure.getValeur());
        mc.setUnite(mesure.getUnite());
        mc.setDateMesure(mesure.getDateMesure());

        mesureRepo.save(mc);

        double valeur = mesure.getValeur();

        //  Appliquer les règles selon le type de capteur
        if ("HUMIDITE".equalsIgnoreCase(capteur.getType())) {
            reglerParHumidite(valeur, parcelle);
        } else if ("TEMPERATURE".equalsIgnoreCase(capteur.getType())) {
            reglerParTemperature(valeur, parcelle);
        }
    }

    // ==================================================
    // RÈGLES MÉTIER : CAPTEUR HUMIDITÉ
    // ==================================================
    private void reglerParHumidite(double humidite, Parcelle parcelle) {

        //  ARRÊT irrigation si seuil max atteint
        if (humidite >= parcelle.getSeuilHumiditeMax()) {
            actionRepo.findByParcelleIdAndStatut(parcelle.getId(), "EN_COURS")
                    .ifPresent(action -> {
                        action.setStatut("TERMINEE");
                        actionRepo.save(action);
                        String msg = " Irrigation arrêtée pour " + parcelle.getNom();
                        System.out.println(msg);
                        alertService.sendAlert(msg);
                    });
            return;
        }

        //  DÉMARRAGE irrigation si seuil min dépassé
        if (humidite < parcelle.getSeuilHumiditeMin()) {

            boolean dejaEnCours =
                    actionRepo.existsByParcelleIdAndStatut(parcelle.getId(), "EN_COURS");

            if (dejaEnCours) return;

            int duree = calculerDuree(parcelle.getSeuilHumiditeMin(), humidite);
            double volume = calculerVolume(parcelle.getSuperficie());

            ActionIrrigation action = new ActionIrrigation();
            action.setParcelleId(parcelle.getId());
            action.setDateDebut(LocalDateTime.now());
            action.setDuree(duree);
            action.setVolumeEau(volume);
            action.setStatut("EN_COURS");

            actionRepo.save(action);

            String msg = " Irrigation déclenchée pour " + parcelle.getNom();
            System.out.println(msg);
            alertService.sendAlert(msg);
        }
    }

    // ==================================================
    // RÈGLES MÉTIER : CAPTEUR TEMPÉRATURE
    // ==================================================
    private void reglerParTemperature(double temperature, Parcelle parcelle) {

        //  Température basse → pas d’irrigation
        if (temperature < 10) {

            String msg = "Température basse, irrigation suspendue pour " + parcelle.getNom();
            System.out.println(msg);
            alertService.sendAlert(msg);
            return;
        }

        //  Température élevée → ajuster irrigation en cours
        if (temperature > 35) {
            actionRepo.findByParcelleIdAndStatut(parcelle.getId(), "EN_COURS")
                    .ifPresent(action -> {
                        action.setDuree(action.getDuree() + 10);
                        actionRepo.save(action);
                        String msg = "Température élevée, durée augmentée pour " + parcelle.getNom();
                        System.out.println(msg);
                        alertService.sendAlert(msg);
                    });
        }
    }

    // ==================================================
    // MÉTHODES MÉTIER COMMUNES
    // ==================================================
    private int calculerDuree(double seuilMin, double humidite) {
        double diff = seuilMin - humidite;

        if (diff > 20) return 60;
        if (diff > 10) return 30;
        return 15;
    }

    private double calculerVolume(double superficie) {
        return superficie * 10; // 10 litres / m²
    }

    @Scheduled(fixedRate = 60000) // toutes les 60 secondes
    public void verifierActionsTerminees() {
        List<ActionIrrigation> actionsEnCours = actionRepo.findByStatut("EN_COURS");
        LocalDateTime now = LocalDateTime.now();

        for (ActionIrrigation action : actionsEnCours) {
            LocalDateTime fin = action.getDateDebut().plusMinutes(action.getDuree());
            if (now.isAfter(fin)) {
                action.setStatut("TERMINEE");
                actionRepo.save(action);

                String msg = " Irrigation terminée automatiquement pour parcelle " + action.getParcelleId();
                System.out.println(msg);
                alertService.sendAlert(msg);
            }
        }
    }
}
