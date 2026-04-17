<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  FileText, Search, PlusCircle, CheckCircle2, History, Eye, Pencil, RotateCcw
} from 'lucide-vue-next'
import { useOrderStore } from '../stores/orders'
import { useAuthStore } from '../stores/auth'
import OrderForm from './OrderForm.vue'
import OrderDetails from './OrderDetails.vue'
import AnalyticsTab from './AnalyticsTab.vue'

const orderStore = useOrderStore()
const authStore = useAuthStore()

const currentSubTab = ref<'lista' | 'novo' | 'produtividade'>('lista')
const searchQuery = ref('')
const statusFilter = ref('Todos')

const selectedOrder = ref<any>(null)
const editingOrder = ref<any>(null)
const isDetailsOpen = ref(false)

onMounted(async () => {
  await orderStore.loadOrders()
})

const filteredOrders = computed(() => {
  let result = orderStore.orders
  
  if (statusFilter.value !== 'Todos') {
    result = result.filter(o => o.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.clientName.toLowerCase().includes(q) ||
      o.plate.toLowerCase().includes(q)
    )
  }
  
  return result
})

const getStatusClass = (status: string) => {
  if (status === 'Pendente') return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400'
  if (status === 'Executado') return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400'
  if (status === 'Cancelado') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400'
  return ''
}

const openDetails = (order: any) => {
  selectedOrder.value = order
  isDetailsOpen.value = true
}

const handleOrderSaved = () => {
  currentSubTab.value = 'lista'
  editingOrder.value = null
  orderStore.loadOrders()
}

const startEdit = (order: any) => {
  editingOrder.value = order
  currentSubTab.value = 'novo'
}

const handleEstorno = async (orderId: string) => {
  if (confirm('Deseja estornar este orçamento? As peças retornarão automaticamente ao estoque físico.')) {
    await orderStore.changeStatus(orderId, 'Pendente')
  }
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-2xl sm:text-3xl font-black text-blue-900 dark:text-white">Gestão de Orçamentos</h2>
      <div class="flex items-center gap-3 flex-1 sm:max-w-md justify-end">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
          <input v-model="searchQuery" type="text" placeholder="Buscar orçamento..." 
            class="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-600 text-sm dark:text-white shadow-sm font-bold" />
        </div>
        <button class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap shrink-0">
          <FileText :size="16" />
          <span class="hidden sm:inline">Exportar Excel</span>
        </button>
      </div>
    </div>

    <!-- Sub-Tabs — scroll horizontal no mobile -->
    <div class="bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex overflow-x-auto scrollbar-none gap-1">
      <button v-for="st in [
        { id: 'lista', label: 'Histórico de Orçamentos', show: true },
        { id: 'novo', label: 'Novo Orçamento', show: authStore.hasPermission('orcamentos', 'edit') },
        { id: 'produtividade', label: 'Produtividade', show: true }
      ].filter(t => t.show)" :key="st.id" @click="currentSubTab = st.id as any" 
        :class="[
          'px-4 sm:px-6 py-2.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap shrink-0',
          currentSubTab === st.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'
        ]">
        {{ st.label }}
      </button>
    </div>

    <!-- View: Lista -->
    <div v-if="currentSubTab === 'lista'" class="space-y-4">
      <div class="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl space-y-4">
        <!-- Filtros de status -->
        <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none bg-gray-50 dark:bg-slate-950 p-2 rounded-2xl border border-gray-100 dark:border-slate-800">
          <button v-for="s in ['Todos', 'Pendente', 'Executado', 'Cancelado']" :key="s" @click="statusFilter = s"
            :class="[
              'px-3 sm:px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all whitespace-nowrap shrink-0',
              statusFilter === s ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-gray-400'
            ]">
            {{ s }}
          </button>
        </div>

        <!-- Tabela (desktop) / Cards (mobile) -->
        <!-- Desktop -->
        <div class="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-gray-400 border-b dark:border-slate-700">
                <th class="px-6 py-4">Status / ID</th>
                <th class="px-6 py-4">Informações do Cliente</th>
                <th class="px-6 py-4">Equipamento / Placa</th>
                <th class="px-6 py-4">Total Geral</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
              <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-blue-50/20 dark:hover:bg-slate-800/30 transition-all group">
                <td class="px-6 py-5">
                  <span :class="[getStatusClass(order.status), 'px-3 py-1 rounded-full text-[10px] font-black uppercase border mb-2 inline-block']">
                    {{ order.status }}
                  </span>
                  <p v-if="order.origin === 'site' || order.id.startsWith('SITE-')" class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[8px] font-black uppercase tracking-tighter border border-blue-200 dark:border-blue-800 w-fit">Web Lead</p>
                </td>
                <td class="px-6 py-5">
                  <p class="font-black text-slate-800 dark:text-gray-100">{{ order.clientName }}</p>
                  <p class="text-[10px] text-gray-400 font-bold mt-0.5">{{ order.phone || 'Sem telefone' }}</p>
                </td>
                <td class="px-6 py-5">
                  <p class="font-black text-slate-700 dark:text-gray-300">{{ order.plate }}</p>
                  <p class="text-[10px] text-blue-600 font-black uppercase">{{ order.equipBrand }} {{ order.equipModel }}</p>
                </td>
                <td class="px-6 py-5">
                  <p class="font-black text-xl text-slate-800 dark:text-white">R$ {{ order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
                </td>
                <td class="px-6 py-5 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openDetails(order)" class="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Ver Detalhes">
                      <Eye :size="16" />
                    </button>
                    <button v-if="authStore.hasPermission('orcamentos', 'edit')" @click="startEdit(order)" class="p-3 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Editar">
                      <Pencil :size="16" />
                    </button>
                    <button v-if="authStore.hasPermission('orcamentos', 'edit') && order.status === 'Executado'" @click="handleEstorno(order.id)" class="p-3 bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white transition-all" title="Estornar">
                      <RotateCcw :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="5" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center opacity-30">
                    <History :size="48" class="text-gray-400 mb-4" />
                    <p class="font-black text-sm uppercase tracking-widest">Nenhuma Ordem Localizada</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: Cards -->
        <div class="sm:hidden space-y-3">
          <div v-if="filteredOrders.length === 0" class="py-16 text-center opacity-30">
            <History :size="48" class="text-gray-400 mx-auto mb-4" />
            <p class="font-black text-sm uppercase tracking-widest">Nenhuma Ordem</p>
          </div>
          <div v-for="order in filteredOrders" :key="order.id"
            class="bg-gray-50 dark:bg-slate-950 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span :class="[getStatusClass(order.status), 'px-3 py-1 rounded-full text-[10px] font-black uppercase border']">
                  {{ order.status }}
                </span>
                <span v-if="order.origin === 'site' || order.id.startsWith('SITE-')" class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[8px] font-black uppercase border border-blue-200 dark:border-blue-800">Web</span>
              </div>
            </div>
            <div>
              <p class="font-black text-slate-800 dark:text-gray-100 text-base">{{ order.clientName }}</p>
              <p class="text-xs text-gray-400 font-bold">{{ order.phone || 'Sem telefone' }}</p>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-black text-slate-700 dark:text-gray-300">{{ order.plate }}</p>
                <p class="text-[10px] text-blue-600 font-black uppercase">{{ order.equipBrand }} {{ order.equipModel }}</p>
              </div>
              <p class="font-black text-lg text-slate-800 dark:text-white">R$ {{ order.total.toFixed(2) }}</p>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
               <button @click="openDetails(order)" class="p-2.5 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                 <Eye :size="14" /> Detalhes
               </button>
               <button v-if="authStore.hasPermission('orcamentos', 'edit')" @click="startEdit(order)" class="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                 <Pencil :size="14" /> Editar
               </button>
               <button v-if="authStore.hasPermission('orcamentos', 'edit') && order.status === 'Executado'" @click="handleEstorno(order.id)" class="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                 <RotateCcw :size="14" /> Estornar
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View: Novo Orçamento -->
    <div v-else-if="currentSubTab === 'novo'" class="animate-in slide-in-from-right duration-500">
      <OrderForm :initialData="editingOrder" @saved="handleOrderSaved" @close="currentSubTab = 'lista'; editingOrder = null" />
    </div>

    <!-- View: Produtividade -->
    <div v-else-if="currentSubTab === 'produtividade'" class="animate-in fade-in duration-500">
      <AnalyticsTab />
    </div>

    <!-- Modal Detalhes -->
    <OrderDetails 
      v-if="selectedOrder" 
      :order="selectedOrder" 
      :isOpen="isDetailsOpen" 
      @close="isDetailsOpen = false; selectedOrder = null" 
    />
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
