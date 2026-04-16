<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  CheckCircle2, Clock, Ban, Users, FileText, Download, Calendar, Filter, Share2
} from 'lucide-vue-next'
import { format, subDays, subMonths, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useOrderStore } from '../stores/orders'
import { useAuthStore } from '../stores/auth'

const orderStore = useOrderStore()
const authStore = useAuthStore()

const timeframe = ref<'day' | 'week' | 'month' | 'year'>('day')

const stats = computed(() => {
  return {
    executed: orderStore.orders.filter(o => o.status === 'Executado').length,
    pending: orderStore.orders.filter(o => o.status === 'Pendente').length,
    cancelled: orderStore.orders.filter(o => o.status === 'Cancelado').length,
    users: 1 // Conforme o print
  }
})

// Dados para o gráfico de linha
const chartData = computed(() => {
  const now = new Date()
  const executedOrders = orderStore.orders.filter(o => o.status === 'Executado' && o.executedAt)

  if (timeframe.value === 'day') {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(now, 6 - i)
      const count = executedOrders.filter(o => isSameDay(parseISO(o.executedAt!), date)).length
      return { label: format(date, 'dd/MM'), value: count }
    })
  }

  // Fallback para outros períodos (mock ou lógica real)
  return [
    { label: '09/04', value: 0 }, { label: '10/04', value: 0 }, { label: '11/04', value: 0 },
    { label: '12/04', value: 0 }, { label: '13/04', value: 0 }, { label: '14/04', value: 0 },
    { label: '15/04', value: 0 }
  ]
})

const maxVal = computed(() => Math.max(...chartData.value.map(d => d.value), 4)) // Max 4 conforme print

// Lógica para desenhar o path da linha no SVG
const svgPath = computed(() => {
  if (chartData.value.length === 0) return ''
  const width = 800
  const height = 250
  const stepX = width / (chartData.value.length - 1)
  
  return chartData.value.map((d, i) => {
    const x = i * stepX
    const y = height - ((d.value / maxVal.value) * height)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const handleExport = () => {
  alert('Iniciando exportação para Excel...')
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- 1. Cartões de Resumo (Estilo Print) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="s in [
        { t: 'EXECUTADOS', v: stats.executed, i: CheckCircle2, c: 'text-green-500', b: 'bg-green-50/50 dark:bg-green-900/10', bc: 'border-green-100 dark:border-green-900/20' },
        { t: 'PENDENTES', v: stats.pending, i: Clock, c: 'text-yellow-500', b: 'bg-yellow-50/50 dark:bg-yellow-900/10', bc: 'border-yellow-100 dark:border-yellow-900/20' },
        { t: 'CANCELADOS', v: stats.cancelled, i: Ban, c: 'text-red-500', b: 'bg-red-50/50 dark:bg-red-900/10', bc: 'border-red-100 dark:border-red-900/20' },
        { t: 'USUÁRIOS', v: stats.users, i: Users, c: 'text-blue-500', b: 'bg-blue-50/50 dark:bg-blue-900/10', bc: 'border-blue-100 dark:border-blue-900/20' }
      ]" :key="s.t" class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all border-l-4" :class="s.bc">
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{{ s.t }}</p>
          <p class="text-4xl font-black text-slate-800 dark:text-white">{{ s.v }}</p>
        </div>
        <div :class="[s.b, 'p-4 rounded-full border border-white dark:border-slate-800 shadow-sm']">
          <component :is="s.i" :class="s.c" :size="20" />
        </div>
      </div>
    </div>

    <!-- 2. Gráfico de Produtividade Consolidada -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
      <div class="p-8 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 class="text-lg font-black text-blue-900 dark:text-white flex items-center gap-2">
            <Filter :size="18" class="text-blue-600" /> Produtividade Consolidada (OS + Avulsos)
          </h3>
          <p class="text-xs text-gray-400 font-bold mt-1">Acompanhamento de entregas por período</p>
        </div>
        
        <div class="flex items-center gap-1 bg-gray-50 dark:bg-slate-950 p-1 rounded-xl border border-gray-100 dark:border-slate-800">
          <button v-for="t in [
            { id: 'day', label: 'DIA' },
            { id: 'week', label: 'SEMANA' },
            { id: 'month', label: 'MÊS' },
            { id: 'year', label: 'ANO' }
          ]" :key="t.id" @click="timeframe = t.id as any"
            :class="[
              'px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all tracking-widest',
              timeframe === t.id ? 'bg-white dark:bg-slate-800 text-blue-700 shadow-md ring-1 ring-blue-50 dark:ring-slate-700' : 'text-slate-400 hover:text-slate-600'
            ]">
            {{ t.label }}
          </button>
        </div>
      </div>

      <div class="p-8">
        <!-- Linhas de Base do Gráfico -->
        <div class="relative h-[300px] w-full mt-4">
          <!-- Grid Lines -->
          <div class="absolute inset-0 flex flex-col justify-between">
            <div v-for="label in [4, 3, 2, 1, 0]" :key="label" class="relative flex items-center h-0 w-full border-t border-gray-100 dark:border-slate-800">
               <span class="absolute -left-8 text-[10px] font-black text-gray-400">{{ label }}-</span>
            </div>
          </div>

          <!-- SVG do Gráfico de Linha -->
          <svg class="absolute inset-x-0 bottom-0 w-full h-[250px] overflow-visible" viewBox="0 0 800 250" preserveAspectRatio="none">
             <!-- Gradiente de Área -->
             <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stop-color="rgba(37, 99, 235, 0.2)" />
                   <stop offset="100%" stop-color="rgba(37, 99, 235, 0)" />
                </linearGradient>
             </defs>
             
             <!-- Caminho da Área -->
             <path :d="`${svgPath} L 800 250 L 0 250 Z`" fill="url(#chartGradient)" />

             <!-- Linha Principal -->
             <path :d="svgPath" fill="none" class="stroke-blue-600 dark:stroke-blue-500" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

             <!-- Pontos nos Dados -->
             <g v-for="(item, i) in chartData" :key="i">
                <circle 
                  :cx="i * (800 / (chartData.length - 1))" 
                  :cy="250 - ((item.value / maxVal) * 250)" 
                  r="5" 
                  class="fill-white stroke-blue-600 dark:fill-slate-950 dark:stroke-blue-400" 
                  stroke-width="2" 
                />
                <text 
                  :x="i * (800 / (chartData.length - 1))" 
                  :y="250 - ((item.value / maxVal) * 250) - 15" 
                  text-anchor="middle" 
                  class="text-[10px] font-black fill-blue-600 dark:fill-blue-400"
                >{{ item.value }}</text>
             </g>
          </svg>

          <!-- Rótulos do Eixo X -->
          <div class="absolute -bottom-8 inset-x-0 flex justify-between px-4">
             <div v-for="item in chartData" :key="item.label" class="flex flex-col items-center">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ item.label }}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
