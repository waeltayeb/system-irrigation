import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Parcelle } from '../../../shared/models/parcelle.model';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AlertService } from '../../../core/services/alert/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-parcelles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './parcelles.component.html',
  styleUrls: ['./parcelles.component.css']
})
export class ParcellesComponent implements OnInit {
  parcelles: Parcelle[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;

  // Exposer Math au template
  Math = Math;

    alerts: string[] = [];

  private subscriptions = new Subscription();

  constructor(
    private parcelleService: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadParcelles();
        // Connexion WebSocket
    this.alertService.connect();

    // S'abonner aux alertes
    this.subscriptions.add(
      this.alertService.subscribe((msg: string) => {
        this.alerts.unshift(msg); // Ajoute la nouvelle alerte
         this.cd.detectChanges();
      })
    );
  }
    ngOnDestroy(): void {
    // Déconnexion WebSocket et unsubscribe
    this.subscriptions.unsubscribe();
    this.alertService.disconnect();
  }

  loadParcelles(): void {
    this.isLoading = true;
    this.parcelleService.getAllParcelles().subscribe({
      next: (data) => {
        this.parcelles = data;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des parcelles';
        this.isLoading = false;
        
        console.error('Erreur:', error);
        this.cd.detectChanges();
      }
    });
  }

  get filteredParcelles(): Parcelle[] {
    if (!this.searchTerm) return this.parcelles;
    
    return this.parcelles.filter(parcelle =>
      parcelle.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedParcelles(): Parcelle[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredParcelles.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredParcelles.length / this.itemsPerPage);
  }

  // Méthodes de calcul
  getTotalSuperficie(): number {
    return this.parcelles.reduce((sum, p) => sum + p.superficie, 0);
  }

  getMoyenneHumiditeMin(): number {
    if (this.parcelles.length === 0) return 0;
    const total = this.parcelles.reduce((sum, p) => sum + p.seuilHumiditeMin, 0);
    return Math.round(total / this.parcelles.length);
  }

  getMoyenneHumiditeMax(): number {
    if (this.parcelles.length === 0) return 0;
    const total = this.parcelles.reduce((sum, p) => sum + p.seuilHumiditeMax, 0);
    return Math.round(total / this.parcelles.length);
  }



  deleteParcelle(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      this.parcelleService.deleteParcelle(id).subscribe({
        next: () => {
          this.parcelles = this.parcelles.filter(p => p.id !== id);
        },
        error: (error) => {
          alert('Erreur lors de la suppression');
          console.error('Erreur:', error);
        }
      });
    }
  }

  editParcelle(id: number): void {
    this.router.navigate(['/parcelles/edit', id]);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/parcelles', id]);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}