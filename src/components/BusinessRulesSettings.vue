<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AlertTriangle, ShieldCheck, Edit2, X, Truck, Save } from 'lucide-vue-next'

const siteSettings = ref({
  maxDiscountWarning: 10,
  maxDiscountDanger: 20,
  goalType: 'valor', // 'orcamento', 'valor', 'produtividade'
  goalTarget: 5000
})

interface Veiculo {
  id: string
  placa: string
  modelo: string
  consumo: number
}

const frota = ref<Veiculo[]>([])
const novoVeiculo = ref({ placa: '', modelo: '', consumo: null as number | null })

// Edição
const veiculoEmEdicao = ref<Veiculo | null>(null)
const mostrarModalEdicao = ref(false)
const formEdicao = ref({ placa: '', modelo: '', consumo: null as number | null })

const abrirModalEdicao = (v: Veiculo) => {
  veiculoEmEdicao.value = v
  formEdicao.value = { ...v }
  mostrarModalEdicao.value = true
}

const maskPlacaEdicao = (e: Event) => {
  let val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (val.length > 7) val = val.slice(0, 7)
  if (val.length > 3) val = val.substring(0, 3) + '-' + val.substring(3)
  formEdicao.value.placa = val
}

const salvarEdicao = () => {
  if (!veiculoEmEdicao.value) return
  
  const placaRegex = /^[A-Z]{3}-[A-Z0-9]{4}$/
  if (!placaRegex.test(formEdicao.value.placa)) {
    alert('Placa inválida.')
    return
  }

  const idx = frota.value.findIndex(v => v.id === veiculoEmEdicao.value!.id)
  if (idx !== -1) {
    frota.value[idx] = { ...veiculoEmEdicao.value, ...formEdicao.value }
    localStorage.setItem('lider_frota', JSON.stringify(frota.value))
    window.dispatchEvent(new Event('storage'))
  }
  
  mostrarModalEdicao.value = false
}

const maskPlaca = (e: Event) => {
  let val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (val.length > 7) val = val.slice(0, 7)
  if (val.length > 3) val = val.substring(0, 3) + '-' + val.substring(3)
  novoVeiculo.value.placa = val
}

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) {
    const parsed = JSON.parse(saved)
    siteSettings.value.maxDiscountWarning = parsed.maxDiscountWarning || 10
    siteSettings.value.maxDiscountDanger = parsed.maxDiscountDanger || 20
    siteSettings.value.goalType = parsed.goalType || 'valor'
    siteSettings.value.goalTarget = parsed.goalTarget || 5000
  }

  const savedFrota = localStorage.getItem('lider_frota')
  if (savedFrota) {
    frota.value = JSON.parse(savedFrota)
  }
})

const saveRules = () => {
  localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings.value))
  localStorage.setItem('lider_frota', JSON.stringify(frota.value))
  window.dispatchEvent(new Event('storage'))
  alert('Regras de negócio e Frota aplicadas com sucesso!')
}

const adicionarVeiculo = () => {
  const placaRegex = /^[A-Z]{3}-[A-Z0-9]{4}$/
  if (!placaRegex.test(novoVeiculo.value.placa)) {
    alert('Placa inválida. Use o formato correto (ex: ABC-1234).')
    return
  }
  if (!novoVeiculo.value.modelo || !novoVeiculo.value.consumo) {
    alert('Preencha todos os campos do veículo.')
    return
  }

  frota.value.push({
    id: Date.now().toString(),
    placa: novoVeiculo.value.placa,
    modelo: novoVeiculo.value.modelo,
    consumo: novoVeiculo.value.consumo
  })

  novoVeiculo.value = { placa: '', modelo: '', consumo: null }
  localStorage.setItem('lider_frota', JSON.stringify(frota.value))
  window.dispatchEvent(new Event('storage'))
}

const removerVeiculo = (id: string) => {
  frota.value = frota.value.filter(v => v.id !== id)
  localStorage.setItem('lider_frota', JSON.stringify(frota.value))
  window.dispatchEvent(new Event('storage'))
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

    <div class="h-px bg-gray-100 dark:bg-slate-800 w-full" />

    <!-- Seção 3: Gestão de Frota -->
    <div>
      <div class="flex items-center gap-4 mb-8">
        <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl text-green-600">
          <ShieldCheck :size="24" />
        </div>
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Gestão de Frota</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Caminhões e Consumo Médio (Integração Módulo Trecho)</p>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-slate-950 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 mb-6">
        <h4 class="text-xs font-black text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-4">Adicionar Novo Veículo</h4>
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1 w-full">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Placa</label>
            <input type="text" :value="novoVeiculo.placa" @input="maskPlaca" placeholder="ABC-1234" class="w-full mt-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-green-400 font-bold dark:text-white transition-all uppercase" maxlength="8" />
          </div>
          <div class="flex-1 w-full">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Modelo (Ex: Scania R450)</label>
            <input type="text" v-model="novoVeiculo.modelo" placeholder="Modelo do Caminhão" class="w-full mt-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-green-400 font-bold dark:text-white transition-all" />
          </div>
          <div class="flex-1 w-full">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Consumo Padrão (KM/L)</label>
            <input type="number" step="0.1" v-model.number="novoVeiculo.consumo" placeholder="Ex: 3.5" class="w-full mt-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-green-400 font-bold dark:text-white transition-all" />
          </div>
          <button @click="adicionarVeiculo" class="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest transition-colors mb-0.5">
            Adicionar
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="v in frota" :key="v.id" class="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 font-black text-gray-700 dark:text-gray-300">
              {{ v.placa }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ v.modelo }}</p>
              <p class="text-[10px] font-black text-amber-500 uppercase tracking-wider">Consumo: {{ v.consumo }} km/l</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="abrirModalEdicao(v)" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              <Edit2 :size="16" />
            </button>
            <button @click="removerVeiculo(v.id)" class="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              Excluir
            </button>
          </div>
        </div>
        <div v-if="frota.length === 0" class="text-center py-6 text-gray-400 font-bold text-sm bg-gray-50 dark:bg-slate-950 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
          Nenhum veículo cadastrado na frota.
        </div>
      </div>
    </div>

    <!-- Modal de Edição de Veículo -->
    <div v-if="mostrarModalEdicao" class="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-blue-50/30 dark:bg-slate-800/30">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Truck class="text-blue-600" :size="20" />
            </div>
            <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Editar Veículo</h3>
          </div>
          <button @click="mostrarModalEdicao = false" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-gray-400 transition-all">
            <X :size="20" />
          </button>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa</label>
              <input type="text" :value="formEdicao.placa" @input="maskPlacaEdicao" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all uppercase" maxlength="8" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modelo</label>
              <input type="text" v-model="formEdicao.modelo" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consumo Padrão (KM/L)</label>
            <input type="number" step="0.1" v-model.number="formEdicao.consumo" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all" />
          </div>
        </div>

        <div class="px-8 py-6 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
          <button @click="mostrarModalEdicao = false" class="px-6 py-3 font-black text-gray-400 uppercase text-xs">Cancelar</button>
          <button @click="salvarEdicao" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
            <Save :size="16" /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>

    <button @click="saveRules" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95">
      <ShieldCheck :size="20" /> Aplicar Regras de Negócio
    </button>
  </div>
</template>
