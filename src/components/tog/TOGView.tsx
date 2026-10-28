import React, { useState } from 'react';
import { TOG, Item } from '../../types';
import { formatDate } from '../../utils/formatters';
import { exportSingleTOGToExcel, exportTOGRegisterToExcel } from '../../utils/excelExport';
import { 
  ArrowRightLeft, 
  Search, 
  FileSpreadsheet, 
  Eye, 
  Calendar,
  Building,
  Layers,
  FileCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface TOGViewProps {
  togs: TOG[];
  items: Item[];
  onOpenNewTOG: () => void;
  onViewTOG: (tog: TOG) => void;
}

export const TOGView: React.FC<TOGViewProps> = ({
  togs,
  onOpenNewTOG,
  onViewTOG,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredTOGs = togs.filter((t) => {
    const matchesSearch = 
      t.togNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.purpose && t.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = !dateFilter || t.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const totalTransferredUnits = togs.reduce((acc, curr) => 
    acc + curr.items.reduce((s, i) => s + i.quantity, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Transfer of Goods (TOG Register)</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Excel Export Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {togs.length} Transfers logged • {totalTransferredUnits.toLocaleString()} units dispatched • Transfer notes printable & exportable
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Main Excel Export for TOG Register */}
          <button
            onClick={() => exportTOGRegisterToExcel(filteredTOGs)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Export all filtered TOG transfers to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Register to Excel</span>
          </button>

          <button
            onClick={onOpenNewTOG}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Goods (New TOG)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by TOG#, Destination, Item, Requester..."
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

      {/* TOG Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">TOG Number</th>
                <th className="py-3 px-4">Transfer Date</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Destination Dept / Project</th>
                <th className="py-3 px-4">Items Transferred</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Export / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTOGs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No Transfer of Goods records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Click "Transfer Goods (New TOG)" to initiate a dispatch.</p>
                  </td>
                </tr>
              ) : (
                filteredTOGs.map((tog) => {
                  const totalUnits = tog.items.reduce((s, i) => s + i.quantity, 0);
                  const itemsSummary = tog.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

                  return (
                    <tr key={tog.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {tog.togNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(tog.date)}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{tog.sourceLocation}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{tog.destinationLocation}</span>
                        </div>
                        {tog.purpose && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {tog.purpose}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">
                          {tog.items.length} line items ({totalUnits} units)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={itemsSummary}>
                          {itemsSummary}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {tog.requestedBy}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="info" size="sm">
                          {tog.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Direct Excel Export Button for this specific TOG */}
                          <button
                            onClick={() => exportSingleTOGToExcel(tog)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1 transition-colors"
                            title="Export this TOG to Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Excel</span>
                          </button>

                          <button
                            onClick={() => onViewTOG(tog)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            title="View Gate Pass / Print Slip"
                          >
                            <Eye className="w-4 h-4" />
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
