export enum UnitStatus {
  AVAILABLE = 'Available',
  SOLD = 'Sold',
  RESERVED = 'Reserved',
  LOCKED = 'Locked'
}

export interface Unit {
  id: string;
  number: string;
  floor: number;
  tower: string;
  type: string; // e.g., "3BHK", "4BHK"
  sqft: number;
  price: string;
  status: UnitStatus;
  description?: string;
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedUnitId: string | null;
}

export interface AccessCode {
  code: string;
  buyerId: string;
  unitId: string;
  generatedAt: number;
  expiresAt: number; // 1 hour validity from first use or absolute time
  isUsed: boolean;
  firstUsedAt?: number;
}

export interface TourSession {
  isActive: boolean;
  startTime: number;
  buyerId: string;
  builderLive: boolean;
}

// Chart Data Types
export interface VisitData {
  name: string;
  visits: number;
  avgTime: number; // minutes
}