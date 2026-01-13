import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Capteur, TypeCapteur } from '../../../shared/models/capteur.model';

@Component({
  selector: 'app-create-mesure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mesures-create.component.html',
  styleUrls: ['./mesures-create.component.css']
})
export class CreateMesureComponent implements OnInit {
  mesureForm: FormGroup;
  capteurs: Capteur[] = [];
  
  isLoading = false;
  isLoadingCapteurs = false;
  successMessage = '';
  errorMessage = '';
  noCapteursMessage = '';

  // Options d'unités
  uniteOptions = [
    { value: '%', label: 'Pourcentage (%)' },
    { value: '°C', label: 'Degrés Celsius (°C)' },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.mesureForm = this.fb.group({
  capteurId: ['', Validators.required],
  valeur: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
  unite: ['', Validators.required]
});

  }

  ngOnInit(): void {
    this.loadCapteurs();
  }

  loadCapteurs(): void {
    this.isLoadingCapteurs = true;
    this.noCapteursMessage = '';
    
    this.apiService.getAllCapteurs().subscribe({
      next: (capteurs) => {
        if (capteurs.length === 0) {
          this.noCapteursMessage = 'Aucun capteur trouvé. Créez d\'abord un capteur.';
        }
        
        this.capteurs = capteurs;
        this.cd.detectChanges();
        
        // Si ID de capteur dans l'URL
        this.route.params.subscribe(params => {
          if (params['capteurId']) {
            const capteurId = +params['capteurId'];
            const capteur = this.capteurs.find(c => c.id === capteurId);
            if (capteur) {
              const defaultUnit = capteur.type === TypeCapteur.HUMIDITE ? '%' : '°C';
              this.mesureForm.patchValue({ 
                capteurId: capteurId,
                unite: defaultUnit
              });
            }
          }
        });
        
        this.isLoadingCapteurs = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur lors du chargement des capteurs';
        this.isLoadingCapteurs = false;
        this.cd.detectChanges();
      }
    });
  }

  // Format: 2026-01-04 16:23:27.000000
getFormattedDateTime(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}





  get f() {
    return this.mesureForm.controls;
  }

  onSubmit(): void {
    if (this.mesureForm.invalid) {
      Object.keys(this.mesureForm.controls).forEach(key => {
        this.mesureForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Créer l'objet mesure avec le bon format de date
    const mesureData = {
  capteurId: +this.mesureForm.value.capteurId,
  valeur: +this.mesureForm.value.valeur,
  unite: this.mesureForm.value.unite,

};


    console.log('Données envoyées:', mesureData);

    this.apiService.createMesure(mesureData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Mesure enregistrée ! ID: ${response.id}`;
        
        // Réinitialiser le formulaire avec date actuelle

        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/mesures']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'enregistrement';
        console.error('Erreur complète:', error);
        
        // Afficher plus de détails sur l'erreur
        if (error.error && error.error.message) {
          this.errorMessage = `Erreur: ${error.error.message}`;
        } else if (error.status === 400) {
          this.errorMessage = 'Données invalides. Vérifiez le format de la date.';
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/mesure']);
  }



  // Remplir avec des valeurs suggérées
  useSuggestedValues(): void {
    const capteurId = this.mesureForm.value.capteurId;
    const capteur = this.capteurs.find(c => c.id === capteurId);
    
    if (!capteur) return;
    
    if (capteur.type === TypeCapteur.HUMIDITE) {
      this.mesureForm.patchValue({
        valeur: 65,
        unite: '%'
      });
    } else {
      this.mesureForm.patchValue({
        valeur: 22,
        unite: '°C'
      });
    }
  }
}