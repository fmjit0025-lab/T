import React, { useState } from 'react';
import { StockAdjustment, Item } from '../../types';
import { formatDate } from '../../utils/formatters';
import { 
  SlidersHorizontal, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface StockAdjustmentViewProps {
  adjustments: StockAdjustment[];
  items: Item[];
  onOpenNewAdjustment: () => void;
  onViewBincard: (item: Item) => void;
}

export const StockAdjustmentView: React.FC<StockAdjustmentViewProps> = ({
  adjustments,
  items,
  onOpenNewAdjustment,
  onViewBincard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');

  const reasons = Array.from(new Set(adjustments.map(a => a.reason))).filter(Boolean);

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = 
      adj.adjNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.adjustedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (adj.notes && adj.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesReason = reasonFilter === 'ALL' || adj.reason === reasonFilter;

    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Stock Adjustment & Audit Trail</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Log inventory discrepancies, damaged/expired stock write-offs, and cycle count corrections
          </p>
        </div>

        <button
          onClick={onOpenNewAdjustment}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Adj#, SKU, Name, Auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Reason:</span>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-blue-500"
          >
            <option value="ALL">All Reasons ({reasons.length})</option>
            {reasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Adjustment #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Item SKU / Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Variance Qty</th>
                <th className="py-3 px-4 text-center">Balance Transition</th>
                <th className="py-3 px-4">Reason Code</th>
                <th className="py-3 px-4">Adjusted By</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No stock adjustment entries found</p>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const isIncrease = adj.type === 'INCREASE';
                  const matchedItem = items.find(i => i.id === adj.itemId || i.sku === adj.sku);

                  return (
                    <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {adj.adjNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(adj.date)}
                      </td>

                      <td className="py-3 px-4">
                        <div 
                          onClick={() => matchedItem && onViewBincard(matchedItem)}
                          className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer"
                        >
                          {adj.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">{adj.sku}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isIncrease ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            INCREASE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            DECREASE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-mono text-sm">
                        {isIncrease ? `+${adj.adjustedQty}` : `-${adj.adjustedQty}`}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className="text-slate-500">{adj.previousStock}</span>
                        <span className="mx-1 text-slate-400">&rarr;</span>
                        <span className="font-bold text-slate-900">{adj.newStock}</span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={isIncrease ? 'purple' : 'warning'} size="sm">
                          {adj.reason}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {adj.adjustedBy}
                      </td>

                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={adj.notes}>
                        {adj.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
