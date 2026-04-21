export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  name: string;
  quantity: number;
}

export interface StockAdjustRequest {
  quantity: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  total: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
