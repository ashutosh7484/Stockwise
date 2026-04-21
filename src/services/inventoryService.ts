import api from './api';
import type {
  InventoryItem,
  CreateItemRequest,
  StockAdjustRequest,
} from '../types/inventory';

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await api.get<InventoryItem[]>('/inventory/items');
    return response.data;
  },

  async create(data: CreateItemRequest): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>('/inventory/items', data);
    return response.data;
  },

  async stockIn(id: string, data: StockAdjustRequest): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>(
      `/inventory/items/${id}/stock-in`,
      data,
    );
    return response.data;
  },

  async stockOut(id: string, data: StockAdjustRequest): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>(
      `/inventory/items/${id}/stock-out`,
      data,
    );
    return response.data;
  },
};
