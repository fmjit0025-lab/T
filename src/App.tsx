import React, { useState, useEffect, useCallback } from 'react';
import { Item, GRN, TOG, StockAdjustment, BincardEntry } from './types';
import { StorageService } from './services/storageService';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { GRNView } from './components/grn/GRNView';
import { NewGRNModal } from './components/grn/NewGRNModal';
import { GRNDetailModal } from './components/grn/GRNDetailModal';
import { TOGView } from './components/tog/TOGView';
import { NewTOGModal } from './components/tog/NewTOGModal';
import { TOGDetailModal } from './components/tog/TOGDetailModal';
import { StockManagementView } from './components/stock/StockManagementView';
import { ItemModal } from './components/stock/ItemModal';
import { StockAdjustmentView } from './components/adjustment/StockAdjustmentView';
import { NewAdjustmentModal } from './components/adjustment/NewAdjustmentModal';
import { BincardView } from './components/bincard/BincardView';
import { ReportsView } from './components/reports/ReportsView';
import { FirebaseConfigModal } from './components/settings/FirebaseConfigModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [togs, setTogs] = useState<TOG[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [bincards, setBincards] = useState<BincardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isNewGRNOpen, setIsNewGRNOpen] = useState(false);
  const [viewingGRN, setViewingGRN] = useState<GRN | null>(null);
  const [isNewTOGOpen, setIsNewTOGOpen] = useState(false);
  const [viewingTOG, setViewingTOG] = useState<TOG | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isNewAdjustmentOpen, setIsNewAdjustmentOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [bincardSelectedItemId, setBincardSelectedItemId] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [fetchedItems, fetchedGRNs, fetchedTOGs, fetchedAdjs, fetchedBins] = await Promise.all([
        StorageService.getItems(),
        StorageService.getGRNs(),
        StorageService.getTOGs(),
        StorageService.getAdjustments(),
        StorageService.getBincardEntries(),
      ]);

      setItems(fetchedItems);
      setGrns(fetchedGRNs);
      setTogs(fetchedTOGs);
      setAdjustments(fetchedAdjs);
      setBincards(fetchedBins);
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSaveGRN = async (newGRN: GRN) => {
    await StorageService.createGRN(newGRN);
    await loadData();
  };

  const handleSaveTOG = async (newTOG: TOG) => {
    await StorageService.createTOG(newTOG);
    await loadData();
  };

  const handleSaveItem = async (savedItem: Item) => {
    await StorageService.saveItem(savedItem);
    await loadData();
  };

  const handleDeleteItem = async (id: string) => {
    await StorageService.deleteItem(id);
    await loadData();
  };

  const handleSaveAdjustment = async (adj: StockAdjustment) => {
    await StorageService.createAdjustment(adj);
    await loadData();
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all inventory, GRN, TOG, and Bincards to default sample dataset?')) {
      await StorageService.resetToDefault();
      await loadData();
      alert('Sample dataset restored!');
    }
  };

  const handleQuickGRN = (item: Item) => {
    setIsNewGRNOpen(true);
  };

  const handleViewBincard = (item: Item) => {
    setBincardSelectedItemId(item.id);
    setActiveTab('bincard');
  };

  const lowStockCount = items.filter(i => i.currentStock <= i.minStockLevel).length;
  const isFirebaseActive = StorageService.isFirestoreActive();

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
        openFirebaseConfig={() => setIsFirebaseModalOpen(true)}
        isFirebaseActive={isFirebaseActive}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenGRNModal={() => setIsNewGRNOpen(true)}
          onOpenTOGModal={() => setIsNewTOGOpen(true)}
          onOpenAdjustmentModal={() => setIsNewAdjustmentOpen(true)}
          openFirebaseConfig={() => setIsFirebaseModalOpen(true)}
          onResetData={handleResetData}
          isFirebaseActive={isFirebaseActive}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
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

          {activeTab === 'grn' && (
            <GRNView
              grns={grns}
              items={items}
              onOpenNewGRN={() => setIsNewGRNOpen(true)}
              onViewGRN={(grn) => setViewingGRN(grn)}
            />
          )}

          {activeTab === 'tog' && (
            <TOGView
              togs={togs}
              items={items}
              onOpenNewTOG={() => setIsNewTOGOpen(true)}
              onViewTOG={(tog) => setViewingTOG(tog)}
            />
          )}

          {activeTab === 'stock' && (
            <StockManagementView
              items={items}
              onAddNewItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
              onDeleteItem={handleDeleteItem}
              onViewBincard={handleViewBincard}
            />
          )}

          {activeTab === 'adjustment' && (
            <StockAdjustmentView
              adjustments={adjustments}
              items={items}
              onOpenNewAdjustment={() => setIsNewAdjustmentOpen(true)}
              onViewBincard={handleViewBincard}
            />
          )}

          {activeTab === 'bincard' && (
            <BincardView
              items={items}
              bincards={bincards}
              selectedItemId={bincardSelectedItemId}
              onSelectItem={(id) => setBincardSelectedItemId(id)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              items={items}
              onQuickGRN={handleQuickGRN}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewGRNModal
        isOpen={isNewGRNOpen}
        onClose={() => setIsNewGRNOpen(false)}
        items={items}
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
        onSaveTOG={handleSaveTOG}
      />

      <TOGDetailModal
        tog={viewingTOG}
        isOpen={Boolean(viewingTOG)}
        onClose={() => setViewingTOG(null)}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveItem}
      />

      <NewAdjustmentModal
        isOpen={isNewAdjustmentOpen}
        onClose={() => setIsNewAdjustmentOpen(false)}
        items={items}
        onSave={handleSaveAdjustment}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigUpdated={loadData}
      />
    </div>
  );
};

export default App;
