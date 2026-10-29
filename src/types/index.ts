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

export type LocationType = 
  | 'Warehouse Bin' 
  | 'Storage Rack' 
  | 'Shelf / Bay' 
  | 'Floor Zone' 
  | 'Cold Room' 
  | 'Bulk Pallet Area'
  | 'Dispatch Bay';

export interface Location {
  id: string;
  code: string; // e.g. A-01-01, BIN-A1, ZONE-NORTH
  name: string; // e.g. Aisle A - Level 1 - Bin 1
  type: LocationType;
  zone?: string; // e.g. Main Hall, High Bay
  capacity?: number;
  description?: string;
  isActive: boolean;
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

// User and Permission Types
export type UserRole = 'Admin' | 'Manager' | 'Warehouse Operator' | 'Viewer';

export type PermissionKey =
  | 'dashboard:view'
  | 'grn:view'
  | 'grn:create'
  | 'tog:view'
  | 'tog:create'
  | 'stock:view'
  | 'stock:create'
  | 'stock:edit'
  | 'stock:delete'
  | 'stock:import'
  | 'adjustment:view'
  | 'adjustment:create'
  | 'bincard:view'
  | 'reports:view'
  | 'locations:view'
  | 'locations:manage'
  | 'users:manage';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  permissions: PermissionKey[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  group: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { key: 'dashboard:view', label: 'View Dashboard', group: 'Dashboard', description: 'Access overall warehouse metrics and alerts' },
  { key: 'grn:view', label: 'View GRN Receipts', group: 'Inbound GRN', description: 'View Goods Received Notes and details' },
  { key: 'grn:create', label: 'Create & Post GRN', group: 'Inbound GRN', description: 'Receive new stock and post GRN' },
  { key: 'tog:view', label: 'View TOG Dispatches', group: 'Outward TOG', description: 'View Transfer of Goods records and Excel exports' },
  { key: 'tog:create', label: 'Create & Post TOG', group: 'Outward TOG', description: 'Issue and transfer stock outward' },
  { key: 'stock:view', label: 'View Stock Catalog', group: 'Stock Master', description: 'Browse items, pricing and stock levels' },
  { key: 'stock:create', label: 'Create Items', group: 'Stock Master', description: 'Add new SKUs and products to catalog' },
  { key: 'stock:edit', label: 'Edit Items', group: 'Stock Master', description: 'Update product pricing, thresholds and info' },
  { key: 'stock:delete', label: 'Delete Items', group: 'Stock Master', description: 'Remove products from inventory' },
  { key: 'stock:import', label: 'Bulk Import Products', group: 'Stock Master', description: 'Upload products in bulk from Excel/CSV' },
  { key: 'adjustment:view', label: 'View Adjustments', group: 'Stock Adjustments', description: 'View audit reconciliations and write-offs' },
  { key: 'adjustment:create', label: 'Create Adjustments', group: 'Stock Adjustments', description: 'Execute cycle count corrections & damage write-offs' },
  { key: 'bincard:view', label: 'View Bincard Ledger', group: 'Bincard Ledger', description: 'Audit perpetual movement trails & running balances' },
  { key: 'reports:view', label: 'View Reports & Valuation', group: 'Reports', description: 'Access valuation summaries and low stock alerts' },
  { key: 'locations:view', label: 'View Locations', group: 'Locations Master', description: 'Browse warehouse bins, racks and storage zones' },
  { key: 'locations:manage', label: 'Manage Locations', group: 'Locations Master', description: 'Create, update and delete storage locations' },
  { key: 'users:manage', label: 'Manage Users & Permissions', group: 'Administration', description: 'Create users, assign roles and modify granular permissions' },
];

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

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  Admin: ALL_PERMISSIONS.map(p => p.key),
  Manager: [
    'dashboard:view',
    'grn:view',
    'grn:create',
    'tog:view',
    'tog:create',
    'stock:view',
    'stock:create',
    'stock:edit',
    'stock:import',
    'adjustment:view',
    'adjustment:create',
    'bincard:view',
    'reports:view',
    'locations:view',
    'locations:manage',
  ],
  'Warehouse Operator': [
    'dashboard:view',
    'grn:view',
    'grn:create',
    'tog:view',
    'tog:create',
    'stock:view',
    'adjustment:view',
    'bincard:view',
    'locations:view',
  ],
  Viewer: [
    'dashboard:view',
    'stock:view',
    'bincard:view',
    'reports:view',
    'locations:view',
  ],
};
