export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  plate?: string;
  vehicleModel?: string;
  equipBrand?: string;
  equipModel?: string;
  created_at?: string;

}

import { apiFetch } from '../utils/api'

export class CustomerService {
  static async getCustomers(): Promise<Customer[]> {
    const response = await apiFetch('/customers');
    return response.data;
  }

  static async addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const response = await apiFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    });
    return response.data;
  }

  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const response = await apiFetch(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  static async deleteCustomer(id: string): Promise<void> {
    await apiFetch(`/customers/${id}`, {
      method: 'DELETE'
    });
  }
}

