// src/types/transfer.ts

export type TransferRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TransferRequest {
  id: string; // Unique ID for the transfer request
  companyId: string; // ID of the company this transfer belongs to
  assetId: string;
  assetName: string;
  assetTag: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName?: string; 
  requestDate: Date;
  status: TransferRequestStatus;
  processedDate?: Date; 
  processedByUserId?: string; 
  notes?: string; 
}
