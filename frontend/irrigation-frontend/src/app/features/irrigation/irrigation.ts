import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ActionIrrigation, StatutIrrigation } from '../../shared/models/irrigation.model';
import { Parcelle } from '../../shared/models/parcelle.model';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-irrigation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './irrigation.html',
  styleUrls: ['./irrigation.css']
})
export class IrrigationComponent implements OnInit {
  irrigations: ActionIrrigation[] = [];
  parcelles: Parcelle[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filtres
  statutFilter: StatutIrrigation | 'ALL' = 'ALL';
  parcelleFilter: number | 'ALL' = 'ALL';
  searchDate: string = '';
  
  // Stats
  stats = {
    total: 0,
    enCours: 0,
    terminees: 0,
    volumeTotal: 0
  };

  // Exposer les objets globaux
  Math = Math;
  StatutIrrigation = StatutIrrigation;

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Charger les irrigations depuis l'historique global
    this.apiService.getHistory().subscribe({
      next: (irrigations) => {
        this.irrigations = irrigations;
        
        this.calculateStats();
        
        // Charger les parcelles pour avoir leurs noms
        this.apiService.getAllParcelles().subscribe({
          next: (parcelles) => {
            this.parcelles = parcelles;
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
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des irrigations';
        this.isLoading = false;
        console.error('Erreur:', error);
        this.cd.detectChanges(); 
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.irrigations.length;
    this.stats.enCours = this.irrigations.filter(i => i.statut === StatutIrrigation.EN_COURS).length;
    this.stats.terminees = this.irrigations.filter(i => i.statut === StatutIrrigation.TERMINEE).length;
    this.stats.volumeTotal = this.irrigations.reduce((sum, i) => sum + (i.volumeEau || 0), 0);
  }

  get filteredIrrigations(): ActionIrrigation[] {
    let filtered = this.irrigations;
    
    // Filtre par statut
    if (this.statutFilter !== 'ALL') {
      filtered = filtered.filter(irrigation => irrigation.statut === this.statutFilter);
    }
    
    // Filtre par parcelle
    if (this.parcelleFilter !== 'ALL') {
      filtered = filtered.filter(irrigation => irrigation.parcelleId === this.parcelleFilter);
    }
    
    // Filtre par date
    if (this.searchDate) {
      const searchDateObj = new Date(this.searchDate);
      filtered = filtered.filter(irrigation => {
        const irrigationDate = new Date(irrigation.dateDebut);
        return irrigationDate.toDateString() === searchDateObj.toDateString();
      });
    }
    
    return filtered.sort((a, b) =>
      new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
    );
  }

  getStatusColor(statut: StatutIrrigation): string {
    switch(statut) {
      case StatutIrrigation.EN_COURS: return 'bg-yellow-100 text-yellow-800';
      case StatutIrrigation.TERMINEE: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(statut: StatutIrrigation): string {
    switch(statut) {
      case StatutIrrigation.EN_COURS: return '🚰';
      case StatutIrrigation.TERMINEE: return '✅';
      default: return '📋';
    }
  }

  getParcelleName(parcelleId: number): string {
    const parcelle = this.parcelles.find(p => p.id === parcelleId);
    return parcelle ? parcelle.nom : `Parcelle #${parcelleId}`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${minutes}m`;
  }

  formatDateTime(date: Date): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR') + ' ' + dateObj.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  calculateEndTime(irrigation: ActionIrrigation): Date {
    const startTime = new Date(irrigation.dateDebut);
    return new Date(startTime.getTime() + irrigation.duree * 60000);
  }

  getProgressPercentage(irrigation: ActionIrrigation): number {
    if (irrigation.statut === StatutIrrigation.TERMINEE) return 100;
    
    // Pour EN_COURS, calculer le pourcentage de progression
    const startTime = new Date(irrigation.dateDebut).getTime();
    const now = new Date().getTime();
    const totalDuration = irrigation.duree * 60000;
    const elapsed = now - startTime;
    
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  }

  startIrrigation(id: number): void {
    // Logique pour démarrer une irrigation
    alert(`Démarrer l'irrigation ${id}`);
  }

  stopIrrigation(id: number): void {
    // Logique pour arrêter une irrigation
    alert(`Arrêter l'irrigation ${id}`);
  }

  resetFilters(): void {
    this.statutFilter = 'ALL';
    this.parcelleFilter = 'ALL';
    this.searchDate = '';
  }

  // Méthodes pour les calculs dans le template
  getCountByStatut(statut: StatutIrrigation): number {
    return this.filteredIrrigations.filter(i => i.statut === statut).length;
  }

  getPercentageByStatut(statut: StatutIrrigation): number {
    if (this.filteredIrrigations.length === 0) return 0;
    return (this.getCountByStatut(statut) / this.filteredIrrigations.length) * 100;
  }

  getAverageVolume(): number {
    if (this.filteredIrrigations.length === 0) return 0;
    const total = this.filteredIrrigations.reduce((sum, i) => sum + (i.volumeEau || 0), 0);
    return total / this.filteredIrrigations.length;
  }

  getAverageDuration(): number {
    if (this.filteredIrrigations.length === 0) return 0;
    const total = this.filteredIrrigations.reduce((sum, i) => sum + i.duree, 0);
    return total / this.filteredIrrigations.length;
  }

  getFilteredVolumeTotal(): number {
    return this.filteredIrrigations.reduce((sum, i) => sum + (i.volumeEau || 0), 0);
  }

  // Méthode pour obtenir tous les statuts
  getAllStatuts(): StatutIrrigation[] {
    return [StatutIrrigation.EN_COURS, StatutIrrigation.TERMINEE];
  }

  // NOUVELLE MÉTHODE : Charger les irrigations d'une parcelle spécifique
  loadIrrigationsForParcelle(parcelleId: number): void {
    this.isLoading = true;
    this.apiService.getIrrigationsByParcelle(parcelleId).subscribe({
      next: (irrigations) => {
        this.irrigations = irrigations;
        this.calculateStats();
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorMessage = `Erreur lors du chargement des irrigations pour la parcelle ${parcelleId}`;
        this.isLoading = false;
        console.error('Erreur:', error);
        this.cd.detectChanges();
      }
    });
  }
}