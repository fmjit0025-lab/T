import React from 'react';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ArrowRightLeft, 
  Boxes, 
  SlidersHorizontal, 
  BookOpenText, 
  FileSpreadsheet, 
  MapPin,
  Users,
  Layers,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { User, PermissionKey } from '../../types';

export type ActiveTab = 
  | 'dashboard' 
  | 'grn' 
  | 'tog' 
  | 'stock' 
  | 'adjustment' 
  | 'bincard' 
  | 'reports' 
  | 'locations' 
  | 'users';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  currentUser,
  onLogout,
}) => {
  const hasPermission = (key: PermissionKey): boolean => {
    return currentUser.permissions?.includes(key) || currentUser.role === 'Admin';
  };

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Overview & Metrics',
      requiredPerm: 'dashboard:view' as PermissionKey,
    },
    {
      id: 'grn' as ActiveTab,
      label: 'GRN (Goods Received)',
      icon: PackagePlus,
      badge: null,
      desc: 'Inward Receipts',
      requiredPerm: 'grn:view' as PermissionKey,
    },
    {
      id: 'tog' as ActiveTab,
      label: 'TOG (Transfer of Goods)',
      icon: ArrowRightLeft,
      badge: null,
      desc: 'Outward & Excel',
      requiredPerm: 'tog:view' as PermissionKey,
    },
    {
      id: 'stock' as ActiveTab,
      label: 'Stock Management',
      icon: Boxes,
      badge: null,
      desc: 'Items & Master Catalog',
      requiredPerm: 'stock:view' as PermissionKey,
    },
    {
      id: 'locations' as ActiveTab,
      label: 'Locations Master',
      icon: MapPin,
      badge: null,
      desc: 'Bins, Racks & Zones',
      requiredPerm: 'locations:view' as PermissionKey,
    },
    {
      id: 'adjustment' as ActiveTab,
      label: 'Stock Adjustment',
      icon: SlidersHorizontal,
      badge: null,
      desc: 'Audit & Discrepancies',
      requiredPerm: 'adjustment:view' as PermissionKey,
    },
    {
      id: 'bincard' as ActiveTab,
      label: 'Bincard Ledger',
      icon: BookOpenText,
      badge: null,
      desc: 'Item Movement Ledger',
      requiredPerm: 'bincard:view' as PermissionKey,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Analytics',
      icon: FileSpreadsheet,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      desc: 'Valuation & Low Stock',
      requiredPerm: 'reports:view' as PermissionKey,
    },
    {
      id: 'users' as ActiveTab,
      label: 'Users & Permissions',
      icon: Users,
      badge: null,
      desc: 'Staff & Security Roles',
      requiredPerm: 'users:manage' as PermissionKey,
    },
  ];

  // Filter items based on current user permissions
  const visibleMenuItems = menuItems.filter(item => hasPermission(item.requiredPerm));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none no-print">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">StockPulse</h1>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Inventory & WMS</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Inventory Modules
        </div>

        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  {item.desc && (
                    <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  )}
                </div>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout Box */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-blue-400 font-medium truncate">
                {currentUser.role}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-center text-[10px] text-slate-500">
          StockPulse WMS • Role-Protected
        </div>
      </div>
    </aside>
  );
};
