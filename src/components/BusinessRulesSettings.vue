<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AlertTriangle, ShieldCheck } from 'lucide-vue-next'

const siteSettings = ref({
  maxDiscountWarning: 10,
  maxDiscountDanger: 20,
  goalType: 'valor', // 'orcamento', 'valor', 'produtividade'
  goalTarget: 5000
})

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) {
    const parsed = JSON.parse(saved)
    siteSettings.value.maxDiscountWarning = parsed.maxDiscountWarning || 10
    siteSettings.value.maxDiscountDanger = parsed.maxDiscountDanger || 20
    siteSettings.value.goalType = parsed.goalType || 'valor'
    siteSettings.value.goalTarget = parsed.goalTarget || 5000
  }
})

const saveRules = () => {
  localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings.value))
  alert('Regras de negócio aplicadas com sucesso!')
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-[32px] p-10 border border-blue-50 dark:border-slate-800 shadow-xl max-w-4xl mx-auto animate-in zoom-in-95 duration-500 space-y-12">
    <!-- Seção 1: Margem e Desconto -->
    <div>
      <div class="flex items-center gap-4 mb-8">
        <div class="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl text-amber-600">
          <AlertTriangle :size="24" />
        </div>
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Regras de Negócio e Alertas</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Controle de Margem de Lucro</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <label class="text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wide">Aviso de Atenção</label>
            <span class="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl font-black text-lg border border-amber-100 dark:border-amber-800">{{ siteSettings.maxDiscountWarning }}%</span>
          </div>
          <input type="range" v-model.number="siteSettings.maxDiscountWarning" min="1" max="50" step="1" 
            class="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          <p class="text-[10px] text-gray-400 font-bold uppercase">Dispara um alerta AMARELO na criação de orçamentos.</p>
        </div>

        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <label class="text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wide">Aviso Crítico</label>
            <span class="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-black text-lg border border-red-100 dark:border-red-800">{{ siteSettings.maxDiscountDanger }}%</span>
          </div>
          <input type="range" v-model.number="siteSettings.maxDiscountDanger" min="1" max="50" step="1" 
            class="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
          <p class="text-[10px] text-gray-400 font-bold uppercase">Dispara um alerta VERMELHO na criação de orçamentos.</p>
        </div>
      </div>
    </div>

    <div class="h-px bg-gray-100 dark:bg-slate-800 w-full" />

    <!-- Seção 2: Metas Mensais -->
    <div>
      <div class="flex items-center gap-4 mb-8">
        <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
          <ShieldCheck :size="24" />
        </div>
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Metas e Objetivos</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configuração do Painel de Bordo</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-4">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Métrica de Acompanhamento</label>
          <select v-model="siteSettings.goalType" class="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all">
            <option value="valor">Faturamento Mensal (R$)</option>
            <option value="orcamento">Valor de Orçamentos Fechados (R$)</option>
            <option value="produtividade">Produtividade (Qtde O.S. Executadas)</option>
          </select>
          <p class="text-[10px] text-gray-400 font-bold uppercase pl-1">Define qual dado será usado na barra de progresso.</p>
        </div>

        <div class="space-y-4">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Valor Alvo (Meta)</label>
          <div class="relative">
            <span v-if="siteSettings.goalType === 'valor' || siteSettings.goalType === 'orcamento'" class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-600">R$</span>
            <input v-model.number="siteSettings.goalTarget" type="number" 
              :class="[(siteSettings.goalType === 'valor' || siteSettings.goalType === 'orcamento') ? 'pl-14' : 'px-6', 'w-full py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-lg dark:text-white transition-all']" />
          </div>
          <p class="text-[10px] text-gray-400 font-bold uppercase pl-1">
            Ex: {{ (siteSettings.goalType === 'valor' || siteSettings.goalType === 'orcamento') ? 'R$ 5000,00' : '50 pedidos' }} por mês.
          </p>
        </div>
      </div>
    </div>

    <button @click="saveRules" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95">
      <ShieldCheck :size="20" /> Aplicar Regras de Negócio
    </button>
  </div>
</template>
