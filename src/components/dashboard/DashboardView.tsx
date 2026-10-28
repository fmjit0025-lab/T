import React from 'react';
import { 
  Item, 
  GRN, 
  TOG, 
  StockAdjustment, 
  BincardEntry 
} from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  DollarSign, 
  Boxes, 
  AlertTriangle, 
  PackagePlus, 
  ArrowRightLeft, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownRight,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { ActiveTab } from '../layout/Sidebar';
import { exportLowStockReportToExcel, exportStockReportToExcel } from '../../utils/excelExport';

interface DashboardViewProps {
  items: Item[];
  grns: GRN[];
  togs: TOG[];
  adjustments: StockAdjustment[];
  bincards: BincardEntry[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGRN: () => void;
  onOpenTOG: () => void;
  onOpenAdjustment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  grns,
  togs,
  adjustments,
  bincards,
  setActiveTab,
  onOpenGRN,
  onOpenTOG,
  onOpenAdjustment,
}) => {
  // Calculations
  const totalStockValue = items.reduce((acc, item) => acc + (item.currentStock * item.unitCost), 0);
  const lowStockItems = items.filter(i => i.currentStock <= i.minStockLevel);
  const totalUnits = items.reduce((acc, item) => acc + item.currentStock, 0);

  // Category breakdown
  const categoryStats = items.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) {
      acc[cat] = { count: 0, value: 0, units: 0 };
    }
    acc[cat].count += 1;
    acc[cat].units += item.currentStock;
    acc[cat].value += item.currentStock * item.unitCost;
    return acc;
  }, {} as Record<string, { count: number; value: number; units: number }>);

  // Recent 6 transactions
  const recentMovements = [...bincards]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Action Required: {lowStockItems.length} Inventory {lowStockItems.length === 1 ? 'Item has' : 'Items have'} dropped below safety threshold!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Review minimum levels, reorder deficits, and generate Goods Received Notes (GRN) to prevent stockouts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLowStockReportToExcel(lowStockItems)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Low Stocks</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
            >
              <span>View Reorder Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Stock Value"
          value={formatCurrency(totalStockValue)}
          subtitle={`${totalUnits.toLocaleString()} units stored in warehouse`}
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          badge={{ text: 'Active Valuation', variant: 'success' }}
          onClick={() => setActiveTab('reports')}
        />

        <StatCard
          title="Master Items"
          value={items.length}
          subtitle={`Across ${Object.keys(categoryStats).length} product categories`}
          icon={Boxes}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          badge={{ text: 'Catalog', variant: 'info' }}
          onClick={() => setActiveTab('stock')}
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          subtitle={lowStockItems.length > 0 ? 'Urgent reordering required' : 'All items optimal'}
          icon={TrendingDown}
          iconBgColor={lowStockItems.length > 0 ? 'bg-rose-50' : 'bg-slate-50'}
          iconColor={lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-400'}
          badge={{ 
            text: lowStockItems.length > 0 ? 'Attention Needed' : 'Healthy', 
            variant: lowStockItems.length > 0 ? 'danger' : 'success' 
          }}
          onClick={() => setActiveTab('reports')}
        />

        <StatCard
          title="Inward / Outward Ops"
          value={`${grns.length} GRN / ${togs.length} TOG`}
          subtitle={`${adjustments.length} stock adjustment audits`}
          icon={ArrowRightLeft}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          badge={{ text: 'Audited Ledger', variant: 'purple' }}
          onClick={() => setActiveTab('bincard')}
        />
      </div>

      {/* Quick Action Bar & Module Shortcuts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quick Operations</h3>
            <p className="text-xs text-slate-500">Initiate core warehouse receipts, dispatches and auditing</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportStockReportToExcel(items)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Stock Sheet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div 
            onClick={onOpenGRN}
            className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-start gap-3.5"
          >
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                Receive Goods (GRN)
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Record new supplier deliveries, assign bin locations, and increment stock balances.
              </p>
            </div>
          </div>

          <div 
            onClick={onOpenTOG}
            className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all flex items-start gap-3.5"
          >
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 flex items-center gap-1">
                Transfer Goods (TOG)
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue goods to departments/stores, validate stock levels, and export formatted vouchers to Excel.
              </p>
            </div>
          </div>

          <div 
            onClick={onOpenAdjustment}
            className="group p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 cursor-pointer transition-all flex items-start gap-3.5"
          >
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-700 flex items-center gap-1">
                Stock Adjustment
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Rectify physical count discrepancies, scrap damaged/expired units, and record audit reasons.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Ledger Transactions & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bincard Ledger Movements (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Stock Movements (Bincard Stream)</h3>
                <p className="text-xs text-slate-500">Live transaction ledger across all warehouse bins</p>
              </div>
              <button
                onClick={() => setActiveTab('bincard')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 uppercase font-semibold">
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Ref #</th>
                    <th className="py-2.5 px-2">Item / SKU</th>
                    <th className="py-2.5 px-2">Bin</th>
                    <th className="py-2.5 px-2 text-right">In (+)</th>
                    <th className="py-2.5 px-2 text-right">Out (-)</th>
                    <th className="py-2.5 px-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-2">
                          {tx.transType === 'GRN' && <Badge variant="success" size="sm">GRN</Badge>}
                          {tx.transType === 'TOG' && <Badge variant="info" size="sm">TOG</Badge>}
                          {tx.transType === 'ADJUSTMENT_IN' && <Badge variant="purple" size="sm">+ADJ</Badge>}
                          {tx.transType === 'ADJUSTMENT_OUT' && <Badge variant="warning" size="sm">-ADJ</Badge>}
                          {tx.transType === 'INITIAL' && <Badge variant="neutral" size="sm">INIT</Badge>}
                        </td>
                        <td className="py-2.5 px-2 font-mono font-medium text-slate-700">
                          {tx.refNumber}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-semibold text-slate-800 truncate max-w-[170px]">{tx.name}</div>
                          <div className="text-[10px] text-slate-500">{tx.sku}</div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-600">
                          {tx.location}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-emerald-600">
                          {tx.qtyIn > 0 ? `+${tx.qtyIn}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-rose-600">
                          {tx.qtyOut > 0 ? `-${tx.qtyOut}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                          {tx.balance}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Category Valuation</h3>
                <p className="text-xs text-slate-500">Asset distribution by category</p>
              </div>
              <button
                onClick={() => setActiveTab('stock')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Items</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {Object.entries(categoryStats).map(([catName, stats]) => {
                const percent = totalStockValue > 0 ? Math.round((stats.value / totalStockValue) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{catName}</span>
                      <span className="font-mono text-slate-500">{formatCurrency(stats.value)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{stats.count} SKUs</span>
                      <span>{stats.units.toLocaleString()} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Valuation:</span>
            <span className="font-bold text-slate-800">{formatCurrency(totalStockValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
