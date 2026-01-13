import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Capteur, TypeCapteur } from '../../shared/models/capteur.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { Subscription } from 'rxjs';
import { AlertService } from '../../core/services/alert/alert.service';

@Component({
  selector: 'app-capteurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './capteurs.html',
  styleUrls: ['./capteurs.css'],
})
export class CapteursComponent implements OnInit {
  capteurs: Capteur[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;

  // Filtres

  typeFilter: TypeCapteur | 'ALL' = 'ALL';
  etatFilter: string = 'ALL';

  // Stats
  stats = {
    total: 0,
    actifs: 0,
    inactifs: 0,
    parType: {
      HUMIDITE: 0,
      TEMPERATURE: 0,
      PLUVIOMETRE: 0,
    },
    typeCount: 0, // Nombre de types différents
  };

  // Exposer les objets globaux au template
  Math = Math;
  Object = Object;

  // Enum accessible dans le template
  TypeCapteur = TypeCapteur;
  alerts: string[] = [];

  private subscriptions = new Subscription();

  constructor(
    private capteurService: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadCapteurs();
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

  loadCapteurs(): void {
    this.isLoading = true;
    this.capteurService.getAllCapteurs().subscribe({
      next: (data) => {
        this.capteurs = data.map((c) => ({
          ...c,
          type: c.type as TypeCapteur,
        }));
        this.calculateStats();
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des capteurs';
        this.isLoading = false;
        console.error('Erreur:', error);
        console.log(this.capteurs);
        this.cd.detectChanges();
      },
    });
  }

  calculateStats(): void {
    this.stats.total = this.capteurs.length;
    this.stats.actifs = this.capteurs.filter((c) => c.etat === 'ACTIF').length;
    this.stats.inactifs = this.capteurs.filter((c) => c.etat !== 'ACTIF').length;

    // Réinitialiser les compteurs par type
    Object.keys(this.stats.parType).forEach((key) => {
      this.stats.parType[key as TypeCapteur] = 0;
    });

    // Compter par type
    this.capteurs.forEach((capteur) => {
      this.stats.parType[capteur.type]++;
    });

    // Compter le nombre de types différents utilisés
    const typesUtilises = new Set(this.capteurs.map((c) => c.type));
    this.stats.typeCount = typesUtilises.size;
  }

  get filteredCapteurs(): Capteur[] {
    let filtered = this.capteurs;

    // Filtre par recherche
    if (this.searchTerm) {
      filtered = filtered.filter(
        (capteur) =>
          capteur.localisation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          capteur.id.toString().includes(this.searchTerm)
      );
    }

    // Filtre par type
    if (this.typeFilter !== 'ALL') {
      filtered = filtered.filter((capteur) => capteur.type === this.typeFilter);
    }

    // Filtre par état
    if (this.etatFilter !== 'ALL') {
      filtered = filtered.filter((capteur) => capteur.etat === this.etatFilter);
    }

    return filtered;
  }

  get paginatedCapteurs(): Capteur[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCapteurs.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCapteurs.length / this.itemsPerPage);
  }

  getTypeIcon(type: TypeCapteur): string {
    switch (type) {
      case TypeCapteur.HUMIDITE:
        return '💧';
      case TypeCapteur.TEMPERATURE:
        return '🌡️';

      default:
        return '📡';
    }
  }

  getTypeColor(type: TypeCapteur): string {
    switch (type) {
      case TypeCapteur.HUMIDITE:
        return 'bg-blue-100 text-blue-800';
      case TypeCapteur.TEMPERATURE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getEtatColor(etat: string): string {
    switch (etat) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800';
      case 'INACTIF':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDaysSinceInstallation(dateInstallation: Date): number {
    const today = new Date();
    const installDate = new Date(dateInstallation);
    const diffTime = today.getTime() - installDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  deleteCapteur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce capteur ?')) {
      this.capteurService.deleteCapteur(id).subscribe({
        next: () => {
          this.capteurs = this.capteurs.filter((c) => c.id !== id);
          this.calculateStats();
        },
        error: (error) => {
          alert('Erreur lors de la suppression');
          console.error('Erreur:', error);
        },
      });
    }
  }

  editCapteur(id: number): void {
    this.router.navigate(['/capteurs/edit', id]);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/capteurs', id]);
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
    this.searchTerm = '';
    this.typeFilter = 'ALL';
    this.etatFilter = 'ALL';
    this.currentPage = 1;
  }

  // Méthodes pour les calculs dans le template
  getCountByEtat(etat: string): number {
    return this.capteurs.filter((c) => c.etat === etat).length;
  }

  getPercentageByEtat(etat: string): number {
    if (this.capteurs.length === 0) return 0;
    return (this.getCountByEtat(etat) / this.capteurs.length) * 100;
  }

  getPercentageByType(type: TypeCapteur): number {
    if (this.capteurs.length === 0) return 0;
    return (this.stats.parType[type] / this.capteurs.length) * 100;
  }

  // Méthode pour obtenir les types de capteurs
  getTypes(): TypeCapteur[] {
    return [TypeCapteur.HUMIDITE, TypeCapteur.TEMPERATURE];
  }

  // Méthode pour obtenir les états disponibles
  getEtats(): string[] {
    return ['ACTIF', 'INACTIF', 'MAINTENANCE'];
  }

  // Méthodes pour la pagination
  isPageVisible(pageIndex: number): boolean {
    return (
      Math.abs(this.currentPage - (pageIndex + 1)) <= 2 ||
      pageIndex === 0 ||
      pageIndex === this.totalPages - 1
    );
  }

  shouldShowEllipsis(pageIndex: number): boolean {
    return Math.abs(this.currentPage - (pageIndex + 1)) === 3 && pageIndex < this.totalPages - 1;
  }
}
