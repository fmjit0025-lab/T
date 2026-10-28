import React from 'react';
import { 
  Flame, 
  Settings, 
  Plus, 
  ArrowRightLeft, 
  PackagePlus, 
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenGRNModal: () => void;
  onOpenTOGModal: () => void;
  onOpenAdjustmentModal: () => void;
  openFirebaseConfig: () => void;
  onResetData: () => void;
  isFirebaseActive: boolean;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenGRNModal,
  onOpenTOGModal,
  onOpenAdjustmentModal,
  openFirebaseConfig,
  onResetData,
  isFirebaseActive,
  lowStockCount,
}) => {
  const getTitles = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Warehouse Dashboard', subtitle: 'Real-time inventory metrics, active stock alerts & recent operations' };
      case 'grn':
        return { title: 'Goods Received Notes (GRN)', subtitle: 'Log inbound shipments, purchase receipts, batch codes & update inventory' };
      case 'tog':
        return { title: 'Transfer of Goods (TOG)', subtitle: 'Manage outward stock dispatches, inter-branch transfers & export to Excel' };
      case 'stock':
        return { title: 'Stock & Items Master', subtitle: 'Manage SKUs, categories, unit costs, minimum stock levels & bin locations' };
      case 'adjustment':
        return { title: 'Stock Adjustment', subtitle: 'Record audit cycle discrepancies, damaged goods write-offs & corrections' };
      case 'bincard':
        return { title: 'Bincard Stock Ledger', subtitle: 'Track historical In/Out movements, running balances & bin audit trails' };
      case 'reports':
        return { title: 'Inventory Reports & Analytics', subtitle: 'Available stock valuation, low stock reorder alerts & Excel exports' };
      default:
        return { title: 'StockPulse WMS', subtitle: 'Inventory Management System' };
    }
  };

  const { title, subtitle } = getTitles();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-3.5 flex items-center justify-between no-print shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Low Stock Indicator */}
        {lowStockCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{lowStockCount} Items Low Stock</span>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={onOpenGRNModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 rounded-lg shadow-2xs transition-colors"
            title="Receive goods into inventory"
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Receive (GRN)</span>
          </button>

          <button
            onClick={onOpenTOGModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 rounded-lg shadow-2xs transition-colors"
            title="Transfer goods outward"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Transfer (TOG)</span>
          </button>

          <button
            onClick={onOpenAdjustmentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 rounded-lg shadow-2xs transition-colors"
            title="Adjust stock balance"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Adjust</span>
          </button>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="Reset Sample Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Firebase Config Button */}
        <button
          onClick={openFirebaseConfig}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isFirebaseActive 
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${isFirebaseActive ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>{isFirebaseActive ? 'Firebase Live' : 'Firebase Settings'}</span>
          <Settings className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
