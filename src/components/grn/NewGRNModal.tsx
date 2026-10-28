import React, { useState } from 'react';
import { Item, GRN, GRNItem } from '../../types';
import { Modal } from '../common/Modal';
import { generateId, formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, PackageCheck } from 'lucide-react';

interface NewGRNModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onSaveGRN: (grn: GRN) => Promise<void>;
}

export const NewGRNModal: React.FC<NewGRNModalProps> = ({
  isOpen,
  onClose,
  items,
  onSaveGRN,
}) => {
  const [grnNumber] = useState(() => generateId('GRN'));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receivedBy, setReceivedBy] = useState('Store Officer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items
  const [lineItems, setLineItems] = useState<GRNItem[]>([
    {
      itemId: items[0]?.id || '',
      sku: items[0]?.sku || '',
      name: items[0]?.name || '',
      quantity: 10,
      unitCost: items[0]?.unitCost || 0,
      totalCost: (items[0]?.unitCost || 0) * 10,
      batchNo: '',
      binLocation: items[0]?.binLocation || 'A-01-01',
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
        totalCost: found.unitCost * copy[index].quantity,
        binLocation: found.binLocation,
      };
      return copy;
    });

    if (!supplier && found.supplier) {
      setSupplier(found.supplier);
    }
  };

  const handleQtyChange = (index: number, qty: number) => {
    setLineItems(prev => {
      const copy = [...prev];
      const validQty = Math.max(1, qty);
      copy[index] = {
        ...copy[index],
        quantity: validQty,
        totalCost: validQty * copy[index].unitCost,
      };
      return copy;
    });
  };

  const handleCostChange = (index: number, cost: number) => {
    setLineItems(prev => {
      const copy = [...prev];
      const validCost = Math.max(0, cost);
      copy[index] = {
        ...copy[index],
        unitCost: validCost,
        totalCost: copy[index].quantity * validCost,
      };
      return copy;
    });
  };

  const handleBatchChange = (index: number, batch: string) => {
    setLineItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], batchNo: batch };
      return copy;
    });
  };

  const handleBinChange = (index: number, bin: string) => {
    setLineItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], binLocation: bin };
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
        totalCost: firstItem ? firstItem.unitCost : 0,
        batchNo: '',
        binLocation: firstItem ? firstItem.binLocation : 'A-01-01',
      }
    ]);
  };

  const removeLineRow = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((acc, curr) => acc + curr.totalCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) {
      alert('Please enter a Supplier Name.');
      return;
    }
    if (lineItems.length === 0) {
      alert('Please add at least one received item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newGRN: GRN = {
        id: `grn-${Date.now()}`,
        grnNumber,
        date,
        supplier,
        poNumber,
        invoiceNumber,
        receivedBy,
        items: lineItems,
        totalAmount,
        status: 'Completed',
        notes,
        createdAt: new Date().toISOString(),
      };

      await onSaveGRN(newGRN);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save GRN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Goods Received Note (GRN)"
      subtitle="Receive inbound goods, update item stock balances and bincard ledger"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GRN Number</label>
            <input
              type="text"
              readOnly
              value={grnNumber}
              className="w-full text-xs font-mono font-bold bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Micro Electronics Ltd."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Order (PO) #</label>
            <input
              type="text"
              placeholder="e.g. PO-2026-089"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Delivery Challan #</label>
            <input
              type="text"
              placeholder="e.g. INV-9821"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Received By</label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Received Line Items ({lineItems.length})
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
                  <th className="py-2 px-2 w-28">Bin Location</th>
                  <th className="py-2 px-2 w-28">Batch / Lot #</th>
                  <th className="py-2 px-2 w-24 text-right">Qty Received</th>
                  <th className="py-2 px-2 w-28 text-right">Unit Cost ($)</th>
                  <th className="py-2 px-2 w-28 text-right">Total ($)</th>
                  <th className="py-2 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <select
                        value={line.itemId}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="w-full text-xs bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                      >
                        {items.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.sku} - {i.name} ({i.uom})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.binLocation}
                        onChange={(e) => handleBinChange(idx, e.target.value)}
                        placeholder="Bin"
                        className="w-full text-xs font-mono bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Optional"
                        value={line.batchNo || ''}
                        onChange={(e) => handleBatchChange(idx, e.target.value)}
                        className="w-full text-xs bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                      />
                    </td>

                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full text-right text-xs font-semibold bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                      />
                    </td>

                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unitCost}
                        onChange={(e) => handleCostChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-xs bg-white text-slate-800 px-2 py-1.5 rounded border border-slate-300 focus:outline-blue-500"
                      />
                    </td>

                    <td className="py-2 px-2 text-right font-bold text-slate-800">
                      {formatCurrency(line.totalCost)}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineRow(idx)}
                        disabled={lineItems.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Notes & Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Items inspected, packages intact, test report verified."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-white text-slate-800 p-2.5 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total GRN Value:</span>
            <span className="text-xl font-extrabold text-blue-700">{formatCurrency(totalAmount)}</span>
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
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <PackageCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing Receipt...' : 'Confirm & Post GRN'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
