import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { InventoryService, type Part, type Movement } from '../services/InventoryService'
import { useAuthStore } from './auth'
import { useAuditStore } from './audit'

export const useInventoryStore = defineStore('inventory', () => {
  const parts = ref<Part[]>([])
  const movements = ref<Movement[]>([])
  const isLoading = ref(false)

  const authStore = useAuthStore()

  const loadStock = async () => {
    isLoading.value = true
    try {
      parts.value = await InventoryService.getParts()
      movements.value = await InventoryService.getMovements()
    } finally {
      isLoading.value = false
    }
  }

  const createPart = async (name: string, quantity: number) => {
    const newPart = await InventoryService.addPart({ name, quantity })
    parts.value.push(newPart)
    
    // Register initial movement
    const newMov = await InventoryService.addMovement({
      partName: name,
      quantity,
      type: 'entrada',
      user: authStore.user?.username || 'Sistema',
      note: 'Cadastro inicial'
    })
    movements.value.unshift(newMov)

    // Save mock to localStorage to persist state
    localStorage.setItem('lider_inventory', JSON.stringify(parts.value))
    localStorage.setItem('lider_movements', JSON.stringify(movements.value))
    
    useAuditStore().addLog(
      'Estoque', 
      'CRIOU', 
      `Cadastrou nova peça: ${name} (Qtd: ${quantity})`
    )
  }

  const registerMovementToPart = async (partId: string, amount: number, type: 'entrada' | 'saida' | 'correcao') => {
    const idx = parts.value.findIndex(p => p.id === partId);
    if (idx === -1) throw new Error('Peça não encontrada');

    const p = parts.value[idx];
    
    let updatedQty = p.quantity;
    if (type === 'entrada') updatedQty += amount;
    else if (type === 'saida') {
      if (p.quantity - amount < 0) throw new Error('Estoque insuficiente para a saída');
      updatedQty -= amount;
    }
    else if (type === 'correcao') updatedQty = amount; // Na correção, o amount é o novo valor total

    await InventoryService.updatePart(partId, { quantity: updatedQty });
    
    parts.value[idx].quantity = updatedQty;

    const newMov = await InventoryService.addMovement({
      partName: p.name,
      quantity: type === 'correcao' ? (updatedQty - p.quantity) : amount,
      type,
      user: authStore.user?.username || 'Sistema',
      note: type === 'entrada' ? 'Entrada manual' : type === 'saida' ? 'Saída manual' : 'Correção de inventário'
    });
    movements.value.unshift(newMov);

    localStorage.setItem('lider_inventory', JSON.stringify(parts.value));
    localStorage.setItem('lider_movements', JSON.stringify(movements.value));
    
    useAuditStore().addLog(
      'Estoque', 
      'EDITOU', 
      `Registrou ${type} de ${amount} para a peça ${p.name}`
    )
  };


  const totalStockQuantity = computed(() => parts.value.reduce((acc, p) => acc + p.quantity, 0))
  const lowStockCount = computed(() => parts.value.filter(p => p.quantity < 5).length)
  const totalEntradas = computed(() => movements.value.filter(m => m.type === 'entrada').reduce((acc, m) => acc + m.quantity, 0))
  const totalSaidas = computed(() => movements.value.filter(m => m.type === 'saida').reduce((acc, m) => acc + m.quantity, 0))

  const updatePart = async (id: string, partData: any) => {
    const idx = parts.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      parts.value[idx] = { ...parts.value[idx], ...partData }
      localStorage.setItem('lider_inventory', JSON.stringify(parts.value))
      
      useAuditStore().addLog(
        'Estoque', 
        'EDITOU', 
        `Modificou dados da peça: ${parts.value[idx].name}`
      )
    }
  }

  const deletePart = async (id: string) => {
    const part = parts.value.find(p => p.id === id)
    parts.value = parts.value.filter(p => p.id !== id)
    localStorage.setItem('lider_inventory', JSON.stringify(parts.value))
    
    if (part) {
      useAuditStore().addLog(
        'Estoque', 
        'EXCLUIU', 
        `Removeu a peça do sistema: ${part.name}`
      )
    }
  }

  return {
    parts,
    movements,
    isLoading,
    loadStock,
    createPart,
    registerMovementToPart,
    totalStockQuantity,
    lowStockCount,
    totalEntradas,
    totalSaidas,
    updatePart,
    deletePart
  }
})
