
// src/services/assetService.ts
import type { Asset, NewAssetData, UpdateAssetData, AssetCharacteristic } from '@/types/asset';
import { generateAssetTag } from '@/lib/utils';
import { MOCK_COMPANY_ID, allAssetsMockData as initialMockAssetsDB } from '@/lib/mock-data'; // For mock company context

// MOCK DATA - In a real app, this would be fetched from/saved to Firestore
// This array will be mutated by the mock functions.
// The initial data now comes from mock-data.ts which includes companyId
let mockAssetsDB: Asset[] = initialMockAssetsDB.map(asset => ({
  ...asset,
  // Ensure dates are Date objects if they are not already
  rentalStartDate: asset.rentalStartDate ? new Date(asset.rentalStartDate) : undefined,
  rentalEndDate: asset.rentalEndDate ? new Date(asset.rentalEndDate) : undefined,
  createdAt: asset.createdAt ? new Date(asset.createdAt) : new Date(),
  updatedAt: asset.updatedAt ? new Date(asset.updatedAt) : new Date(),
}));


/**
 * Fetches assets for a given company.
 */
export async function getAssets(companyId: string): Promise<Asset[]> {
  console.log(`[AssetService] Fetching assets for company: ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate delay
  return mockAssetsDB.filter(asset => asset.companyId === companyId);
}

/**
 * Fetches a single asset by its ID and company ID.
 */
export async function getAssetById(assetId: string, companyId: string): Promise<Asset | null> {
  console.log(`[AssetService] Fetching asset by ID: ${assetId} for company: ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const asset = mockAssetsDB.find(a => a.id === assetId && a.companyId === companyId);
  return asset ? { ...asset } : null; // Return a copy
}

/**
 * Creates a new asset for a specific company.
 */
export async function createAsset(
  companyId: string,
  assetData: NewAssetData,
  photos: File[] 
): Promise<{ id: string, tag: string }> {
  console.log(`[AssetService] Creating asset for company: ${companyId}`, assetData, photos);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let newTag = generateAssetTag();
  // Ensure tag is unique within the company
  while (mockAssetsDB.some(asset => asset.companyId === companyId && asset.tag === newTag)) {
    console.warn(`[AssetService] Tag collision for ${newTag} in company ${companyId}. Regenerating...`);
    newTag = generateAssetTag();
  }

  const newId = `ASSET${Math.floor(Math.random() * 90000) + 10000}`; 
  
  const photoUrls: Asset['photos'] = photos.map((file, index) => ({
    id: `newphoto-${newId}-${index}`,
    url: URL.createObjectURL(file), 
    name: file.name,
  }));

  const newAsset: Asset = {
    ...assetData,
    id: newId,
    tag: newTag,
    companyId, // Crucial for multi-tenancy
    photos: photoUrls,
    characteristics: assetData.characteristics?.map(c => ({...c, id: `char-${Date.now()}-${Math.random().toString(16).slice(2)}`, isActive: true})) || [],
    attachments: assetData.attachments?.map(att => ({...att, id: `attach-${Date.now()}-${Math.random().toString(16).slice(2)}`})) || [],
    status: assetData.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockAssetsDB.push(newAsset);
  return { id: newAsset.id, tag: newAsset.tag };
}

/**
 * Updates an existing asset, ensuring it belongs to the correct company.
 */
export async function updateAsset(
  assetId: string,
  companyId: string,
  assetData: UpdateAssetData,
  newPhotos: File[], 
  photosToRemove: string[] 
): Promise<void> {
  console.log(`[AssetService] Updating asset: ${assetId} for company: ${companyId}`, assetData, newPhotos, photosToRemove);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const assetIndex = mockAssetsDB.findIndex(a => a.id === assetId && a.companyId === companyId);
  if (assetIndex === -1) {
    throw new Error("Asset not found or not authorized to update for this company.");
  }

  let currentAsset = mockAssetsDB[assetIndex];

  let updatedPhotos = currentAsset.photos.filter(p => p.id && !photosToRemove.includes(p.id));
  const newPhotoUrls: Asset['photos'] = newPhotos.map((file, index) => ({
    id: `updatedphoto-${assetId}-${index}-${Date.now()}`,
    url: URL.createObjectURL(file), 
    name: file.name,
  }));
  updatedPhotos = [...updatedPhotos, ...newPhotoUrls];

  const formCharacteristics = assetData.characteristics || [];
  const updatedCharacteristics = currentAsset.characteristics.map(existingChar => {
      const formChar = formCharacteristics.find(fc => fc.id === existingChar.id);
      if (formChar) {
          return { ...existingChar, ...formChar }; // Update existing
      }
      // If not in form and was active, it might be an implicit deactivation if not handled explicitly by `isActive` flag
      // However, the current logic in EditAssetPage sends all characteristics with isActive flag.
      return existingChar;
  }).filter(char => char.isActive !== false); // Filter out those explicitly marked inactive

  const newCharacteristicsFromForm = formCharacteristics.filter(fc => !fc.id);
  const finalCharacteristics = [
      ...updatedCharacteristics,
      ...newCharacteristicsFromForm.map(nc => ({...nc, id: `char-${Date.now()}-${Math.random().toString(16).slice(2)}`, isActive: true} as AssetCharacteristic))
  ];
  
  const finalAttachments = assetData.attachments?.map(att => att.id ? att : {...att, id: `attach-${Date.now()}-${Math.random().toString(16).slice(2)}`}) || currentAsset.attachments;


  mockAssetsDB[assetIndex] = {
    ...currentAsset,
    ...assetData,
    photos: updatedPhotos,
    characteristics: finalCharacteristics,
    attachments: finalAttachments as AssetAttachment[], // Ensure type
    updatedAt: new Date(),
  };
}

/**
 * Deletes an asset, ensuring it belongs to the correct company.
 */
export async function deleteAsset(assetId: string, companyId: string): Promise<void> {
  console.log(`[AssetService] Deleting asset: ${assetId} for company: ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const initialLength = mockAssetsDB.length;
  mockAssetsDB = mockAssetsDB.filter(a => !(a.id === assetId && a.companyId === companyId));
  
  if (mockAssetsDB.length === initialLength) {
    console.warn(`Asset ${assetId} not found for deletion or companyId mismatch with ${companyId}.`);
  }
}

// --- Other MOCK service functions needed by asset forms (now company-scoped) ---
export async function fetchCategoriesForSelect(companyId: string): Promise<string[]> {
    console.log(`[AssetService] Fetching categories for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Categories can be global or company-specific. For now, global.
    return ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Veículos', 'Outros'];
}

// Locations should be company-specific
export async function fetchLocationsForSelect(companyId: string): Promise<{ id: string; name: string }[]> {
    console.log(`[AssetService] Fetching locations for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock: filter locations by companyId if they had one, or return generic for now.
    // This mock assumes locations are generic or we need to add companyId to them too.
    if (companyId === MOCK_COMPANY_ID) {
        return [
          { id: 'loc1-xyz', name: 'Escritório 1 (XYZ)' },
          { id: 'loc2-xyz', name: 'Escritório 2 (XYZ)' },
          { id: 'loc3-xyz', name: 'Sala de Reuniões (XYZ)' },
        ];
    } else if (companyId === 'COMPANY_ABC') {
         return [
          { id: 'loc1-abc', name: 'Escritório ABC Principal' },
          { id: 'loc2-abc', name: 'Depósito ABC' },
        ];
    }
    return [];
}

// Users should be company-specific
export async function fetchUsersForSelect(companyId: string): Promise<{ id: string; name: string }[]> {
    console.log(`[AssetService] Fetching users for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock: filter users by companyId
    const companyUsers = {
        [MOCK_COMPANY_ID]: [
          { id: 'user1', name: 'João Silva (XYZ)' },
          { id: 'user2-xyz', name: 'Maria Oliveira (XYZ)' },
          { id: 'user3-xyz', name: 'Carlos Pereira (XYZ)' },
        ],
        ['COMPANY_ABC']: [
            { id: 'admin-abc-id', name: 'Alice Braga (ABC)' },
            { id: 'user6-abc', name: 'Bruno Lima (ABC)' },
        ]
    };
    return companyUsers[companyId as keyof typeof companyUsers] || [];
}

// Parent assets should be company-specific
export async function fetchParentAssetsForSelect(companyId: string, excludeAssetId?: string): Promise<{ id: string; name: string; tag: string }[]> {
  console.log(`[AssetService] Fetching parent assets for company: ${companyId}, excluding: ${excludeAssetId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAssetsDB
    .filter(asset => asset.companyId === companyId && asset.id !== excludeAssetId)
    .map(asset => ({ id: asset.id, name: asset.name, tag: asset.tag }));
}
