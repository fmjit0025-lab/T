import React, { useState } from 'react';
import { Item, BincardEntry, TransactionType } from '../../types';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import { exportBincardToExcel } from '../../utils/excelExport';
import { 
  BookOpenText, 
  Search, 
  FileSpreadsheet, 
  MapPin, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface BincardViewProps {
  items: Item[];
  bincards: BincardEntry[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

export const BincardView: React.FC<BincardViewProps> = ({
  items,
  bincards,
  selectedItemId,
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transFilter, setTransFilter] = useState<'ALL' | TransactionType>('ALL');

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Filter bincard entries
  const filteredEntries = bincards.filter(entry => {
    const matchesItem = selectedItemId ? entry.itemId === selectedItemId : true;
    const matchesType = transFilter === 'ALL' || entry.transType === transFilter;
    const matchesSearch = 
      entry.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesItem && matchesType && matchesSearch;
  });

  const totalIn = filteredEntries.reduce((acc, curr) => acc + curr.qtyIn, 0);
  const totalOut = filteredEntries.reduce((acc, curr) => acc + curr.qtyOut, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Bincard Stock Movement Ledger</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete perpetual inventory record tracking receipts (In), dispatches (Out), running balances & bin racks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportBincardToExcel(filteredEntries, selectedItem)}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Bincard to Excel</span>
          </button>
        </div>
      </div>

      {/* Item Selector & Profile Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Select Bin Card Item:</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedItemId || ''}
              onChange={(e) => onSelectItem(e.target.value || null)}
              className="w-full sm:w-96 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-blue-500 focus:bg-white"
            >
              <option value="">-- All Items Master Movement Stream --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} - {i.name} [Bin: {i.binLocation}] (Stock: {i.currentStock} {i.uom})
                </option>
              ))}
            </select>
            {selectedItemId && (
              <button
                onClick={() => onSelectItem(null)}
                className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
              >
                Clear Item
              </button>
            )}
          </div>
        </div>

        {/* Selected Item Highlights Card */}
        {selectedItem && (
          <div className="mt-3 p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Item Code / SKU:</span>
              <span className="font-mono font-bold text-blue-700 text-sm mt-0.5 block">{selectedItem.sku}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block font-medium">Description:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{selectedItem.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Assigned Bin Location:</span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {selectedItem.binLocation}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Current Stock Balance:</span>
              <span className={`text-base font-extrabold font-mono mt-0.5 block ${
                selectedItem.currentStock <= selectedItem.minStockLevel ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {selectedItem.currentStock} {selectedItem.uom}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Reference #, SKU, Remarks, User..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Transaction Type:</span>
          <select
            value={transFilter}
            onChange={(e) => setTransFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="GRN">GRN (Inward Goods)</option>
            <option value="TOG">TOG (Outward Transfer)</option>
            <option value="ADJUSTMENT_IN">Adjustment In (+)</option>
            <option value="ADJUSTMENT_OUT">Adjustment Out (-)</option>
            <option value="INITIAL">Initial Balance</option>
          </select>
        </div>
      </div>

      {/* Bincard Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference #</th>
                {!selectedItemId && <th className="py-3 px-4">Item SKU / Name</th>}
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4 text-right">In (+)</th>
                <th className="py-3 px-4 text-right">Out (-)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
                <th className="py-3 px-4">Handled By</th>
                <th className="py-3 px-4">Remarks / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <BookOpenText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No movement entries found for this query</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{formatDate(entry.date)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {entry.transType === 'GRN' && <Badge variant="success" size="sm">GRN</Badge>}
                      {entry.transType === 'TOG' && <Badge variant="info" size="sm">TOG</Badge>}
                      {entry.transType === 'ADJUSTMENT_IN' && <Badge variant="purple" size="sm">+ADJ</Badge>}
                      {entry.transType === 'ADJUSTMENT_OUT' && <Badge variant="warning" size="sm">-ADJ</Badge>}
                      {entry.transType === 'INITIAL' && <Badge variant="neutral" size="sm">INIT</Badge>}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {entry.refNumber}
                    </td>

                    {!selectedItemId && (
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => onSelectItem(entry.itemId)}
                          className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer truncate max-w-[180px]"
                        >
                          {entry.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">{entry.sku}</div>
                      </td>
                    )}

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {entry.location}
                    </td>

                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                      {entry.qtyIn > 0 ? `+${entry.qtyIn}` : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold font-mono text-rose-600">
                      {entry.qtyOut > 0 ? `-${entry.qtyOut}` : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-sm text-slate-900 bg-slate-50/50">
                      {entry.balance}
                    </td>

                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {entry.user}
                    </td>

                    <td className="py-3 px-4 text-slate-500 max-w-[220px] truncate" title={entry.remarks}>
                      {entry.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-800">
              <tr>
                <td colSpan={selectedItemId ? 3 : 4} className="py-3 px-4 text-right uppercase">
                  Filtered Totals:
                </td>
                <td></td>
                <td className="py-3 px-4 text-right text-emerald-700 font-mono">+{totalIn}</td>
                <td className="py-3 px-4 text-right text-rose-700 font-mono">-{totalOut}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
