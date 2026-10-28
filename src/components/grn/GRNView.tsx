import React, { useState } from 'react';
import { GRN, Item } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportSingleGRNToExcel } from '../../utils/excelExport';
import { 
  PackagePlus, 
  Search, 
  FileSpreadsheet, 
  Eye, 
  FileText,
  Calendar,
  Building2,
  Package
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface GRNViewProps {
  grns: GRN[];
  items: Item[];
  onOpenNewGRN: () => void;
  onViewGRN: (grn: GRN) => void;
}

export const GRNView: React.FC<GRNViewProps> = ({
  grns,
  onOpenNewGRN,
  onViewGRN,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredGRNs = grns.filter((g) => {
    const matchesSearch = 
      g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.poNumber && g.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (g.invoiceNumber && g.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      g.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = !dateFilter || g.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const totalInwardValue = grns.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalItemsReceived = grns.reduce((acc, curr) => 
    acc + curr.items.reduce((s, i) => s + i.quantity, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Inbound Receipts (GRN Register)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {grns.length} GRNs logged • {totalItemsReceived.toLocaleString()} units received • {formatCurrency(totalInwardValue)} total inward value
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewGRN}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Receive Goods (New GRN)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by GRN#, Supplier, PO#, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date:</span>
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-blue-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* GRN Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">GRN Number</th>
                <th className="py-3 px-4">Receipt Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">PO / Inv #</th>
                <th className="py-3 px-4">Items Received</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No Goods Received Notes found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing filters or record your first GRN above.</p>
                  </td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => {
                  const itemsSummary = grn.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                  return (
                    <tr key={grn.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {grn.grnNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(grn.date)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{grn.supplier}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        <div>{grn.poNumber || '-'}</div>
                        <div className="text-[10px] text-slate-400">{grn.invoiceNumber || ''}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700">{grn.items.length} line {grn.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[220px]" title={itemsSummary}>
                          {itemsSummary}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(grn.totalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm">
                          {grn.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewGRN(grn)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            title="View / Print GRN Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => exportSingleGRNToExcel(grn)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                            title="Export this GRN to Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
