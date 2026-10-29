import React, { useState } from 'react';
import { Item } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { exportStockReportToExcel } from '../../utils/excelExport';
import { 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  BookOpenText, 
  AlertTriangle,
  Boxes,
  MapPin,
  UploadCloud
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface StockManagementViewProps {
  items: Item[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  onAddNewItem: () => void;
  onOpenBulkImport: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onViewBincard: (item: Item) => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  items,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canImport = true,
  onAddNewItem,
  onOpenBulkImport,
  onEditItem,
  onDeleteItem,
  onViewBincard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Categories list
  const categories = Array.from(new Set(items.map(i => i.category))).filter(Boolean);

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'LOW') {
      matchesStock = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
    } else if (stockFilter === 'OUT') {
      matchesStock = item.currentStock === 0;
    }

    return matchesSearch && matchesCat && matchesStock;
  });

  const totalValue = items.reduce((acc, i) => acc + (i.currentStock * i.unitCost), 0);
  const lowCount = items.filter(i => i.currentStock <= i.minStockLevel).length;

  const handleDelete = async (item: Item) => {
    if (window.confirm(`Are you sure you want to delete ${item.sku} - ${item.name}? This will remove it from the master catalog.`)) {
      await onDeleteItem(item.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Actions Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Stock & Items Master Catalog</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {items.length} SKUs configured • Total Inventory Valuation: {formatCurrency(totalValue)} • {lowCount} items need attention
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportStockReportToExcel(filteredItems)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          {canImport && (
            <button
              onClick={onOpenBulkImport}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Import Products (Bulk)</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={onAddNewItem}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Name, Bin or Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-blue-500"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Stock Level Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'LOW' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Low Stock ({items.filter(i => i.currentStock > 0 && i.currentStock <= i.minStockLevel).length})
            </button>
            <button
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'OUT' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Out of Stock ({items.filter(i => i.currentStock === 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Item SKU / Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-right">Stock Valuation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No items found matching the selected filters</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOut = item.currentStock === 0;
                  const isLow = !isOut && item.currentStock <= item.minStockLevel;
                  const itemValuation = item.currentStock * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {item.sku}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        {item.supplier && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            Supplier: {item.supplier}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded w-max">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.binLocation}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatCurrency(item.unitCost)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-block text-center">
                          <span className={`text-sm font-bold font-mono ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                          }`}>
                            {item.currentStock}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">{item.uom}</span>
                          <div className="text-[10px] text-slate-400">
                            Min: {item.minStockLevel}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(itemValuation)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOut && <Badge variant="danger" size="sm">Out of Stock</Badge>}
                        {isLow && (
                          <Badge variant="warning" size="sm">
                            <AlertTriangle className="w-3 h-3 mr-0.5 inline" />
                            Low Stock
                          </Badge>
                        )}
                        {!isOut && !isLow && <Badge variant="success" size="sm">Normal</Badge>}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewBincard(item)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            title="View Bincard Ledger for this item"
                          >
                            <BookOpenText className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                              title="Edit Item Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
