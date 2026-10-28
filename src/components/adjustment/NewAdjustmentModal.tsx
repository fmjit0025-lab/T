import React, { useState, useEffect } from 'react';
import { Item, StockAdjustment, AdjustmentReason } from '../../types';
import { Modal } from '../common/Modal';
import { generateId } from '../../utils/formatters';
import { Check, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface NewAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onSave: (adj: StockAdjustment) => Promise<void>;
}

const REASONS: AdjustmentReason[] = [
  'Physical Audit Discrepancy',
  'Damaged / Broken Goods',
  'Expired Stock',
  'Found Stock',
  'Data Entry Correction',
  'Sample / Testing Write-off',
  'Scrap / Disposal',
  'Other'
];

export const NewAdjustmentModal: React.FC<NewAdjustmentModalProps> = ({
  isOpen,
  onClose,
  items,
  onSave,
}) => {
  const [adjNumber] = useState(() => generateId('ADJ'));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [type, setType] = useState<'INCREASE' | 'DECREASE'>('DECREASE');
  const [adjustedQty, setAdjustedQty] = useState(1);
  const [reason, setReason] = useState<AdjustmentReason>('Physical Audit Discrepancy');
  const [adjustedBy, setAdjustedBy] = useState('Auditor / Store Keeper');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  const currentItem = items.find(i => i.id === selectedItemId);
  const previousStock = currentItem ? currentItem.currentStock : 0;

  const newStock = type === 'INCREASE' 
    ? previousStock + adjustedQty 
    : Math.max(0, previousStock - adjustedQty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) {
      alert('Please select an item.');
      return;
    }
    if (adjustedQty <= 0) {
      alert('Adjustment quantity must be greater than zero.');
      return;
    }
    if (type === 'DECREASE' && adjustedQty > previousStock) {
      alert(`Cannot decrease stock by ${adjustedQty}. Current on-hand stock is only ${previousStock} ${currentItem.uom}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const newAdj: StockAdjustment = {
        id: `adj-${Date.now()}`,
        adjNumber,
        date,
        type,
        itemId: currentItem.id,
        sku: currentItem.sku,
        name: currentItem.name,
        previousStock,
        adjustedQty,
        newStock,
        reason,
        adjustedBy,
        notes,
        createdAt: new Date().toISOString(),
      };

      await onSave(newAdj);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Stock Adjustment"
      subtitle="Rectify audit count variance, write-off damaged or expired inventory"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Ref #</label>
            <input
              type="text"
              readOnly
              value={adjNumber}
              className="w-full text-xs font-mono font-bold bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Target Item *</label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-medium"
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.sku} - {i.name} (Current: {i.currentStock} {i.uom} @ {i.binLocation})
              </option>
            ))}
          </select>
        </div>

        {/* Adjustment Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjustment Direction *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('INCREASE')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                type === 'INCREASE'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              + INCREASE STOCK
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Found stock / count surplus</span>
            </button>

            <button
              type="button"
              onClick={() => setType('DECREASE')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                type === 'DECREASE'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              - DECREASE STOCK
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Damaged / shortage / write-off</span>
            </button>
          </div>
        </div>

        {/* Quantities and Calculation preview */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Previous Stock</span>
            <span className="text-base font-bold text-slate-700 font-mono">
              {previousStock} {currentItem?.uom}
            </span>
          </div>

          <div>
            <label className="text-[10px] text-slate-600 font-bold block uppercase mb-0.5">Quantity Change</label>
            <input
              type="number"
              min="1"
              value={adjustedQty}
              onChange={(e) => setAdjustedQty(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-20 text-center text-sm font-bold bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 mx-auto"
            />
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">New Stock Balance</span>
            <span className={`text-base font-bold font-mono ${
              type === 'INCREASE' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {newStock} {currentItem?.uom}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason Code *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as AdjustmentReason)}
            className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Adjusted By (Staff / Auditor) *</label>
          <input
            type="text"
            required
            value={adjustedBy}
            onChange={(e) => setAdjustedBy(e.target.value)}
            className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Investigation Details</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain cause of discrepancy, disposal certificate #, incident date..."
            className="w-full text-xs bg-white text-slate-800 p-2.5 rounded-lg border border-slate-300 focus:outline-blue-500"
          />
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
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Adjusting...' : 'Confirm Stock Adjustment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
