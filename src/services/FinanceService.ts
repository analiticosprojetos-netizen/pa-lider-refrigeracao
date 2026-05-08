export interface Transaction {
  id: string
  type: 'receita' | 'despesa'
  description: string
  amount: number
  date: string
  category: string
  orderId?: string
}

import { apiFetch } from '../utils/api'

export class FinanceService {
  static async getTransactions(): Promise<Transaction[]> {
    const response = await apiFetch('/finances');
    return response.data;
  }

  static async addTransaction(trx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const response = await apiFetch('/finances', {
      method: 'POST',
      body: JSON.stringify(trx)
    });
    return response.data;
  }
}
