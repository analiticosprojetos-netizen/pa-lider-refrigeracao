import { apiFetch } from '../utils/api'

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  consumo: number;
}

export class FleetService {
  static async getAll(): Promise<Veiculo[]> {
    const response = await apiFetch('/fleet');
    return response.data;
  }

  static async create(veiculo: Veiculo): Promise<Veiculo> {
    const response = await apiFetch('/fleet', {
      method: 'POST',
      body: JSON.stringify(veiculo)
    });
    return response.data;
  }

  static async update(id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> {
    const response = await apiFetch('/fleet/' + id, {
      method: 'PUT',
      body: JSON.stringify(veiculo)
    });
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiFetch('/fleet/' + id, {
      method: 'DELETE'
    });
  }
}
