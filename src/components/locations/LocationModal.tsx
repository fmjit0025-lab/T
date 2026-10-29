import React, { useState, useEffect } from 'react';
import { Location, LocationType } from '../../types';
import { Modal } from '../common/Modal';
import { Check, MapPin } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onSave: (location: Location) => Promise<void>;
  existingCodes: string[];
}

const LOCATION_TYPES: LocationType[] = [
  'Warehouse Bin',
  'Storage Rack',
  'Shelf / Bay',
  'Floor Zone',
  'Cold Room',
  'Bulk Pallet Area',
  'Dispatch Bay'
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  location,
  onSave,
  existingCodes,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('Warehouse Bin');
  const [zone, setZone] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location) {
      setCode(location.code);
      setName(location.name);
      setType(location.type);
      setZone(location.zone || '');
      setCapacity(location.capacity !== undefined ? location.capacity : '');
      setDescription(location.description || '');
      setIsActive(location.isActive);
    } else {
      setCode('');
      setName('');
      setType('Warehouse Bin');
      setZone('Main Warehouse');
      setCapacity(200);
      setDescription('');
      setIsActive(true);
    }
  }, [location, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || !name.trim()) {
      alert('Location Code and Name are required.');
      return;
    }

    // Check code uniqueness if creating new
    if (!location && existingCodes.some(c => c.toUpperCase() === cleanCode)) {
      alert(`Location code "${cleanCode}" already exists. Please choose a unique code.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const saved: Location = {
        id: location ? location.id : `loc-${Date.now()}`,
        code: cleanCode,
        name: name.trim(),
        type,
        zone: zone.trim() || undefined,
        capacity: capacity !== '' ? Number(capacity) : undefined,
        description: description.trim() || undefined,
        isActive,
        createdAt: location ? location.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(saved);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={location ? `Edit Location: ${location.code}` : 'Create New Warehouse Location'}
      subtitle="Define storage bins, racks, shelves, and pallet zones"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location Code / Bin # *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. A-02-01 or BIN-E1"
              className="w-full text-xs font-mono font-bold bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 uppercase"
            />
            <p className="text-[10px] text-slate-400 mt-1">Unique alphanumeric identifier</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LocationType)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location Title / Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aisle A - Shelf 2 - Level 1"
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Zone / Area / Department</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Zone A (Electronics)"
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity / Max Units</label>
            <input
              type="number"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="e.g. 500"
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Handling Guidelines</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. ESD safe, heavy duty, maximum pallet load 1000kg..."
              className="w-full text-xs bg-white text-slate-800 p-2.5 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Active Status</span>
              <span className="text-[11px] text-slate-500">Available for selection in GRN, TOG and Stock Item Master</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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
            <span>{isSubmitting ? 'Saving...' : location ? 'Update Location' : 'Create Location'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
