export interface Part {
  id: string;
  name: string;
  quantity: number;
}

export interface Movement {
  id: string;
  partName: string;
  type: 'entrada' | 'saida' | 'correcao';
  quantity: number;
  user: string;
  date: string;
  note?: string;
}

import { apiFetch } from '../utils/api'

export class InventoryService {
  static async getParts(): Promise<Part[]> {
    const response = await apiFetch('/inventory');
    return response.data;
  }

  static async addPart(part: Omit<Part, 'id'>): Promise<Part> {
    const response = await apiFetch('/inventory', {
      method: 'POST',
      body: JSON.stringify(part)
    });
    return response.data;
  }

  static async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    const response = await apiFetch(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  static async deletePart(id: string): Promise<boolean> {
    const response = await apiFetch(`/inventory/${id}`, {
      method: 'DELETE'
    });
    return response.success;
  }

  static async getMovements(): Promise<Movement[]> {
    const response = await apiFetch('/inventory/movements');
    return response.data;
  }

  static async addMovement(movement: Omit<Movement, 'id' | 'date'>): Promise<Movement> {
    const response = await apiFetch('/inventory/movement', {
      method: 'POST',
      body: JSON.stringify(movement)
    });
    return response.data;
  }
}
