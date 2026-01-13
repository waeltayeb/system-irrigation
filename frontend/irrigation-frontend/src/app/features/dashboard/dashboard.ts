import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Capteur, TypeCapteur } from '../../shared/models/capteur.model';
import { Parcelle } from '../../shared/models/parcelle.model';
import { StatutIrrigation } from '../../shared/models/irrigation.model';
import { MesureCourante } from '../../shared/models/mesure.model';
import { ActionIrrigation } from '../../shared/models/irrigation.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AlertService } from '../../core/services/alert/alert.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  now = new Date();
  parcelles: Parcelle[] = [];
  mesuresCourantes: { [key: number]: MesureCourante } = {};
  irrigationsEnCours: ActionIrrigation[] = [];
  capteurs: Capteur[] = [];
  
  // Données supplémentaires
  allIrrigations: ActionIrrigation[] = [];
  recentMesures: any[] = [];
  
  isLoading = {
    parcelles: true,
    irrigations: true,
    capteurs: true,
    mesures: true
  };
  
  stats = {
    totalParcelles: 0,
    irrigationActive: 0,
    capteursActifs: 0,
    consommationEau: 0,
    surfaceTotale: 0,
    irrigationToday: 0,
    avgHumidity: 0,
    alertes: 0
  };

  // Alertes et notifications
  alerts: string[] = [];
  alertes = {
    capteursInactifs: [] as Capteur[]
  };

  private subscriptions = new Subscription();

  constructor(
    private apiService: ApiService, 
    private cd: ChangeDetectorRef,
    private alertService: AlertService 
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    // Connexion WebSocket
    this.alertService.connect();

    // Abonnement aux alertes
    this.subscriptions.add(
  this.alertService.subscribe((msg: string) => {
    this.alerts.unshift(msg);
    console.log('Nouvelle alerte reçue:', msg);
    this.stats.alertes += 1;
    this.cd.detectChanges();
  })
);

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    this.loadParcelles();
    this.loadIrrigations();
    this.loadCapteurs();
    this.loadRecentMesures();
  }

  loadParcelles(): void {
    this.isLoading.parcelles = true;
    this.subscriptions.add(
      this.apiService.getAllParcelles().subscribe({
        next: (parcelles) => {
          this.parcelles = parcelles;
          this.stats.totalParcelles = parcelles.length;
          this.stats.surfaceTotale = parcelles.reduce((sum, p) => sum + p.superficie, 0);
          
          // Charger les mesures courantes pour chaque parcelle
          parcelles.forEach(parcelle => {
            this.apiService.getMesureCourante(parcelle.id).subscribe({
              next: (mesure) => {
                this.mesuresCourantes[parcelle.id] = mesure;
                this.calculateAvgHumidity();
                this.cd.detectChanges();
              },
              error: () => {
                // Si pas de mesure, créer une mesure par défaut
                this.mesuresCourantes[parcelle.id] = {
                  parcelleId: parcelle.id,
                  typeCapteur: 'HUMIDITE',
                  valeur: 0,
                  unite: '%',
                  dateMesure: new Date()
                };
                this.cd.detectChanges();
              }
            });
          });
          
          this.isLoading.parcelles = false;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Erreur chargement parcelles:', error);
          this.isLoading.parcelles = false;
          this.cd.detectChanges();
        }
      })
    );
  }

  loadIrrigations(): void {
    this.isLoading.irrigations = true;
    this.subscriptions.add(
      this.apiService.getHistory().subscribe({
        next: (irrigations) => {
          this.allIrrigations = irrigations;
          this.irrigationsEnCours = irrigations.filter(i => i.statut === StatutIrrigation.EN_COURS);
          
          this.stats.irrigationActive = this.irrigationsEnCours.length;
          this.stats.consommationEau = irrigations.reduce((sum, irr) => sum + (irr.volumeEau || 0), 0);
          
          // Calculer les irrigations d'aujourd'hui
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          this.stats.irrigationToday = irrigations.filter(irr => 
            new Date(irr.dateDebut) >= today
          ).length;
          

          this.isLoading.irrigations = false;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Erreur chargement irrigations:', error);
          this.isLoading.irrigations = false;
          this.cd.detectChanges();
        }
      })
    );
  }

  loadCapteurs(): void {
    this.isLoading.capteurs = true;
    this.subscriptions.add(
      this.apiService.getAllCapteurs().subscribe({
        next: (capteurs) => {
          this.capteurs = capteurs;
          this.stats.capteursActifs = capteurs.filter(c => c.etat === 'ACTIF').length;
          
          // Vérifier les capteurs inactifs
          this.alertes.capteursInactifs = capteurs.filter(c => c.etat !== 'ACTIF');
          this.stats.alertes += this.alertes.capteursInactifs.length;
          
          this.isLoading.capteurs = false;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Erreur chargement capteurs:', error);
          this.isLoading.capteurs = false;
          this.cd.detectChanges();
        }
      })
    );
  }

  loadRecentMesures(): void {
    this.isLoading.mesures = true;
    // Charger les dernières mesures pour chaque capteur
    if (this.capteurs.length > 0) {
      const capteurPromises = this.capteurs.slice(0, 5).map(capteur => 
        this.apiService.getLastByCapteur(capteur.id).toPromise()
      );
      
      Promise.all(capteurPromises).then(mesures => {
        this.recentMesures = mesures.filter(m => m).map((mesure, index) => ({
          ...mesure,
          capteur: this.capteurs[index]
        }));
        this.isLoading.mesures = false;
        this.cd.detectChanges();
      }).catch(() => {
        this.isLoading.mesures = false;
        this.cd.detectChanges();
      });
    } else {
      this.isLoading.mesures = false;
      this.cd.detectChanges();
    }
  }



  calculateAvgHumidity(): void {
    const humidities = Object.values(this.mesuresCourantes)
      .filter(m => m && m.valeur > 0)
      .map(m => m.valeur);
    
    if (humidities.length > 0) {
      this.stats.avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    }
  }

  getHumiditePercent(parcelleId: number): number {
    const mesure = this.mesuresCourantes[parcelleId];
    const parcelle = this.parcelles.find(p => p.id === parcelleId);
    
    if (!mesure || !parcelle) return 0;
    
    const range = parcelle.seuilHumiditeMax - parcelle.seuilHumiditeMin;
    const position = mesure.valeur - parcelle.seuilHumiditeMin;
    return Math.max(0, Math.min(100, Math.round((position / range) * 100)));
  }

  getHumiditeStatus(parcelleId: number): string {
    const percent = this.getHumiditePercent(parcelleId);
    if (percent < 30) return 'danger';
    if (percent < 60) return 'warning';
    return 'success';
  }

  getIconForTypeCapteur(type: TypeCapteur): string {
    return type === TypeCapteur.HUMIDITE ? '💧' : '🌡️';
  }

  getProgressColor(percent: number): string {
    if (percent < 30) return 'bg-red-500';
    if (percent < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getStatusColor(statut: StatutIrrigation): string {
    switch(statut) {
      case StatutIrrigation.EN_COURS: return 'bg-yellow-100 text-yellow-800';
      case StatutIrrigation.TERMINEE: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins}m` : `${minutes}m`;
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  get isLoadingAny(): boolean {
    return Object.values(this.isLoading).some(loading => loading);
  }

    // Pour obtenir le nom d'une parcelle
  getParcelleName(parcelleId: number): string {
    const parcelle = this.parcelles.find(p => p.id === parcelleId);
    return parcelle ? parcelle.nom : '';
  }

  // Calculer la progression d'une irrigation
  getProgressPercentage(irrigation: ActionIrrigation): number {
    if (irrigation.statut === StatutIrrigation.TERMINEE) return 100;
    
    const startTime = new Date(irrigation.dateDebut).getTime();
    const now = new Date().getTime();
    const totalDuration = irrigation.duree * 60000;
    const elapsed = now - startTime;
    
    const percentage = (elapsed / totalDuration) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  }

  // Pour le pipe date dans le template
  get currentDate(): string {
    return this.now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}