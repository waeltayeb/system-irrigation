export interface Mesure {
  id: number;
  capteurId: number;
  valeur: number;
  unite: string;
  dateMesure: Date;
}

export interface MesureCourante {
  parcelleId: number;
  typeCapteur: string;
  valeur: number;
  unite: string;
  dateMesure: Date;
}

export interface CreateMesureDto {
  capteurId: number;
  valeur: number;
  unite: string;
}
