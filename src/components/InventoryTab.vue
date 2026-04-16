<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Package, Plus, Minus, Edit3, Trash2, History, Search, X,
  BarChart3, ArrowUpCircle, ArrowDownCircle, PlusCircle, AlertTriangle
} from 'lucide-vue-next'
import { useInventoryStore } from '../stores/inventory'
import { useAuthStore } from '../stores/auth'

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

const currentSubTab = ref<'lista' | 'historico'>('lista')
const searchQuery = ref('')
const isNewPartModalOpen = ref(false)
const isEditModalOpen = ref(false)

const newPartName = ref('')
const newPartQty = ref(0)

const editingPartId = ref('')
const editPartForm = ref({
  name: '',
  quantity: 0
})

onMounted(async () => {
  await inventoryStore.loadStock()
})

const filteredParts = computed(() => {
  if (!searchQuery.value) return inventoryStore.parts
  const q = searchQuery.value.toLowerCase()
  return inventoryStore.parts.filter(p => p.name.toLowerCase().includes(q))
})

const topParts = computed(() => {
  return [...inventoryStore.parts]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8) // Mostra as 8 principais no gráfico
})

const itemsPerPage = 5
const currentPageList = ref(1)
const currentPageHist = ref(1)

watch(searchQuery, () => {
  currentPageList.value = 1
})

const paginatedParts = computed(() => {
  const start = (currentPageList.value - 1) * itemsPerPage
  return filteredParts.value.slice(start, start + itemsPerPage)
})
const totalPagesList = computed(() => Math.ceil(filteredParts.value.length / itemsPerPage) || 1)

const paginatedMovements = computed(() => {
  const start = (currentPageHist.value - 1) * itemsPerPage
  return inventoryStore.movements.slice(start, start + itemsPerPage)
})
const totalPagesHist = computed(() => Math.ceil(inventoryStore.movements.length / itemsPerPage) || 1)

const handleCreatePart = async () => {
  if (!newPartName.value) return alert('Nome da peça é obrigatório')
  await inventoryStore.createPart(newPartName.value, newPartQty.value)
  newPartName.value = ''
  newPartQty.value = 0
  isNewPartModalOpen.value = false
}

const openEditModal = (part: any) => {
  editingPartId.value = part.id
  editPartForm.value = { name: part.name, quantity: part.quantity }
  isEditModalOpen.value = true
}

const handleUpdatePart = async () => {
  await inventoryStore.updatePart(editingPartId.value, { ...editPartForm.value })
  isEditModalOpen.value = false
}

const handleDeletePart = (id: string) => {
  if (confirm('Deseja realmente excluir esta peça?')) {
    // inventoryStore.deletePart(id) // Implementar se necessário ou apenas ocultar
  }
}
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-700 pb-12">
    <!-- 1. Cabeçalho e Título -->
    <div class="flex items-center justify-between">
       <h2 class="text-3xl font-black text-blue-900 dark:text-white tracking-tight">Gestão de Estoque</h2>
       
       <button @click="isNewPartModalOpen = true" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/30 active:scale-95">
          <PlusCircle :size="16" /> Nova Peça
       </button>
    </div>

    <!-- 2. Seção Superior: Visão Geral e Gráfico -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Card Azul de Resumo -->
      <div class="bg-blue-600 dark:bg-blue-700 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-blue-400/20">
         <Package class="absolute right-[-40px] top-[-40px] w-64 h-64 opacity-10" />
         
         <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/70 mb-2">TOTAL DE PEÇAS EM ESTOQUE</p>
            <div class="flex items-baseline gap-4">
              <span class="text-7xl font-black tracking-tighter">{{ inventoryStore.totalStockQuantity }}</span>
              <span class="text-xs font-bold text-blue-100/60 tracking-normal">{{ inventoryStore.parts.length }} tipos de itens cadastrados</span>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4 mt-12 relative z-10">
            <div class="bg-blue-500/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-inner transition hover:bg-blue-500/50">
               <div>
                  <p class="text-[9px] font-black uppercase text-blue-100/80 mb-1 flex items-center gap-1.5 line-height-tight">
                     <ArrowUpCircle :size="10" class="text-green-300" /> ENTRADAS
                  </p>
                  <p class="text-3xl font-black">{{ inventoryStore.totalEntradas }}</p>
               </div>
            </div>
            <div class="bg-blue-500/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-inner transition hover:bg-blue-500/50">
               <div>
                  <p class="text-[9px] font-black uppercase text-blue-100/80 mb-1 flex items-center gap-1.5 line-height-tight">
                     <ArrowDownCircle :size="10" class="text-red-300" /> SAÍDAS
                  </p>
                  <p class="text-3xl font-black">{{ inventoryStore.totalSaidas }}</p>
               </div>
            </div>
         </div>
      </div>

      <!-- Card do Gráfico (Top 10) -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-blue-50 dark:border-slate-800 flex flex-col">
          <div class="flex items-center justify-between mb-8">
             <h3 class="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 :size="16" class="text-blue-600" /> NÍVEIS DE ESTOQUE (TOP 10)
             </h3>
          </div>
          
          <div class="flex-grow flex items-end justify-between px-4 gap-3 min-h-[160px]">
             <div v-for="p in topParts" :key="p.id" class="flex-1 flex flex-col items-center justify-end h-full gap-3 group translate-y-0 hover:-translate-y-1 transition-all duration-500">
                <div class="w-full max-w-[45px] bg-blue-500 dark:bg-blue-600 rounded-t-xl relative group-hover:bg-blue-400 transition-all duration-700 shadow-md shadow-blue-500/10" 
                  :style="{ height: `${Math.min((p.quantity / 20) * 100, 100)}%` }">
                   <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-md font-black">
                     {{ p.quantity }}
                   </div>
                </div>
                <span class="text-[9px] font-black text-gray-400 uppercase truncate w-full text-center tracking-tighter">{{ p.name.split(' ')[0] }}</span>
             </div>
          </div>
      </div>
    </div>

    <!-- 3. Navegação de Sub-Tabs -->
    <div class="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex w-fit mb-8">
       <button @click="currentSubTab = 'lista'" 
         :class="[currentSubTab === 'lista' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600', 'px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all tracking-widest']">
         Lista de Peças
       </button>
       <button @click="currentSubTab = 'historico'" 
         :class="[currentSubTab === 'historico' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600', 'px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all tracking-widest']">
         Histórico de Movimentações
       </button>
    </div>

    <!-- 4. Area Principal (Grid 1/4 e 3/4) -->
    <div v-if="currentSubTab === 'lista'" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
       <!-- Coluna Esquerda: Formulário -->
       <div class="space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-[28px] p-8 shadow-xl border border-blue-50 dark:border-slate-800 space-y-8">
             <h3 class="text-sm font-black text-blue-900 dark:text-white flex items-center gap-2">
                <PlusCircle :size="18" class="text-blue-600" /> Nova Peça
             </h3>
             
             <div class="space-y-6">
                <div class="space-y-1.5">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nome da Peça</label>
                   <input v-model="newPartName" type="text" placeholder="Ex: Compressor TM16" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 font-bold text-sm outline-none focus:border-blue-500 transition-all dark:text-white" />
                </div>
                <div class="space-y-1.5">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Quantidade Inicial</label>
                   <input v-model.number="newPartQty" type="number" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 font-bold text-sm outline-none focus:border-blue-500 transition-all dark:text-white" />
                </div>
                <button @click="handleCreatePart" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                   Cadastrar no Sistema
                </button>
             </div>
          </div>

          <!-- Alerta de Estoque Baixo (Sticky hint) -->
          <div v-if="inventoryStore.lowStockCount > 0" class="flex items-center gap-4 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
             <AlertTriangle class="text-red-500 shrink-0" :size="20" />
             <div>
                <p class="text-xs font-black text-red-600 uppercase">{{ inventoryStore.lowStockCount }} Itens em Nível Crítico</p>
                <p class="text-[9px] text-red-400 font-bold uppercase mt-0.5 tracking-tight">Necessário reposição urgente</p>
             </div>
          </div>
       </div>

       <!-- Coluna Direita: Tabela -->
       <div class="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[28px] shadow-xl border border-blue-50 dark:border-slate-800 overflow-hidden flex flex-col">
          <div class="p-8 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
             <h3 class="text-sm font-black text-blue-900 dark:text-white uppercase tracking-widest">Controle de Peças</h3>
             <div class="relative w-full max-w-sm">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
                <input v-model="searchQuery" type="text" placeholder="Buscar peça..." class="w-full pl-11 pr-5 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:text-white shadow-inner" />
             </div>
          </div>

          <div class="overflow-x-auto">
             <table class="w-full text-left">
                <thead>
                   <tr class="bg-blue-50/20 dark:bg-slate-800/20 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b dark:border-slate-800">
                      <th class="px-8 py-5">Peça</th>
                      <th class="px-8 py-5 text-center">Qtd Atual</th>
                      <th class="px-8 py-5 text-right">Ações</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                   <tr v-for="part in paginatedParts" :key="part.id" class="group hover:bg-blue-50/10 dark:hover:bg-slate-800/10 transition-colors">
                      <td class="px-8 py-6">
                         <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                               <Package :size="18" class="text-blue-600" />
                            </div>
                            <span class="font-black text-slate-800 dark:text-gray-100 text-base tracking-tight">{{ part.name }}</span>
                         </div>
                      </td>
                      <td class="px-8 py-6 text-center">
                         <span :class="[part.quantity < 5 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200', 'inline-block px-4 py-2 rounded-xl font-black text-sm border shadow-sm']">
                            {{ part.quantity }}
                         </span>
                      </td>
                      <td class="px-8 py-6 text-right">
                         <div class="flex justify-end gap-2">
                            <button @click="inventoryStore.registerMovementToPart(part.id, 1, 'entrada')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-500 hover:text-white transition-all shadow-sm">
                               <Plus :size="16" />
                            </button>
                            <button @click="inventoryStore.registerMovementToPart(part.id, 1, 'saida')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                               <Minus :size="16" />
                            </button>
                            <button @click="openEditModal(part)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-blue-600 border border-slate-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                               <Edit3 :size="16" />
                            </button>
                            <button @click="handleDeletePart(part.id)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-red-400 border border-slate-200 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                               <Trash2 :size="16" />
                            </button>
                         </div>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
          <!-- Paginação da Lista -->
          <div class="p-5 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
            <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Página {{ currentPageList }} de {{ totalPagesList }}</span>
            <div class="flex gap-2">
               <button @click="currentPageList--" :disabled="currentPageList === 1" class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-300 transition-all">Anterior</button>
               <button @click="currentPageList++" :disabled="currentPageList === totalPagesList" class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-300 transition-all">Próxima</button>
            </div>
          </div>
       </div>
    </div>

    <!-- 5. View: Histórico -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-[28px] shadow-xl border border-blue-50 dark:border-slate-800 overflow-hidden animate-in slide-in-from-right duration-500">
       <div class="p-8 border-b dark:border-slate-800 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800/30">
          <History class="w-6 h-6 text-blue-600" />
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tighter">Histórico de Movimentações</h3>
       </div>
       <div class="overflow-x-auto">
          <table class="w-full text-left">
             <thead>
                <tr class="bg-blue-50/10 dark:bg-slate-800/20 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b dark:border-slate-800">
                   <th class="px-8 py-5">Data/Hora</th>
                   <th class="px-8 py-4">Peça / Insumo</th>
                   <th class="px-8 py-4">Tipo Movimento</th>
                   <th class="px-8 py-4 text-center">Quantidade</th>
                   <th class="px-8 py-4 text-right">Executor</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-for="mov in paginatedMovements" :key="mov.id" class="hover:bg-blue-50/10 transition-colors">
                   <td class="px-8 py-5 text-gray-400 text-xs font-bold">{{ mov.date }}</td>
                   <td class="px-8 py-5 font-black text-slate-800 dark:text-white text-base">{{ mov.partName }}</td>
                   <td class="px-8 py-5 text-xs font-black uppercase" :class="mov.type === 'entrada' ? 'text-green-600' : 'text-red-500'">
                      {{ mov.type }}
                   </td>
                   <td class="px-8 py-5 text-center font-black text-xl" :class="mov.type === 'entrada' ? 'text-green-600' : 'text-red-500'">
                      {{ mov.type === 'entrada' ? '+' : '-' }}{{ mov.quantity }}
                   </td>
                   <td class="px-8 py-5 text-right text-xs font-bold text-gray-400 opacity-60">{{ mov.user }}</td>
                </tr>
             </tbody>
          </table>
       </div>
       <!-- Paginação do Histórico -->
       <div class="p-5 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
          <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Página {{ currentPageHist }} de {{ totalPagesHist }}</span>
          <div class="flex gap-2">
             <button @click="currentPageHist--" :disabled="currentPageHist === 1" class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-300 transition-all">Anterior</button>
             <button @click="currentPageHist++" :disabled="currentPageHist === totalPagesHist" class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-300 transition-all">Próxima</button>
          </div>
       </div>
    </div>

    <!-- 6. Modal: Nova Peça (Acesso Rápido) -->
    <div v-if="isNewPartModalOpen" class="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
       <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-3xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
          <div class="px-10 py-8 bg-blue-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center text-blue-900 dark:text-white">
             <h3 class="text-2xl font-black tracking-tighter uppercase">Registrar Item</h3>
             <button @click="isNewPartModalOpen = false" class="p-3 hover:bg-red-50 rounded-2xl text-gray-400 transition-all"><X :size="24"/></button>
          </div>
          <div class="p-10 space-y-6">
             <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-400 pl-1">Nome da Peça / Insumo</label>
                <input v-model="newPartName" type="text" class="w-full px-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 font-black text-lg transition-all dark:text-white" />
             </div>
             <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-400 pl-1">Quantidade Inicial</label>
                <input v-model.number="newPartQty" type="number" class="w-full px-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-600 font-black text-lg transition-all dark:text-white" />
             </div>
          </div>
          <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/30 border-t flex justify-end gap-4">
             <button @click="isNewPartModalOpen = false" class="px-8 py-4 font-black text-gray-400 hover:text-gray-600 uppercase text-xs">Cancelar</button>
             <button @click="handleCreatePart" :disabled="!newPartName || newPartQty < 0" class="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-widest">Salvar Catálogo</button>
          </div>
       </div>
    </div>

    <!-- 7. Modal: Editar Peça (Correção) -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4">
       <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-3xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
          <div class="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center text-blue-900 dark:text-white">
             <h3 class="text-2xl font-black tracking-tighter uppercase">Corrigir Peça</h3>
             <button @click="isEditModalOpen = false" class="p-3 hover:bg-red-50 rounded-2xl text-gray-400 transition-all"><X :size="24"/></button>
          </div>
          <div class="p-10 space-y-6">
             <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-400 pl-1">Nome da Peça</label>
                <input v-model="editPartForm.name" type="text" class="w-full px-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-lg dark:text-white" />
             </div>
             <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-400 pl-1">Quantidade Atual</label>
                <input v-model.number="editPartForm.quantity" type="number" class="w-full px-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none font-black text-lg dark:text-white" />
                <p class="text-[10px] text-gray-400 italic px-2">Alterar a quantidade aqui não registra movimentação, apenas corrige o saldo.</p>
             </div>
          </div>
          <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/30 border-t flex justify-end gap-4">
             <button @click="isEditModalOpen = false" class="px-8 py-4 font-black text-gray-400 uppercase text-xs">Cancelar</button>
             <button @click="handleUpdatePart" class="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-2xl active:scale-95 transition-all uppercase text-xs tracking-widest">Salvar Correção</button>
          </div>
       </div>
    </div>
  </div>
</template>
