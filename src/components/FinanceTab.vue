<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Landmark, ArrowUpCircle, ArrowDownCircle, History, PlusCircle, X, Search, FileText } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finances'
import CurrencyInput from './CurrencyInput.vue'

const financeStore = useFinanceStore()

const isNewTrxModalOpen = ref(false)
const filterQuery = ref('')

const OFFICIAL_CATEGORIES = ["Orçamento", "Fixo", "Variável", "Serviço", "Venda", "Outros"]

const form = ref<{
  type: 'receita' | 'despesa'
  description: string
  category: string
  amount: number
}>({
  type: 'receita',
  description: '',
  category: 'Orçamento',
  amount: 0
})

onMounted(async () => {
  await financeStore.loadFinances()
})

const save = async () => {
  if (!form.value.description || form.value.amount <= 0) return
  await financeStore.createTransaction({ ...form.value })
  isNewTrxModalOpen.value = false
  form.value = { type: 'receita', description: '', category: 'Orçamento', amount: 0 }
}

const filteredTransactions = computed(() => {
  if (!filterQuery.value) return financeStore.transactions
  return financeStore.transactions.filter(t => 
    t.description.toLowerCase().includes(filterQuery.value.toLowerCase()) ||
    t.category.toLowerCase().includes(filterQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
    <!-- Header Principal -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-black text-blue-900 dark:text-white">Central Financeira</h2>
        <p class="text-xs text-gray-500 mt-1">Gestão integrada do Fluxo de Caixa da Lider</p>
      </div>
    </div>

    <!-- ======================= -->
    <!-- FLUXO DE CAIXA         -->
    <!-- ======================= -->
    <div class="space-y-8 mt-2 animate-in fade-in duration-500">
      
      <!-- Controles Fluxo de caixa -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 class="text-xl font-black text-blue-900 dark:text-white">Indicadores Gerais</h3>
        <button @click="isNewTrxModalOpen = true" class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
          <PlusCircle class="w-5 h-5" /> Novo Lançamento
        </button>
      </div>

      <!-- Cards Superiores Premium -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-2xl rounded-[32px] p-8 relative overflow-hidden h-52 flex flex-col justify-between group border border-blue-400/20">
          <Landmark class="absolute right-[-40px] top-[-40px] w-64 h-64 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-blue-200 opacity-80 pl-1">Saldo em Conta</p>
            <p class="text-3xl lg:text-5xl font-black mt-2 tracking-tighter truncate">R$ {{ financeStore.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
          </div>
          <div class="flex items-center gap-2">
             <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-white/10 shrink-0">Tesouraria Lider</div>
             <div class="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0"></div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-[32px] shadow-xl p-6 lg:p-8 flex flex-col justify-between h-52 border-l-[12px] border-l-green-500 transition-all hover:-translate-y-1">
          <div>
             <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
               <ArrowUpCircle class="w-5 h-5" />
               <h3 class="text-xs font-black uppercase tracking-widest">Total de Receitas</h3>
             </div>
             <p class="text-2xl lg:text-4xl font-black text-slate-800 dark:text-white mt-4 tracking-tighter truncate">
                R$ {{ financeStore.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
             </p>
          </div>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Sincronizado com Ordens de Serviço</p>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-[32px] shadow-xl p-6 lg:p-8 flex flex-col justify-between h-52 border-l-[12px] border-l-red-500 transition-all hover:-translate-y-1">
          <div>
             <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
               <ArrowDownCircle class="w-5 h-5" />
               <h3 class="text-xs font-black uppercase tracking-widest">Total de Despesas</h3>
             </div>
             <p class="text-2xl lg:text-4xl font-black text-slate-800 dark:text-white mt-4 tracking-tighter truncate">
                R$ {{ financeStore.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
             </p>
          </div>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Pagamentos de Peças e Operações</p>
        </div>
      </div>

      <!-- Filtros e Tabela Analítica -->
      <div class="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden">
        <div class="px-8 py-8 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 class="text-xl font-black text-blue-900 dark:text-white flex items-center gap-3">
              <History class="w-7 h-7 text-blue-600" /> Fluxo de Lançamentos
            </h3>
            <p class="text-xs text-gray-400 mt-1">Lista cronológica de todas as entradas e saídas</p>
          </div>
          <div class="relative max-w-sm w-full">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
            <input v-model="filterQuery" type="text" placeholder="Buscar por descrição..." class="w-full pl-12 pr-6 py-4 rounded-[20px] bg-gray-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-blue-600 outline-none text-sm dark:text-white font-medium shadow-inner" />
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-700 text-[10px] uppercase font-black text-gray-500 tracking-widest">
                <th class="px-8 py-4">Data</th>
                <th class="px-8 py-4">Descrição do Movimento</th>
                <th class="px-8 py-4">Categoria</th>
                <th class="px-8 py-4 text-right">Valor Líquido (R$)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
              <tr v-for="trx in filteredTransactions" :key="trx.id" class="hover:bg-blue-50/20 dark:hover:bg-slate-800/30 transition-all duration-300 group">
                <td class="px-8 py-6 text-gray-400 text-xs font-black uppercase whitespace-nowrap">{{ new Date(trx.date).toLocaleDateString() }}</td>
                <td class="px-8 py-6">
                  <div class="flex flex-col">
                    <span class="font-black text-slate-800 dark:text-gray-100 text-base min-w-[200px]">{{ trx.description }}</span>
                    <span class="flex items-center gap-1.5 text-[10px] font-black uppercase mt-1" :class="trx.type === 'receita' ? 'text-green-600' : 'text-red-500'">
                      <component :is="trx.type === 'receita' ? ArrowUpCircle : ArrowDownCircle" :size="12" />
                      Lançamento de {{ trx.type }}
                    </span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="inline-flex items-center px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase border border-gray-200 dark:border-slate-700 shadow-sm whitespace-nowrap">
                    {{ trx.category }}
                  </div>
                </td>
                <td class="px-8 py-6 text-right whitespace-nowrap">
                  <div class="flex flex-col items-end">
                    <span class="font-black text-xl tracking-tighter" :class="trx.type === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                      {{ trx.type === 'receita' ? '+' : '-' }} R$ {{ trx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                    </span>
                    <span class="text-[9px] font-bold text-gray-400 uppercase mt-1">Efetivado com sucesso</span>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="4" class="px-8 py-24 text-center">
                  <div class="flex flex-col items-center opacity-30">
                    <History :size="48" class="text-gray-400 mb-4" />
                    <p class="font-black uppercase tracking-[0.2em] text-sm">Nenhum registro encontrado</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <!-- Modal Novo Lançamento -->
    <div v-if="isNewTrxModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95 scale-100">
        <div class="px-10 py-8 bg-blue-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-black text-blue-900 dark:text-white tracking-tight">Novo Movimento</h3>
              <p class="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">Tesouraria Lider Refrigeração</p>
            </div>
            <button @click="isNewTrxModalOpen = false" class="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl text-gray-400 hover:text-red-500 transition-all">
              <X class="w-6 h-6"/>
            </button>
        </div>
        
        <div class="p-10 space-y-8">
          <div class="grid grid-cols-2 gap-6">
            <button @click="form.type = 'receita'" 
              :class="form.type === 'receita' ? 'bg-green-600 text-white shadow-xl shadow-green-500/30 scale-105' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 opacity-50'" 
              class="rounded-3xl py-5 font-black flex flex-col items-center gap-2 transition-all border border-gray-100 dark:border-slate-800">
              <ArrowUpCircle class="w-6 h-6"/> 
              <span class="text-xs uppercase tracking-widest">Receita</span>
            </button>
            <button @click="form.type = 'despesa'" 
              :class="form.type === 'despesa' ? 'bg-red-600 text-white shadow-xl shadow-red-500/30 scale-105' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 opacity-50'" 
              class="rounded-3xl py-5 font-black flex flex-col items-center gap-2 transition-all border border-gray-100 dark:border-slate-800">
              <ArrowDownCircle class="w-6 h-6"/> 
              <span class="text-xs uppercase tracking-widest">Despesa</span>
            </button>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Descrição do Lançamento</label>
              <input v-model="form.description" type="text" placeholder="Ex: Pagamento Fornecedor" class="w-full px-6 py-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none font-bold text-lg transition-all" />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div class="space-y-2">
                 <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Categoria</label>
                 <select v-model="form.category" class="w-full px-6 py-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none font-black appearance-none">
                   <option v-for="cat in OFFICIAL_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                 </select>
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Valor do Título (R$)</label>
                 <CurrencyInput v-model="form.amount" class="w-full px-6 py-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none font-black text-lg" />
               </div>
            </div>
          </div>
        </div>

        <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-end gap-4 border-t border-gray-100 dark:border-slate-800">
          <button @click="isNewTrxModalOpen = false" class="px-8 py-4 font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase text-xs tracking-widest leading-none">Cancelar Registro</button>
          <button @click="save" :disabled="!form.description || form.amount <= 0" class="px-10 py-4 font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 leading-none">
            <PlusCircle :size="18" /> Confirmar Lançamento
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
