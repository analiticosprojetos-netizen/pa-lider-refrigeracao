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
    localStorage.setItem('lider_customers', JSON.stringify(customers.value))
    
    useAuditStore().addLog(
      'Clientes', 
      'CRIOU', 
      `Cadastrou novo cliente/empresa: ${data.name}`
    )
  }

  const updateCustomer = async (id: string, customerData: any) => {
    const idx = customers.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      customers.value[idx] = { ...customers.value[idx], ...customerData }
      localStorage.setItem('lider_customers', JSON.stringify(customers.value))
      
      useAuditStore().addLog(
        'Clientes', 
        'EDITOU', 
        `Alterou dados do cadastro: ${customers.value[idx].name}`
      )
    }
  }

  const deleteCustomer = (id: string) => {
    const customer = customers.value.find(c => c.id === id)
    customers.value = customers.value.filter(c => c.id !== id)
    localStorage.setItem('lider_customers', JSON.stringify(customers.value))
    
    if (customer) {
       useAuditStore().addLog(
         'Clientes', 
         'EXCLUIU', 
         `Removeu cadastro do cliente do banco de dados: ${customer.name}`
       )
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
