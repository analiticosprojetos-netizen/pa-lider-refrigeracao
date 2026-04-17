<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Trash2, Save, X, Search, Calculator, Calendar, Clock, PenTool, User, Truck, AlertCircle } from 'lucide-vue-next'
import { useOrderStore } from '../stores/orders'
import { useInventoryStore } from '../stores/inventory'
import { useCustomerStore } from '../stores/customers'
import { EQUIPMENT_DATABASE, SERVICE_TYPES } from '../services/OrderService'
import CurrencyInput from './CurrencyInput.vue'
import { formatToTitleCase } from '../utils/textUtils'

const props = defineProps<{
  initialData?: any
}>()

const emit = defineEmits(['close', 'saved'])

const orderStore = useOrderStore()
const inventoryStore = useInventoryStore()
const customerStore = useCustomerStore()

// State
const formData = ref({
  id: undefined as string | undefined,
  clientName: '',
  document: '',
  phone: '',
  email: '',
  plate: '',
  vehicleModel: '',
  equipBrand: '',
  equipModel: '',
  serviceType: '',
  problem: '',
  diagnosis: '',
  startTime: '',
  endTime: '',
  travelValue: 0,
  discountPercent: 0,
  discountValue: 0,
  warranty: '90 dias',
  technician: '',
  observations: '',
  services: [] as any[],
  parts: [] as any[]
})

const siteSettings = ref({
  maxDiscountWarning: 10,
  maxDiscountDanger: 20
})

onMounted(async () => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) {
    const parsed = JSON.parse(saved)
    siteSettings.value.maxDiscountWarning = parsed.maxDiscountWarning || 10
    siteSettings.value.maxDiscountDanger = parsed.maxDiscountWarning || 20
  }
  
  if (props.initialData) {
    formData.value = { ...props.initialData }
  }
  await inventoryStore.loadStock()
  await customerStore.loadCustomers()
})

const onClientNameSelect = () => {
  const existing = customerStore.customers.find(c => c.name.toLowerCase() === formData.value.clientName.toLowerCase())
  if (existing) {
    formData.value.document = existing.document || formData.value.document
    formData.value.phone = existing.phone || formData.value.phone
    formData.value.email = existing.email || formData.value.email
    formData.value.plate = existing.plate || formData.value.plate
    formData.value.vehicleModel = existing.vehicleModel || formData.value.vehicleModel
    formData.value.equipBrand = existing.equipBrand || formData.value.equipBrand
    formData.value.equipModel = existing.equipModel || formData.value.equipModel
  }
}

const filteredModels = computed(() => {
  if (!formData.value.equipBrand) return []
  return EQUIPMENT_DATABASE[formData.value.equipBrand] || []
})

const addService = () => {
  formData.value.services.push({ id: Math.random().toString(36).substr(2, 9), description: '', value: 0, qty: 1 })
}

const removeService = (index: number) => {
  formData.value.services.splice(index, 1)
}

const addPart = () => {
  formData.value.parts.push({ id: Math.random().toString(36).substr(2, 9), inventoryPartId: '', description: '', value: 0, qty: 1 })
}

const removePart = (index: number) => {
  formData.value.parts.splice(index, 1)
}

const onPartSelect = (index: number, partId: string) => {
  if (!partId) return

  // Verifica se a peça já existe em outro campo para evitar duplicidade
  const isDuplicate = formData.value.parts.some((p, i) => i !== index && p.inventoryPartId === partId)
  if (isDuplicate) {
    alert('Esta peça já foi adicionada ao orçamento. Por favor, ajuste a quantidade no campo já existente.')
    formData.value.parts[index].inventoryPartId = ''
    return
  }

  const part = inventoryStore.parts.find(p => p.id === partId)
  if (part) {
    formData.value.parts[index].description = part.name
    formData.value.parts[index].inventoryPartId = part.id
    validateQty(formData.value.parts[index])
  }
}

// Calculations
const servicesValue = computed(() => formData.value.services.reduce((acc, s) => acc + (s.value * s.qty), 0))
const partsValue = computed(() => formData.value.parts.reduce((acc, p) => acc + (p.value * p.qty), 0))
const subtotal = computed(() => servicesValue.value + partsValue.value + formData.value.travelValue)

const total = computed(() => {
  const res = subtotal.value - formData.value.discountValue
  return res < 0 ? 0 : res
})

// Sync Discount % and Value
watch(() => formData.value.discountPercent, (newVal) => {
  const val = (subtotal.value * (newVal / 100))
  if (Math.abs(formData.value.discountValue - val) > 0.01) {
    formData.value.discountValue = parseFloat(val.toFixed(2))
  }
})

watch(() => formData.value.discountValue, (newVal) => {
  if (subtotal.value > 0) {
    const per = (newVal / subtotal.value) * 100
    if (Math.abs(formData.value.discountPercent - per) > 0.01) {
      formData.value.discountPercent = parseFloat(per.toFixed(2))
    }
  }
})

const discountAlertClass = computed(() => {
  if (formData.value.discountPercent >= siteSettings.value.maxDiscountDanger) {
    return 'bg-red-500 text-white ring-4 ring-red-500/30'
  }
  if (formData.value.discountPercent >= siteSettings.value.maxDiscountWarning) {
    return 'bg-amber-500 text-white ring-4 ring-amber-500/30'
  }
  return 'bg-blue-800 dark:bg-blue-900 text-white'
})

const timelineDays = computed(() => {
  if (!formData.value.startTime || !formData.value.endTime) return 0
  const start = new Date(formData.value.startTime)
  const end = new Date(formData.value.endTime)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays || 1
})

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return ''
  return `${parts[2]}/${parts[1]}`
}

const getMaxQty = (part: any) => {
  if (!part.inventoryPartId) return 9999
  const inventoryItem = inventoryStore.parts.find(p => p.id === part.inventoryPartId)
  return inventoryItem ? inventoryItem.quantity : 9999
}

const validateQty = (part: any) => {
  const max = getMaxQty(part)
  if (part.qty > max) {
    part.qty = max
  }
  if (part.qty < 1) {
    part.qty = 1
  }
}

const handleSave = async () => {
  if (!formData.value.clientName) return alert('Cliente é obrigatório')
  
  const payload = {
    ...formData.value,
    servicesValue: servicesValue.value,
    partsValue: partsValue.value,
    subtotal: subtotal.value,
    total: total.value
  }

  // --- GRAVA O CLIENTE E CARRO NA BASE ---
  const existingCustomer = customerStore.customers.find(c => c.name.toLowerCase() === formData.value.clientName.toLowerCase())
  const custData = {
    name: formData.value.clientName,
    document: formData.value.document,
    phone: formData.value.phone,
    email: formData.value.email,
    plate: formData.value.plate,
    vehicleModel: formData.value.vehicleModel,
    equipBrand: formData.value.equipBrand,
    equipModel: formData.value.equipModel
  }
  
  if (!existingCustomer) {
    await customerStore.createCustomer(custData)
  } else {
    await customerStore.updateCustomer(existingCustomer.id, custData)
  }

  if (formData.value.id) {
    await orderStore.updateOrder(formData.value.id, payload)
  } else {
    await orderStore.createOrder(payload)
  }
  emit('saved')
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Grid Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- 1. Dados do Cliente -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
        <h3 class="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <User :size="16" /> Dados do Cliente
        </h3>
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nome / Empresa</label>
            <input list="registered_customers" v-model="formData.clientName" @input="() => { onClientNameSelect(); formData.clientName = formatToTitleCase(formData.clientName) }" type="text" placeholder="Digite o nome..." class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white shadow-sm" spellcheck="true" lang="pt-BR" />
            <datalist id="registered_customers">
              <option v-for="c in customerStore.customers" :key="c.id" :value="c.name"></option>
            </datalist>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">CPF / CNPJ</label>
              <input v-model="formData.document" type="text" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Telefone</label>
              <input v-model="formData.phone" type="text" placeholder="(00) 00000-0000" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">E-mail</label>
            <input v-model="formData.email" type="email" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white" />
          </div>
        </div>
      </div>

      <!-- 2. Veículo e Equipamento -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
        <h3 class="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Truck :size="16" /> Veículo e Equipamento
        </h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Placa</label>
               <input v-model="formData.plate" @input="formData.plate = formData.plate.toUpperCase()" type="text" placeholder="ABC-1234" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white uppercase" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Modelo Veículo</label>
              <input v-model="formData.vehicleModel" @input="formData.vehicleModel = formatToTitleCase(formData.vehicleModel)" type="text" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white" spellcheck="true" lang="pt-BR" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Marca Equipamento</label>
               <select v-model="formData.equipBrand" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 appearance-none font-bold text-sm dark:text-white">
                 <option value="">Ex: Thermo King</option>
                 <option v-for="brand in Object.keys(EQUIPMENT_DATABASE)" :key="brand" :value="brand">{{ brand }}</option>
               </select>
            </div>
            <div class="space-y-1">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Modelo Equipamento</label>
               <select v-model="formData.equipModel" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 appearance-none font-bold text-sm dark:text-white">
                 <option value="">Selecione ou digite...</option>
                 <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
               </select>
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tipo de Serviço</label>
            <select v-model="formData.serviceType" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 appearance-none font-bold text-sm dark:text-white">
               <option value="">Selecione ou digite o tipo...</option>
               <option v-for="st in SERVICE_TYPES" :key="st" :value="st">{{ st }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 3. Diagnóstico Técnico -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
        <h3 class="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <AlertCircle :size="16" /> Diagnóstico Técnico
        </h3>
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Problema Relatado</label>
            <textarea v-model="formData.problem" @input="formData.problem = formatToTitleCase(formData.problem)" rows="3" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white resize-none" spellcheck="true" lang="pt-BR"></textarea>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Diagnóstico Técnico</label>
            <textarea v-model="formData.diagnosis" @input="formData.diagnosis = formatToTitleCase(formData.diagnosis)" rows="3" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white resize-none" spellcheck="true" lang="pt-BR"></textarea>
          </div>
        </div>
      </div>

      <!-- 4. Cronograma de Execução -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
        <h3 class="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Clock :size="16" /> Cronograma de Execução
        </h3>
        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Início do Serviço</label>
              <input v-model="formData.startTime" type="date" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fim do Serviço</label>
              <input v-model="formData.endTime" type="date" class="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 transition-all font-bold text-sm dark:text-white" />
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between pl-1">
              <label class="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em]">Linha do Tempo do Projeto</label>
              <div v-if="timelineDays > 0" class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {{ timelineDays }} dias de duração
              </div>
            </div>
            
            <div v-if="formData.startTime && formData.endTime" class="bg-gray-50/50 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <div class="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                <span>{{ formatDateShort(formData.startTime) }}</span>
                <span>{{ formatDateShort(formData.endTime) }}</span>
              </div>
              
              <!-- Barra de Timeline -->
              <div class="relative h-4 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                <div v-if="formData.services.length === 0" class="h-full w-full bg-blue-500 animate-pulse"></div>
                <div v-for="(svc, idx) in formData.services.slice(0, 5)" :key="svc.id" 
                  :style="{ width: `${100 / Math.min(formData.services.length, 5)}%` }"
                  :class="[
                    'h-full border-r border-white/20 last:border-r-0 transition-all duration-700',
                    idx % 2 === 0 ? 'bg-blue-600' : 'bg-blue-400'
                  ]"
                ></div>
              </div>
              
              <!-- Legendas dos Serviços -->
              <div class="flex justify-between px-1 gap-1">
                 <div v-for="(svc, idx) in formData.services.slice(0, 5)" :key="svc.id" 
                    class="flex-1 text-center truncate"
                 >
                    <p class="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{{ svc.description || 'Serviço ' + (idx + 1) }}</p>
                 </div>
              </div>
            </div>
            
            <div v-else class="h-24 w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 flex items-center justify-center bg-gray-50/50 dark:bg-slate-950/20">
               <p class="text-[10px] font-bold text-gray-400 uppercase italic">Selecione as datas para visualizar o cronograma gráfico</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Serviços e Peças -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div class="px-8 py-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
           <h3 class="text-sm font-black text-blue-900 dark:text-white uppercase tracking-widest">Serviços e Peças</h3>
           <div class="flex gap-2">
              <button @click="addService" class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-850 hover:bg-gray-100 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase border border-gray-200 dark:border-slate-800 transition-all">+ Serviço</button>
              <button @click="addPart" class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-850 hover:bg-gray-100 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase border border-gray-200 dark:border-slate-800 transition-all">+ Peça</button>
           </div>
        </div>
        <div class="p-8 space-y-2 max-h-[500px] overflow-y-auto">
           <!-- Lista de Serviços -->
           <div v-for="(item, idx) in formData.services" :key="item.id" class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-6 p-4 bg-gray-50/50 dark:bg-slate-950/20 rounded-xl border border-transparent hover:border-blue-100 dark:hover:border-slate-800 transition-all">
              <div class="col-span-1 md:col-span-8 space-y-1.5">
                 <label v-if="idx === 0" class="text-[9px] font-black uppercase text-gray-400 hidden md:block">Serviço / Mão de Obra</label>
                 <label class="text-[9px] font-black uppercase text-gray-400 md:hidden">Descrição do Serviço</label>
                 <input v-model="item.description" @input="item.description = formatToTitleCase(item.description)" placeholder="Ex: Carga de Gás" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white transition-all shadow-sm" spellcheck="true" lang="pt-BR" />
              </div>
              <div class="col-span-9 md:col-span-3 space-y-1.5">
                 <label v-if="idx === 0" class="text-[9px] font-black uppercase text-gray-400 hidden md:block">Valor</label>
                 <label class="text-[9px] font-black uppercase text-gray-400 md:hidden">Valor Unitário</label>
                 <CurrencyInput v-model="item.value" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white transition-all shadow-sm text-right" />
              </div>
              <!-- Deixando quantity invisivel para serviços mas computável (1 por default) -->
              <input type="hidden" v-model="item.qty" />
              <div class="col-span-3 md:col-span-1 flex items-center justify-center pb-3">
                 <button @click="removeService(idx)" class="p-3 md:p-0 text-red-400 hover:text-red-500 transition-colors bg-red-50 md:bg-transparent rounded-lg"><Trash2 :size="18" /></button>
              </div>
           </div>

           <!-- Lista de Peças -->
           <div v-for="(part, idx) in formData.parts" :key="part.id" class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6 space-y-4">
              
              <div class="space-y-2">
                 <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Vincular ao Estoque (Opcional)
                 </label>
                 <div class="flex gap-4 items-center">
                    <select v-model="part.inventoryPartId" @change="onPartSelect(idx, part.inventoryPartId)" class="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white appearance-none shadow-sm transition-all">
                       <option value="">Selecione uma peça do estoque...</option>
                       <option v-for="p in inventoryStore.parts" :key="p.id" :value="p.id">{{ p.name }} (Disp: {{ p.quantity }})</option>
                    </select>
                    <button @click="removePart(idx)" class="text-red-400 hover:text-red-500 pt-1 flex-shrink-0 transition-colors">
                       <Trash2 :size="20" />
                    </button>
                 </div>
              </div>

              <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12 md:col-span-7 space-y-1.5">
                  <label class="text-[9px] font-black uppercase text-gray-400 md:hidden">Descrição Manual</label>
                  <input v-model="part.description" @input="part.description = formatToTitleCase(part.description)" placeholder="Descrição da Peça" class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white shadow-sm transition-all" spellcheck="true" lang="pt-BR" />
                </div>
                <div class="col-span-4 md:col-span-2 space-y-1.5">
                  <label class="text-[9px] font-black uppercase text-gray-400 md:hidden">Qtd</label>
                  <input v-model.number="part.qty" type="number" :min="1" :max="getMaxQty(part)" @input="validateQty(part)" class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm text-center dark:text-white shadow-sm transition-all" />
                </div>
                <div class="col-span-8 md:col-span-3 space-y-1.5">
                  <label class="text-[9px] font-black uppercase text-gray-400 md:hidden">Valor Unitário</label>
                  <CurrencyInput v-model="part.value" class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white text-right shadow-sm transition-all" />
                </div>
              </div>
           </div>
           
           <div v-if="formData.services.length === 0 && formData.parts.length === 0" class="py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest opacity-40">
              Nenhum serviço ou peça adicionado
           </div>
        </div>
      </div>

      <!-- 6. Resumo Financeiro (Cartão Azul) -->
      <div class="bg-blue-900 text-white rounded-2xl shadow-xl p-8 flex flex-col justify-between border border-blue-800">
        <div>
          <h3 class="text-xs font-black uppercase tracking-[0.2em] text-blue-200 mb-6">Resumo Financeiro</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] font-black text-blue-300 uppercase">Deslocamento (R$)</label>
              <CurrencyInput v-model="formData.travelValue" class="w-full bg-blue-800/50 text-white border border-blue-700/50 rounded-xl px-4 py-2.5 outline-none font-bold text-xs" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-blue-300 uppercase">Garantia</label>
              <input v-model="formData.warranty" type="text" class="w-full bg-blue-800/50 border border-blue-700/50 rounded-xl px-4 py-2.5 outline-none font-bold text-xs" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-blue-300 uppercase">% Desconto (R$)</label>
              <input v-model.number="formData.discountPercent" type="number" class="w-full bg-blue-800/50 border border-blue-700/50 rounded-xl px-4 py-2.5 outline-none font-bold text-xs" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-blue-300 uppercase">Desconto (R$)</label>
              <CurrencyInput v-model="formData.discountValue" class="w-full bg-blue-800/50 text-white border border-blue-700/50 rounded-xl px-4 py-2.5 outline-none font-bold text-xs" />
            </div>
          </div>

          <div class="mt-8 space-y-2">
            <div class="flex justify-between items-center text-[10px] font-bold text-blue-100/60 uppercase">
               <span>Total Mão de Obra:</span>
               <span>R$ {{ servicesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between items-center text-[10px] font-bold text-blue-100/60 uppercase">
               <span>Total Peças:</span>
               <span>R$ {{ partsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between items-center text-[11px] font-black text-blue-5 uppercase border-t border-blue-800 pt-2">
               <span>Subtotal:</span>
               <span>R$ {{ subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between items-center text-[11px] font-black text-red-300 uppercase">
               <span>Desconto:</span>
               <span>- R$ {{ (formData.discountValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-10">
          <div class="flex justify-between items-end mb-6">
            <h4 class="text-4xl font-black uppercase tracking-tighter">TOTAL:</h4>
            <p class="text-4xl font-black tracking-tighter text-white">R\$ {{ total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
          </div>
          
          <div class="space-y-3">
             <div class="space-y-1">
                <label class="text-[9px] font-black text-blue-300 uppercase">Técnico Responsável</label>
                <input v-model="formData.technician" @input="formData.technician = formatToTitleCase(formData.technician)" type="text" placeholder="admin" class="w-full bg-blue-800/50 border border-blue-700/50 rounded-xl px-4 py-2.5 outline-none font-bold text-xs" spellcheck="true" lang="pt-BR" />
             </div>
             <button @click="handleSave" class="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2">
               <Plus v-if="!formData.id" :size="18" />
               <Save v-else :size="18" />
               {{ formData.id ? 'Salvar Alterações' : 'Gerar Orçamento' }}
             </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
