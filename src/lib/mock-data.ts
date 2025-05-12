// src/lib/mock-data.ts

// --- Mock Data Structures ---
export interface AssetForMyDashboard {
  id: string;
  name: string;
  tag: string;
  status: 'active' | 'lost' | 'inactive' | 'maintenance';
  locationName: string;
  category: string;
  responsibleUserId: string;
  ownership: 'own' | 'rented';
}

export interface TransferRequest {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName?: string;
  requestDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
  processedDate?: Date;
}

export interface UserForSelect {
  id: string;
  name: string;
}

// Mock Logged-in User ID
export const MOCK_LOGGED_IN_USER_ID = 'user1';
export const MOCK_LOGGED_IN_USER_NAME = 'João Silva';

export let allAssetsMockData: AssetForMyDashboard[] = [
  { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', category: 'Eletrônicos', tag: 'AB12C', locationName: 'Escritório 1', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'active', ownership: 'own' },
  { id: 'ASSET002', name: 'Monitor LG 27"', category: 'Eletrônicos', tag: 'DE34F', locationName: 'Escritório 2', responsibleUserId: 'user2', status: 'active', ownership: 'own' },
  { id: 'ASSET003', name: 'Cadeira de Escritório', category: 'Mobiliário', tag: 'GH56I', locationName: 'Sala de Reuniões', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'lost', ownership: 'rented' },
  { id: 'ASSET004', name: 'Projetor Epson PowerLite', category: 'Eletrônicos', tag: 'JK78L', locationName: 'Sala de Treinamento', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'maintenance', ownership: 'own' },
  { id: 'ASSET005', name: 'Teclado Gamer RGB', category: 'Eletrônicos', tag: 'MN90P', locationName: 'Escritório 1', responsibleUserId: 'user2', status: 'inactive', ownership: 'own' },
  { id: 'ASSET006', name: 'Impressora Multifuncional HP', category: 'Eletrônicos', tag: 'QR12S', locationName: 'Recepção', responsibleUserId: 'user3', status: 'active', ownership: 'own' },
];

export let mockTransferRequests: TransferRequest[] = [
    { id: 'transfer1', assetId: 'ASSET002', assetName: 'Monitor LG 27"', assetTag: 'DE34F', fromUserId: 'user2', fromUserName: 'Maria Oliveira', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 'transfer2', assetId: 'ASSET005', assetName: 'Teclado Gamer RGB', assetTag: 'MN90P', fromUserId: 'user2', fromUserName: 'Maria Oliveira', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 'transfer3', assetId: 'ASSET006', assetName: 'Impressora Multifuncional HP', assetTag: 'QR12S', fromUserId: 'user3', fromUserName: 'Carlos Pereira', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'accepted', processedDate: new Date(Date.now() - 23 * 60 * 60 * 1000) },
];

export const mockUsersForSelect: UserForSelect[] = [
    { id: 'user1', name: 'João Silva' },
    { id: 'user2', name: 'Maria Oliveira' },
    { id: 'user3', name: 'Carlos Pereira' },
    { id: 'user4', name: 'Ana Costa' },
];
