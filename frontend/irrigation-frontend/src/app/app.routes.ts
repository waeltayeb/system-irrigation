import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ParcellesComponent } from './features/parcelles/parcelles/parcelles.component';
import { CapteursComponent } from './features/capteurs/capteurs';
import { IrrigationComponent } from './features/irrigation/irrigation';
import { MesuresComponent } from './features/mesures/mesures.component';
import { EditCapteurComponent } from './features/capteurs/edit-capteur/edit-capteur.component';
import { CreateMesureComponent } from './features/mesures/mesures-create/mesures-create.component';

// AJOUTEZ 'export' devant const routes
export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent 
  },
  { 
    path: 'parcelles', 
    component: ParcellesComponent 
  },
  { 
    path: 'parcelles/create', 
    loadComponent: () => import('./features/parcelles/create-parcelle/create-parcelle.component')
      .then(m => m.CreateParcelleComponent)
  },
  { 
  path: 'parcelles/edit/:id', 
  loadComponent: () => import('./features/parcelles/edit-parcelle/edit-parcelle.component')
    .then(m => m.EditParcelleComponent)
},
  { 
    path: 'capteurs', 
    component: CapteursComponent 
  },
   
  { 
  path: 'capteurs/create', 
  loadComponent: () => import('./features/capteurs/create-capteur/create-capteur.component')
    .then(m => m.CreateCapteurComponent)
},
{
    path: 'capteurs/edit/:id',
    component: EditCapteurComponent
 },
{ 
  path: 'irrigation', 
  component: IrrigationComponent
},
{
  path: 'mesure',
  component: MesuresComponent
},
 {
    path: 'mesures/create',
    component: CreateMesureComponent
  },
  // Vous pourrez ajouter d'autres routes plus tard pour capteurs, parcelles, etc.
];