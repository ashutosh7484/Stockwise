import { TrendingUp, TrendingDown, Calendar, Package } from 'lucide-react';
import type { InventoryItem } from '../types/inventory';
import { getStockStatus, getStatusConfig } from '../utils/stockStatus';
import EmptyState from './EmptyState';

interface InventoryTableProps {
  items: InventoryItem[];
  isAdmin: boolean;
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function InventoryTable({
  items,
  isAdmin,
  onStockIn,
  onStockOut,
}: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Your inventory is empty"
        description={
          isAdmin
            ? 'Create your first item using the button above.'
            : 'No inventory items have been added yet.'
        }
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3.5 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Item Name
                </span>
              </th>
              <th className="px-6 py-3.5 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Quantity
                </span>
              </th>
              <th className="px-6 py-3.5 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </span>
              </th>
              <th className="px-6 py-3.5 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Last Updated
                </span>
              </th>
              {isAdmin && (
                <th className="px-6 py-3.5 text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item, idx) => {
              const status = getStockStatus(item.quantity);
              const config = getStatusConfig(status);
              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors group animate-fade-in"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-3.5 h-3.5 text-brand-500" />
                      </div>
                      <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-slate-700">
                      {item.quantity.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">units</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.updatedAt)}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onStockIn(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            bg-emerald-50 text-emerald-700 border border-emerald-200
                            hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                        >
                          <TrendingUp className="w-3 h-3" />
                          Add Stock
                        </button>
                        <button
                          onClick={() => onStockOut(item)}
                          disabled={item.quantity === 0}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            bg-red-50 text-red-700 border border-red-200
                            hover:bg-red-100 hover:border-red-300 transition-colors
                            disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <TrendingDown className="w-3 h-3" />
                          Use Stock
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {items.map((item, idx) => {
          const status = getStockStatus(item.quantity);
          const config = getStatusConfig(status);
          return (
            <div
              key={item.id}
              className="p-4 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.updatedAt)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                  {config.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm font-bold text-slate-700">
                  {item.quantity.toLocaleString()} <span className="font-normal text-slate-400 text-xs">units</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStockIn(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                        bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3" /> Add
                    </button>
                    <button
                      onClick={() => onStockOut(item)}
                      disabled={item.quantity === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                        bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <TrendingDown className="w-3 h-3" /> Use
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
