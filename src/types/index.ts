export type UOM = 'Pcs' | 'Box' | 'Kg' | 'Mtr' | 'Ltr' | 'Rolls' | 'Sets' | 'Pack' | 'Carton';

export interface Item {
  id: string;
  sku: string; // Unique Item Code
  name: string;
  category: string;
  uom: UOM;
  binLocation: string; // e.g. A-01-02
  minStockLevel: number;
  currentStock: number;
  unitCost: number;
  supplier: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GRNItem {
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNo?: string;
  expiryDate?: string;
  binLocation: string;
}

export interface GRN {
  id: string;
  grnNumber: string; // e.g. GRN-20261028-001
  date: string;
  supplier: string;
  poNumber: string;
  invoiceNumber: string;
  receivedBy: string;
  items: GRNItem[];
  totalAmount: number;
  status: 'Completed' | 'Pending' | 'Draft';
  notes?: string;
  createdAt: string;
}

export interface TOGItem {
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  binLocation: string;
  notes?: string;
}

export interface TOG {
  id: string;
  togNumber: string; // e.g. TOG-20261028-001
  date: string;
  sourceLocation: string;
  destinationLocation: string; // Department, Project, or Store
  requestedBy: string;
  approvedBy: string;
  dispatchedBy?: string;
  items: TOGItem[];
  status: 'Completed' | 'Draft' | 'In-Transit';
  purpose: string;
  remarks?: string;
  createdAt: string;
}

export type AdjustmentReason = 
  | 'Physical Audit Discrepancy'
  | 'Damaged / Broken Goods'
  | 'Expired Stock'
  | 'Found Stock'
  | 'Data Entry Correction'
  | 'Sample / Testing Write-off'
  | 'Scrap / Disposal'
  | 'Other';

export interface StockAdjustment {
  id: string;
  adjNumber: string; // e.g. ADJ-20261028-001
  date: string;
  type: 'INCREASE' | 'DECREASE';
  itemId: string;
  sku: string;
  name: string;
  previousStock: number;
  adjustedQty: number; // magnitude of change
  newStock: number;
  reason: AdjustmentReason;
  adjustedBy: string;
  notes: string;
  createdAt: string;
}

export type TransactionType = 'GRN' | 'TOG' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'INITIAL';

export interface BincardEntry {
  id: string;
  timestamp: string;
  date: string;
  itemId: string;
  sku: string;
  name: string;
  location: string; // Bin Location
  transType: TransactionType;
  refNumber: string; // GRN-XXX, TOG-XXX, ADJ-XXX
  qtyIn: number;
  qtyOut: number;
  balance: number;
  unitCost?: number;
  user: string;
  remarks: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
  useLiveFirebase: boolean;
}
