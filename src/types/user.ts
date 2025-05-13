// src/types/user.ts

export type UserRole = "Administrador" | "Gerente" | "Técnico" | "Inventariante" | "Funcionário";

export interface UserData {
  id: string; // UID from Firebase Auth, also document ID in Firestore 'users' collection
  companyId: string; // ID of the company this user belongs to
  name: string;
  email: string;
  role: UserRole;
  managerId?: string; // ID of the manager, if any
  isActive: boolean;
  createdAt: Date; // Store as Timestamp in DB, convert to Date in app
  updatedAt: Date; // Store as Timestamp in DB, convert to Date in app
  
  // Optional denormalized fields
  avatarUrl?: string;
  managerName?: string;
}

// For select dropdowns
export interface UserForSelect {
    id: string;
    name: string;
}
