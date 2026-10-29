import React, { useState } from 'react';
import { Item, TOG, TOGItem, Location } from '../../types';
import { Modal } from '../common/Modal';
import { generateId, formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface NewTOGModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  locations?: Location[];
  onSaveTOG: (tog: TOG) => Promise<void>;
}

export const NewTOGModal: React.FC<NewTOGModalProps> = ({
  isOpen,
  onClose,
  items,
  locations = [],
  onSaveTOG,
}) => {
  const [togNumber] = useState(() => generateId('TOG'));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sourceLocation, setSourceLocation] = useState('Central Warehouse - Bay A');
  const [destinationLocation, setDestinationLocation] = useState('Production Dept / Assembly Line');
  const [requestedBy, setRequestedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('Warehouse Manager');
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items
  const [lineItems, setLineItems] = useState<TOGItem[]>([
    {
      itemId: items[0]?.id || '',
      sku: items[0]?.sku || '',
      name: items[0]?.name || '',
      quantity: 1,
      unitCost: items[0]?.unitCost || 0,
      binLocation: items[0]?.binLocation || 'A-01-01',
      notes: '',
    }
  ]);

  const handleItemSelect = (index: number, selectedItemId: string) => {
    const found = items.find(i => i.id === selectedItemId);
    if (!found) return;

    setLineItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        itemId: found.id,
        sku: found.sku,
        name: found.name,
        unitCost: found.unitCost,
        binLocation: found.binLocation,
      };
      return copy;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    setLineItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        quantity: Math.max(1, qty),
      };
      return copy;
    });
  };

  const handleNotesChange = (index: number, notes: string) => {
    setLineItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes };
      return copy;
    });
  };

  const addLineRow = () => {
    const firstItem = items[0];
    setLineItems(prev => [
      ...prev,
      {
        itemId: firstItem ? firstItem.id : '',
        sku: firstItem ? firstItem.sku : '',
        name: firstItem ? firstItem.name : '',
        quantity: 1,
        unitCost: firstItem ? firstItem.unitCost : 0,
        binLocation: firstItem ? firstItem.binLocation : 'A-01-01',
        notes: '',
      }
    ]);
  };

  const removeLineRow = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Check if any line quantity exceeds available inventory
  const getStockValidationError = (): string | null => {
    for (const line of lineItems) {
      const masterItem = items.find(i => i.id === line.itemId || i.sku === line.sku);
      if (!masterItem) continue;
      if (line.quantity > masterItem.currentStock) {
        return `Requested quantity for "${masterItem.sku} - ${masterItem.name}" (${line.quantity}) exceeds available stock (${masterItem.currentStock} ${masterItem.uom}).`;
      }
    }
    return null;
  };

  const validationError = getStockValidationError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedBy.trim()) {
      alert('Please enter who requested this transfer.');
      return;
    }
    if (!destinationLocation.trim()) {
      alert('Please enter a destination department or warehouse.');
      return;
    }
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const newTOG: TOG = {
        id: `tog-${Date.now()}`,
        togNumber,
        date,
        sourceLocation,
        destinationLocation,
        requestedBy,
        approvedBy,
        items: lineItems,
        status: 'Completed',
        purpose,
        remarks,
        createdAt: new Date().toISOString(),
      };

      await onSaveTOG(newTOG);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save TOG transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Transfer of Goods (TOG / Gate Pass)"
      subtitle="Dispatch items outward to branches, projects or production with live stock checks"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">TOG Number</label>
            <input
              type="text"
              readOnly
              value={togNumber}
              className="w-full text-xs font-mono font-bold bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Source Location *</label>
            <select
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-medium"
            >
              <option value="Central Warehouse - Bay A">Central Warehouse - Bay A</option>
              {locations.filter(l => l.isActive).map(loc => (
                <option key={loc.id} value={`${loc.code} - ${loc.name}`}>
                  {loc.code} — {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Location / Dept *</label>
            <div className="space-y-1">
              <select
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-medium"
              >
                <option value="Production Dept / Assembly Line">Production Dept / Assembly Line</option>
                <option value="Project Alpha Job Site">Project Alpha Job Site</option>
                <option value="Branch Store B">Branch Store B</option>
                <option value="R&D Testing Lab">R&D Testing Lab</option>
                <option value="Maintenance Workshop">Maintenance Workshop</option>
                {locations.filter(l => l.isActive).map(loc => (
                  <option key={loc.id} value={`Transfer to: ${loc.code} - ${loc.name}`}>
                    Warehouse Bin: {loc.code} ({loc.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requested By *</label>
            <input
              type="text"
              required
              placeholder="e.g. David Miller (Production Lead)"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
            <input
              type="text"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>
        </div>

        {/* Validation Warning if stock exceeded */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transfer Line Items ({lineItems.length})
            </h4>
            <button
              type="button"
              onClick={addLineRow}
              className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Item</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Item (SKU / Name)</th>
                  <th className="py-2 px-2 w-28">Current Bin</th>
                  <th className="py-2 px-2 w-28 text-right">Available Stock</th>
                  <th className="py-2 px-2 w-28 text-right">Transfer Qty</th>
                  <th className="py-2 px-2 w-44">Line Purpose / Notes</th>
                  <th className="py-2 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((line, idx) => {
                  const masterItem = items.find(i => i.id === line.itemId || i.sku === line.sku);
                  const available = masterItem ? masterItem.currentStock : 0;
                  const isOver = line.quantity > available;

                  return (
                    <tr key={idx} className={isOver ? 'bg-rose-50/60' : 'hover:bg-slate-50/50'}>
                      <td className="py-2 px-3">
                        <select
                          value={line.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full text-xs bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                        >
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.sku} - {i.name} (Stock: {i.currentStock} {i.uom})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {line.binLocation}
                        </span>
                      </td>

                      <td className="py-2 px-2 text-right">
                        <span className={`font-bold font-mono ${available <= (masterItem?.minStockLevel || 0) ? 'text-amber-600' : 'text-slate-700'}`}>
                          {available} {masterItem?.uom}
                        </span>
                      </td>

                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                          className={`w-full text-right text-xs font-bold px-2 py-1.5 rounded border ${
                            isOver 
                              ? 'bg-rose-100 text-rose-800 border-rose-400 focus:outline-rose-500' 
                              : 'bg-white text-slate-800 border-slate-300 focus:outline-blue-500'
                          }`}
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder="e.g. For Job #44, urgent"
                          value={line.notes || ''}
                          onChange={(e) => handleNotesChange(idx, e.target.value)}
                          className="w-full text-xs bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineRow(idx)}
                          disabled={lineItems.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Purpose & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Job Order</label>
            <input
              type="text"
              placeholder="e.g. Monthly automation panel fabrication run #44"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 p-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Gate Pass Instructions</label>
            <input
              type="text"
              placeholder="e.g. Dispatched on pallet cart #2, hand over to Alex"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 p-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
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
            disabled={isSubmitting || Boolean(validationError)}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isSubmitting ? 'Transferring Items...' : 'Approve & Dispatch TOG'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
