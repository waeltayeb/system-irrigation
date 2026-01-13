import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Parcelle } from '../../../shared/models/parcelle.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-edit-parcelle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './edit-parcelle.component.html',
  styleUrls: ['./edit-parcelle.component.css']
})
export class EditParcelleComponent implements OnInit {
  parcelleForm: FormGroup;
  parcelleId: number | null = null;
  parcelleOriginal: Parcelle | null = null;
  isLoading = false;
  isLoadingParcelle = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.parcelleForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      superficie: ['', [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      seuilHumiditeMin: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      seuilHumiditeMax: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    }, { validators: this.validateHumidityThresholds });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.parcelleId = +params['id'];
      if (this.parcelleId) {
        this.loadParcelle();
      }
    });
  }

  loadParcelle(): void {
    this.isLoadingParcelle = true;
    this.apiService.getParcelleById(this.parcelleId!).subscribe({
      next: (parcelle) => {
        this.parcelleOriginal = parcelle;
        this.parcelleForm.patchValue({
          nom: parcelle.nom,
          superficie: parcelle.superficie,
          seuilHumiditeMin: parcelle.seuilHumiditeMin,
          seuilHumiditeMax: parcelle.seuilHumiditeMax
        });
        this.isLoadingParcelle = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la parcelle';
        this.isLoadingParcelle = false;
        this.cd.detectChanges();
        console.error('Erreur:', error);
      }
    });
  }

  // Validateur personnalisé pour vérifier que seuilMin < seuilMax
  validateHumidityThresholds(control: AbstractControl) {
    const min = control.get('seuilHumiditeMin')?.value;
    const max = control.get('seuilHumiditeMax')?.value;
    
    if (min !== null && max !== null && parseFloat(min) >= parseFloat(max)) {
      return { invalidThresholds: true };
    }
    return null;
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get f() {
    return this.parcelleForm.controls;
  }

  // Vérifier si le formulaire a été modifié
  get isFormModified(): boolean {
    if (!this.parcelleOriginal) return false;
    
    return this.parcelleForm.value.nom !== this.parcelleOriginal.nom ||
           this.parcelleForm.value.superficie !== this.parcelleOriginal.superficie ||
           this.parcelleForm.value.seuilHumiditeMin !== this.parcelleOriginal.seuilHumiditeMin ||
           this.parcelleForm.value.seuilHumiditeMax !== this.parcelleOriginal.seuilHumiditeMax;
  }

  onSubmit(): void {
    if (this.parcelleForm.invalid) {
      this.markFormGroupTouched(this.parcelleForm);
      return;
    }

    if (!this.isFormModified) {
      this.successMessage = 'Aucune modification détectée';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const parcelleData: Parcelle = {
      id: this.parcelleId!,
      nom: this.parcelleForm.value.nom,
      superficie: parseFloat(this.parcelleForm.value.superficie),
      seuilHumiditeMin: parseFloat(this.parcelleForm.value.seuilHumiditeMin),
      seuilHumiditeMax: parseFloat(this.parcelleForm.value.seuilHumiditeMax)
    };

    this.apiService.updateParcelle(this.parcelleId!, parcelleData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Parcelle mise à jour avec succès !';
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/parcelles']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la mise à jour de la parcelle';
        console.error('Erreur mise à jour parcelle:', error);
      }
    });
  }

  onCancel(): void {
    if (this.isFormModified) {
      if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment annuler ?')) {
        this.router.navigate(['/parcelles']);
      }
    } else {
      this.router.navigate(['/parcelles']);
    }
  }

  onReset(): void {
    if (this.parcelleOriginal) {
      this.parcelleForm.patchValue({
        nom: this.parcelleOriginal.nom,
        superficie: this.parcelleOriginal.superficie,
        seuilHumiditeMin: this.parcelleOriginal.seuilHumiditeMin,
        seuilHumiditeMax: this.parcelleOriginal.seuilHumiditeMax
      });
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Calcul du pourcentage d'humidité moyen recommandé
  getRecommendedHumidity(): number {
    const min = parseFloat(this.parcelleForm.value.seuilHumiditeMin || 0);
    const max = parseFloat(this.parcelleForm.value.seuilHumiditeMax || 0);
    
    if (min > 0 && max > 0) {
      return Math.round((min + max) / 2);
    }
    return 0;
  }

  // Vérifier les changements par champ
  getFieldChange(field: keyof Parcelle): { changed: boolean, original: any, current: any } {
    if (!this.parcelleOriginal) {
      return { changed: false, original: null, current: null };
    }
    
    const original = this.parcelleOriginal[field];
    const current = this.parcelleForm.value[field];
    
    return {
      changed: original !== current,
      original,
      current
    };
  }
    // Méthode pour compter les champs modifiés
  getModifiedFieldsCount(): number {
    if (!this.parcelleOriginal) return 0;
    
    const fields = ['nom', 'superficie', 'seuilHumiditeMin', 'seuilHumiditeMax'] as const;
    return fields.filter(field => {
      const change = this.getFieldChange(field);
      return change.changed;
    }).length;
  }
    // Méthode pour supprimer la parcelle
  deleteParcelle(): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la parcelle "${this.parcelleOriginal?.nom}" ? Cette action est irréversible.`)) {
      this.isLoading = true;
      
      this.apiService.deleteParcelle(this.parcelleId!).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Parcelle supprimée avec succès !';
          
          setTimeout(() => {
            this.router.navigate(['/parcelles']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la suppression de la parcelle';
          console.error('Erreur suppression parcelle:', error);
        }
      });
    }
  }
}