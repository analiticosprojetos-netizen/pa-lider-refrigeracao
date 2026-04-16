export interface Transaction {
  id: string
  type: 'receita' | 'despesa'
  description: string
  amount: number
  date: string
  category: string
  orderId?: string
}

export class FinanceService {
  /**
   * GET /api/finances
   */
  static async getTransactions(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('lider_transactions')
        resolve(data ? JSON.parse(data) : [])
      }, 600)
    })
  }

  /**
   * POST /api/finances
   */
  static async addTransaction(trx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTrx: Transaction = {
          ...trx,
          id: 'uuid-trx-' + Date.now(),
          date: new Date().toISOString()
        }
        resolve(newTrx)
      }, 400)
    })
  }
}
