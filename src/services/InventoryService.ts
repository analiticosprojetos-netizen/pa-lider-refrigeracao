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

export class InventoryService {
  /**
   * GET /api/inventory
   */
  static async getParts(): Promise<Part[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('lider_inventory');
        resolve(data ? JSON.parse(data) : []);
      }, 500);
    });
  }

  /**
   * POST /api/inventory
   */
  static async addPart(part: Omit<Part, 'id'>): Promise<Part> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPart = { ...part, id: Math.random().toString(36).substr(2, 9) };
        resolve(newPart);
      }, 500);
    });
  }

  /**
   * PUT /api/inventory/:id
   */
  static async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...updates } as Part);
      }, 400);
    });
  }

  /**
   * DELETE /api/inventory/:id
   */
  static async deletePart(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 400);
    });
  }

  /**
   * GET /api/inventory/movements
   */
  static async getMovements(): Promise<Movement[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('lider_movements');
        resolve(data ? JSON.parse(data) : []);
      }, 500);
    });
  }

  /**
   * POST /api/inventory/movement
   */
  static async addMovement(movement: Omit<Movement, 'id' | 'date'>): Promise<Movement> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMov = { 
          ...movement, 
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleString() // Mudado de ISO para Locale para paridade com original
        };
        resolve(newMov);
      }, 300);
    });
  }
}
