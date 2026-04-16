import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OrderService, type ServiceOrder } from '../services/OrderService'
import { useInventoryStore } from './inventory'
import { useFinanceStore } from './finances'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<ServiceOrder[]>([])
  const isLoading = ref(false)
  const inventoryStore = useInventoryStore()
  const financeStore = useFinanceStore()

  const loadOrders = async () => {
    isLoading.value = true
    try {
      orders.value = await OrderService.getOrders()
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (data: any) => {
    const newOrder = await OrderService.createOrder(data)
    orders.value.unshift(newOrder)
    localStorage.setItem('lider_orders', JSON.stringify(orders.value))
  }

  const changeStatus = async (orderId: string, status: 'Executado' | 'Cancelado' | 'Pendente') => {
    const idx = orders.value.findIndex(o => o.id === orderId)
    if (idx === -1) return

    const order = orders.value[idx]
    const oldStatus = order.status

    // Lógica de Movimentação de Estoque Automática
    if (status === 'Executado' && oldStatus !== 'Executado') {
      // Baixa: Subtrai peças do estoque físico
      for (const part of order.parts) {
        if (part.inventoryPartId) {
          try {
            await inventoryStore.registerMovementToPart(part.inventoryPartId, part.qty, 'saida')
          } catch (e) {
            console.error(`Erro ao abater ${part.description}:`, e)
          }
        }
      }
      
      // Lançamento Financeiro Automático
      await financeStore.createTransaction({
        type: 'receita',
        description: `O.S. #${order.id} - ${order.clientName}`,
        category: 'Orçamento',
        amount: order.total
      })
    } else if (oldStatus === 'Executado' && status !== 'Executado') {
      // Estorno: Devolve peças ao estoque físico
      for (const part of order.parts) {
        if (part.inventoryPartId) {
          try {
            await inventoryStore.registerMovementToPart(part.inventoryPartId, part.qty, 'entrada')
          } catch (e) {
            console.error(`Erro ao devolver ${part.description}:`, e)
          }
        }
      }
    }

    await OrderService.updateOrderStatus(orderId, status)
    
    order.status = status
    if (status === 'Executado') {
      order.executedAt = new Date().toISOString()
      order.cancelledAt = null
    } else if (status === 'Cancelado') {
      order.cancelledAt = new Date().toISOString()
      order.executedAt = null
    } else {
      order.executedAt = null
      order.cancelledAt = null
    }

    localStorage.setItem('lider_orders', JSON.stringify(orders.value))
  }

  const updateOrder = async (orderId: string, data: any) => {
    const idx = orders.value.findIndex(o => o.id === orderId)
    if (idx === -1) return
    
    orders.value[idx] = { ...orders.value[idx], ...data }
    localStorage.setItem('lider_orders', JSON.stringify(orders.value))
  }

  return {
    orders,
    isLoading,
    loadOrders,
    createOrder,
    updateOrder,
    changeStatus
  }
})

