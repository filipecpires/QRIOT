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

// Default Mock Logged-in User (can be used as a base or for non-demo scenarios)
export const MOCK_LOGGED_IN_USER_ID = 'user1';
export const MOCK_LOGGED_IN_USER_NAME = 'João Silva (Padrão)';


export const DEMO_USER_PROFILES = {
  "Administrador": { id: "admin-demo-id", name: "Demo Administrador", role: "Administrador" as const },
  "Gerente": { id: "manager-demo-id", name: "Demo Gerente", role: "Gerente" as const },
  "Técnico": { id: "tech-demo-id", name: "Demo Técnico", role: "Técnico" as const },
  "Inventariante": { id: "inventory-demo-id", name: "Demo Inventariante", role: "Inventariante" as const },
  "Funcionário": { id: "employee-demo-id", name: "Demo Funcionário", role: "Funcionário" as const },
};


export let allAssetsMockData: AssetForMyDashboard[] = [
  // Assets for João Silva (Padrão / Funcionário Demo if 'employee-demo-id' is 'user1')
  { id: 'ASSET001', name: 'Notebook Dell Latitude 7400 (do João)', category: 'Eletrônicos', tag: 'AB12C', locationName: 'Escritório 1', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'active', ownership: 'own' },
  { id: 'ASSET003', name: 'Cadeira de Escritório (do João)', category: 'Mobiliário', tag: 'GH56I', locationName: 'Sala de Reuniões', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'lost', ownership: 'rented' },
  { id: 'ASSET004', name: 'Projetor Epson PowerLite (do João)', category: 'Eletrônicos', tag: 'JK78L', locationName: 'Sala de Treinamento', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'maintenance', ownership: 'own' },

  // Assets for Demo Gerente (manager-demo-id)
  { id: 'ASSET101', name: 'Tablet Samsung Galaxy Tab S9 (do Demo Gerente)', category: 'Eletrônicos', tag: 'MG10A', locationName: 'Escritório Gerência', responsibleUserId: DEMO_USER_PROFILES.Gerente.id, status: 'active', ownership: 'own' },
  { id: 'ASSET102', name: 'Dockstation USB-C (do Demo Gerente)', category: 'Acessórios', tag: 'MG10B', locationName: 'Escritório Gerência', responsibleUserId: DEMO_USER_PROFILES.Gerente.id, status: 'active', ownership: 'own' },
  
  // Assets for Demo Administrador (admin-demo-id)
  { id: 'ASSET201', name: 'Servidor PowerEdge R750 (do Demo Admin)', category: 'Infraestrutura', tag: 'AD20X', locationName: 'Data Center Principal', responsibleUserId: DEMO_USER_PROFILES.Administrador.id, status: 'active', ownership: 'own' },
  { id: 'ASSET202', name: 'Switch Cisco Catalyst (do Demo Admin)', category: 'Redes', tag: 'AD20Y', locationName: 'Data Center Principal', responsibleUserId: DEMO_USER_PROFILES.Administrador.id, status: 'maintenance', ownership: 'own' },

  // Assets for Demo Técnico (tech-demo-id)
  { id: 'ASSET301', name: 'Kit Ferramentas Manutenção (do Demo Técnico)', category: 'Ferramentas', tag: 'TC30K', locationName: 'Bancada Técnica', responsibleUserId: DEMO_USER_PROFILES.Técnico.id, status: 'active', ownership: 'own'},

  // Assets for Demo Inventariante (inventory-demo-id)
  { id: 'ASSET401', name: 'Coletor de Dados Zebra (do Demo Inventariante)', category: 'Equipamentos', tag: 'IN40C', locationName: 'Em Trânsito', responsibleUserId: DEMO_USER_PROFILES.Inventariante.id, status: 'active', ownership: 'rented'},

  // Unassigned or for other users not part of specific demos here
  { id: 'ASSET002', name: 'Monitor LG 27" (de Maria)', category: 'Eletrônicos', tag: 'DE34F', locationName: 'Escritório 2', responsibleUserId: 'user2', status: 'active', ownership: 'own' },
  { id: 'ASSET005', name: 'Teclado Gamer RGB (de Maria)', category: 'Eletrônicos', tag: 'MN90P', locationName: 'Escritório 1', responsibleUserId: 'user2', status: 'inactive', ownership: 'own' },
  { id: 'ASSET006', name: 'Impressora Multifuncional HP (de Carlos)', category: 'Eletrônicos', tag: 'QR12S', locationName: 'Recepção', responsibleUserId: 'user3', status: 'active', ownership: 'own' },
];

// Ensure employee-demo-id maps to user1 if that's the intent
if (DEMO_USER_PROFILES.Funcionário.id !== MOCK_LOGGED_IN_USER_ID) {
    // This is a sanity check. If employee-demo-id is different, ensure assets are assigned to it.
    // For this example, we assume employee-demo-id is user1 (MOCK_LOGGED_IN_USER_ID).
    // If you change DEMO_USER_PROFILES.Funcionário.id, add assets for that ID above.
    console.warn("DEMO_USER_PROFILES.Funcionário.id might not align with MOCK_LOGGED_IN_USER_ID's assets. Please verify mock data.");
}


export let mockTransferRequests: TransferRequest[] = [
    // Incoming for João Silva (Padrão / Funcionário Demo)
    { id: 'transfer1', assetId: 'ASSET002', assetName: 'Monitor LG 27" (de Maria)', assetTag: 'DE34F', fromUserId: 'user2', fromUserName: 'Maria Oliveira', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'pending' },
    
    // Incoming for Demo Gerente
    { id: 'transfer4', assetId: 'ASSET006', assetName: 'Impressora Multifuncional HP (de Carlos)', assetTag: 'QR12S', fromUserId: 'user3', fromUserName: 'Carlos Pereira', toUserId: DEMO_USER_PROFILES.Gerente.id, toUserName: DEMO_USER_PROFILES.Gerente.name, requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'pending' },
    
    // Outgoing from João Silva (Padrão / Funcionário Demo) to Demo Gerente
    { id: 'transfer2', assetId: 'ASSET003', assetName: 'Cadeira de Escritório (do João)', assetTag: 'GH56I', fromUserId: MOCK_LOGGED_IN_USER_ID, fromUserName: MOCK_LOGGED_IN_USER_NAME, toUserId: DEMO_USER_PROFILES.Gerente.id, toUserName: DEMO_USER_PROFILES.Gerente.name, requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'pending' },

    // Already processed
    { id: 'transfer3', assetId: 'ASSET005', assetName: 'Teclado Gamer RGB (de Maria)', assetTag: 'MN90P', fromUserId: 'user2', fromUserName: 'Maria Oliveira', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'accepted', processedDate: new Date(Date.now() - 4* 24 * 60 * 60 * 1000) },
];

export const mockUsersForSelect: UserForSelect[] = [
    { id: MOCK_LOGGED_IN_USER_ID, name: MOCK_LOGGED_IN_USER_NAME }, // João Silva (Padrão)
    { id: 'user2', name: 'Maria Oliveira' },
    { id: 'user3', name: 'Carlos Pereira' },
    { id: 'user4', name: 'Ana Costa' },
    // Add demo profile users here if they should be selectable for transfer
    { id: DEMO_USER_PROFILES.Administrador.id, name: DEMO_USER_PROFILES.Administrador.name },
    { id: DEMO_USER_PROFILES.Gerente.id, name: DEMO_USER_PROFILES.Gerente.name },
    { id: DEMO_USER_PROFILES.Técnico.id, name: DEMO_USER_PROFILES.Técnico.name },
    { id: DEMO_USER_PROFILES.Inventariante.id, name: DEMO_USER_PROFILES.Inventariante.name },
    // employee-demo-id might be the same as MOCK_LOGGED_IN_USER_ID, so no need to duplicate if so.
    // Ensure employee-demo-id is distinct if they are different mock users.
    // For this example, we'll assume DEMO_USER_PROFILES.Funcionário.id is MOCK_LOGGED_IN_USER_ID.
];
// Filter out duplicates just in case
const uniqueMockUsers = Array.from(new Map(mockUsersForSelect.map(user => [user.id, user])).values());
export const finalMockUsersForSelect = uniqueMockUsers;
