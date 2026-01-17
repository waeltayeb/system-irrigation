package com.systeme.irrigation.capteur_service.Services;

import com.systeme.irrigation.capteur_service.Entities.Capteur;
import com.systeme.irrigation.capteur_service.Repositories.CapteurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CapteurService {
    private final CapteurRepository repository;

    public Capteur save(Capteur c) {
        return repository.save(c);
    }

    public List<Capteur> findAll() {
        return repository.findAll();
    }

    public Capteur findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capteur introuvable"));
    }

    public Capteur update(Long id, Capteur newCapteur) {
        Capteur existing = findById(id);

        existing.setType(newCapteur.getType());
        existing.setLocalisation(newCapteur.getLocalisation());
        existing.setEtat(newCapteur.getEtat());
        existing.setDateInstallation(newCapteur.getDateInstallation());

        return repository.save(existing);
    }


    public void delete(Long id) {
        Capteur capteur = findById(id);
        repository.delete(capteur);
    }

}
