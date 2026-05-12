import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CustomerService, type Customer } from '../services/CustomerService'
import { useAuditStore } from './audit'

export const useCustomerStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const isLoading = ref(false)

  const loadCustomers = async () => {
    isLoading.value = true
    try {
      customers.value = await CustomerService.getCustomers()
    } finally {
      isLoading.value = false
    }
  }

  const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = await CustomerService.addCustomer(data)
    customers.value.unshift(newCustomer)
    
    useAuditStore().addLog(
      'Clientes', 
      'CRIOU', 
      `Cadastrou novo cliente/empresa: ${data.name}`
    )
  }

  const updateCustomer = async (id: string, customerData: any) => {
    try {
      const updatedCustomer = await CustomerService.updateCustomer(id, customerData)
      const idx = customers.value.findIndex(c => c.id === id)
      if (idx !== -1) {
        customers.value[idx] = updatedCustomer
        
        useAuditStore().addLog(
          'Clientes', 
          'EDITOU', 
          `Alterou dados do cadastro: ${updatedCustomer.name}`
        )
      }
    } catch (err: any) {
      alert('Erro ao atualizar cliente: ' + err.message)
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      console.log('Solicitando exclusão do cliente:', id)
      const customer = customers.value.find(c => c.id === id)
      await CustomerService.deleteCustomer(id)
      console.log('Cliente excluído do servidor com sucesso')
      
      customers.value = customers.value.filter(c => c.id !== id)
      
      if (customer) {
         useAuditStore().addLog(
           'Clientes', 
           'EXCLUIU', 
           `Removeu cadastro do cliente do banco de dados: ${customer.name}`
         )
      }
    } catch (err: any) {
      console.error('Erro na store ao excluir cliente:', err)
      alert('Erro ao excluir cliente: ' + err.message)
    }
  }

  return {
    customers,
    isLoading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})
