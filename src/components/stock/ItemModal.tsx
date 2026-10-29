import React, { useState, useEffect } from 'react';
import { Item, UOM, Location } from '../../types';
import { Modal } from '../common/Modal';
import { generateId } from '../../utils/formatters';
import { Check, Boxes, MapPin } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  locations?: Location[];
  onSave: (item: Item) => Promise<void>;
}

const UOM_OPTIONS: UOM[] = ['Pcs', 'Box', 'Kg', 'Mtr', 'Ltr', 'Rolls', 'Sets', 'Pack', 'Carton'];
const CATEGORY_OPTIONS = [
  'Electronics',
  'Hardware & Mechanical',
  'Consumables',
  'Packaging',
  'Chemicals & Solvents',
  'Raw Materials',
  'Safety & PPE',
  'Tools & Equipment',
  'General',
];

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  item,
  locations = [],
  onSave,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [uom, setUom] = useState<UOM>('Pcs');
  const [binLocation, setBinLocation] = useState('');
  const [minStockLevel, setMinStockLevel] = useState(20);
  const [currentStock, setCurrentStock] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setSku(item.sku);
      setName(item.name);
      setCategory(item.category);
      setUom(item.uom);
      setBinLocation(item.binLocation);
      setMinStockLevel(item.minStockLevel);
      setCurrentStock(item.currentStock);
      setUnitCost(item.unitCost);
      setSupplier(item.supplier || '');
      setDescription(item.description || '');
    } else {
      setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setCategory(CATEGORY_OPTIONS[0]);
      setUom('Pcs');
      setBinLocation('A-01-01');
      setMinStockLevel(25);
      setCurrentStock(50);
      setUnitCost(10.00);
      setSupplier('');
      setDescription('');
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      alert('Please fill in Item SKU and Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedItem: Item = {
        id: item ? item.id : `item-${Date.now()}`,
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        uom,
        binLocation: binLocation.trim().toUpperCase() || 'A-01-01',
        minStockLevel: Math.max(0, Number(minStockLevel)),
        currentStock: Math.max(0, Number(currentStock)),
        unitCost: Math.max(0, Number(unitCost)),
        supplier: supplier.trim(),
        description: description.trim(),
        createdAt: item ? item.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(savedItem);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Edit Master Item: ${item.sku}` : 'Add New Inventory Item'}
      subtitle="Define item code, storage bin rack, reorder point and cost"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Code / SKU *</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SKU-ELEC-105"
              className="w-full text-xs font-mono font-bold bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name / Description *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Industrial Relays 24V DC"
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure (UOM) *</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value as UOM)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            >
              {UOM_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Default Bin / Storage Location *</label>
            <div className="space-y-1">
              <select
                required
                value={binLocation}
                onChange={(e) => setBinLocation(e.target.value)}
                className="w-full text-xs font-mono bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
              >
                <option value="">-- Select Warehouse Location --</option>
                {/* Include current item's bin if not in list */}
                {binLocation && !locations.some(l => l.code === binLocation) && (
                  <option value={binLocation}>{binLocation} (Assigned / Custom)</option>
                )}
                {locations.filter(l => l.isActive).map((loc) => (
                  <option key={loc.id} value={loc.code}>
                    {loc.code} — {loc.name} {loc.zone ? `[${loc.zone}]` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Choose from Warehouse Storage Locations Master</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Stock Level (Reorder Threshold) *</label>
            <input
              type="number"
              min="0"
              required
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(parseInt(e.target.value) || 0)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Alert triggers when stock drops to or below this point.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {item ? 'Current On Hand Stock' : 'Initial Starting Stock'}
            </label>
            <input
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-bold bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Supplier</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Apex Micro Electronics Ltd."
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description / Technical Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specifications, size, model number, handling requirements..."
              className="w-full text-xs bg-white text-slate-800 p-2.5 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
