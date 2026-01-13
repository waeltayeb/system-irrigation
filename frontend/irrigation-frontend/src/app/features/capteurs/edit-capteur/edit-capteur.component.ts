import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

import { TypeCapteur } from '../../../shared/models/capteur.model';
import { Parcelle } from '../../../shared/models/parcelle.model';
import { Capteur } from '../../../shared/models/capteur.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-edit-capteur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './edit-capteur.component.html',
  styleUrls: ['./edit-capteur.component.css']
})
export class EditCapteurComponent implements OnInit {
  capteurForm: FormGroup;
  capteurId!: number;
  capteur: Capteur | null = null;
  parcelles: Parcelle[] = [];
  isLoading = false;
  isLoadingCapteur = false;
  isLoadingParcelles = false;
  successMessage = '';
  errorMessage = '';
  
  // Types de capteurs disponibles
  TypeCapteur = TypeCapteur;
  typesCapteurs = [TypeCapteur.HUMIDITE, TypeCapteur.TEMPERATURE];
  
  // États disponibles
  etats = ['ACTIF', 'INACTIF', 'MAINTENANCE'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.capteurForm = this.fb.group({
      type: ['', Validators.required],
      localisation: ['', Validators.required],
      etat: ['ACTIF', Validators.required],
      dateInstallation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.capteurId = +params['id'];
      if (this.capteurId) {
        this.loadCapteur();
        this.loadParcelles();
      }
    });
  }

  loadCapteur(): void {
    this.isLoadingCapteur = true;
    this.apiService.getCapteurById(this.capteurId).subscribe({
      next: (capteur) => {
        this.capteur = capteur;
        
        // Formater la date pour l'input type="date"
        const formattedDate = this.formatDateForInput(capteur.dateInstallation);
        
        // Mettre à jour le formulaire avec les données du capteur
        this.capteurForm.patchValue({
          type: capteur.type,
          localisation: capteur.localisation,
          etat: capteur.etat,
          dateInstallation: formattedDate
        });
        
        this.isLoadingCapteur = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du capteur:', error);
        this.errorMessage = 'Impossible de charger les données du capteur';
        this.isLoadingCapteur = false;
        this.cd.detectChanges();
      }
    });
  }

  loadParcelles(): void {
    this.isLoadingParcelles = true;
    this.apiService.getAllParcelles().subscribe({
      next: (data) => {
        this.parcelles = data;
        this.isLoadingParcelles = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des parcelles:', error);
        this.isLoadingParcelles = false;
        this.cd.detectChanges();
      }
    });
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
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

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const capteurData = {
      ...this.capteurForm.value,
      dateInstallation: new Date(this.capteurForm.value.dateInstallation)
    };

    this.apiService.updateCapteur(this.capteurId, capteurData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Capteur modifié avec succès !`;
        
        // Mettre à jour l'objet capteur local
        this.capteur = response;
        
        setTimeout(() => {
          this.router.navigate(['/capteurs']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la modification du capteur';
        console.error('Erreur:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/capteurs']);
  }

  onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce capteur ? Cette action est irréversible.')) {
      this.isLoading = true;
      this.apiService.deleteCapteur(this.capteurId).subscribe({
        next: () => {
          this.successMessage = 'Capteur supprimé avec succès';
          setTimeout(() => {
            this.router.navigate(['/capteurs']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la suppression du capteur';
          console.error('Erreur:', error);
        }
      });
    }
  }

  getSuggestedName(): string {
    const type = this.capteurForm.value.type;
    const localisation = this.capteurForm.value.localisation;
    
    if (!type || !localisation) return '';
    
    const typeAbbr = type === TypeCapteur.HUMIDITE ? 'HUM' : 'TEMP';
    return `CAP_${typeAbbr}_${localisation.replace(/\s+/g, '_').toUpperCase()}`;
  }
}