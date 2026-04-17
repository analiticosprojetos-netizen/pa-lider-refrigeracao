<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Camera, Save, ZoomIn, ZoomOut, Check, Eye, X, Palette, Type, Edit2, Package, Zap, ChevronUp, ChevronDown, Image } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import BannerCarousel from './BannerCarousel.vue'
import { useAuditStore } from '../stores/audit'

const auditStore = useAuditStore()

const settings = ref({
  banners: [] as any[],
  specialties: [] as any[],
  carouselDelay: 6
})

const activeConfigTab = ref('banners') // 'banners' | 'specialties'

const isCropperModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const currentImage = ref('')

// Preview State
const previewTab = ref('image') // 'image' | 'text'
const previewScale = ref(0.6)

// Triagem Workflow State
const isDestinyModalOpen = ref(false)
const isTargetSelectionModalOpen = ref(false)
const uploadDestination = ref<'banner' | 'card'>('banner')
const isSequentialBoth = ref(false) // Rastreador para o fluxo Ambos
const targetCardIndex = ref(-1)

// Cropper & Result State
const cropperRef = ref()
const cropperResultSrc = ref('')

// Banner Form State
const cropperOverlayOpacity = ref(60)
const cropperObjectFit = ref('cover')
const customTitle1 = ref('Sua Carga')
const customTitle2 = ref('Sempre na Temperatura Certa')
const customButtonText = ref('Falar com Especialista')
const customButtonAction = ref('contact')
const customButtonUrl = ref('')
const customAlignment = ref('left')
const customTitleSize = ref(100)
const customSubtitleSize = ref(100)
const customImageScale = ref(100)
const customImagePosition = ref('center')
const customOverlayLogo = ref('') 
const customType = ref('Serviço') // Novo: Tipo para o card (Serviço/Autorizada)

const editingIndex = ref(-1)

const resetBannerForm = () => {
  cropperResultSrc.value = ''
  cropperOverlayOpacity.value = 60
  cropperObjectFit.value = 'cover'
  customImageScale.value = 100
  customImagePosition.value = 'center'
  previewScale.value = 0.6
  previewTab.value = 'image'
  customTitle1.value = 'Sua Carga'
  customTitle2.value = 'Sempre na Temperatura Certa'
  customButtonText.value = 'Falar com Especialista'
  customButtonAction.value = 'contact'
  customButtonUrl.value = ''
  customAlignment.value = 'left'
  customTitleSize.value = 100
  customSubtitleSize.value = 100
  customOverlayLogo.value = ''
  customType.value = 'Serviço'
  editingIndex.value = -1
}

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.banners && parsed.banners.length > 0) {
      if (typeof parsed.banners[0] === 'string') {
         settings.value.banners = parsed.banners.map((b: string) => ({ src: b, overlay: 60, objectFit: 'cover' }))
      } else {
         settings.value.banners = parsed.banners.map((b: any) => ({ ...b, objectFit: b.objectFit || 'cover' }))
      }
    }
    settings.value.carouselDelay = parsed.carouselDelay || 6
    if (parsed.specialties && Array.isArray(parsed.specialties)) {
      settings.value.specialties = parsed.specialties
    } else {
      // Default specialties if none exist
      settings.value.specialties = [
        { title: 'Thermo King', desc: 'Referência mundial em refrigeração. Técnicos treinados e certificados pela marca.', iconName: 'Thermometer', type: 'Autorizada', logo: '' },
        { title: 'Carrier', desc: 'Representante autorizado. Peças originais e suporte especializado Carrier Transicold.', iconName: 'Award', type: 'Autorizada', logo: '' },
        { title: 'Frigo King', desc: 'Equipamentos robustos para logística de perecíveis. Atendimento técnica oficial.', iconName: 'ShieldCheck', type: 'Autorizada', logo: '' },
        { title: 'Thermo Star', desc: 'Soluções em refrigeração para transporte. Manutenção técnica autorizada de fábrica.', iconName: 'Snowflake', type: 'Autorizada', logo: '' },
        { title: 'Baús Frigoríficos', desc: 'Reforma completa e isolamento térmico de alta performance para baús frigoríficos.', iconName: 'Truck', type: 'Serviço', logo: '' },
        { title: 'Logística de Frio', desc: 'Gestão completa da cadeia de frio, garantindo a integridade térmica da sua carga.', iconName: 'CheckCircle2', type: 'Serviço', logo: '' }
      ]
    }
  }
})

const triggerFileSelect = () => {
  editingIndex.value = -1 
  targetCardIndex.value = -1
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Escolha uma imagem de até 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          currentImage.value = ev.target.result as string
          isDestinyModalOpen.value = true // Triagem inicial
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const selectDestiny = (dest: 'banner' | 'card' | 'both') => {
  isSequentialBoth.value = dest === 'both'
  uploadDestination.value = (dest === 'card' || dest === 'both') ? 'card' : 'banner'
  isDestinyModalOpen.value = false
  
  if (dest === 'card' || dest === 'both') {
    previewTab.value = 'text' 
    previewScale.value = 0.8
    
    if (targetCardIndex.value >= 0) {
      isCropperModalOpen.value = true
      cropperObjectFit.value = 'contain'
    } else {
      isTargetSelectionModalOpen.value = true
    }
  } else {
    isCropperModalOpen.value = true
    cropperObjectFit.value = 'cover'
  }
}

const selectTargetCard = (idx: number) => {
  targetCardIndex.value = idx
  const spec = settings.value.specialties[idx]
  customTitle1.value = spec.title
  customTitle2.value = spec.desc
  customType.value = spec.type || 'Serviço'
  
  isTargetSelectionModalOpen.value = false
  isCropperModalOpen.value = true
  cropperObjectFit.value = 'contain'
}

const handleCrop = () => {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult()
    cropperResultSrc.value = canvas.toDataURL('image/jpeg', 0.8)
    isCropperModalOpen.value = false
    isPreviewModalOpen.value = true
  }
}

const cancelCrop = () => {
  isCropperModalOpen.value = false
  currentImage.value = ''
}

const useOriginal = () => {
  cropperResultSrc.value = currentImage.value
  isCropperModalOpen.value = false
  isPreviewModalOpen.value = true
  cropperObjectFit.value = 'contain' // Sugestão para logos
}

const confirmPreview = () => {
  // LÓGICA DE SALVAMENTO PARA CARD
  if (uploadDestination.value === 'card') {
     const idx = targetCardIndex.value >= 0 ? targetCardIndex.value : editingIndex.value
     settings.value.specialties[idx] = {
        ...settings.value.specialties[idx],
        logo: cropperResultSrc.value,
        title: customTitle1.value,
        desc: customTitle2.value,
        type: customType.value
      }
      auditStore.addLog("Sistema", "EDITOU", `Card de Especialidade atualizado: ${customTitle1.value}`)
      
      // Transição automática para Banner se for "Ambos"
      if (isSequentialBoth.value) {
        const logoProcessada = cropperResultSrc.value
        uploadDestination.value = 'banner' 
        isSequentialBoth.value = false // Consome o fluxo
        targetCardIndex.value = -1
        customOverlayLogo.value = logoProcessada 
        cropperObjectFit.value = 'cover' 
        previewTab.value = 'image' 
        return 
      }
  } 
  // LÓGICA DE SALVAMENTO PARA BANNER
  else if (uploadDestination.value === 'banner') {
    const bannerData = {
      src: cropperResultSrc.value,
      overlay: cropperOverlayOpacity.value,
      objectFit: cropperObjectFit.value,
      imageScale: customImageScale.value,
      imagePosition: customImagePosition.value,
      title1: customTitle1.value,
      title2: customTitle2.value,
      buttonText: customButtonText.value,
      buttonAction: customButtonAction.value,
      buttonUrl: customButtonUrl.value,
      alignment: customAlignment.value,
      titleSize: customTitleSize.value,
      subtitleSize: customSubtitleSize.value,
      overlayLogo: customOverlayLogo.value
    }

    if (editingIndex.value >= 0) {
      settings.value.banners[editingIndex.value] = bannerData
    } else {
      settings.value.banners.push(bannerData)
    }
    auditStore.addLog("Sistema", "EDITOU", "Banner salvo com sucesso")
  }
  
  isPreviewModalOpen.value = false
  resetBannerForm()
}

const cancelPreview = () => {
  isPreviewModalOpen.value = false
  resetBannerForm()
}

const editBanner = (index: number) => {
  const banner = settings.value.banners[index]
  editingIndex.value = index
  activeConfigTab.value = 'banners'
  uploadDestination.value = 'banner'
  
  // Preenche refs
  cropperResultSrc.value = banner.src
  cropperOverlayOpacity.value = banner.overlay || 60
  cropperObjectFit.value = banner.objectFit || 'cover'
  customTitle1.value = banner.title1 ?? 'Sua Carga'
  customTitle2.value = banner.title2 ?? 'Sempre na Temperatura Certa'
  customButtonText.value = banner.buttonText ?? 'Falar com Especialista'
  customButtonAction.value = banner.buttonAction || 'contact'
  customButtonUrl.value = banner.buttonUrl || ''
  customAlignment.value = banner.alignment || 'left'
  customTitleSize.value = banner.titleSize || 100
  customSubtitleSize.value = banner.subtitleSize || 100
  customImageScale.value = banner.imageScale || 100
  customImagePosition.value = banner.imagePosition || 'center'
  customOverlayLogo.value = banner.overlayLogo || ''
  
  isPreviewModalOpen.value = true
}

const editSpecialty = (index: number) => {
  const spec = settings.value.specialties[index]
  editingIndex.value = index
  activeConfigTab.value = 'specialties'
  uploadDestination.value = 'card'
  
  cropperResultSrc.value = spec.logo || ''
  customTitle1.value = spec.title
  customTitle2.value = spec.desc
  customType.value = spec.type || 'Serviço'
  
  // Para especialidades, usamos o modo 'contain' por padrão para logos
  cropperObjectFit.value = 'contain'
  previewTab.value = 'text' // Focar nos textos primeiro
  isPreviewModalOpen.value = true
}

const triggerLogoUpload = (index: number) => {
  editingIndex.value = -1 // Reset editing banner index
  targetCardIndex.value = index
  
  // Carrega dados originais do card
  const spec = settings.value.specialties[index]
  customTitle1.value = spec.title
  customTitle2.value = spec.desc
  customType.value = spec.type || 'Serviço'

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          currentImage.value = ev.target.result as string
          isDestinyModalOpen.value = true // Agora também abre a triagem aqui!
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const removeBanner = (index: number) => {
  const removed = settings.value.banners[index]
  settings.value.banners.splice(index, 1)
  auditStore.addLog("Sistema", "EXCLUIU", `Banner removido da lista (Posição anterior: ${index + 1})`)
}

const removeSpecialty = (index: number) => {
  if (confirm('Deseja remover esta especialidade?')) {
    settings.value.specialties.splice(index, 1)
    auditStore.addLog("Sistema", "REMOVEU", "Especialidade removida")
  }
}

const moveSpecialtyUp = (index: number) => {
  if (index > 0) {
    const item = settings.value.specialties.splice(index, 1)[0]
    settings.value.specialties.splice(index - 1, 0, item)
  }
}

const moveSpecialtyDown = (index: number) => {
  if (index < settings.value.specialties.length - 1) {
    const item = settings.value.specialties.splice(index, 1)[0]
    settings.value.specialties.splice(index + 1, 0, item)
  }
}

const reorderSpecialty = (oldIndex: number, newPos: number) => {
  if (isNaN(newPos) || newPos < 1) return
  let targetIdx = newPos - 1
  if (targetIdx >= settings.value.specialties.length) targetIdx = settings.value.specialties.length - 1
  if (targetIdx === oldIndex) return

  const item = settings.value.specialties.splice(oldIndex, 1)[0]
  settings.value.specialties.splice(targetIdx, 0, item)
  auditStore.addLog("Sistema", "REORDENOU", `Especialidade movida da posição ${oldIndex + 1} para ${targetIdx + 1}`)
}

const save = () => {
  const saved = localStorage.getItem('lider_site_settings')
  const current = saved ? JSON.parse(saved) : {}
  localStorage.setItem('lider_site_settings', JSON.stringify({
    ...current,
    banners: settings.value.banners,
    specialties: settings.value.specialties,
    carouselDelay: settings.value.carouselDelay
  }))
  
  auditStore.addLog("Sistema", "EDITOU", `Configurações master de banners salvas. Total: ${settings.value.banners.length} banners.`)
  alert('Configurações de banners salvas com sucesso!')
}

const zoomIn = () => cropperRef.value?.zoom(1.2)
const zoomOut = () => cropperRef.value?.zoom(0.8)
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-10 border border-blue-50 dark:border-slate-800 shadow-xl max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
          <Palette :size="24" />
        </div>
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Centro de Marketing</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Personalização Visual e Conteúdo</p>
        </div>
      </div>
      <button @click="save" class="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase flex justify-center items-center gap-2 shadow-xl shadow-blue-500/30 hover:scale-105 transition-all">
         <Save :size="16" /> Salvar Tudo
      </button>
    </div>

    <!-- Navegação por Abas -->
    <div class="flex border-b border-gray-100 dark:border-slate-800 mb-8 overflow-x-auto">
      <button @click="activeConfigTab = 'banners'" 
              :class="activeConfigTab === 'banners' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'" 
              class="px-6 py-3 border-b-2 font-black text-[10px] uppercase tracking-widest transition-all shrink-0">
        Banners Principais
      </button>
      <button @click="activeConfigTab = 'specialties'" 
              :class="activeConfigTab === 'specialties' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'" 
              class="px-6 py-3 border-b-2 font-black text-[10px] uppercase tracking-widest transition-all shrink-0">
        Cards de Especialidades
      </button>
    </div>

    <div v-if="activeConfigTab === 'banners'" class="space-y-8 animate-in slide-in-from-left-4 duration-300">
      <div class="space-y-2">
         <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tempo de Transição (Segundos)</label>
         <input v-model.number="settings.carouselDelay" type="number" class="w-32 px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-blue-500 outline-none text-sm font-bold dark:text-white" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div v-for="(banner, idx) in settings.banners" :key="idx" class="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 aspect-[21/9] bg-slate-950 transition-all hover:shadow-xl">
            <!-- Background Preview Simples na grade de miniaturas -->
            <img :src="banner.src" class="w-full h-full" :class="banner.objectFit === 'contain' ? 'object-contain' : 'object-cover'" :style="{ opacity: (1 - (banner.overlay / 100)) }" />
            
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none p-4"
                  :class="{ 'justify-start': banner.alignment === 'left', 'justify-center': banner.alignment === 'center', 'justify-end': banner.alignment === 'right' }">
               <div v-if="banner.title1 || banner.title2" class="opacity-50">
                   <h2 class="text-white text-[10px] font-black italic">{{ banner.title1 }}</h2>
                   <h3 class="text-blue-500 text-[8px] font-black italic mt-0.5">{{ banner.title2 }}</h3>
               </div>
            </div>

            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <button @click="editBanner(idx)" class="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                  <Edit2 :size="18" />
               </button>
               <button @click="removeBanner(idx)" class="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                  <Trash2 :size="18" />
               </button>
            </div>
         </div>
         
         <button @click="triggerFileSelect" class="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all aspect-[21/9]">
            <Plus :size="32" />
            <span class="text-[10px] font-black uppercase tracking-widest text-center mt-2">Selecionar Imagem <br/>(Cortar e Ajustar)</span>
         </button>
      </div>
    </div>

    <!-- ABA DE ESPECIALIDADES -->
    <div v-else class="space-y-8 animate-in slide-in-from-right-4 duration-300">
       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(spec, idx) in settings.specialties" :key="idx" 
               class="bg-gray-50 dark:bg-slate-950 p-6 rounded-3xl border border-transparent hover:border-blue-500/30 transition-all group relative">
            <div class="flex items-center gap-4">
               <div @click="triggerLogoUpload(idx)" class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all overflow-hidden shrink-0">
                  <img v-if="spec.logo" :src="spec.logo" class="w-full h-full object-contain p-2" />
                  <div v-else class="text-gray-400 flex flex-col items-center">
                    <Package :size="16" />
                    <span class="text-[8px] font-black uppercase mt-1">Logo</span>
                  </div>
               </div>
               <div class="flex-1">
                  <h4 class="text-sm font-black text-blue-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <input type="number" 
                           :value="idx + 1" 
                           @change="(e) => reorderSpecialty(idx, parseInt((e.target as HTMLInputElement).value))"
                           class="w-10 h-7 bg-blue-100/50 dark:bg-blue-900/20 border-none rounded-lg text-center text-[10px] text-blue-600 focus:ring-2 ring-blue-500 outline-none transition-all" />
                    {{ spec.title }}
                  </h4>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 font-medium">{{ spec.desc }}</p>
               </div>
               <div class="flex items-center gap-3">
                  <button @click="editSpecialty(idx)" class="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                     <Edit2 :size="14" />
                  </button>
                  <button @click="removeSpecialty(idx)" class="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
                     <Trash2 :size="16" />
                  </button>
               </div>
            </div>
          </div>
       </div>
       <div class="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
          <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 leading-relaxed text-center">
            Cada card representa uma especialidade ou marca autorizada. <br/> 
            Você pode alterar o texto e subir o logotipo real de cada fabricante acima.
          </p>
       </div>
    </div>

    <!-- Modal de Crop (Ajuste da Imagem) -->
    <teleport to="body">
      <div v-if="isCropperModalOpen" class="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div class="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Onde Focar na Imagem?</h3>
            <button @click="cancelCrop" class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X :size="20" /></button>
          </div>
          <div class="bg-slate-100 dark:bg-black/50 p-0 h-[50vh] min-h-[400px]">
            <Cropper
               ref="cropperRef"
               :src="currentImage"
               :stencil-props="{ movable: true, resizable: true }"
               image-restriction="fit-area"
               class="h-full w-full"
            />
          </div>
          <div class="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
               <button @click="zoomOut" class="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 flex flex-col items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 w-16 h-12"><ZoomOut :size="16"/></button>
               <button @click="zoomIn" class="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 flex flex-col items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 w-16 h-12"><ZoomIn :size="16"/></button>
            </div>
            <div class="flex flex-wrap gap-2 w-full sm:w-auto">
               <button @click="useOriginal" class="flex-1 sm:flex-none px-6 py-3 border border-blue-500 text-blue-500 font-black text-xs uppercase rounded-xl hover:bg-blue-500/10 transition-all">Usar Original (Logo)</button>
               <button @click="cancelCrop" class="flex-1 sm:flex-none px-6 py-3 font-bold text-gray-500 text-xs uppercase hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
               <button @click="handleCrop" class="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                  <Check :size="16"/> Confirmar Recorte
               </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal de Preview Real (ESTÚDIO) -->
    <teleport to="body">
      <div v-if="isPreviewModalOpen" class="fixed inset-0 z-[1001] bg-slate-950 backdrop-blur-md flex items-center justify-center p-0 animate-in fade-in duration-300">
         <div class="w-full h-full overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
            
            <div class="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-white/10 shrink-0 shadow-lg">
               <div class="flex items-center gap-3 text-white">
                  <Eye :size="20" class="text-blue-400" />
                  <h3 class="font-black tracking-widest text-sm uppercase">Estúdio de Criação</h3>
               </div>
               <button @click="cancelPreview" class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X :size="20" /></button>
            </div>

          <!-- Área de Trabalho: Painel + Preview -->
          <div class="flex flex-col lg:flex-row flex-1 overflow-hidden">
             
             <!-- CANVA: Preview Escalonável -->
             <div class="flex-1 overflow-auto bg-slate-950 custom-scrollbar p-6 flex flex-col items-center justify-start lg:justify-center relative">
                 <div class="origin-top transition-transform" :style="{ transform: `scale(${previewScale})` }">
                   <!-- MODO BANNER -->
                   <div v-if="uploadDestination === 'banner'" class="w-[1920px]">
                      <BannerCarousel :banners="[{ 
                        src: cropperResultSrc, 
                        overlay: cropperOverlayOpacity, 
                        objectFit: cropperObjectFit, 
                        title1: customTitle1, 
                        title2: customTitle2, 
                        buttonText: customButtonText, 
                        buttonAction: customButtonAction, 
                        buttonUrl: customButtonUrl, 
                        alignment: customAlignment,
                        titleSize: customTitleSize,
                        subtitleSize: customSubtitleSize,
                        imageScale: customImageScale,
                        imagePosition: customImagePosition,
                        overlayLogo: customOverlayLogo
                      }]" :delay="10" />
                   </div>

                   <!-- MODO CARD (Estúdio de Cards dedicado) -->
                   <div v-else class="w-[500px] bg-white dark:bg-slate-900 p-16 rounded-[60px] border border-blue-50 dark:border-slate-800 shadow-4xl flex flex-col items-center text-center relative overflow-hidden">
                      <div class="w-32 h-32 rounded-[32px] bg-blue-50/50 dark:bg-slate-800/50 flex items-center justify-center text-blue-600 mb-10 border border-blue-100/30 dark:border-blue-900/30 overflow-hidden shadow-sm">
                        <img v-if="cropperResultSrc" :src="cropperResultSrc" class="w-full h-full object-contain p-2" />
                        <Package v-else :size="48" />
                      </div>
                      
                      <span class="px-5 py-1.5 bg-blue-100/60 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-full mb-8">
                        {{ customType }}
                      </span>

                      <h3 class="text-4xl font-black text-blue-950 dark:text-white mb-6 uppercase tracking-tighter leading-tight">{{ customTitle1 || 'Título' }}</h3>
                      <p class="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-semibold">{{ customTitle2 || 'Descrição da especialidade...' }}</p>
                   </div>
                 </div>
             </div>

             <!-- BARRA LATERAL (SIDEBAR DE PROPRIEDADES) -->
             <div class="w-full lg:w-[420px] shrink-0 bg-slate-900/95 border-l border-white/10 flex flex-col h-full shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-10 relative">
                 <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                     
                     <!-- Abas (Banner vs Card) -->
                     <div v-if="uploadDestination === 'banner'" class="flex bg-slate-800 p-1.5 rounded-2xl w-full">
                         <button @click="previewTab = 'image'" :class="previewTab === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider">
                             <Palette :size="14" /> Imagem Base
                         </button>
                         <button @click="previewTab = 'text'" :class="previewTab === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider">
                             <Type :size="14" /> Textos e Logos
                         </button>
                     </div>
                     <div v-else class="flex bg-slate-800 p-1.5 rounded-2xl w-full">
                        <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white shadow-lg font-black text-[10px] uppercase tracking-wider">
                           <Edit2 :size="14" /> Configurar Card
                        </button>
                     </div>

                     <!-- MODO BANNER: ABA 1 (Ajuste de Imagem) -->
                     <div v-if="uploadDestination === 'banner' && previewTab === 'image'" class="space-y-8 animate-in fade-in duration-300">
                         <div class="space-y-4">
                             <div class="flex justify-between items-center">
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300">Zoom da Janela</label>
                                <span class="text-xs font-bold text-white">{{ Math.round(previewScale * 100) }}%</span>
                             </div>
                             <input type="range" v-model.number="previewScale" min="0.1" max="1.0" step="0.05" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                             <p class="text-[9px] text-slate-500 uppercase font-black">Ajuste apenas para visualizar melhor em sua tela.</p>
                         </div>
                         
                         <div class="pt-2 space-y-3">
                             <label class="text-[10px] font-black uppercase tracking-widest text-blue-300">Modo de Encaixe da Imagem</label>
                             <div class="flex flex-col bg-slate-800 p-1.5 rounded-xl border border-slate-700 gap-1.5">
                                 <button @click="cropperObjectFit = 'cover'" :class="cropperObjectFit === 'cover' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="text-[10px] font-black tracking-widest uppercase py-4 rounded-lg transition-all w-full">Cobrir Tela</button>
                                 <button @click="cropperObjectFit = 'contain'" :class="cropperObjectFit === 'contain' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="text-[10px] font-black tracking-widest uppercase py-4 rounded-lg transition-all w-full">Completar (Fundo Lider)</button>
                                 <button @click="cropperObjectFit = 'none'" :class="cropperObjectFit === 'none' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="text-[10px] font-black tracking-widest uppercase py-4 rounded-lg transition-all w-full">Tamanho Real</button>
                             </div>
                         </div>

                         <div v-if="cropperObjectFit !== 'cover'" class="space-y-6 pt-4 border-t border-white/5 animate-in slide-in-from-top-4">
                             <div class="space-y-3">
                                 <div class="flex justify-between items-center">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-cyan-300">Escala da Imagem</label>
                                    <span class="text-xs font-bold text-white">{{ customImageScale }}%</span>
                                 </div>
                                 <input type="range" v-model.number="customImageScale" min="5" max="300" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                             </div>

                             <div class="space-y-3">
                                 <label class="text-[10px] font-black uppercase tracking-widest text-cyan-300">Posição da Imagem</label>
                                 <div class="grid grid-cols-3 gap-2">
                                     <button v-for="pos in ['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right']" 
                                             :key="pos" 
                                             @click="customImagePosition = pos"
                                             :class="customImagePosition === pos ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-slate-700 hover:bg-white/5'"
                                             class="h-10 border rounded-lg transition-all text-white flex items-center justify-center">
                                         <div class="w-2 h-2 rounded-full" :class="customImagePosition === pos ? 'bg-white' : 'bg-slate-600'"></div>
                                     </button>
                                 </div>
                             </div>
                         </div>

                         <div class="space-y-3">
                             <div class="flex justify-between items-center">
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300">Transparência da Imagem</label>
                                <span class="text-xs font-bold text-white">{{ cropperOverlayOpacity }}%</span>
                             </div>
                             <input type="range" v-model.number="cropperOverlayOpacity" min="0" max="95" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                         </div>
                     </div>

                     <!-- MODO CARD: Única Aba de Texto -->
                     <div v-if="uploadDestination === 'card'" class="space-y-6 animate-in fade-in duration-300">
                        <div class="space-y-4">
                           <div>
                              <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Título do Card</label>
                              <input v-model="customTitle1" type="text" placeholder="Ex: Carrier" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                           </div>
                           <div>
                              <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-2">Classificação</label>
                              <div class="grid grid-cols-2 gap-2">
                                 <button @click="customType = 'Serviço'" :class="customType === 'Serviço' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400 border border-slate-700'" class="py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Serviço</button>
                                 <button @click="customType = 'Autorizada'" :class="customType === 'Autorizada' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400 border border-slate-700'" class="py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Autorizada</button>
                              </div>
                           </div>
                           <div>
                              <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Descrição Curta</label>
                              <textarea v-model="customTitle2" rows="4" placeholder="Descreva o serviço ou a marca..." class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none resize-none"></textarea>
                           </div>
                           <div class="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                              <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">Este texto aparecerá no carrossel de especialidades da página inicial.</p>
                           </div>
                        </div>
                     </div>

                     <!-- MODO BANNER: ABA 2 (Textos e Logos) -->
                     <div v-if="uploadDestination === 'banner' && previewTab === 'text'" class="space-y-6 animate-in fade-in duration-300">
                         <!-- Textos -->
                         <div class="space-y-4">
                             <div>
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Título Grande</label>
                                <input v-model="customTitle1" type="text" placeholder="Ex: Sua Carga" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                                <div class="flex justify-between items-center mt-2 px-1">
                                   <span class="text-[8px] font-black text-slate-500 uppercase">Tamanho</span>
                                   <span class="text-[10px] font-bold text-blue-400">{{ customTitleSize }}%</span>
                                </div>
                                <input type="range" v-model.number="customTitleSize" min="50" max="200" step="5" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                             </div>
                             <div>
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Subtítulo Azul</label>
                                <input v-model="customTitle2" type="text" placeholder="Ex: Sempre na Temperatura Certa" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                                <div class="flex justify-between items-center mt-2 px-1">
                                   <span class="text-[8px] font-black text-slate-500 uppercase">Tamanho</span>
                                   <span class="text-[10px] font-bold text-blue-400">{{ customSubtitleSize }}%</span>
                                </div>
                                <input type="range" v-model.number="customSubtitleSize" min="50" max="200" step="5" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                             </div>
                             
                             <!-- Botão e Links -->
                             <div class="pt-4 border-t border-white/5 space-y-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Texto do Botão</label>
                                    <input v-model="customButtonText" type="text" placeholder="Falar com Especialista" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-2">Ação do Botão</label>
                                    <select v-model="customButtonAction" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-4 text-[11px] font-black uppercase tracking-widest focus:border-blue-500 outline-none cursor-pointer appearance-none">
                                        <option value="contact">Solicitar Orçamento</option>
                                        <option value="url">Link Externo / WhatsApp</option>
                                    </select>
                                </div>
                                <div v-show="customButtonAction === 'url'">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-green-400 block mb-1">URL (https://...)</label>
                                    <input v-model="customButtonUrl" type="text" placeholder="https://wa.me/..." class="w-full bg-slate-800 text-white border border-green-500/30 rounded-xl px-4 py-3 text-sm font-bold focus:border-green-500 outline-none" />
                                </div>
                             </div>

                             <!-- NOVO: Logotipo Flutuante no Banner -->
                             <div class="pt-4 border-t border-white/5">
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-2">Logotipo Flutuante (Overlay)</label>
                                <div class="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                   <div class="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 group relative">
                                      <img v-if="customOverlayLogo" :src="customOverlayLogo" class="w-full h-full object-contain p-1" />
                                      <Palette v-else :size="20" class="text-slate-600" />
                                   </div>
                                   <div class="flex-1">
                                      <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ customOverlayLogo ? 'Marca Aplicada' : 'Nenhuma Marca' }}</p>
                                      <button v-if="customOverlayLogo" @click="customOverlayLogo = ''" class="text-[10px] font-black text-red-400 uppercase mt-1 hover:text-red-300 transition-colors">Remover Logo</button>
                                   </div>
                                </div>
                             </div>

                             <div class="pt-4 border-t border-white/5">
                                 <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-2">Posicionamento na Tela</label>
                                 <div class="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 gap-1.5">
                                     <button @click="customAlignment = 'left'" :class="customAlignment === 'left' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">Esquerda</button>
                                     <button @click="customAlignment = 'center'" :class="customAlignment === 'center' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">Centro</button>
                                     <button @click="customAlignment = 'right'" :class="customAlignment === 'right' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">Direita</button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!-- Footer do Sidebar -->
                 <div class="p-6 bg-slate-900 border-t border-white/10 shrink-0">
                     <button @click="confirmPreview" class="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all">
                        Finalizar e Salvar
                     </button>
                 </div>
             </div>
          </div>
       </div>
      </div>
    </teleport>

    <!-- NOVO: Modal de Triagem de Destino -->
    <teleport to="body">
      <div v-if="isDestinyModalOpen" class="fixed inset-0 z-[1010] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-lg shadow-4xl overflow-hidden animate-in zoom-in-95 duration-300 p-10 text-center">
          <div class="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-8">
             <Palette :size="40" />
          </div>
          <h3 class="text-2xl font-black text-blue-900 dark:text-white uppercase tracking-tighter mb-4">Onde deseja aplicar esta imagem?</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-10 leading-relaxed">Selecione o destino para que eu possa abrir a ferramenta correta de ajuste para você.</p>
          
          <div class="grid grid-cols-1 gap-4">
             <button @click="selectDestiny('card')" class="w-full py-5 bg-gray-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-gray-100 dark:border-slate-700 hover:border-blue-500 flex items-center justify-center gap-3 group">
                <Package :size="18" class="text-blue-500 group-hover:text-white" /> Somente nos Cards (Especialidades)
             </button>
             <button @click="selectDestiny('banner')" class="w-full py-5 bg-gray-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-gray-100 dark:border-slate-700 hover:border-blue-500 flex items-center justify-center gap-3 group">
                <Camera :size="18" class="text-blue-500 group-hover:text-white" /> Somente no Banner (Topo)
             </button>
             <button @click="selectDestiny('both')" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.02] flex items-center justify-center gap-3 font-bold border-2 border-white/10 italic">
                <Zap :size="18" class="animate-pulse" /> Usar em AMBOS (Logo + Banner)
             </button>
          </div>
          <button @click="isDestinyModalOpen = false" class="mt-8 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest">Cancelar Upload</button>
        </div>
      </div>
    </teleport>

    <!-- NOVO: Modal de Seleção de Card Alvo -->
    <teleport to="body">
      <div v-if="isTargetSelectionModalOpen" class="fixed inset-0 z-[1011] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-2xl shadow-4xl overflow-hidden animate-in zoom-in-95 duration-300 p-10">
          <div class="text-center mb-10">
             <h3 class="text-2xl font-black text-blue-900 dark:text-white uppercase tracking-tighter">Em qual card deseja aplicar?</h3>
             <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">Escolha a posição correta para a nova logo ou imagem.</p>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
             <button v-for="(spec, idx) in settings.specialties" :key="idx" 
                     @click="selectTargetCard(idx)"
                     class="p-6 bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-3xl border border-gray-100 dark:border-slate-700 hover:border-blue-400 transition-all flex flex-col items-center text-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                   <img v-if="spec.logo" :src="spec.logo" class="w-full h-full object-contain p-1" />
                   <Package v-else :size="20" class="text-blue-500" />
                </div>
                <span class="text-[9px] font-black uppercase text-blue-900 dark:text-white leading-tight">{{ spec.title }}</span>
             </button>
          </div>
          <button @click="isTargetSelectionModalOpen = false" class="w-full mt-8 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest">Voltar</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
</style>
