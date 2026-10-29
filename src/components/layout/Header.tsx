import React from 'react';
import { 
  ArrowRightLeft, 
  PackagePlus, 
  SlidersHorizontal,
  RotateCcw,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { User, PermissionKey } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: User;
  onOpenGRNModal: () => void;
  onOpenTOGModal: () => void;
  onOpenAdjustmentModal: () => void;
  onResetData: () => void;
  onLogout: () => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onOpenGRNModal,
  onOpenTOGModal,
  onOpenAdjustmentModal,
  onResetData,
  onLogout,
  lowStockCount,
}) => {
  const hasPermission = (key: PermissionKey): boolean => {
    return currentUser.permissions?.includes(key) || currentUser.role === 'Admin';
  };

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
      case 'locations':
        return { title: 'Warehouse Storage Locations Master', subtitle: 'Configure bins, racks, shelves, cold storage and loading bays' };
      case 'adjustment':
        return { title: 'Stock Adjustment', subtitle: 'Record audit cycle discrepancies, damaged goods write-offs & corrections' };
      case 'bincard':
        return { title: 'Bincard Stock Ledger', subtitle: 'Track historical In/Out movements, running balances & bin audit trails' };
      case 'reports':
        return { title: 'Inventory Reports & Analytics', subtitle: 'Available stock valuation, low stock reorder alerts & Excel exports' };
      case 'users':
        return { title: 'User & Security Administration', subtitle: 'Manage warehouse staff, roles and assigned module permissions' };
      default:
        return { title: 'StockPulse WMS', subtitle: 'Inventory Management System' };
    }
  };

  const { title, subtitle } = getTitles();

  const canCreateGRN = hasPermission('grn:create');
  const canCreateTOG = hasPermission('tog:create');
  const canCreateAdj = hasPermission('adjustment:create');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-8 py-3.5 flex items-center justify-between no-print shadow-xs">
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
        {(canCreateGRN || canCreateTOG || canCreateAdj) && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {canCreateGRN && (
              <button
                onClick={onOpenGRNModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 rounded-lg shadow-2xs transition-colors"
                title="Receive goods into inventory"
              >
                <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Receive (GRN)</span>
              </button>
            )}

            {canCreateTOG && (
              <button
                onClick={onOpenTOGModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 rounded-lg shadow-2xs transition-colors"
                title="Transfer goods outward"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Transfer (TOG)</span>
              </button>
            )}

            {canCreateAdj && (
              <button
                onClick={onOpenAdjustmentModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 rounded-lg shadow-2xs transition-colors"
                title="Adjust stock balance"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Adjust</span>
              </button>
            )}
          </div>
        )}

        {/* Reset Demo Data Button */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={onResetData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Reset Sample Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Current User Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-none">{currentUser.fullName}</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{currentUser.role}</div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
