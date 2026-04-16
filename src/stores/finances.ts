import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FinanceService, type Transaction } from '../services/FinanceService'

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

  const createTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
    const newTrx = await FinanceService.addTransaction(data)
    transactions.value.unshift(newTrx)
    localStorage.setItem('lider_transactions', JSON.stringify(transactions.value))
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
    totalReceitas,
    totalDespesas,
    saldo
  }
})
