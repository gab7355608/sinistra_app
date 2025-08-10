import { Prisma } from "@/config/client";
import { ticketInclude } from "@/repositories";

export type TicketWithRelations = Prisma.TicketGetPayload<{
    include: typeof ticketInclude;
}>;

// Types pour les données spécifiques des accidents de voiture
export interface AccidentVoitureData {
  date: string;
  lieu: string;
  faits: string;
  nombrePersonnes: number;
  immatriculation: string;
  tiers: boolean;
  blesses: boolean;
  degats: {
    vehicule: string;
    estimation: string | null;
  };
}

// Types pour les données spécifiques des incendies
export interface IncendieData {
  date: string;
  lieu: string;
  faits: string;
  nombrePersonnes: number;
  typeBien: 'maison' | 'appartement' | 'local professionnel' | string;
  pompiers: boolean;
  dommagesImportants: boolean;
  origineIncendie: 'électrique' | 'gaz' | 'autre' | string;
  degats: {
    surface: string | null;
    pieces: string[];
    estimation: string | null;
  };
}

// Types pour les biens volés
export interface BienVole {
  objet: string;
  marque: string | null;
  modele: string | null;
  valeur: number;
}

// Types pour les données spécifiques des vols/cambriolages
export interface VolCambriolageData {
  date: string;
  lieu: string;
  faits: string;
  nombrePersonnes: number;
  plainte: boolean;
  numeroplainte: string | null;
  biensVoles: BienVole[];
  modeOperatoire: 'effraction' | 'escalade' | 'autre' | string;
  totalEstime: number;
}

// Types pour les données spécifiques des dégâts des eaux
export interface DegatEauxData {
  date: string;
  lieu: string;
  faits: string;
  nombrePersonnes: number;
  origineFuite: 'canalisation' | 'toiture' | 'appareil électroménager' | string;
  dommagesImportants: boolean;
  piecesTouchees: string[];
  degats: {
    type: ('mur' | 'sol' | 'mobilier' | string)[];
    surface: string | null;
    estimation: string | null;
  };
  interventionUrgence: boolean;
  degatsVoisins: boolean;
}

// Type union pour tous les types de données spécifiques
export type SpecificData = 
  | AccidentVoitureData 
  | IncendieData 
  | VolCambriolageData 
  | DegatEauxData;

// Type pour les données partielles (pendant la collecte)
export type PartialAccidentVoitureData = Partial<AccidentVoitureData> & {
  degats?: Partial<AccidentVoitureData['degats']>;
};

export type PartialIncendieData = Partial<IncendieData> & {
  degats?: Partial<IncendieData['degats']>;
};

export type PartialVolCambriolageData = Partial<VolCambriolageData> & {
  biensVoles?: Partial<BienVole>[];
};

export type PartialDegatEauxData = Partial<DegatEauxData> & {
  degats?: Partial<DegatEauxData['degats']>;
};

export type PartialSpecificData = 
  | PartialAccidentVoitureData 
  | PartialIncendieData 
  | PartialVolCambriolageData 
  | PartialDegatEauxData;

// Helper types pour la validation
export type SpecificDataByType = {
  ACCIDENT_VOITURE: AccidentVoitureData;
  INCENDIE: IncendieData;
  VOL_CAMBRIOLAGE: VolCambriolageData;
  DEGAT_EAUX: DegatEauxData;
};

export type PartialSpecificDataByType = {
  ACCIDENT_VOITURE: PartialAccidentVoitureData;
  INCENDIE: PartialIncendieData;
  VOL_CAMBRIOLAGE: PartialVolCambriolageData;
  DEGAT_EAUX: PartialDegatEauxData;
};



