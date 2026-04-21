import type { StockStatus } from '../types/inventory';

export function getStockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= 10) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getStatusConfig(status: StockStatus): StatusConfig {
  switch (status) {
    case 'IN_STOCK':
      return {
        label: 'In Stock',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'LOW_STOCK':
      return {
        label: 'Low Stock',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'OUT_OF_STOCK':
      return {
        label: 'Out of Stock',
        badgeClass: 'bg-red-50 text-red-700 border border-red-200',
        dotClass: 'bg-red-500',
      };
  }
}
