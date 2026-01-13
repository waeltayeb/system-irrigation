import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isMenuOpen = false;
  currentRoute = '';

  navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊', description: 'Vue d\'ensemble du système' },
    { path: '/parcelles', label: 'Parcelles', icon: '🌱', description: 'Gestion des zones d\'irrigation' },
    { path: '/capteurs', label: 'Capteurs', icon: '📡', description: 'Gestion des capteurs IoT' },
    { path: '/irrigation', label: 'Irrigation', icon: '💧', description: 'Contrôle de l\'irrigation' },
    { path: '/mesure', label: 'Mesures', icon: '📈', description: 'Données des capteurs' }
  ];

  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentRoute = event.urlAfterRedirects;
        this.isMenuOpen = false;
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    if (window.innerWidth < 768) {
      this.isMenuOpen = false;
    }
  }

  isActive(path: string): boolean {
    return this.currentRoute === path || this.currentRoute.startsWith(path + '/');
  }

  getCurrentPageLabel(): string {
    const currentItem = this.navItems.find(item => this.isActive(item.path));
    return currentItem?.label ?? 'Smart Irrigation';
  }
}
