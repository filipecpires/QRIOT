
// src/services/assetService.ts
import type { Asset, NewAssetData, UpdateAssetData, AssetCharacteristic } from '@/types/asset';
import { generateAssetTag } from '@/lib/utils';
import { MOCK_COMPANY_ID } from '@/lib/mock-data'; // For mock company context

// MOCK DATA - In a real app, this would be fetched from/saved to Firestore
// This array will be mutated by the mock functions.
let mockAssetsDB: Asset[] = [
  { 
    id: 'ASSET001', 
    companyId: MOCK_COMPANY_ID,
    name: 'Notebook Dell Latitude 7400', 
    category: 'Eletrônicos', 
    tag: 'AB12C', 
    locationId: 'loc1', 
    responsibleUserId: 'user1', 
    ownershipType: 'own',
    status: 'active', 
    characteristics: [
        { id: 'char1', key: 'Processador', value: 'Intel Core i7', isPublic: true, isActive: true },
        { id: 'char2', key: 'Memória RAM', value: '16GB', isPublic: true, isActive: true },
    ],
    photos: [{id: 'p1', url: 'https://picsum.photos/seed/asset001/200/150'}],
    attachments: [{id: 'a1', name: 'Manual', url: 'https://example.com/manual.pdf', isPublic: true}],
    createdAt: new Date(2023, 0, 15),
    updatedAt: new Date(2023, 0, 15),
    description: 'Notebook para desenvolvimento.',
  },
  { 
    id: 'ASSET002', 
    companyId: MOCK_COMPANY_ID,
    name: 'Monitor LG 27"', 
    category: 'Eletrônicos', 
    tag: 'DE34F', 
    locationId: 'loc2', 
    responsibleUserId: 'user2',
    ownershipType: 'rented',
    rentalCompany: 'LocaTech',
    rentalStartDate: new Date(2024, 0, 1),
    rentalEndDate: new Date(2024, 11, 31),
    rentalCost: 75.00,
    status: 'active', 
    characteristics: [],
    photos: [],
    attachments: [],
    createdAt: new Date(2023, 1, 20),
    updatedAt: new Date(2023, 1, 20),
  },
   { 
    id: 'ASSET003', 
    companyId: MOCK_COMPANY_ID,
    name: 'Cadeira de Escritório', 
    category: 'Mobiliário', 
    tag: 'GH56I', 
    locationId: 'loc1', 
    responsibleUserId: 'user1',
    ownershipType: 'own',
    status: 'lost', 
    characteristics: [],
    photos: [],
    attachments: [],
    createdAt: new Date(2023, 2, 10),
    updatedAt: new Date(2023, 2, 10),
  },
  { 
    id: 'ASSET004', 
    companyId: MOCK_COMPANY_ID,
    name: 'Projetor Epson PowerLite', 
    category: 'Eletrônicos', 
    tag: 'JK78L', 
    locationId: 'loc3', 
    responsibleUserId: 'user3',
    ownershipType: 'own',
    status: 'inactive', 
    characteristics: [],
    photos: [],
    attachments: [],
    createdAt: new Date(2023, 3, 5),
    updatedAt: new Date(2023, 3, 5),
  },
  // Add more mock assets as needed
];

/**
 * Fetches assets for a given company.
 * TODO: Implement actual Firebase Firestore query.
 */
export async function getAssets(companyId: string): Promise<Asset[]> {
  console.log(`[AssetService] Fetching assets for company: ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate delay
  return mockAssetsDB.filter(asset => asset.companyId === companyId);
}

/**
 * Fetches a single asset by its ID and company ID.
 * TODO: Implement actual Firebase Firestore query.
 */
export async function getAssetById(assetId: string, companyId: string): Promise<Asset | null> {
  console.log(`[AssetService] Fetching asset by ID: ${assetId} for company: ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const asset = mockAssetsDB.find(a => a.id === assetId && a.companyId === companyId);
  return asset ? { ...asset } : null; // Return a copy
}

/**
 * Creates a new asset.
 * TODO: Implement Firebase Firestore document creation and Firebase Storage photo uploads.
 */
export async function createAsset(
  companyId: string,
  assetData: NewAssetData,
  photos: File[] // Array of files to upload
): Promise<{ id: string, tag: string }> {
  console.log(`[AssetService] Creating asset for company: ${companyId}`, assetData, photos);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newTag = generateAssetTag(); // Generate unique tag
  // TODO: Ensure tag is unique within the company in a real backend

  const newId = `ASSET${Math.floor(Math.random() * 9000) + 1000}`; // Mock ID
  
  // Simulate photo upload and get URLs
  const photoUrls: Asset['photos'] = photos.map((file, index) => ({
    id: `newphoto-${newId}-${index}`,
    url: URL.createObjectURL(file), // Placeholder, replace with actual storage URL
    name: file.name,
  }));

  const newAsset: Asset = {
    ...assetData,
    id: newId,
    tag: newTag,
    companyId,
    photos: photoUrls,
    characteristics: assetData.characteristics?.map(c => ({...c, isActive: true})) || [], // Ensure isActive is set
    attachments: assetData.attachments || [],
    status: assetData.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockAssetsDB.push(newAsset);
  return { id: newAsset.id, tag: newAsset.tag };
}

/**
 * Updates an existing asset.
 * TODO: Implement Firebase Firestore document update and Firebase Storage photo uploads/deletions.
 */
export async function updateAsset(
  assetId: string,
  companyId: string,
  assetData: UpdateAssetData,
  newPhotos: File[], // New files to upload
  photosToRemove: string[] // IDs of existing photos to remove
): Promise<void> {
  console.log(`[AssetService] Updating asset: ${assetId} for company: ${companyId}`, assetData, newPhotos, photosToRemove);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const assetIndex = mockAssetsDB.findIndex(a => a.id === assetId && a.companyId === companyId);
  if (assetIndex === -1) {
    throw new Error("Asset not found or not authorized to update.");
  }

  // Simulate photo removal
  let updatedPhotos = mockAssetsDB[assetIndex].photos.filter(p => p.id && !photosToRemove.includes(p.id));

  // Simulate new photo upload
  const newPhotoUrls: Asset['photos'] = newPhotos.map((file, index) => ({
    id: `updatedphoto-${assetId}-${index}-${Date.now()}`,
    url: URL.createObjectURL(file), // Placeholder
    name: file.name,
  }));
  updatedPhotos = [...updatedPhotos, ...newPhotoUrls];

  // Update characteristics: mark as inactive or update existing ones
  const updatedCharacteristics = mockAssetsDB[assetIndex].characteristics.map(existingChar => {
    const formChar = assetData.characteristics?.find(fc => fc.id === existingChar.id);
    if (formChar) { // If found in submitted data, update it
        return { ...existingChar, ...formChar };
    }
    // If not in submitted form data, it means it was either removed (isActive=false) or unchanged.
    // The `assetData.characteristics` from the form should contain all characteristics, including those marked `isActive: false`.
    return existingChar; 
  });

  // Add new characteristics (those without an ID from form)
  const newCharacteristicsFromForm = assetData.characteristics?.filter(fc => !fc.id) || [];
  const allCharacteristics = [...updatedCharacteristics, ...newCharacteristicsFromForm.map(nc => ({...nc, id: `char-${Date.now()}-${Math.random()}`, isActive: true} as AssetCharacteristic))];


  mockAssetsDB[assetIndex] = {
    ...mockAssetsDB[assetIndex],
    ...assetData,
    photos: updatedPhotos,
    characteristics: allCharacteristics,
    updatedAt: new Date(),
  };
}

/**
 * Deletes an asset.
 * TODO: Implement Firebase Firestore document deletion and Firebase Storage photo deletions.
 */
export async function deleteAsset(assetId: string, companyId: string): Promise<void> {
  console.log(`[AssetService] Deleting asset: ${assetId} for company: ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const initialLength = mockAssetsDB.length;
  mockAssetsDB = mockAssetsDB.filter(a => !(a.id === assetId && a.companyId === companyId));
  
  if (mockAssetsDB.length === initialLength) {
    //   throw new Error("Asset not found or not authorized to delete.");
    // For mock, let's not throw, just log.
    console.warn(`Asset ${assetId} not found for deletion or companyId mismatch.`);
  }
  // TODO: Delete associated photos from Firebase Storage.
}

// --- Other MOCK service functions needed by asset forms ---
export async function fetchCategoriesForSelect(companyId: string): Promise<string[]> {
    console.log(`[AssetService] Fetching categories for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Veículos', 'Outros'];
}

export async function fetchLocationsForSelect(companyId: string): Promise<{ id: string; name: string }[]> {
    console.log(`[AssetService] Fetching locations for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'loc1', name: 'Escritório 1' },
      { id: 'loc2', name: 'Escritório 2' },
      { id: 'loc3', name: 'Sala de Reuniões' },
    ];
}

export async function fetchUsersForSelect(companyId: string): Promise<{ id: string; name: string }[]> {
    console.log(`[AssetService] Fetching users for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'user1', name: 'João Silva' },
      { id: 'user2', name: 'Maria Oliveira' },
      { id: 'user3', name: 'Carlos Pereira' },
    ];
}

export async function fetchParentAssetsForSelect(companyId: string, excludeAssetId?: string): Promise<{ id: string; name: string; tag: string }[]> {
  console.log(`[AssetService] Fetching parent assets for company: ${companyId}, excluding: ${excludeAssetId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAssetsDB
    .filter(asset => asset.companyId === companyId && asset.id !== excludeAssetId)
    .map(asset => ({ id: asset.id, name: asset.name, tag: asset.tag }));
}
