// src/types/asset.ts

// For characteristics that are part of an asset
export interface AssetCharacteristic {
  id?: string; // Optional: only for existing characteristics during edit
  key: string;
  value: string;
  isPublic: boolean;
  isActive?: boolean; // For logical deletion, true by default on creation
}

// For photos associated with an asset
export interface AssetPhoto {
  id?: string; // Optional: only for existing photos during edit
  url: string;
  name?: string; // Original file name or a description
}

// For attachments (external links) associated with an asset
export interface AssetAttachment {
  id?: string; // Optional: only for existing attachments during edit
  name: string;
  url: string;
  isPublic: boolean;
}

// Main Asset data structure
export interface Asset {
  id: string; // Document ID in Firestore
  companyId: string; // ID of the company this asset belongs to
  name: string;
  category: string;
  tag: string; // Unique (within company) 5-character alphanumeric tag
  locationId: string;
  responsibleUserId: string;
  parentId?: string; // ID of the parent asset, if any
  
  ownershipType: 'own' | 'rented';
  rentalCompany?: string;
  rentalStartDate?: Date; // Store as ISO string in DB, convert to Date in app
  rentalEndDate?: Date;   // Store as ISO string in DB, convert to Date in app
  rentalCost?: number;

  description?: string;
  status: 'active' | 'lost' | 'inactive' | 'maintenance'; // Added 'maintenance' status

  characteristics: AssetCharacteristic[];
  photos: AssetPhoto[];
  attachments: AssetAttachment[];

  // New fields for Expiration Schedule
  nextMaintenanceDate?: Date;
  lastMaintenanceDate?: Date;
  maintenanceIntervalDays?: number;
  
  certificationName?: string; // e.g., "NR-10", "ISO 9001"
  certificationExpiryDate?: Date;
  
  warrantyExpiryDate?: Date;
  
  lastInventoryDate?: Date;
  nextInventoryDate?: Date;
  inventoryIntervalDays?: number;

  createdAt: Date; // Store as Timestamp in DB, convert to Date in app
  updatedAt: Date; // Store as Timestamp in DB, convert to Date in app

  // Optional denormalized fields for easier display - consider if needed
  locationName?: string;
  responsibleUserName?: string;
  parentTagName?: string; 
}

// Type for creating a new asset (some fields are auto-generated or set by default)
export type NewAssetData = Omit<Asset, 'id' | 'tag' | 'companyId' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: Asset['status']; // Allow setting initial status, defaults to 'active' if not provided
};

// Type for updating an asset (all fields are optional)
export type UpdateAssetData = Partial<Omit<Asset, 'id' | 'tag' | 'companyId' | 'createdAt' | 'updatedAt'>>;