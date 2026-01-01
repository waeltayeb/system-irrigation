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
}
