import React, { useState } from 'react';
import { Item } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { exportStockReportToExcel, exportLowStockReportToExcel } from '../../utils/excelExport';
import { 
  FileSpreadsheet, 
  Search, 
  AlertTriangle, 
  PackageCheck, 
  DollarSign, 
  Boxes, 
  ArrowRight, 
  PackagePlus,
  TrendingDown,
  Building2
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface ReportsViewProps {
  items: Item[];
  onQuickGRN: (item: Item) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  items,
  onQuickGRN,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'available' | 'lowStock'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = Array.from(new Set(items.map(i => i.category))).filter(Boolean);

  // Available stock items
  const availableItems = items.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Low stock items (currentStock <= minStockLevel)
  const lowStockItems = items.filter(item => item.currentStock <= item.minStockLevel);

  const filteredLowStock = lowStockItems.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // KPI Calculations
  const totalValuation = availableItems.reduce((acc, i) => acc + (i.currentStock * i.unitCost), 0);
  const totalUnits = availableItems.reduce((acc, i) => acc + i.currentStock, 0);

  const totalReorderEstCost = lowStockItems.reduce((acc, i) => {
    const deficit = Math.max(0, i.minStockLevel - i.currentStock);
    const suggested = deficit * 2;
    return acc + (suggested * i.unitCost);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Report Switcher & Excel Action Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Inventory Reports & Intelligence</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit inventory balances, evaluate working capital and generate restock procurement plans
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveReportTab('available')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeReportTab === 'available'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available Stock Report
            </button>
            <button
              onClick={() => setActiveReportTab('lowStock')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeReportTab === 'lowStock'
                  ? 'bg-white text-rose-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Low Stock Alerts</span>
              {lowStockItems.length > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              if (activeReportTab === 'available') {
                exportStockReportToExcel(availableItems);
              } else {
                exportLowStockReportToExcel(filteredLowStock);
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AVAILABLE STOCK REPORT */}
      {activeReportTab === 'available' && (
        <div className="space-y-5">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase">Total Inventory Valuation</span>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalValuation)}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Calculated at current unit purchase costs</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase">Total On Hand Stock</span>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">{totalUnits.toLocaleString()} units</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Across {availableItems.length} filtered items</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase">Healthy Stock Ratio</span>
              <h4 className="text-2xl font-bold text-emerald-600 mt-1">
                {items.length > 0 ? `${Math.round(((items.length - lowStockItems.length) / items.length) * 100)}%` : '100%'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{items.length - lowStockItems.length} of {items.length} items above threshold</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU, Item Name, Bin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-blue-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Available Stock Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">SKU / Item Code</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Bin Location</th>
                    <th className="py-3 px-4 text-center">Safety Level</th>
                    <th className="py-3 px-4 text-center">Available Units</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {availableItems.map((item) => {
                    const isOut = item.currentStock === 0;
                    const isLow = !isOut && item.currentStock <= item.minStockLevel;
                    const itemValue = item.currentStock * item.unitCost;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {item.sku}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.category}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {item.binLocation}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-mono">
                          {item.minStockLevel} {item.uom}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-extrabold text-sm text-slate-900">
                          {item.currentStock} {item.uom}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {formatCurrency(item.unitCost)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                          {formatCurrency(itemValue)}
                        </td>
                        <td className="py-3 px-4">
                          {isOut && <Badge variant="danger" size="sm">Out of Stock</Badge>}
                          {isLow && <Badge variant="warning" size="sm">Low Stock</Badge>}
                          {!isOut && !isLow && <Badge variant="success" size="sm">Healthy</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK / REORDER ALERT REPORT */}
      {activeReportTab === 'lowStock' && (
        <div className="space-y-5">
          {/* Reorder Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <span className="text-xs font-semibold text-rose-700 uppercase">Items Requiring Reorder</span>
              <h4 className="text-2xl font-black text-rose-800 mt-1">{lowStockItems.length} SKUs</h4>
              <p className="text-[11px] text-rose-600 mt-0.5">Currently at or below minimum threshold</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase">Estimated Restock Cost</span>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalReorderEstCost)}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">To restore healthy 2x buffer levels</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase">Stockout Risk</span>
              <h4 className="text-2xl font-bold text-amber-600 mt-1">
                {lowStockItems.filter(i => i.currentStock === 0).length} Critical
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Items with zero remaining units</p>
            </div>
          </div>

          {/* Low Stock Reorder List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/70 border-b border-rose-100 text-rose-900 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Item SKU / Name</th>
                    <th className="py-3 px-4">Bin Location</th>
                    <th className="py-3 px-4 text-center">On Hand Stock</th>
                    <th className="py-3 px-4 text-center">Min Threshold</th>
                    <th className="py-3 px-4 text-center">Deficit Units</th>
                    <th className="py-3 px-4 text-center">Suggested Order</th>
                    <th className="py-3 px-4 text-right">Est. Cost</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLowStock.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <PackageCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                        <p className="font-medium text-slate-700">Excellent! No low stock items.</p>
                        <p className="text-[11px] text-slate-400 mt-1">All inventory items are currently above minimum threshold.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLowStock.map((item) => {
                      const deficit = Math.max(0, item.minStockLevel - item.currentStock);
                      const suggestedOrder = deficit * 2;
                      const estCost = suggestedOrder * item.unitCost;
                      const isCritical = item.currentStock === 0;

                      return (
                        <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{item.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{item.sku}</div>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-700">
                            {item.binLocation}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`font-mono font-extrabold text-sm ${
                              isCritical ? 'text-rose-600 bg-rose-100 px-2 py-0.5 rounded' : 'text-amber-600'
                            }`}>
                              {item.currentStock} {item.uom}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {item.minStockLevel} {item.uom}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                            -{deficit}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-blue-700 bg-blue-50/50">
                            +{suggestedOrder} {item.uom}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {formatCurrency(estCost)}
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{item.supplier || 'Unassigned'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onQuickGRN(item)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1 mx-auto transition-colors"
                              title="Create GRN to receive this item"
                            >
                              <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Receive (GRN)</span>
                            </button>
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
      )}
    </div>
  );
};
