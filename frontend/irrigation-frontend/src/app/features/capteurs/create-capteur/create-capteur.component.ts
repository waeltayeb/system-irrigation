import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

import { TypeCapteur } from '../../../shared/models/capteur.model';
import { Parcelle } from '../../../shared/models/parcelle.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-create-capteur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './create-capteur.component.html',
  styleUrls: ['./create-capteur.component.css']
})
export class CreateCapteurComponent implements OnInit {
  capteurForm: FormGroup;
  parcelles: Parcelle[] = [];
  isLoading = false;
  isLoadingParcelles: boolean = false;
  successMessage = '';
  errorMessage = '';
  
  // Types de capteurs disponibles (seulement 2)
  TypeCapteur = TypeCapteur;
  typesCapteurs = [TypeCapteur.HUMIDITE, TypeCapteur.TEMPERATURE];
  
  // États disponibles
  etats = ['ACTIF', 'INACTIF', 'MAINTENANCE'];

  constructor(
    private fb: FormBuilder,
    private capteurService: ApiService,
    private parcelleService: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    this.capteurForm = this.fb.group({
      type: ['', Validators.required],
      localisation: ['', Validators.required],
      etat: ['ACTIF', Validators.required],
      dateInstallation: [this.getTodayDate(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadParcelles();
  }

loadParcelles(): void {
  this.isLoadingParcelles = true;

  this.parcelleService.getAllParcelles().subscribe({
    next: (data) => {
      

      this.parcelles = data;
      this.isLoadingParcelles = false;

      this.cd.detectChanges(); 
    },
    error: () => {
      this.isLoadingParcelles = false;
      this.cd.detectChanges();
    }
  });
}



  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get f() {
    return this.capteurForm.controls;
  }

  getTypeIcon(type: TypeCapteur): string {
    return type === TypeCapteur.HUMIDITE ? '💧' : '🌡️';
  }

  getTypeDescription(type: TypeCapteur): string {
    return type === TypeCapteur.HUMIDITE 
      ? 'Mesure l\'humidité du sol' 
      : 'Mesure la température ambiante';
  }

  onSubmit(): void {
    if (this.capteurForm.invalid) {
      Object.keys(this.capteurForm.controls).forEach(key => {
        this.capteurForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.parcelles.length === 0) {
      this.errorMessage = 'Aucune parcelle disponible. Créez d\'abord une parcelle.';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const capteurData = {
      type: this.capteurForm.value.type,
      localisation: this.capteurForm.value.localisation,
      etat: this.capteurForm.value.etat,
      dateInstallation: new Date(this.capteurForm.value.dateInstallation)
    };

    this.capteurService.createCapteur(capteurData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Capteur créé avec succès ! ID: ${response.id}`;
        
        setTimeout(() => {
          this.router.navigate(['/capteurs']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la création du capteur';
        console.error('Erreur:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/capteurs']);
  }

  // Méthode pour générer un nom de capteur suggéré
  getSuggestedName(): string {
    const type = this.capteurForm.value.type;
    const localisation = this.capteurForm.value.localisation;
    
    if (!type || !localisation) return '';
    
    const typeAbbr = type === TypeCapteur.HUMIDITE ? 'HUM' : 'TEMP';
    return `CAP_${typeAbbr}_${localisation.replace(/\s+/g, '_').toUpperCase()}`;
  }
}