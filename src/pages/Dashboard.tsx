import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Navbar from '../components/Navbar';
import InventoryTable from '../components/InventoryTable';
import CreateItemModal from '../components/CreateItemModal';
import StockModal from '../components/StockModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../hooks/useAuth';
import type { InventoryItem } from '../types/inventory';
import { getStockStatus, getStatusConfig } from '../utils/stockStatus';

type ModalMode = 'stock-in' | 'stock-out';

interface StockModalState {
  isOpen: boolean;
  mode: ModalMode;
  item: InventoryItem | null;
}

export default function Dashboard() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create item modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Stock modal
  const [stockModal, setStockModal] = useState<StockModalState>({
    isOpen: false,
    mode: 'stock-in',
    item: null,
  });
  const [stockSubmitting, setStockSubmitting] = useState(false);

  // Confirm dialog for stock-out
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    pendingQty: number | null;
  }>({ isOpen: false, pendingQty: null });

  // Load inventory
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await inventoryService.getAll();
      setItems(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setLoadError(err.response?.data?.message ?? 'Failed to load inventory.');
      } else {
        setLoadError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Stats
  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const lowOrOut = items.filter((i) => getStockStatus(i.quantity) !== 'IN_STOCK').length;

  // Create item
  async function handleCreateItem(data: { name: string; quantity: number }) {
    setCreateSubmitting(true);
    try {
      const newItem = await inventoryService.create(data);
      setItems((prev) => [newItem, ...prev]);
      setCreateOpen(false);
      toast.success(`"${newItem.name}" added to inventory`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Failed to create item.');
      } else {
        toast.error('Failed to create item.');
      }
    } finally {
      setCreateSubmitting(false);
    }
  }

  // Open stock modals
  function openStockIn(item: InventoryItem) {
    setStockModal({ isOpen: true, mode: 'stock-in', item });
  }

  function openStockOut(item: InventoryItem) {
    setStockModal({ isOpen: true, mode: 'stock-out', item });
  }

  // Handle stock modal submit
  async function handleStockModalSubmit(qty: number) {
    if (stockModal.mode === 'stock-out') {
      // Show confirmation first
      setConfirmState({ isOpen: true, pendingQty: qty });
      return;
    }
    await executeStockIn(qty);
  }

  async function executeStockIn(qty: number) {
    if (!stockModal.item) return;
    setStockSubmitting(true);
    try {
      const updated = await inventoryService.stockIn(stockModal.item.id, { quantity: qty });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setStockModal((s) => ({ ...s, isOpen: false }));
      toast.success(`Added ${qty} units to "${updated.name}"`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Stock-in failed.');
      } else {
        toast.error('Stock-in failed.');
      }
    } finally {
      setStockSubmitting(false);
    }
  }

  async function executeStockOut() {
    if (!stockModal.item || confirmState.pendingQty == null) return;
    const qty = confirmState.pendingQty;
    setConfirmState({ isOpen: false, pendingQty: null });
    setStockSubmitting(true);
    try {
      const updated = await inventoryService.stockOut(stockModal.item.id, { quantity: qty });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setStockModal((s) => ({ ...s, isOpen: false }));
      toast.success(`Used ${qty} units from "${updated.name}"`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? 'Insufficient stock.';
        toast.error(msg);
      } else {
        toast.error('Stock-out failed.');
      }
    } finally {
      setStockSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Inventory</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isAdmin ? 'Manage your stock levels' : 'View current inventory'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary self-start">
              <Plus className="w-4 h-4" />
              Create Item
            </button>
          )}
        </div>

        {/* Stats row */}
        {!isLoading && !loadError && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Items', value: totalItems, icon: <BarChart3 className="w-4 h-4 text-brand-500" /> },
              { label: 'Total Units', value: totalUnits.toLocaleString(), icon: <BarChart3 className="w-4 h-4 text-emerald-500" /> },
              {
                label: 'Needs Attention',
                value: lowOrOut,
                icon: <BarChart3 className="w-4 h-4 text-amber-500" />,
                highlight: lowOrOut > 0,
              },
            ].map((stat) => (
              <div key={stat.label} className="card p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
                <p className={`font-display text-2xl font-bold ${stat.highlight ? 'text-amber-600' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stock status legend */}
        {!isLoading && !loadError && items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((s) => {
              const cfg = getStatusConfig(s);
              const count = items.filter((i) => getStockStatus(i.quantity) === s).length;
              return (
                <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                  {cfg.label}
                  <span className="font-mono ml-0.5">({count})</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" text="Loading inventory…" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-display font-bold text-slate-800 mb-1">Failed to load inventory</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-xs">{loadError}</p>
              <button onClick={loadItems} className="btn-secondary">
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : (
            <InventoryTable
              items={items}
              isAdmin={isAdmin}
              onStockIn={openStockIn}
              onStockOut={openStockOut}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {isAdmin && (
        <>
          <CreateItemModal
            isOpen={createOpen}
            isSubmitting={createSubmitting}
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreateItem}
          />

          <StockModal
            isOpen={stockModal.isOpen}
            mode={stockModal.mode}
            item={stockModal.item}
            isSubmitting={stockSubmitting}
            onClose={() => setStockModal((s) => ({ ...s, isOpen: false }))}
            onSubmit={handleStockModalSubmit}
          />

          <ConfirmDialog
            isOpen={confirmState.isOpen}
            title="Confirm Stock Out"
            message={`You're about to remove ${confirmState.pendingQty ?? 0} unit(s) from "${stockModal.item?.name}". This action cannot be undone.`}
            confirmLabel="Yes, use stock"
            cancelLabel="Cancel"
            variant="danger"
            onConfirm={executeStockOut}
            onCancel={() => setConfirmState({ isOpen: false, pendingQty: null })}
          />
        </>
      )}
    </div>
  );
}
