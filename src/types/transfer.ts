// src/types/transfer.ts

export type TransferRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TransferRequest {
  id: string; // Unique ID for the transfer request
  assetId: string;
  assetName: string;
  assetTag: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName?: string; // Optional, might not be known immediately or if transferring to an email not yet a user
  requestDate: Date;
  status: TransferRequestStatus;
  processedDate?: Date; // Date when the request was accepted/rejected
  processedByUserId?: string; // User who processed the request
  notes?: string; // Optional notes for the transfer
}
