<script setup lang="ts">
import { computed } from 'vue'
import { 
  X, Download, Mail, User, Truck, AlertCircle, Package, 
  Calendar, ShieldCheck, Percent, Clock, MessageCircle, Share2 
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { generateServiceOrderPDF, sendToWhatsApp } from '../utils/exportUtils'

const props = defineProps<{
  order: any
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

if (!props.order) {
  emit('close')
}

const subtotal = computed(() => props.order?.subtotal || (props.order?.total + (props.order?.discountValue || 0)))
const servicesTotal = computed(() => props.order?.servicesValue || 0)
const partsTotal = computed(() => props.order?.partsValue || 0)

const formatDateTime = (isoString: string) => {
  if (!isoString) return 'Não informado'
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy HH:mm')
  } catch (e) {
    return isoString
  }
}

const handleWhatsApp = () => {
  sendToWhatsApp(props.order)
}

const handleExportPDF = () => {
  generateServiceOrderPDF(props.order)
}
</script>

<template>
  <div v-if="isOpen && order" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-blue-50 dark:border-slate-800">
      <!-- Header -->
      <div class="px-8 py-6 border-b dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 class="text-2xl font-black text-blue-900 dark:text-white flex items-center gap-2">
              Orçamento #{{ order.id }}
            </h2>
            <p class="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Calendar :size="12" /> Gerado em: {{ order.date }}
            </p>
          </div>
          <div class="flex flex-row flex-wrap items-center gap-2 w-full lg:w-auto">
            <button @click="handleExportPDF" class="flex-1 lg:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
              <Download :size="16" /> Baixar PDF
            </button>
            <button @click="handleWhatsApp" class="flex-1 lg:flex-none px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20">
              <MessageCircle :size="16" /> WhatsApp
            </button>
            <button @click="emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400">
              <X :size="24" />
            </button>
          </div>
        </div>
      </div>

      <div class="p-8 space-y-8">
        <!-- Subheader: Status Banner -->
        <div :class="[
          'p-4 rounded-2xl flex items-center justify-between',
          order.status === 'Executado' ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800' :
          order.status === 'Cancelado' ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800' :
          'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800'
        ]">
          <div class="flex items-center gap-3">
            <div :class="[
              'p-2 rounded-full',
              order.status === 'Executado' ? 'bg-green-500' :
              order.status === 'Cancelado' ? 'bg-red-500' : 'bg-yellow-500'
            ]">
              <Package class="text-white" :size="16" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase opacity-60">Status Atual</p>
              <p class="text-sm font-black">{{ order.status }}</p>
            </div>
          </div>
          <div class="text-right">
             <p v-if="order.executedAt" class="text-[10px] font-bold text-green-600 uppercase">Concluído em: {{ formatDateTime(order.executedAt) }}</p>
             <p v-if="order.cancelledAt" class="text-[10px] font-bold text-red-600 uppercase">Cancelado em: {{ formatDateTime(order.cancelledAt) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Dados do Cliente -->
          <div class="space-y-3">
            <h3 class="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
              <User :size="16" /> Dados do Cliente
            </h3>
            <div class="bg-gray-50 dark:bg-slate-950 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-2">
              <p class="text-lg font-black text-blue-900 dark:text-white">{{ order.clientName }}</p>
              <div class="grid grid-cols-1 gap-1 text-sm text-gray-500">
                <p>Doc: {{ order.document || 'N/A' }}</p>
                <p>Tel: {{ order.phone || 'N/A' }}</p>
                <p>Email: {{ order.email || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Veículo/Equipamento -->
          <div class="space-y-3">
            <h3 class="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
              <Truck :size="16" /> Veículo e Equipamento
            </h3>
            <div class="bg-gray-50 dark:bg-slate-950 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-2">
              <p class="text-lg font-black text-blue-900 dark:text-white">{{ order.plate }}</p>
              <p class="text-sm font-bold text-blue-600">{{ order.vehicleModel }}</p>
              <div class="pt-2 border-t border-gray-100 dark:border-slate-800 mt-2">
                <p class="text-xs text-gray-500 uppercase font-bold">Equipamento</p>
                <p class="text-sm font-black text-slate-700 dark:text-slate-300">{{ order.equipBrand }} {{ order.equipModel }}</p>
                <p class="text-xs text-blue-500 font-bold mt-1">{{ order.serviceType }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensagem do Site (se existir) -->
        <div v-if="order.report" class="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
          <p class="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2 mb-2">
            <MessageCircle :size="14" /> Detalhes da Solicitação do Site
          </p>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic">{{ order.report }}</p>
        </div>

        <!-- Diagnóstico e Cronograma -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-3">
            <h3 class="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
              <AlertCircle :size="16" /> Diagnóstico Técnico
            </h3>
            <div class="bg-blue-50/30 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-4 h-full">
              <div>
                <p class="text-[10px] font-black text-blue-400 uppercase">Problema Relatado</p>
                <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ order.problem || 'Nenhum relato.' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-blue-400 uppercase">Diagnóstico</p>
                <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ order.diagnosis || 'Nenhum diagnóstico.' }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
              <Clock :size="16" /> Cronograma Previsto
            </h3>
            <div class="bg-gray-50 dark:bg-slate-950 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4 h-full flex flex-col justify-center">
              <div class="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm">
                <span class="text-[10px] font-black text-gray-400 uppercase">Início Estimado</span>
                <span class="text-sm font-black text-blue-900 dark:text-white">{{ order.startTime || 'Agendar' }}</span>
              </div>
              <div class="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm">
                <span class="text-[10px] font-black text-gray-400 uppercase">Fim Estimado</span>
                <span class="text-sm font-black text-blue-900 dark:text-white">{{ order.endTime || 'Agendar' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela de Itens -->
        <div class="space-y-4">
          <h3 class="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
            <Package :size="16" /> Itens do Orçamento
          </h3>
          <div class="overflow-x-auto rounded-3xl border border-gray-100 dark:border-slate-800">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-slate-800 text-[10px] font-black uppercase text-gray-500 border-b dark:border-slate-700">
                  <th class="px-6 py-4">Descrição</th>
                  <th class="px-6 py-4">Tipo</th>
                  <th class="px-6 py-4 text-center">Qtd</th>
                  <th class="px-6 py-4 text-right">Unitário</th>
                  <th class="px-6 py-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-for="s in order.services" :key="s.id" class="dark:text-slate-300">
                  <td class="px-6 py-4 font-bold">{{ s.description }}</td>
                  <td class="px-6 py-4 text-xs opacity-60">Mão de Obra</td>
                  <td class="px-6 py-4 text-center">{{ s.qty }}</td>
                  <td class="px-6 py-4 text-right font-medium">R$ {{ s.value.toFixed(2) }}</td>
                  <td class="px-6 py-4 text-right font-black">R$ {{ (s.qty * s.value).toFixed(2) }}</td>
                </tr>
                <tr v-for="p in order.parts" :key="p.id" class="dark:text-slate-300">
                  <td class="px-6 py-4 font-bold">{{ p.description }}</td>
                  <td class="px-6 py-4 text-xs opacity-60">Peça / Insumo</td>
                  <td class="px-6 py-4 text-center">{{ p.qty }}</td>
                  <td class="px-6 py-4 text-right font-medium">R$ {{ p.value.toFixed(2) }}</td>
                  <td class="px-6 py-4 text-right font-black">R$ {{ (p.qty * p.value).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totais Finais -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-end pt-4">
          <div class="space-y-4">
             <div class="flex items-center gap-2 text-sm">
                <ShieldCheck class="text-green-600" :size="18" />
                <span class="font-bold text-slate-700 dark:text-slate-300">Garantia:</span>
                <span class="text-gray-500">{{ order.warranty }}</span>
             </div>
             <div class="flex items-center gap-2 text-sm">
                <User class="text-blue-600" :size="18" />
                <span class="font-bold text-slate-700 dark:text-slate-300">Técnico Responsável:</span>
                <span class="text-gray-500">{{ order.technician }}</span>
             </div>
             <div v-if="order.observations" class="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl italic text-xs text-gray-500">
                <p class="font-black not-italic text-slate-400 uppercase mb-1">Observações Gerais</p>
                {{ order.observations }}
             </div>
          </div>

          <div class="bg-blue-900 text-white p-8 rounded-3xl space-y-3 shadow-2xl shadow-blue-900/20">
            <div class="flex justify-between text-sm opacity-70">
              <span>Mão de Obra Total:</span>
              <span>R$ {{ servicesTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm opacity-70">
              <span>Peças Total:</span>
              <span>R$ {{ partsTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm opacity-70">
              <span>Deslocamento:</span>
              <span>R$ {{ order.travelValue?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t border-blue-800/50 pt-3">
              <span>Subtotal:</span>
              <span>R$ {{ subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="order.discountValue > 0" class="flex justify-between text-sm text-red-300 font-bold">
              <span class="flex items-center gap-1"><Percent :size="14" /> Desconto ({{ order.discountPercent.toFixed(1) }}%)</span>
              <span>- R$ {{ order.discountValue.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-3xl font-black pt-3 border-t border-blue-800">
              <span class="text-yellow-400">TOTAL:</span>
              <span class="text-yellow-400">R$ {{ order.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
