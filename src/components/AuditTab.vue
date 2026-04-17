<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ClipboardList, Search, Eye, PlusCircle, Edit2, Trash2, ShieldAlert } from 'lucide-vue-next'
import { useAuditStore } from '../stores/audit'

const auditStore = useAuditStore()
const filterQuery = ref('')
const filterModule = ref('')
const filterAction = ref('')

onMounted(async () => {
  auditStore.loadLogs()
})

const filteredLogs = computed(() => {
  return auditStore.logs.filter(log => {
    // Busca textual ampla
    const matchQuery = !filterQuery.value || 
                       log.user.toLowerCase().includes(filterQuery.value.toLowerCase()) || 
                       log.details.toLowerCase().includes(filterQuery.value.toLowerCase())
    
    const matchModule = !filterModule.value || log.module === filterModule.value
    const matchAction = !filterAction.value || log.action === filterAction.value
    
    return matchQuery && matchModule && matchAction
  })
})

const formatDate = (isoString: string) => {
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CRIOU': return PlusCircle
    case 'EDITOU': return Edit2
    case 'EXCLUIU': return Trash2
    default: return ShieldAlert
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'CRIOU': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    case 'EDITOU': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    case 'EXCLUIU': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-blue-50 dark:border-slate-800 shadow-xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white flex items-center gap-3">
            <ClipboardList class="w-7 h-7 text-blue-600" /> Relatório de Auditoria Global
          </h3>
          <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Rastreabilidade completa de ações no sistema</p>
        </div>
        
        <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select v-model="filterModule" class="px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-blue-600 outline-none text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
            <option value="">Todos os Módulos</option>
            <option value="Orçamentos">Orçamentos</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Estoque">Estoque</option>
            <option value="Clientes">Clientes</option>
            <option value="Sistema">Sistema</option>
          </select>
          
          <select v-model="filterAction" class="px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-blue-600 outline-none text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
            <option value="">Todas as Ações</option>
            <option value="CRIOU">Criação</option>
            <option value="EDITOU">Edição</option>
            <option value="EXCLUIU">Exclusão</option>
          </select>

          <div class="relative w-full md:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
            <input v-model="filterQuery" type="text" placeholder="Buscar usuário ou detalhe..." class="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-blue-600 outline-none text-[10px] font-black uppercase dark:text-white" />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-700 text-[10px] uppercase font-black text-gray-500 tracking-widest">
              <th class="px-6 py-4">Data / Hora</th>
              <th class="px-6 py-4">Usuário</th>
              <th class="px-6 py-4">Ação / Módulo</th>
              <th class="px-6 py-4">Detalhes da Rastreabilidade</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
            <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-blue-50/20 dark:hover:bg-slate-800/30 transition-all duration-300">
              <td class="px-6 py-5 text-gray-400 text-[11px] font-bold whitespace-nowrap">{{ formatDate(log.timestamp) }}</td>
              <td class="px-6 py-5">
                <span class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase">
                  <ShieldAlert v-if="log.user === 'Admin'" :size="12" class="text-amber-500"/>
                  <Eye v-else :size="12" class="text-blue-500"/>
                  {{ log.user }}
                </span>
              </td>
              <td class="px-6 py-5 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span :class="['px-2.5 py-1 rounded-md text-[9px] font-black border uppercase flex items-center gap-1.5', getActionColor(log.action)]">
                    <component :is="getActionIcon(log.action)" :size="10" />
                    {{ log.action }}
                  </span>
                  <span class="text-[10px] font-bold text-gray-500 uppercase">{{ log.module }}</span>
                </div>
              </td>
              <td class="px-6 py-5">
                <p class="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{{ log.details }}</p>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="4" class="px-6 py-20 text-center">
                <div class="flex flex-col items-center opacity-30">
                  <ClipboardList :size="48" class="text-gray-400 mb-4" />
                  <p class="font-black uppercase tracking-[0.2em] text-sm">Nenhum evento registrado</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
        <span>Mostrando {{ filteredLogs.length }} registros de log</span>
        <span>Apenas para visualização gerencial (Imutável)</span>
      </div>
    </div>
  </div>
</template>
