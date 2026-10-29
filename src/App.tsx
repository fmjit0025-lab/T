import React, { useState, useEffect, useCallback } from 'react';
import { 
  Item, 
  GRN, 
  TOG, 
  StockAdjustment, 
  BincardEntry, 
  Location, 
  User, 
  PermissionKey 
} from './types';
import { StorageService } from './services/storageService';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { GRNView } from './components/grn/GRNView';
import { NewGRNModal } from './components/grn/NewGRNModal';
import { GRNDetailModal } from './components/grn/GRNDetailModal';
import { TOGView } from './components/tog/TOGView';
import { NewTOGModal } from './components/tog/NewTOGModal';
import { TOGDetailModal } from './components/tog/TOGDetailModal';
import { StockManagementView } from './components/stock/StockManagementView';
import { ItemModal } from './components/stock/ItemModal';
import { BulkImportModal } from './components/stock/BulkImportModal';
import { LocationsView } from './components/locations/LocationsView';
import { LocationModal } from './components/locations/LocationModal';
import { StockAdjustmentView } from './components/adjustment/StockAdjustmentView';
import { NewAdjustmentModal } from './components/adjustment/NewAdjustmentModal';
import { BincardView } from './components/bincard/BincardView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { UserModal } from './components/users/UserModal';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Master data states
  const [items, setItems] = useState<Item[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [togs, setTogs] = useState<TOG[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [bincards, setBincards] = useState<BincardEntry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isNewGRNOpen, setIsNewGRNOpen] = useState(false);
  const [viewingGRN, setViewingGRN] = useState<GRN | null>(null);
  const [isNewTOGOpen, setIsNewTOGOpen] = useState(false);
  const [viewingTOG, setViewingTOG] = useState<TOG | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isNewAdjustmentOpen, setIsNewAdjustmentOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [bincardSelectedItemId, setBincardSelectedItemId] = useState<string | null>(null);

  // Permission helper
  const hasPerm = (key: PermissionKey): boolean => {
    if (!currentUser) return false;
    return currentUser.role === 'Admin' || currentUser.permissions?.includes(key);
  };

  // Load all application data
  const loadData = useCallback(async () => {
    try {
      const [
        fetchedItems, 
        fetchedGRNs, 
        fetchedTOGs, 
        fetchedAdjs, 
        fetchedBins, 
        fetchedLocs, 
        fetchedUsers
      ] = await Promise.all([
        StorageService.getItems(),
        StorageService.getGRNs(),
        StorageService.getTOGs(),
        StorageService.getAdjustments(),
        StorageService.getBincardEntries(),
        StorageService.getLocations(),
        StorageService.getUsers(),
      ]);

      setItems(fetchedItems);
      setGrns(fetchedGRNs);
      setTogs(fetchedTOGs);
      setAdjustments(fetchedAdjs);
      setBincards(fetchedBins);
      setLocations(fetchedLocs);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Items
  const handleSaveItem = async (savedItem: Item) => {
    await StorageService.saveItem(savedItem);
    await loadData();
  };

  const handleDeleteItem = async (id: string) => {
    await StorageService.deleteItem(id);
    await loadData();
  };

  // Handler for Bulk Product Import
  const handleBulkImport = async (importedItems: Item[]) => {
    const result = await StorageService.bulkImportItems(
      importedItems, 
      currentUser?.fullName || 'Bulk Import'
    );
    await loadData();
    alert(`Success: ${result.imported} new items created, ${result.updated} existing items updated!`);
  };

  // Handlers for Locations
  const handleSaveLocation = async (loc: Location) => {
    await StorageService.saveLocation(loc);
    await loadData();
  };

  const handleDeleteLocation = async (id: string) => {
    await StorageService.deleteLocation(id);
    await loadData();
  };

  // Handlers for Users & Permissions
  const handleSaveUser = async (userToSave: User) => {
    await StorageService.saveUser(userToSave);
    if (currentUser?.id === userToSave.id) {
      setCurrentUser(userToSave);
    }
    await loadData();
  };

  const handleDeleteUser = async (id: string) => {
    await StorageService.deleteUser(id);
    await loadData();
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  // Handlers for GRN & TOG & Adjustments
  const handleSaveGRN = async (newGRN: GRN) => {
    await StorageService.createGRN(newGRN);
    await loadData();
  };

  const handleSaveTOG = async (newTOG: TOG) => {
    await StorageService.createTOG(newTOG);
    await loadData();
  };

  const handleSaveAdjustment = async (adj: StockAdjustment) => {
    await StorageService.createAdjustment(adj);
    await loadData();
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all inventory, locations, GRNs, TOGs, and sample users to defaults?')) {
      await StorageService.resetToDefault();
      await loadData();
      alert('Sample dataset restored!');
    }
  };

  const handleQuickGRN = (_item: Item) => {
    setIsNewGRNOpen(true);
  };

  const handleViewBincard = (item: Item) => {
    setBincardSelectedItemId(item.id);
    setActiveTab('bincard');
  };

  const lowStockCount = items.filter(i => i.currentStock <= i.minStockLevel).length;

  // If user is not authenticated, display Login / Register page
  if (!currentUser) {
    return (
      <AuthPage 
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">Initializing StockPulse WMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenGRNModal={() => setIsNewGRNOpen(true)}
          onOpenTOGModal={() => setIsNewTOGOpen(true)}
          onOpenAdjustmentModal={() => setIsNewAdjustmentOpen(true)}
          onResetData={handleResetData}
          onLogout={handleLogout}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && hasPerm('dashboard:view') && (
            <DashboardView
              items={items}
              grns={grns}
              togs={togs}
              adjustments={adjustments}
              bincards={bincards}
              setActiveTab={setActiveTab}
              onOpenGRN={() => setIsNewGRNOpen(true)}
              onOpenTOG={() => setIsNewTOGOpen(true)}
              onOpenAdjustment={() => setIsNewAdjustmentOpen(true)}
            />
          )}

          {activeTab === 'grn' && hasPerm('grn:view') && (
            <GRNView
              grns={grns}
              items={items}
              onOpenNewGRN={() => setIsNewGRNOpen(true)}
              onViewGRN={(grn) => setViewingGRN(grn)}
            />
          )}

          {activeTab === 'tog' && hasPerm('tog:view') && (
            <TOGView
              togs={togs}
              items={items}
              onOpenNewTOG={() => setIsNewTOGOpen(true)}
              onViewTOG={(tog) => setViewingTOG(tog)}
            />
          )}

          {activeTab === 'stock' && hasPerm('stock:view') && (
            <StockManagementView
              items={items}
              canCreate={hasPerm('stock:create')}
              canEdit={hasPerm('stock:edit')}
              canDelete={hasPerm('stock:delete')}
              canImport={hasPerm('stock:import')}
              onAddNewItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
              onDeleteItem={handleDeleteItem}
              onViewBincard={handleViewBincard}
            />
          )}

          {activeTab === 'locations' && hasPerm('locations:view') && (
            <LocationsView
              locations={locations}
              items={items}
              canManage={hasPerm('locations:manage')}
              onAddNewLocation={() => {
                setEditingLocation(null);
                setIsLocationModalOpen(true);
              }}
              onEditLocation={(loc) => {
                setEditingLocation(loc);
                setIsLocationModalOpen(true);
              }}
              onDeleteLocation={handleDeleteLocation}
            />
          )}

          {activeTab === 'adjustment' && hasPerm('adjustment:view') && (
            <StockAdjustmentView
              adjustments={adjustments}
              items={items}
              onOpenNewAdjustment={() => setIsNewAdjustmentOpen(true)}
              onViewBincard={handleViewBincard}
            />
          )}

          {activeTab === 'bincard' && hasPerm('bincard:view') && (
            <BincardView
              items={items}
              bincards={bincards}
              selectedItemId={bincardSelectedItemId}
              onSelectItem={(id) => setBincardSelectedItemId(id)}
            />
          )}

          {activeTab === 'reports' && hasPerm('reports:view') && (
            <ReportsView
              items={items}
              onQuickGRN={handleQuickGRN}
            />
          )}

          {activeTab === 'users' && hasPerm('users:manage') && (
            <UsersView
              users={users}
              currentUser={currentUser}
              onAddNewUser={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              onEditUser={(u) => {
                setEditingUser(u);
                setIsUserModalOpen(true);
              }}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>
      </div>

      {/* Product Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        locations={locations}
        onSave={handleSaveItem}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        existingItems={items}
        locations={locations}
        onImportSuccess={handleBulkImport}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
        location={editingLocation}
        existingCodes={locations.map(l => l.code)}
        onSave={handleSaveLocation}
      />

      {/* User & Permissions Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        existingUsers={users}
        onSave={handleSaveUser}
      />

      {/* Operational Modals */}
      <NewGRNModal
        isOpen={isNewGRNOpen}
        onClose={() => setIsNewGRNOpen(false)}
        items={items}
        locations={locations}
        onSaveGRN={handleSaveGRN}
      />

      <GRNDetailModal
        grn={viewingGRN}
        isOpen={Boolean(viewingGRN)}
        onClose={() => setViewingGRN(null)}
      />

      <NewTOGModal
        isOpen={isNewTOGOpen}
        onClose={() => setIsNewTOGOpen(false)}
        items={items}
        locations={locations}
        onSaveTOG={handleSaveTOG}
      />

      <TOGDetailModal
        tog={viewingTOG}
        isOpen={Boolean(viewingTOG)}
        onClose={() => setViewingTOG(null)}
      />

      <NewAdjustmentModal
        isOpen={isNewAdjustmentOpen}
        onClose={() => setIsNewAdjustmentOpen(false)}
        items={items}
        onSave={handleSaveAdjustment}
      />
    </div>
  );
};

export default App;
