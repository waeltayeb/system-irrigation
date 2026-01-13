import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Mesure } from '../../shared/models/mesure.model';
import { Capteur, TypeCapteur } from '../../shared/models/capteur.model';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-mesures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './mesures.component.html',
  styleUrls: ['./mesures.component.css']
})
export class MesuresComponent implements OnInit {
  allMesures: Mesure[] = [];   
mesures: Mesure[] = [];     

  capteurs: Capteur[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filtres
  capteurFilter: number | 'ALL' = 'ALL';
  dateFilter: string = '';
  typeFilter: TypeCapteur | 'ALL' = 'ALL';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 15;
  
  // Capteur sélectionné pour le détail
  selectedCapteurId: number | null = null;
  
  // Dernière mesure du capteur sélectionné
  derniereMesure: Mesure | null = null;
  isDerniereLoading = false;
  
  // Stats
  stats = {
    total: 0,
    moyenne: 0,
    min: 0,
    max: 0,
    dernieres24h: 0,
    ecartType: 0,
    periodeCouverture: 'N/A',
    moyenneParJour: 0,
    derniereMesureTime: 'N/A'
  };

  // Exposer les objets globaux
  Math = Math;
  TypeCapteur = TypeCapteur;

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCapteurs();
    this.loadAllMesures();

  }

  loadCapteurs(): void {
    this.isLoading = true;
    this.apiService.getAllCapteurs().subscribe({
      next: (capteurs) => {
        this.capteurs = capteurs;
        
        // Si des capteurs existent, charger les mesures du premier
        if (capteurs.length > 0) {
          this.selectedCapteurId = capteurs[0].id;
          this.capteurFilter = capteurs[0].id;
          this.loadMesuresForCapteur(capteurs[0].id);
          this.loadDerniereMesure(capteurs[0].id);
        } else {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des capteurs';
        this.isLoading = false;
        console.error('Erreur:', error);
        this.cd.detectChanges();
      }
    });
  }

  loadMesuresForCapteur(capteurId: number): void {
    this.isLoading = true;
    this.selectedCapteurId = capteurId;
    this.currentPage = 1; // Réinitialiser la pagination
    
    this.apiService.getByCapteur(capteurId).subscribe({
      next: (mesures) => {
        this.mesures = mesures;
        this.calculateStats();
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des mesures';
        this.isLoading = false;
        console.error('Erreur:', error);
        this.cd.detectChanges();
      }
    });
  }

  loadDerniereMesure(capteurId: number): void {
    this.isDerniereLoading = true;
    this.apiService.getLastByCapteur(capteurId).subscribe({
      next: (mesure) => {
        this.derniereMesure = mesure;
        this.isDerniereLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la dernière mesure:', error);
        this.derniereMesure = null;
        this.isDerniereLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  getCapteurTypeIcon(capteurId: number): string {
  const capteur = this.capteurs.find(c => c.id === capteurId);
  if (!capteur) {
    return '❓'; // Icône par défaut si capteur non trouvé
  }
  return this.getTypeIcon(capteur.type);
}



 loadAllMesures(): void {
  this.isLoading = true;

  this.apiService.getAllMesures().subscribe({
    next: (mesures) => {
      this.allMesures = mesures;
      this.isLoading = false;
      this.calculateStats();
      this.cd.detectChanges();
    },
    error: () => {
      this.errorMessage = 'Erreur lors du chargement des mesures';
      this.isLoading = false;
    }
  });
}


  calculateStats(): void {
    if (this.filteredMesures.length === 0) {
      this.stats = { 
        total: 0, 
        moyenne: 0, 
        min: 0, 
        max: 0, 
        dernieres24h: 0,
        ecartType: 0,
        periodeCouverture: 'N/A',
        moyenneParJour: 0,
        derniereMesureTime: 'N/A'
      };
      return;
    }

    const values = this.filteredMesures.map(m => m.valeur);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Calcul de la moyenne
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    
    // Calcul de l'écart-type
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const ecartType = Math.sqrt(avgSquareDiff);

    // Période de couverture
    const dates = this.filteredMesures.map(m => new Date(m.dateMesure));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const periodeCouverture = diffDays > 0 ? `${diffDays} jour(s)` : 'Moins d\'un jour';

    // Moyenne par jour
    const uniqueDays = new Set(dates.map(d => d.toDateString())).size;
    const moyenneParJour = this.filteredMesures.length / uniqueDays;

    // Dernière mesure
    const lastMeasurement = this.filteredMesures.reduce((latest, current) => {
      return new Date(current.dateMesure) > new Date(latest.dateMesure) ? current : latest;
    });
    const lastDate = new Date(lastMeasurement.dateMesure);
    const timeDiff = now.getTime() - lastDate.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    let derniereMesureTime = 'N/A';
    
    if (minutesDiff < 60) {
      derniereMesureTime = `Il y a ${minutesDiff} minute(s)`;
    } else if (minutesDiff < 1440) {
      derniereMesureTime = `Il y a ${Math.floor(minutesDiff / 60)} heure(s)`;
    } else {
      derniereMesureTime = `Il y a ${Math.floor(minutesDiff / 1440)} jour(s)`;
    }

    this.stats.total = this.filteredMesures.length;
    this.stats.moyenne = parseFloat(mean.toFixed(2));
    this.stats.min = parseFloat(Math.min(...values).toFixed(2));
    this.stats.max = parseFloat(Math.max(...values).toFixed(2));
    this.stats.dernieres24h = this.filteredMesures.filter(m => 
      new Date(m.dateMesure) >= twentyFourHoursAgo
    ).length;
    this.stats.ecartType = parseFloat(ecartType.toFixed(2));
    this.stats.periodeCouverture = periodeCouverture;
    this.stats.moyenneParJour = parseFloat(moyenneParJour.toFixed(1));
    this.stats.derniereMesureTime = derniereMesureTime;
  }

// Modifiez la méthode get filteredMesures() :
get filteredMesures(): Mesure[] {
  let filtered = [...this.allMesures];

  if (this.capteurFilter !== 'ALL') {
    filtered = filtered.filter(m => m.capteurId === this.capteurFilter);
  }

  if (this.typeFilter !== 'ALL') {
    const ids = this.capteurs
      .filter(c => c.type === this.typeFilter)
      .map(c => c.id);
    filtered = filtered.filter(m => ids.includes(m.capteurId));
  }

  if (this.dateFilter) {
    const d = new Date(this.dateFilter).toDateString();
    filtered = filtered.filter(m =>
      new Date(m.dateMesure).toDateString() === d
    );
  }

  return filtered.sort((a, b) =>
    new Date(b.dateMesure).getTime() - new Date(a.dateMesure).getTime()
  );
}


// Modifiez la méthode onCapteurChange() :
onCapteurChange(): void {
  this.currentPage = 1;

  if (this.capteurFilter === 'ALL') {
    this.selectedCapteurId = null;
    this.derniereMesure = null;
  } else {
    this.selectedCapteurId = this.capteurFilter as number;
    this.loadDerniereMesure(this.selectedCapteurId);
  }

  this.calculateStats();
}


// Ajoutez cette méthode pour récupérer les mesures pour un capteur spécifique dans la vue "Tous"
getMesuresForCapteur(capteurId: number): Mesure[] {
  return this.mesures.filter(m => m.capteurId === capteurId);
  
}

// Modifiez la méthode getSelectedCapteur() pour fonctionner avec capteurFilter :
getSelectedCapteur(): Capteur | undefined {
  if (this.capteurFilter === 'ALL') return undefined;
  return this.capteurs.find(c => c.id === this.capteurFilter);
}

// Modifiez les méthodes qui utilisent selectedCapteurId pour utiliser capteurFilter à la place :

getValueColor(mesure: Mesure): string {
  if (this.capteurFilter === 'ALL') {
    // Si on est en mode "Tous les capteurs", on détermine le type à partir du capteur de la mesure
    const mesureCapteur = this.capteurs.find(c => c.id === mesure.capteurId);
    if (!mesureCapteur) return 'text-gray-700';
    
    if (mesureCapteur.type === TypeCapteur.HUMIDITE) {
      if (mesure.valeur < 30) return 'text-red-600 font-bold';
      if (mesure.valeur < 60) return 'text-yellow-600';
      return 'text-green-600';
    } else {
      if (mesure.valeur < 10) return 'text-blue-600';
      if (mesure.valeur > 30) return 'text-red-600 font-bold';
      return 'text-green-600';
    }
  } else {
    // Si on est en mode capteur spécifique
    const capteur = this.getSelectedCapteur();
    if (!capteur) return 'text-gray-700';
    
    if (capteur.type === TypeCapteur.HUMIDITE) {
      if (mesure.valeur < 30) return 'text-red-600 font-bold';
      if (mesure.valeur < 60) return 'text-yellow-600';
      return 'text-green-600';
    } else {
      if (mesure.valeur < 10) return 'text-blue-600';
      if (mesure.valeur > 30) return 'text-red-600 font-bold';
      return 'text-green-600';
    }
  }
}



  get paginatedMesures(): Mesure[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMesures.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMesures.length / this.itemsPerPage);
  }

  


  getTypeIcon(type: TypeCapteur): string {
    return type === TypeCapteur.HUMIDITE ? '💧' : '🌡️';
  }

  getTypeColor(type: TypeCapteur): string {
    return type === TypeCapteur.HUMIDITE 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-red-100 text-red-800';
  }

  formatDateTime(date: Date): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR') + ' ' + 
           dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }


  getValueUnit(capteurId: number): string {
    const capteur = this.capteurs.find(c => c.id === capteurId);
    if (!capteur) return 'N/A';
    return capteur.type === TypeCapteur.HUMIDITE ? '%' : '°C';
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

  resetFilters(): void {
    this.dateFilter = '';
    this.typeFilter = 'ALL';
    this.currentPage = 1;
  }

  exportToCSV(): void {
    const selectedCapteur = this.getSelectedCapteur();
    const capteurName = selectedCapteur 
      ? `${selectedCapteur.type}_${selectedCapteur.localisation}` 
      : 'mesures';
    
    const headers = ['ID', 'Capteur ID', 'Type', 'Localisation', 'Valeur', 'Unité', 'Date Mesure'];
    const csvData = [
      headers.join(','),
      ...this.filteredMesures.map(m => {
        const capteur = this.capteurs.find(c => c.id === m.capteurId);
        return `${m.id},${m.capteurId},"${capteur?.type || 'N/A'}","${capteur?.localisation || 'N/A'}",${m.valeur},${m.unite},"${this.formatDateTime(m.dateMesure)}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mesures_${capteurName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Méthode pour rafraîchir les mesures manuellement
  refreshMesures(): void {
    if (this.selectedCapteurId) {
      this.loadMesuresForCapteur(this.selectedCapteurId);
      this.loadDerniereMesure(this.selectedCapteurId);
    } else if (this.capteurFilter === 'ALL') {
      this.loadAllMesures();
    }
  }

  // Méthode pour obtenir le nom du capteur
  getCapteurName(capteurId: number): string {
    const capteur = this.capteurs.find(c => c.id === capteurId);
    return capteur ? `${capteur.type} - ${capteur.localisation}` : `Capteur ${capteurId}`;
  }
}