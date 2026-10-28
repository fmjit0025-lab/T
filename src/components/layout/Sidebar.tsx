import React from 'react';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ArrowRightLeft, 
  Boxes, 
  SlidersHorizontal, 
  BookOpenText, 
  FileSpreadsheet, 
  Flame,
  Layers
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'grn' | 'tog' | 'stock' | 'adjustment' | 'bincard' | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  openFirebaseConfig: () => void;
  isFirebaseActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  openFirebaseConfig,
  isFirebaseActive,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'grn' as ActiveTab,
      label: 'GRN (Goods Received)',
      icon: PackagePlus,
      badge: null,
      desc: 'Inward Receipts',
    },
    {
      id: 'tog' as ActiveTab,
      label: 'TOG (Transfer of Goods)',
      icon: ArrowRightLeft,
      badge: null,
      desc: 'Outward & Excel',
    },
    {
      id: 'stock' as ActiveTab,
      label: 'Stock Management',
      icon: Boxes,
      badge: null,
      desc: 'Items & Master Data',
    },
    {
      id: 'adjustment' as ActiveTab,
      label: 'Stock Adjustment',
      icon: SlidersHorizontal,
      badge: null,
      desc: 'Audit & Spoilage',
    },
    {
      id: 'bincard' as ActiveTab,
      label: 'Bincard Ledger',
      icon: BookOpenText,
      badge: null,
      desc: 'Item Bin Ledger',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Analytics',
      icon: FileSpreadsheet,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeVariant: 'danger',
      desc: 'Available & Low Stock',
    },
  ];

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
      <nav className="p-3 space-y-1.5 flex-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Inventory Modules
        </div>

        {menuItems.map((item) => {
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

      {/* Firebase Status Card */}
      <div className="p-4 border-t border-slate-800">
        <div 
          onClick={openFirebaseConfig}
          className="bg-slate-800/80 hover:bg-slate-800 rounded-xl p-3 border border-slate-700/60 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${isFirebaseActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-white">Firebase Sync</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {isFirebaseActive ? 'Connected to Firestore' : 'Local / Demo Mode'}
          </p>
          <div className="mt-2 text-[11px] text-blue-400 group-hover:text-blue-300 font-medium flex items-center justify-between">
            <span>Configure Firebase</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-slate-400">
          StockPulse WMS v2.4 • 2026
        </div>
      </div>
    </aside>
  );
};
