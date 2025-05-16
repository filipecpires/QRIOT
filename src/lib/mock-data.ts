// src/lib/mock-data.ts
import type { AssetForMyDashboard, UserForSelect, UserData, TransferRequest, CompanyDetails, LicenseInfo, BillingInfo, PaymentHistoryEntry, Asset } from '@/types'; // Added Asset
import type { UserRole } from '@/types/user'; // Import UserRole

// --- Mock Company ID ---
export const MOCK_COMPANY_ID = 'COMPANY_XYZ';
export const ANOTHER_MOCK_COMPANY_ID = 'COMPANY_ABC'; // For demonstrating segregation

// Default Mock Logged-in User (can be used as a base or for non-demo scenarios)
export const MOCK_LOGGED_IN_USER_ID = 'user1'; // Belongs to COMPANY_XYZ
export const MOCK_LOGGED_IN_USER_NAME = 'João Silva (Empresa XYZ)';


export const DEMO_USER_PROFILES: Record<string, { id: string; name: string; role: UserRole; companyId: string }> = {
  "Administrador": { id: "admin-demo-id", name: "Demo Administrador (Empresa XYZ)", role: "Administrador", companyId: MOCK_COMPANY_ID },
  "Gerente": { id: "manager-demo-id", name: "Demo Gerente (Empresa XYZ)", role: "Gerente", companyId: MOCK_COMPANY_ID },
  "Técnico": { id: "tech-demo-id", name: "Demo Técnico (Empresa XYZ)", role: "Técnico", companyId: MOCK_COMPANY_ID },
  "Inventariante": { id: "inventory-demo-id", name: "Demo Inventariante (Empresa XYZ)", role: "Inventariante", companyId: MOCK_COMPANY_ID },
  "Funcionário": { id: "employee-demo-id", name: "Demo Funcionário (Empresa XYZ)", role: "Funcionário", companyId: MOCK_COMPANY_ID },
  "Admin Empresa ABC": { id: "admin-abc-id", name: "Admin (Empresa ABC)", role: "Administrador", companyId: ANOTHER_MOCK_COMPANY_ID },
};


export let allAssetsMockData: Asset[] = [ // Changed type to Asset
  // Assets for COMPANY_XYZ
  { 
    id: 'ASSET001', companyId: MOCK_COMPANY_ID, name: 'Notebook Dell Latitude 7400 (XYZ)', category: 'Eletrônicos', tag: 'AB12C', 
    locationId: 'loc1-xyz', locationName: 'Escritório 1 (XYZ)', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'active', ownershipType: 'own', 
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 1, 1), updatedAt: new Date(),
    nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next maintenance in 30 days
    warrantyExpiryDate: new Date(2025, 5, 15),
    nextInventoryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Next inventory in 15 days
  },
  { 
    id: 'ASSET003', companyId: MOCK_COMPANY_ID, name: 'Cadeira de Escritório (XYZ)', category: 'Mobiliário', tag: 'GH56I', 
    locationId: 'loc3-xyz', locationName: 'Sala de Reuniões (XYZ)', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'lost', ownershipType: 'rented',
    rentalCompany: 'LocaMais', rentalStartDate: new Date(2024, 0, 10), rentalEndDate: new Date(2025, 0, 9),
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 2, 10), updatedAt: new Date(),
  },
  { 
    id: 'ASSET004', companyId: MOCK_COMPANY_ID, name: 'Projetor Epson PowerLite (XYZ)', category: 'Eletrônicos', tag: 'JK78L', 
    locationId: 'loc1-xyz', locationName: 'Sala de Treinamento (XYZ)', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'maintenance', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 3, 5), updatedAt: new Date(),
    certificationName: "Segurança Elétrica",
    certificationExpiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
  },
  { 
    id: 'ASSET101', companyId: MOCK_COMPANY_ID, name: 'Tablet Samsung Galaxy Tab S9 (Gerente XYZ)', category: 'Eletrônicos', tag: 'MG10A', 
    locationId: 'loc2-xyz', locationName: 'Escritório Gerência (XYZ)', responsibleUserId: DEMO_USER_PROFILES.Gerente.id, status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 4, 1), updatedAt: new Date(),
    warrantyExpiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Warranty expires in 5 days
  },
  { 
    id: 'ASSET102', companyId: MOCK_COMPANY_ID, name: 'Dockstation USB-C (Gerente XYZ)', category: 'Acessórios', tag: 'MG10B', 
    locationId: 'loc2-xyz', locationName: 'Escritório Gerência (XYZ)', responsibleUserId: DEMO_USER_PROFILES.Gerente.id, status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 5, 12), updatedAt: new Date(),
    nextMaintenanceDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000), 
  },
  { 
    id: 'ASSET201', companyId: MOCK_COMPANY_ID, name: 'Servidor PowerEdge R750 (Admin XYZ)', category: 'Infraestrutura', tag: 'AD20X', 
    locationId: 'loc1-xyz', locationName: 'Data Center Principal (XYZ)', responsibleUserId: DEMO_USER_PROFILES.Administrador.id, status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2022, 6, 20), updatedAt: new Date(),
    nextMaintenanceDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    certificationName: "ISO 27001",
    certificationExpiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Cert expires in 60 days
  },
  { 
    id: 'ASSET202', companyId: MOCK_COMPANY_ID, name: 'Switch Cisco Catalyst (Admin XYZ)', category: 'Redes', tag: 'AD20Y', 
    locationId: 'loc1-xyz', locationName: 'Data Center Principal (XYZ)', responsibleUserId: DEMO_USER_PROFILES.Administrador.id, status: 'maintenance', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2022, 7, 1), updatedAt: new Date(),
    lastInventoryDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
  },
  { 
    id: 'ASSET301', companyId: MOCK_COMPANY_ID, name: 'Kit Ferramentas Manutenção (Técnico XYZ)', category: 'Ferramentas', tag: 'TC30K', 
    locationId: 'loc3-xyz', locationName: 'Bancada Técnica (XYZ)', responsibleUserId: DEMO_USER_PROFILES.Técnico.id, status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 8, 15), updatedAt: new Date(),
  },
  { 
    id: 'ASSET401', companyId: MOCK_COMPANY_ID, name: 'Coletor de Dados Zebra (Invent. XYZ)', category: 'Equipamentos', tag: 'IN40C', 
    locationId: 'loc1-xyz', locationName: 'Em Trânsito (XYZ)', responsibleUserId: DEMO_USER_PROFILES.Inventariante.id, status: 'active', ownershipType: 'rented',
    rentalCompany: 'ScanSolutions', rentalStartDate: new Date(2024, 2, 1), rentalEndDate: new Date(2024, 8, 30),
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 9, 2), updatedAt: new Date(),
    nextInventoryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Inventory overdue by 5 days
  },
  { 
    id: 'ASSET002', companyId: MOCK_COMPANY_ID, name: 'Monitor LG 27" (Maria XYZ)', category: 'Eletrônicos', tag: 'DE34F', 
    locationId: 'loc2-xyz', locationName: 'Escritório 2 (XYZ)', responsibleUserId: 'user2-xyz', status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 10, 3), updatedAt: new Date(),
  },
  { 
    id: 'ASSET005', companyId: MOCK_COMPANY_ID, name: 'Teclado Gamer RGB (Maria XYZ)', category: 'Eletrônicos', tag: 'MN90P', 
    locationId: 'loc1-xyz', locationName: 'Escritório 1 (XYZ)', responsibleUserId: 'user2-xyz', status: 'inactive', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2022, 11, 7), updatedAt: new Date(),
  },
  { 
    id: 'ASSET006', companyId: MOCK_COMPANY_ID, name: 'Impressora HP (Carlos XYZ)', category: 'Eletrônicos', tag: 'QR12S', 
    locationId: 'loc3-xyz', locationName: 'Recepção (XYZ)', responsibleUserId: 'user3-xyz', status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 0, 15), updatedAt: new Date(),
  },

  // Assets for ANOTHER_MOCK_COMPANY_ID
  { 
    id: 'ASSET501', companyId: ANOTHER_MOCK_COMPANY_ID, name: 'MacBook Pro 16" (Empresa ABC)', category: 'Eletrônicos', tag: 'ABC01', 
    locationId: 'locA-abc', locationName: 'Escritório ABC', responsibleUserId: DEMO_USER_PROFILES["Admin Empresa ABC"].id, status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 1, 1), updatedAt: new Date(),
    nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  { 
    id: 'ASSET502', companyId: ANOTHER_MOCK_COMPANY_ID, name: 'Câmera DSLR Canon (Empresa ABC)', category: 'Equipamentos', tag: 'ABC02', 
    locationId: 'locB-abc', locationName: 'Estúdio ABC', responsibleUserId: DEMO_USER_PROFILES["Admin Empresa ABC"].id, status: 'active', ownershipType: 'own',
    characteristics: [], photos: [], attachments: [], createdAt: new Date(2023, 2, 10), updatedAt: new Date(),
    warrantyExpiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
  },
];


export let mockTransferRequests: TransferRequest[] = [
    // Transfers within MOCK_COMPANY_ID
    { id: 'transfer1', companyId: MOCK_COMPANY_ID, assetId: 'ASSET002', assetName: 'Monitor LG 27" (Maria XYZ)', assetTag: 'DE34F', fromUserId: 'user2-xyz', fromUserName: 'Maria Oliveira (XYZ)', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 'transfer2', companyId: MOCK_COMPANY_ID, assetId: 'ASSET003', assetName: 'Cadeira de Escritório (XYZ)', assetTag: 'GH56I', fromUserId: MOCK_LOGGED_IN_USER_ID, fromUserName: MOCK_LOGGED_IN_USER_NAME, toUserId: DEMO_USER_PROFILES.Gerente.id, toUserName: DEMO_USER_PROFILES.Gerente.name, requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 'transfer3', companyId: MOCK_COMPANY_ID, assetId: 'ASSET005', assetName: 'Teclado Gamer RGB (Maria XYZ)', assetTag: 'MN90P', fromUserId: 'user2-xyz', fromUserName: 'Maria Oliveira (XYZ)', toUserId: MOCK_LOGGED_IN_USER_ID, toUserName: MOCK_LOGGED_IN_USER_NAME, requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'accepted', processedDate: new Date(Date.now() - 4* 24 * 60 * 60 * 1000), processedByUserId: MOCK_LOGGED_IN_USER_ID },
    { id: 'transfer4', companyId: MOCK_COMPANY_ID, assetId: 'ASSET006', assetName: 'Impressora HP (Carlos XYZ)', assetTag: 'QR12S', fromUserId: 'user3-xyz', fromUserName: 'Carlos Pereira (XYZ)', toUserId: DEMO_USER_PROFILES.Gerente.id, toUserName: DEMO_USER_PROFILES.Gerente.name, requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'pending' },
];

export const mockUsersForSelect: UserForSelect[] = [
    // Users from MOCK_COMPANY_ID
    { id: MOCK_LOGGED_IN_USER_ID, name: MOCK_LOGGED_IN_USER_NAME, companyId: MOCK_COMPANY_ID },
    { id: 'user2-xyz', name: 'Maria Oliveira (XYZ)', companyId: MOCK_COMPANY_ID },
    { id: 'user3-xyz', name: 'Carlos Pereira (XYZ)', companyId: MOCK_COMPANY_ID },
    { id: DEMO_USER_PROFILES.Administrador.id, name: DEMO_USER_PROFILES.Administrador.name, companyId: MOCK_COMPANY_ID },
    { id: DEMO_USER_PROFILES.Gerente.id, name: DEMO_USER_PROFILES.Gerente.name, companyId: MOCK_COMPANY_ID },
    { id: DEMO_USER_PROFILES.Técnico.id, name: DEMO_USER_PROFILES.Técnico.name, companyId: MOCK_COMPANY_ID },
    { id: DEMO_USER_PROFILES.Inventariante.id, name: DEMO_USER_PROFILES.Inventariante.name, companyId: MOCK_COMPANY_ID },
    
    // User from ANOTHER_MOCK_COMPANY_ID
    { id: DEMO_USER_PROFILES["Admin Empresa ABC"].id, name: DEMO_USER_PROFILES["Admin Empresa ABC"].name, companyId: ANOTHER_MOCK_COMPANY_ID },
];

const uniqueMockUsers = Array.from(new Map(mockUsersForSelect.map(user => [user.id, user])).values());
export const finalMockUsersForSelect = uniqueMockUsers;

export const mockAdminUsers: UserData[] = [
    // Company XYZ
    { id: 'user1', companyId: MOCK_COMPANY_ID, name: 'João Silva (Admin XYZ)', email: 'joao.silva@xyz.com', role: 'Administrador', isActive: true, createdAt: new Date(2023, 0, 1), updatedAt: new Date(2023, 0, 1) },
    { id: 'user2-xyz', companyId: MOCK_COMPANY_ID, name: 'Maria Oliveira (Gerente XYZ)', email: 'maria.oliveira@xyz.com', role: 'Gerente', managerId: 'user1', isActive: true, createdAt: new Date(2023, 1, 1), updatedAt: new Date(2023, 1, 1) },
    { id: 'user3-xyz', companyId: MOCK_COMPANY_ID, name: 'Carlos Pereira (Técnico XYZ)', email: 'carlos.pereira@xyz.com', role: 'Técnico', managerId: 'user2-xyz', isActive: true, createdAt: new Date(2023, 2, 1), updatedAt: new Date(2023, 2, 1) },
    { id: 'user4-xyz', companyId: MOCK_COMPANY_ID, name: 'Ana Costa (Invent. XYZ)', email: 'ana.costa@xyz.com', role: 'Inventariante', managerId: 'user2-xyz', isActive: false, createdAt: new Date(2023, 3, 1), updatedAt: new Date(2023, 3, 1) },
    { id: 'user5-xyz', companyId: MOCK_COMPANY_ID, name: 'Pedro Santos (Funcionário XYZ)', email: 'pedro.santos@xyz.com', role: 'Funcionário', managerId: 'user1', isActive: true, createdAt: new Date(2023, 4, 1), updatedAt: new Date(2023, 4, 1) },
    
    // Company ABC
    { id: 'admin-abc-id', companyId: ANOTHER_MOCK_COMPANY_ID, name: 'Alice Braga (Admin ABC)', email: 'alice.braga@abc.com', role: 'Administrador', isActive: true, createdAt: new Date(2023, 5, 1), updatedAt: new Date(2023, 5, 1) },
    { id: 'user6-abc', companyId: ANOTHER_MOCK_COMPANY_ID, name: 'Bruno Lima (Gerente ABC)', email: 'bruno.lima@abc.com', role: 'Gerente', managerId: 'admin-abc-id', isActive: true, createdAt: new Date(2023, 6, 1), updatedAt: new Date(2023, 6, 1) },
];

export const getManagersForCompany = (companyId: string): UserForSelect[] => {
  return mockAdminUsers
    .filter(u => u.companyId === companyId && (u.role === 'Administrador' || u.role === 'Gerente'))
    .map(u => ({ id: u.id, name: `${u.name} (${u.role})`, companyId: u.companyId }));
};

// --- Mock Data for Company Settings Page ---
export async function fetchCompanyDetails(companyId: string): Promise<CompanyDetails | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (companyId === MOCK_COMPANY_ID) {
        return {
            id: MOCK_COMPANY_ID,
            name: 'Minha Empresa Exemplo (XYZ)',
            logoUrl: 'https://placehold.co/100x100/003049/FFFFFF.png?text=QRIoT', // Placeholder logo
            ownerId: 'user1',
            createdAt: new Date(2023, 0, 15),
            updatedAt: new Date(),
        };
    }
     if (companyId === ANOTHER_MOCK_COMPANY_ID) {
        return {
            id: ANOTHER_MOCK_COMPANY_ID,
            name: 'Empresa ABC Soluções',
            logoUrl: 'https://placehold.co/100x100/FF6347/FFFFFF.png?text=ABC',
            ownerId: 'admin-abc-id',
            createdAt: new Date(2022, 5, 10),
            updatedAt: new Date(),
        };
    }
    return null;
}

export async function fetchCompanyLicenseInfo(companyId: string): Promise<LicenseInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 700));
    // This can be more dynamic based on companyId if needed
    if (companyId === MOCK_COMPANY_ID) {
        return {
            planName: 'Plano Profissional',
            assetLimit: 1000,
            currentAssetCount: allAssetsMockData.filter(a => a.companyId === MOCK_COMPANY_ID).length,
            userLimit: 50,
            currentUserCount: mockAdminUsers.filter(u => u.companyId === MOCK_COMPANY_ID).length,
            expirationDate: new Date(2025, 11, 31),
            status: 'active',
            isTrial: false,
        };
    }
    if (companyId === ANOTHER_MOCK_COMPANY_ID) {
         return {
            planName: 'Teste Gratuito',
            assetLimit: 50,
            currentAssetCount: allAssetsMockData.filter(a => a.companyId === ANOTHER_MOCK_COMPANY_ID).length,
            userLimit: 5,
            currentUserCount: mockAdminUsers.filter(u => u.companyId === ANOTHER_MOCK_COMPANY_ID).length,
            expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Expires in 10 days
            status: 'trial',
            isTrial: true,
        };
    }
    return null;
}

export async function fetchBillingDetails(companyId: string): Promise<BillingInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
     if (companyId === MOCK_COMPANY_ID) {
        return {
            nextPaymentDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15), // Next month's 15th
            nextPaymentAmount: 49.90,
            paymentMethod: 'Visa **** 1234',
        };
    }
     if (companyId === ANOTHER_MOCK_COMPANY_ID) {
        return {
            nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            nextPaymentAmount: 0, // Trial
            paymentMethod: 'N/A (Trial)',
        };
    }
    return null;
}

export async function fetchPaymentHistory(companyId: string): Promise<PaymentHistoryEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 900));
     if (companyId === MOCK_COMPANY_ID) {
        return [
            { id: 'pay1', date: new Date(2024, 3, 15), amount: 49.90, status: 'Paid', description: 'Mensalidade Plano Profissional - Abril/2024', invoiceUrl: '#' },
            { id: 'pay2', date: new Date(2024, 2, 15), amount: 49.90, status: 'Paid', description: 'Mensalidade Plano Profissional - Março/2024', invoiceUrl: '#' },
            { id: 'pay3', date: new Date(2024, 1, 15), amount: 29.90, status: 'Paid', description: 'Mensalidade Plano Básico - Fevereiro/2024', invoiceUrl: '#' },
        ];
    }
    return []; // No payment history for other companies in this mock
}

export async function saveCompanyDetails(companyId: string, data: { name: string, logoUrl?: string }): Promise<boolean> {
    console.log(`Saving data for company ${companyId}:`, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, update Firestore document for the company
    return true;
}