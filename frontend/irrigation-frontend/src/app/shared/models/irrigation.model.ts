export enum StatutIrrigation {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE'
}

export interface ActionIrrigation {
  id: number;
  parcelleId: number;
  dateDebut: Date;
  duree: number;
  volumeEau: number;
  statut: StatutIrrigation;
}