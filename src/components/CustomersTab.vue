<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Users, UserPlus, Search, Edit3, Trash2, X, Mail, Phone, FileText, 
  MapPin, CheckCircle2, History 
} from 'lucide-vue-next'
import { useCustomerStore } from '../stores/customers'

const customerStore = useCustomerStore()
const searchQuery = ref('')
const isNewCustomerModalOpen = ref(ref(false))
const isEditModalOpen = ref(false)

const form = ref({
  name: '',
  document: '',
  phone: '',
  email: ''
})

const editForm = ref({
  id: '',
  name: '',
  document: '',
  phone: '',
  email: ''
})

onMounted(async () => {
  await customerStore.loadCustomers()
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customerStore.customers
  return customerStore.customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.document?.includes(searchQuery.value)
  )
})

const save = async () => {
  await customerStore.addCustomer({ ...form.value })
  isNewCustomerModalOpen.value = false
  form.value = { name: '', document: '', phone: '', email: '' }
}

const openEditModal = (customer: any) => {
  editForm.value = { ...customer }
  isEditModalOpen.value = true
}

const handleUpdate = async () => {
  await customerStore.updateCustomer(editForm.value.id, { ...editForm.value })
  isEditModalOpen.value = false
}

const handleDelete = (id: string) => {
  if (confirm('Deseja excluir este cliente?')) {
    customerStore.deleteCustomer(id)
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Cabeçalho (Estilo Print) -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
       <h2 class="text-3xl font-black text-blue-900 dark:text-white">Gestão de Clientes</h2>
       
       <div class="flex items-center gap-4 flex-1 max-w-2xl justify-end">
          <div class="relative flex-1 w-full max-w-sm">
             <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
             <input v-model="searchQuery" type="text" placeholder="Buscar cliente..." class="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-600 text-sm dark:text-white shadow-sm font-bold" />
          </div>
          
          <button @click="isNewCustomerModalOpen = true" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/20 active:scale-95">
             <UserPlus :size="16" /> Novo Cliente
          </button>
       </div>
    </div>

    <!-- Card Principal de Clientes -->
    <div class="bg-white dark:bg-slate-900 rounded-[32px] border border-blue-50 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-700">
       <div class="px-8 py-8 flex items-center gap-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
             <Users class="text-blue-600" :size="24" />
          </div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tighter">Clientes Cadastrados</h3>
       </div>

       <div class="overflow-x-auto">
          <table class="w-full text-left">
             <thead>
                <tr class="bg-blue-50/20 dark:bg-slate-800/20 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b dark:border-slate-800">
                   <th class="px-8 py-5">Nome / Empresa</th>
                   <th class="px-8 py-5">CPF / CNPJ</th>
                   <th class="px-8 py-5">Telefone</th>
                   <th class="px-8 py-5">E-mail</th>
                   <th class="px-8 py-5">Data de Cadastro</th>
                   <th class="px-8 py-5 text-right">Ações</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-for="customer in filteredCustomers" :key="customer.id" class="group hover:bg-blue-50/10 dark:hover:bg-slate-800/10 transition-colors">
                   <td class="px-8 py-6">
                      <p class="font-black text-slate-800 dark:text-gray-100 text-base tracking-tight">{{ customer.name }}</p>
                   </td>
                   <td class="px-8 py-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                      {{ customer.document || '---' }}
                   </td>
                   <td class="px-8 py-6 text-sm font-bold text-gray-600 dark:text-gray-300">
                      {{ customer.phone }}
                   </td>
                   <td class="px-8 py-6 text-sm font-bold text-gray-400">
                      {{ customer.email }}
                   </td>
                   <td class="px-8 py-6 text-xs font-black text-gray-400 uppercase">
                      {{ customer.createdAt || '---' }}
                   </td>
                   <td class="px-8 py-6 text-right">
                      <div class="flex justify-end gap-2">
                         <button @click="openEditModal(customer)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 border border-slate-100 dark:border-slate-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Edit3 :size="16" />
                         </button>
                         <button @click="handleDelete(customer.id)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-red-400 border border-slate-100 dark:border-slate-700 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            <Trash2 :size="16" />
                         </button>
                      </div>
                   </td>
                </tr>
             </tbody>
          </table>
          
          <div v-if="filteredCustomers.length === 0" class="py-24 text-center">
             <div class="opacity-10 mb-6">
                <Users :size="80" class="mx-auto" />
             </div>
             <p class="text-sm font-black text-gray-300 uppercase tracking-widest italic">Nenhum cliente encontrado</p>
          </div>
       </div>
    </div>

    <!-- Modal Novo Cliente -->
    <div v-show="isNewCustomerModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-3xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
        <div class="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center text-blue-900 dark:text-white">
           <h3 class="text-2xl font-black uppercase tracking-tighter">Cadastrar Cliente</h3>
           <button @click="isNewCustomerModalOpen = false" class="p-3 hover:bg-red-50 rounded-2xl text-gray-400 transition-all"><X :size="24"/></button>
        </div>
        <div class="p-10 space-y-6">
          <div>
            <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block tracking-widest">Nome Completo / Razão Social</label>
            <input v-model="form.name" type="text" placeholder="Ex: Transportadora Líder LTDA" class="w-full px-6 py-4.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-4 focus:ring-blue-100 transition shadow-inner font-bold text-lg outline-none" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block tracking-widest">CPF / CNPJ</label>
               <input v-model="form.document" type="text" placeholder="00.000.000/0001-00" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 transition shadow-inner font-bold outline-none" />
             </div>
             <div>
               <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block tracking-widest">Telefone</label>
               <input v-model="form.phone" type="text" placeholder="(11) 99999-9999" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 transition shadow-inner font-bold outline-none" />
             </div>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block tracking-widest">E-mail de Contato</label>
            <input v-model="form.email" type="email" placeholder="contato@cliente.com" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 transition shadow-inner font-bold outline-none" />
          </div>
        </div>
        <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
          <button @click="isNewCustomerModalOpen = false" class="px-6 py-2.5 font-bold text-gray-400 uppercase text-xs">Cancelar</button>
          <button @click="save" :disabled="!form.name" class="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">Salvar Cliente</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Cliente -->
    <div v-show="isEditModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-3xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
        <div class="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center text-blue-900 dark:text-white">
           <h3 class="text-2xl font-black">Editar Cadastro</h3>
           <button @click="isEditModalOpen = false" class="p-3 hover:bg-red-50 rounded-2xl text-gray-400 transition-all"><X :size="24"/></button>
        </div>
        <div class="p-10 space-y-6">
          <div>
            <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block">Nome Completo</label>
            <input v-model="editForm.name" type="text" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-4 focus:ring-blue-100 font-bold text-lg outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block">CPF / CNPJ</label>
               <input v-model="editForm.document" type="text" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold outline-none" />
             </div>
             <div>
               <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block">Telefone</label>
               <input v-model="editForm.phone" type="text" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold outline-none" />
             </div>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase text-gray-400 pl-1 mb-2 block">E-mail</label>
            <input v-model="editForm.email" type="email" class="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold outline-none" />
          </div>
        </div>
        <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
          <button @click="isEditModalOpen = false" class="px-8 py-2.5 font-bold text-gray-400 uppercase text-xs">Cancelar</button>
          <button @click="handleUpdate" class="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition">Salvar Alterações</button>
        </div>
      </div>
    </div>
  </div>
</template>
