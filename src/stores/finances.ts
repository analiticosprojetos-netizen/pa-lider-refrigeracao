// v3 - atualizado com auditoria
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FinanceService, type Transaction } from '../services/FinanceService'
import { useAuditStore } from './audit'

export const useFinanceStore = defineStore('finances', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)

  const loadFinances = async () => {
    isLoading.value = true
    try {
      transactions.value = await FinanceService.getTransactions()
    } finally {
      isLoading.value = false
    }
  }

  const createTransaction = async (data: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    const newTrx = await FinanceService.addTransaction(data)
    transactions.value.unshift(newTrx)
    localStorage.setItem('lider_transactions', JSON.stringify(transactions.value))
    
    useAuditStore().addLog(
      'Financeiro', 
      'CRIOU', 
      `Lançou ${data.type} de R$ ${data.amount} na categoria ${data.category}`
    )
    
    return newTrx
  }

  const deleteTransaction = (id: string) => {
    const trx = transactions.value.find(t => t.id === id)
    transactions.value = transactions.value.filter(t => t.id !== id)
    localStorage.setItem('lider_transactions', JSON.stringify(transactions.value))
    
    if (trx) {
      useAuditStore().addLog(
        'Financeiro', 
        'EXCLUIU', 
        `Excluiu (estornou) ${trx.type} de R$ ${trx.amount}`
      )
    }
  }

  const updateTransaction = (id: string, data: Partial<Omit<Transaction, 'id' | 'date'>>) => {
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      transactions.value[idx] = { ...transactions.value[idx], ...data }
      localStorage.setItem('lider_transactions', JSON.stringify(transactions.value))
      
      useAuditStore().addLog(
        'Financeiro', 
        'EDITOU', 
        `Editou lançamento de R$ ${data.amount !== undefined ? data.amount : 'sem alteração de valor'} (${data.description})`
      )
    }
  }

  const totalReceitas = computed(() => {
    return transactions.value
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + t.amount, 0)
  })

  const totalDespesas = computed(() => {
    return transactions.value
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + t.amount, 0)
  })

  const saldo = computed(() => totalReceitas.value - totalDespesas.value)

  return {
    transactions,
    isLoading,
    loadFinances,
    createTransaction,
    deleteTransaction,
    updateTransaction,
    totalReceitas,
    totalDespesas,
    saldo
  }
})
