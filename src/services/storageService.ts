import { 
  Item, 
  GRN, 
  TOG, 
  StockAdjustment, 
  BincardEntry,
  Location,
  User,
  UserRole,
  PermissionKey,
  ROLE_DEFAULT_PERMISSIONS
} from '../types';
import { 
  INITIAL_ITEMS, 
  INITIAL_GRNS, 
  INITIAL_TOGS, 
  INITIAL_ADJUSTMENTS, 
  INITIAL_BINCARD_ENTRIES,
  INITIAL_LOCATIONS,
  INITIAL_USERS
} from './mockData';
import { 
  getFirebaseInstances, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  writeBatch 
} from './firebase';

const KEYS = {
  ITEMS: 'stockpulse_items',
  GRN: 'stockpulse_grn',
  TOG: 'stockpulse_tog',
  ADJUSTMENTS: 'stockpulse_adjustments',
  BINCARD: 'stockpulse_bincard',
  LOCATIONS: 'stockpulse_locations',
  USERS: 'stockpulse_users',
  CURRENT_USER: 'stockpulse_current_user',
};

// Generic LocalStorage helpers
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export class StorageService {
  // Check if live Firestore is active
  static isFirestoreActive(): boolean {
    const { db } = getFirebaseInstances();
    return db !== null;
  }

  // ==================== AUTHENTICATION & USERS ====================
  static getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(KEYS.CURRENT_USER);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      setLocal(KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }

  static async getUsers(): Promise<User[]> {
    return getLocal<User[]>(KEYS.USERS, INITIAL_USERS);
  }

  static async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    setLocal(KEYS.USERS, users);

    // If updating current logged in user, refresh session
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  static async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    setLocal(KEYS.USERS, users.filter(u => u.id !== id));
  }

  static async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = await this.getUsers();
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const user = users.find(u => 
      (u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) &&
      (!u.password || u.password === password)
    );

    if (!user) {
      return { success: false, error: 'Invalid username/email or password.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated. Please contact an administrator.' };
    }

    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString(),
    };
    await this.saveUser(updatedUser);
    this.setCurrentUser(updatedUser);

    return { success: true, user: updatedUser };
  }

  static async register(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
    permissions?: PermissionKey[];
    securityKey?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = await this.getUsers();
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username is already taken.' };
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email is already registered.' };
    }

    const requestedRole: UserRole = data.role || (users.length === 0 ? 'Admin' : 'Warehouse Operator');
    const isElevatedRole = requestedRole === 'Admin' || requestedRole === 'Manager';
    const hasAdminSecret = data.securityKey?.trim() === 'ADMIN2026';

    // Permission control: Elevated roles require security authorization passcode
    if (isElevatedRole && !hasAdminSecret && users.length > 0) {
      return { 
        success: false, 
        error: 'Security authorization code is required to register with Admin or Manager permissions. (Code: ADMIN2026)' 
      };
    }

    const assignedPermissions = data.permissions && data.permissions.length > 0
      ? data.permissions
      : ROLE_DEFAULT_PERMISSIONS[requestedRole];

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
      fullName: data.fullName.trim(),
      role: requestedRole,
      permissions: assignedPermissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    await this.saveUser(newUser);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  // ==================== LOCATIONS ====================
  static async getLocations(): Promise<Location[]> {
    return getLocal<Location[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
  }

  static async saveLocation(location: Location): Promise<void> {
    const locations = await this.getLocations();
    const index = locations.findIndex(l => l.id === location.id);
    if (index >= 0) {
      locations[index] = location;
    } else {
      locations.unshift(location);
    }
    setLocal(KEYS.LOCATIONS, locations);
  }

  static async deleteLocation(id: string): Promise<void> {
    const locations = await this.getLocations();
    setLocal(KEYS.LOCATIONS, locations.filter(l => l.id !== id));
  }

  // ==================== ITEMS ====================
  static async getItems(): Promise<Item[]> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        const colRef = collection(db, 'items');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const list: Item[] = [];
          snapshot.forEach((d) => list.push(d.data() as Item));
          return list;
        }
      } catch (err) {
        console.warn('Firestore getItems error, using local fallback:', err);
      }
    }
    return getLocal<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
  }

  static async saveItem(item: Item): Promise<void> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        const docRef = doc(db, 'items', item.id);
        await setDoc(docRef, item);
      } catch (err) {
        console.error('Firestore saveItem error:', err);
      }
    }
    const items = getLocal<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    setLocal(KEYS.ITEMS, items);
  }

  static async deleteItem(id: string): Promise<void> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        await deleteDoc(doc(db, 'items', id));
      } catch (err) {
        console.error('Firestore deleteItem error:', err);
      }
    }
    const items = getLocal<Item[]>(KEYS.ITEMS, INITIAL_ITEMS);
    setLocal(KEYS.ITEMS, items.filter((i) => i.id !== id));
  }

  // ==================== PRODUCT BULK IMPORT ====================
  static async bulkImportItems(newItems: Item[], currentUserName: string = 'Bulk Import'): Promise<{ imported: number; updated: number }> {
    const existingItems = await this.getItems();
    const bincards = await this.getBincardEntries();
    let imported = 0;
    let updated = 0;

    for (const newItem of newItems) {
      const existingIndex = existingItems.findIndex(
        i => i.sku.toUpperCase() === newItem.sku.toUpperCase()
      );

      if (existingIndex >= 0) {
        // Update existing item
        const prev = existingItems[existingIndex];
        existingItems[existingIndex] = {
          ...prev,
          name: newItem.name || prev.name,
          category: newItem.category || prev.category,
          uom: newItem.uom || prev.uom,
          binLocation: newItem.binLocation || prev.binLocation,
          unitCost: newItem.unitCost > 0 ? newItem.unitCost : prev.unitCost,
          minStockLevel: newItem.minStockLevel >= 0 ? newItem.minStockLevel : prev.minStockLevel,
          currentStock: newItem.currentStock >= 0 ? newItem.currentStock : prev.currentStock,
          supplier: newItem.supplier || prev.supplier,
          description: newItem.description || prev.description,
          updatedAt: new Date().toISOString(),
        };
        updated++;
      } else {
        // Insert as new item
        existingItems.unshift(newItem);
        imported++;

        // If starting stock is greater than 0, create an initial bincard ledger record
        if (newItem.currentStock > 0) {
          const entry: BincardEntry = {
            id: `bin-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            itemId: newItem.id,
            sku: newItem.sku,
            name: newItem.name,
            location: newItem.binLocation,
            transType: 'INITIAL',
            refNumber: 'BULK-IMPORT',
            qtyIn: newItem.currentStock,
            qtyOut: 0,
            balance: newItem.currentStock,
            unitCost: newItem.unitCost,
            user: currentUserName,
            remarks: 'Opening inventory balance via Bulk Excel/CSV Import'
          };
          bincards.unshift(entry);
        }
      }
    }

    setLocal(KEYS.ITEMS, existingItems);
    setLocal(KEYS.BINCARD, bincards);

    return { imported, updated };
  }

  // ==================== GRN ====================
  static async getGRNs(): Promise<GRN[]> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        const snapshot = await getDocs(collection(db, 'grn'));
        if (!snapshot.empty) {
          const list: GRN[] = [];
          snapshot.forEach((d) => list.push(d.data() as GRN));
          return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        console.warn('Firestore getGRNs error, using local fallback:', err);
      }
    }
    return getLocal<GRN[]>(KEYS.GRN, INITIAL_GRNS);
  }

  static async createGRN(grn: GRN): Promise<void> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        await setDoc(doc(db, 'grn', grn.id), grn);
      } catch (err) {
        console.error('Firestore createGRN error:', err);
      }
    }

    const grns = getLocal<GRN[]>(KEYS.GRN, INITIAL_GRNS);
    grns.unshift(grn);
    setLocal(KEYS.GRN, grns);

    // Atomically increment inventory stock & record bincard entries
    const items = await this.getItems();
    const bincards = await this.getBincardEntries();

    for (const lineItem of grn.items) {
      const targetItem = items.find((i) => i.id === lineItem.itemId || i.sku === lineItem.sku);
      if (targetItem) {
        const previousStock = targetItem.currentStock;
        const newStock = previousStock + lineItem.quantity;
        targetItem.currentStock = newStock;
        targetItem.updatedAt = new Date().toISOString();
        if (lineItem.unitCost > 0) {
          targetItem.unitCost = lineItem.unitCost;
        }
        await this.saveItem(targetItem);

        const entry: BincardEntry = {
          id: `bin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          date: grn.date,
          itemId: targetItem.id,
          sku: targetItem.sku,
          name: targetItem.name,
          location: lineItem.binLocation || targetItem.binLocation,
          transType: 'GRN',
          refNumber: grn.grnNumber,
          qtyIn: lineItem.quantity,
          qtyOut: 0,
          balance: newStock,
          unitCost: lineItem.unitCost,
          user: grn.receivedBy,
          remarks: `Received via PO: ${grn.poNumber || 'N/A'}, Supplier: ${grn.supplier}`
        };
        bincards.unshift(entry);
      }
    }
    setLocal(KEYS.BINCARD, bincards);
  }

  // ==================== TOG (Transfer of Goods) ====================
  static async getTOGs(): Promise<TOG[]> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        const snapshot = await getDocs(collection(db, 'tog'));
        if (!snapshot.empty) {
          const list: TOG[] = [];
          snapshot.forEach((d) => list.push(d.data() as TOG));
          return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        console.warn('Firestore getTOGs error, using local fallback:', err);
      }
    }
    return getLocal<TOG[]>(KEYS.TOG, INITIAL_TOGS);
  }

  static async createTOG(tog: TOG): Promise<void> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        await setDoc(doc(db, 'tog', tog.id), tog);
      } catch (err) {
        console.error('Firestore createTOG error:', err);
      }
    }

    const togs = getLocal<TOG[]>(KEYS.TOG, INITIAL_TOGS);
    togs.unshift(tog);
    setLocal(KEYS.TOG, togs);

    const items = await this.getItems();
    const bincards = await this.getBincardEntries();

    for (const lineItem of tog.items) {
      const targetItem = items.find((i) => i.id === lineItem.itemId || i.sku === lineItem.sku);
      if (targetItem) {
        const previousStock = targetItem.currentStock;
        const newStock = Math.max(0, previousStock - lineItem.quantity);
        targetItem.currentStock = newStock;
        targetItem.updatedAt = new Date().toISOString();
        await this.saveItem(targetItem);

        const entry: BincardEntry = {
          id: `bin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          date: tog.date,
          itemId: targetItem.id,
          sku: targetItem.sku,
          name: targetItem.name,
          location: lineItem.binLocation || targetItem.binLocation,
          transType: 'TOG',
          refNumber: tog.togNumber,
          qtyIn: 0,
          qtyOut: lineItem.quantity,
          balance: newStock,
          unitCost: lineItem.unitCost || targetItem.unitCost,
          user: tog.requestedBy,
          remarks: `Transfer to: ${tog.destinationLocation} (${tog.purpose || 'Issued'})`
        };
        bincards.unshift(entry);
      }
    }
    setLocal(KEYS.BINCARD, bincards);
  }

  // ==================== STOCK ADJUSTMENTS ====================
  static async getAdjustments(): Promise<StockAdjustment[]> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        const snapshot = await getDocs(collection(db, 'adjustments'));
        if (!snapshot.empty) {
          const list: StockAdjustment[] = [];
          snapshot.forEach((d) => list.push(d.data() as StockAdjustment));
          return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        console.warn('Firestore getAdjustments error, using local fallback:', err);
      }
    }
    return getLocal<StockAdjustment[]>(KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
  }

  static async createAdjustment(adj: StockAdjustment): Promise<void> {
    const { db } = getFirebaseInstances();
    if (db) {
      try {
        await setDoc(doc(db, 'adjustments', adj.id), adj);
      } catch (err) {
        console.error('Firestore createAdjustment error:', err);
      }
    }

    const adjs = getLocal<StockAdjustment[]>(KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
    adjs.unshift(adj);
    setLocal(KEYS.ADJUSTMENTS, adjs);

    const items = await this.getItems();
    const targetItem = items.find((i) => i.id === adj.itemId || i.sku === adj.sku);
    if (targetItem) {
      targetItem.currentStock = adj.newStock;
      targetItem.updatedAt = new Date().toISOString();
      await this.saveItem(targetItem);

      const bincards = await this.getBincardEntries();
      const isIncrease = adj.type === 'INCREASE';
      const entry: BincardEntry = {
        id: `bin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        date: adj.date,
        itemId: targetItem.id,
        sku: targetItem.sku,
        name: targetItem.name,
        location: targetItem.binLocation,
        transType: isIncrease ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
        refNumber: adj.adjNumber,
        qtyIn: isIncrease ? adj.adjustedQty : 0,
        qtyOut: isIncrease ? 0 : adj.adjustedQty,
        balance: adj.newStock,
        unitCost: targetItem.unitCost,
        user: adj.adjustedBy,
        remarks: `Stock Adjustment: ${adj.reason} - ${adj.notes || ''}`
      };
      bincards.unshift(entry);
      setLocal(KEYS.BINCARD, bincards);
    }
  }

  // ==================== BINCARD ENTRIES ====================
  static async getBincardEntries(itemId?: string): Promise<BincardEntry[]> {
    const { db } = getFirebaseInstances();
    let entries: BincardEntry[] = [];
    if (db) {
      try {
        const snapshot = await getDocs(collection(db, 'bincards'));
        if (!snapshot.empty) {
          snapshot.forEach((d) => entries.push(d.data() as BincardEntry));
        }
      } catch (err) {
        console.warn('Firestore getBincardEntries error, using local fallback:', err);
      }
    }

    if (entries.length === 0) {
      entries = getLocal<BincardEntry[]>(KEYS.BINCARD, INITIAL_BINCARD_ENTRIES);
    }

    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (itemId) {
      return entries.filter((e) => e.itemId === itemId);
    }
    return entries;
  }

  // ==================== RESET ====================
  static async resetToDefault(): Promise<void> {
    setLocal(KEYS.ITEMS, INITIAL_ITEMS);
    setLocal(KEYS.GRN, INITIAL_GRNS);
    setLocal(KEYS.TOG, INITIAL_TOGS);
    setLocal(KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
    setLocal(KEYS.BINCARD, INITIAL_BINCARD_ENTRIES);
    setLocal(KEYS.LOCATIONS, INITIAL_LOCATIONS);
    setLocal(KEYS.USERS, INITIAL_USERS);
  }
}
