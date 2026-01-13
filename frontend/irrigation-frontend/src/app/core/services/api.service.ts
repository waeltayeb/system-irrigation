import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Capteur,  } from '../../shared/models/capteur.model';
import { Parcelle } from '../../shared/models/parcelle.model';
import { CreateMesureDto, Mesure } from '../../shared/models/mesure.model';
import { MesureCourante } from '../../shared/models/mesure.model';
import { ActionIrrigation, StatutIrrigation  } from '../../shared/models/irrigation.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8222/api';

  constructor(private http: HttpClient) {}



//   // Mesures
//   getLastMesure(capteurId: number): Observable<Mesure> {
//     return this.http.get<Mesure>(`${this.apiUrl}/mesures/capteur/${capteurId}/last`);
//   }



// MesureCourante(parcelleId: number): Observable<MesureCourante> {
//     return this.http.get<MesureCourante>(`${this.apiUrl}/parcelles/${parcelleId}/mesure`);
//   }

//   // Irrigations
//   getIrrigationsHistory(): Observable<ActionIrrigation[]> {
//     return this.http.get<ActionIrrigation[]>(`${this.apiUrl}/irrigations/history`);
//   }

  getIrrigationsByStatut(statut: string): Observable<ActionIrrigation[]> {
    return this.http.get<ActionIrrigation[]>(`${this.apiUrl}/irrigations?statut=${statut}`);
  }


  //************************************************************************************** */
  //************************************************************************************** */
  //********************************API PARCELLES **************************************** */

  // Créer une parcelle
  createParcelle(parcelle: Parcelle): Observable<Parcelle> {
    return this.http.post<Parcelle>(`${this.apiUrl}/parcelles`, parcelle);
  }

  // Obtenir toutes les parcelles
  getAllParcelles(): Observable<Parcelle[]> {
    return this.http.get<Parcelle[]>(`${this.apiUrl}/parcelles`);
  }

  // Obtenir une parcelle par ID
  getParcelleById(id: number): Observable<Parcelle> {
    return this.http.get<Parcelle>(`${this.apiUrl}/parcelles/${id}`);
  }

  // Mettre à jour une parcelle
  updateParcelle(id: number, parcelle: Parcelle): Observable<Parcelle> {
    return this.http.put<Parcelle>(`${this.apiUrl}/parcelles/${id}`, parcelle);
  }

  // Supprimer une parcelle
  deleteParcelle(id: number) {

    return this.http.delete(
    `${this.apiUrl}/parcelles/${id}`,
    { responseType: 'text' }
  );
  }

  // Obtenir les irrigations d'une parcelle
  getIrrigationsByParcelle(parcelleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/parcelles/${parcelleId}/irrigations`);
  }

  // Obtenir la mesure courante
  getMesureCourante(parcelleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/parcelles/${parcelleId}/mesure`);
  }

  //************************************************************************************** */
  //************************************************************************************** */
  //********************************API CAPTEURS **************************************** */

  // Créer un capteur - POST /api/capteurs
  createCapteur(capteur: Omit<Capteur, 'id'>): Observable<Capteur> {
    return this.http.post<Capteur>(`${this.apiUrl}/capteurs`, capteur);
  }

  // Obtenir tous les capteurs - GET /api/capteurs
  getAllCapteurs(): Observable<Capteur[]> {
    return this.http.get<Capteur[]>(`${this.apiUrl}/capteurs`);
  }

  // Obtenir un capteur par ID - GET /api/capteurs/{id}
  getCapteurById(id: number): Observable<Capteur> {
    return this.http.get<Capteur>(`${this.apiUrl}/capteurs/${id}`);
  }

  // Mettre à jour un capteur
  updateCapteur(id: number, capteur: Capteur): Observable<Capteur> {
    return this.http.put<Capteur>(`${this.apiUrl}/capteurs/${id}`, capteur);
  }

  // Supprimer un capteur
  deleteCapteur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/capteurs/${id}`);
  }

  // ****************************************************************************************  */
  // ****************************************************************************************  */
  // ********************************API IIRIAGTIONS ****************************************  */

  // Historique global - GET /api/irrigations/history
  getHistory(): Observable<ActionIrrigation[]> {
    return this.http.get<ActionIrrigation[]>(`${this.apiUrl}/irrigations/history`);
  }

  // Par statut - GET /api/irrigations?statut={statut}
  getByStatut(statut: StatutIrrigation): Observable<ActionIrrigation[]> {
    return this.http.get<ActionIrrigation[]>(`${this.apiUrl}/irrigations?statut=${statut}`);
  }

  // Pour une parcelle spécifique - GET /api/parcelles/{id}/irrigations
  getByParcelle(parcelleId: number): Observable<ActionIrrigation[]> {
    return this.http.get<ActionIrrigation[]>(`${this.apiUrl}/parcelles/${parcelleId}/irrigations`);
  }

    //************************************************************************************** */
  //************************************************************************************** */
  //********************************API MESURE **************************************** */

    // Créer une mesure - POST /api/mesures

  createMesure(mesure: CreateMesureDto): Observable<Mesure> {
  return this.http.post<Mesure>(`${this.apiUrl}/mesures`, mesure);
}


  // Obtenir les mesures d'un capteur - GET /api/mesures/capteur/{capteurId}
  getByCapteur(capteurId: number): Observable<Mesure[]> {
    return this.http.get<Mesure[]>(`${this.apiUrl}/mesures/capteur/${capteurId}`);
  }

  // Obtenir la dernière mesure d'un capteur - GET /api/mesures/capteur/{capteurId}/last
  getLastByCapteur(capteurId: number): Observable<Mesure> {
    return this.http.get<Mesure>(`${this.apiUrl}/mesures/capteur/${capteurId}/last`);
  }

  // Obtenir toutes les mesures (si votre backend le permet)
  getAllMesures(): Observable<Mesure[]> {
    return this.http.get<Mesure[]>(`${this.apiUrl}/mesures`);
  }



}