export interface EmissionDataPoint {
  year: number;
  Energy: number;
  Industry: number;
  Agriculture: number;
  Transport: number;
  Waste: number;
  [key: string]: number;
}

export interface SectorStat {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface SectorEmission {
  AssetCount: number;
  Emissions: number;
  Year: number | null;
  Month: number | null;
  Gas: string;
  Sector: string;
}

export interface SectorEmissionResponse {
  all: SectorEmission[];
}

export interface Asset {
  id: string;
  name: string;
  country: string;
  sector: string;
  emissions: number; // In Tonnes
  lastUpdate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
  isThinking?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum ChartType {
  AREA = 'Area',
  BAR = 'Bar',
  LINE = 'Line'
}