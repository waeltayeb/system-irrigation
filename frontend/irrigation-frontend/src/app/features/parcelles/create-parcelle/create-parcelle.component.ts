import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Parcelle } from '../../../shared/models/parcelle.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-create-parcelle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './create-parcelle.component.html',
  styleUrls: ['./create-parcelle.component.css']
})
export class CreateParcelleComponent implements OnInit {
  parcelleForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private ApiService: ApiService,
    private router: Router
  ) {
    this.parcelleForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      superficie: ['', [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      seuilHumiditeMin: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      seuilHumiditeMax: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    }, { validators: this.validateHumidityThresholds });
  }

  ngOnInit(): void {}

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

  onSubmit(): void {
    if (this.parcelleForm.invalid) {
      this.markFormGroupTouched(this.parcelleForm);
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const parcelleData: Parcelle = {
      nom: this.parcelleForm.value.nom,
      superficie: parseFloat(this.parcelleForm.value.superficie),
      seuilHumiditeMin: parseFloat(this.parcelleForm.value.seuilHumiditeMin),
      seuilHumiditeMax: parseFloat(this.parcelleForm.value.seuilHumiditeMax),
      id: null as any  // L'ID sera attribué par le backend
    };

    this.ApiService.createParcelle(parcelleData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Parcelle créée avec succès !';
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/parcelles']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la création de la parcelle';
        console.error('Erreur création parcelle:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/parcelles']);
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
}