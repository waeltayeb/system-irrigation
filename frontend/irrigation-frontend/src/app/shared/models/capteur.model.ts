export enum TypeCapteur {
  HUMIDITE = 'HUMIDITE',
  TEMPERATURE = 'TEMPERATURE',
}

export interface Capteur {
  id: number;
  type: TypeCapteur;
  localisation: string;
  etat: string;
  dateInstallation: Date;
}