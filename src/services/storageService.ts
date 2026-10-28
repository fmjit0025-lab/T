import { 
  Item, 
  GRN, 
  TOG, 
  StockAdjustment, 
  BincardEntry 
} from '../types';
import { 
  INITIAL_ITEMS, 
  INITIAL_GRNS, 
  INITIAL_TOGS, 
  INITIAL_ADJUSTMENTS, 
  INITIAL_BINCARD_ENTRIES 
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
    // Also maintain local
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

    // Save GRN locally
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

        // Add Bincard entry
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
        if (db) {
          try {
            await setDoc(doc(db, 'bincards', entry.id), entry);
          } catch (e) {
            console.error('Failed to sync bincard to firestore:', e);
          }
        }
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

    // Save TOG locally
    const togs = getLocal<TOG[]>(KEYS.TOG, INITIAL_TOGS);
    togs.unshift(tog);
    setLocal(KEYS.TOG, togs);

    // Atomically decrement inventory stock & record bincard entries
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

        // Add Bincard entry
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
        if (db) {
          try {
            await setDoc(doc(db, 'bincards', entry.id), entry);
          } catch (e) {
            console.error('Failed to sync bincard to firestore:', e);
          }
        }
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

    // Update target item stock
    const items = await this.getItems();
    const targetItem = items.find((i) => i.id === adj.itemId || i.sku === adj.sku);
    if (targetItem) {
      targetItem.currentStock = adj.newStock;
      targetItem.updatedAt = new Date().toISOString();
      await this.saveItem(targetItem);

      // Add Bincard entry
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
      if (db) {
        try {
          await setDoc(doc(db, 'bincards', entry.id), entry);
        } catch (e) {
          console.error('Failed to sync bincard to firestore:', e);
        }
      }
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

    // Sort newest first
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (itemId) {
      return entries.filter((e) => e.itemId === itemId);
    }
    return entries;
  }

  // ==================== DEMO SEED / RESET ====================
  static async resetToDefault(): Promise<void> {
    setLocal(KEYS.ITEMS, INITIAL_ITEMS);
    setLocal(KEYS.GRN, INITIAL_GRNS);
    setLocal(KEYS.TOG, INITIAL_TOGS);
    setLocal(KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
    setLocal(KEYS.BINCARD, INITIAL_BINCARD_ENTRIES);

    const { db } = getFirebaseInstances();
    if (db) {
      try {
        const batch = writeBatch(db);
        // seed items
        for (const item of INITIAL_ITEMS) {
          batch.set(doc(db, 'items', item.id), item);
        }
        // seed grns
        for (const grn of INITIAL_GRNS) {
          batch.set(doc(db, 'grn', grn.id), grn);
        }
        // seed togs
        for (const tog of INITIAL_TOGS) {
          batch.set(doc(db, 'tog', tog.id), tog);
        }
        // seed adjustments
        for (const adj of INITIAL_ADJUSTMENTS) {
          batch.set(doc(db, 'adjustments', adj.id), adj);
        }
        // seed bincards
        for (const bin of INITIAL_BINCARD_ENTRIES) {
          batch.set(doc(db, 'bincards', bin.id), bin);
        }
        await batch.commit();
      } catch (err) {
        console.error('Failed to seed Firebase Firestore:', err);
      }
    }
  }

  static async seedFirebase(): Promise<{ success: boolean; message: string }> {
    const { db } = getFirebaseInstances();
    if (!db) {
      return { success: false, message: 'Firebase connection not initialized or disabled.' };
    }

    try {
      const batch = writeBatch(db);
      for (const item of INITIAL_ITEMS) {
        batch.set(doc(db, 'items', item.id), item);
      }
      for (const grn of INITIAL_GRNS) {
        batch.set(doc(db, 'grn', grn.id), grn);
      }
      for (const tog of INITIAL_TOGS) {
        batch.set(doc(db, 'tog', tog.id), tog);
      }
      for (const adj of INITIAL_ADJUSTMENTS) {
        batch.set(doc(db, 'adjustments', adj.id), adj);
      }
      for (const bin of INITIAL_BINCARD_ENTRIES) {
        batch.set(doc(db, 'bincards', bin.id), bin);
      }
      await batch.commit();
      return { success: true, message: 'Sample inventory, GRNs, TOGs, and Bincards uploaded to Firebase!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to write to Firebase.' };
    }
  }
}
