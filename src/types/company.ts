// src/types/company.ts

export interface CompanyDetails {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId?: string; // Optional: if you track the primary owner
  // Add other company-specific fields here
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseInfo {
  planName: string;
  assetLimit: number;
  currentAssetCount: number;
  userLimit: number;
  currentUserCount: number;
  expirationDate: Date | null;
  status: 'active' | 'expired' | 'exceeded' | 'trial';
  isTrial: boolean;
}

export interface BillingInfo {
  nextPaymentDate: Date;
  nextPaymentAmount: number;
  paymentMethod?: string; // e.g., "Visa **** 1234"
}

export interface PaymentHistoryEntry {
  id: string;
  date: Date;
  amount: number;
  status: 'Paid' | 'Failed' | 'Pending';
  description: string; // e.g., "Monthly Subscription - Pro Plan"
  invoiceUrl?: string; // Link to download invoice
}
