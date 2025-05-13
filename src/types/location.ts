
// src/types/location.ts

export interface LocationData {
  id: string; // Document ID in Firestore
  companyId: string; // ID of the company this location belongs to
  name: string;
  latitude: number;
  longitude: number;
  assetCount?: number; // Optional: Denormalized count of assets in this location
  createdAt: Date;
  updatedAt: Date;
}
