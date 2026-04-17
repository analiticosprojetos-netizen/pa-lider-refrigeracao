<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Camera, Save, ZoomIn, ZoomOut, Check, Eye, X, Palette, Type, Edit2 } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import BannerCarousel from './BannerCarousel.vue'

const settings = ref({
  banners: [] as any[],
  carouselDelay: 6
})

const isCropperModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const currentImage = ref('')

// Preview State
const previewTab = ref('image') // 'image' | 'text'
const previewScale = ref(0.6)

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
  }
})

const triggerFileSelect = () => {
  editingIndex.value = -1 
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
          isCropperModalOpen.value = true
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
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
  const bannerData = {
    src: cropperResultSrc.value,
    overlay: cropperOverlayOpacity.value,
    objectFit: cropperObjectFit.value,
    imageScale: customImageScale.value,
    imagePosition: customImagePosition.value,
    // Tipografia
    title1: customTitle1.value,
    title2: customTitle2.value,
    buttonText: customButtonText.value,
    buttonAction: customButtonAction.value,
    buttonUrl: customButtonUrl.value,
    alignment: customAlignment.value,
    titleSize: customTitleSize.value,
    subtitleSize: customSubtitleSize.value
  }

  if (editingIndex.value >= 0) {
    settings.value.banners[editingIndex.value] = bannerData
  } else {
    settings.value.banners.push(bannerData)
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
  
  isPreviewModalOpen.value = true
}

const removeBanner = (index: number) => {
  settings.value.banners.splice(index, 1)
}

const save = () => {
  const saved = localStorage.getItem('lider_site_settings')
  const current = saved ? JSON.parse(saved) : {}
  localStorage.setItem('lider_site_settings', JSON.stringify({
    ...current,
    banners: settings.value.banners,
    carouselDelay: settings.value.carouselDelay
  }))
  alert('Configurações de banners salvas com sucesso!')
}

const zoomIn = () => cropperRef.value?.zoom(1.2)
const zoomOut = () => cropperRef.value?.zoom(0.8)
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-10 border border-blue-50 dark:border-slate-800 shadow-xl max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
          <Camera :size="24" />
        </div>
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Gerenciamento de Banners</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Carrossel da Página Inicial</p>
        </div>
      </div>
      <button @click="save" class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
         <Save :size="16" /> Salvar Alterações
      </button>
    </div>

    <div class="space-y-8">
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

    <!-- Modal de Crop (Ajuste da Imagem) -->
    <div v-if="isCropperModalOpen" class="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Onde Focar no Banner?</h3>
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

    <!-- Modal de Preview Real (ESTÚDIO) -->
    <div v-if="isPreviewModalOpen" class="fixed inset-0 z-[200] bg-slate-950 backdrop-blur-md flex items-center justify-center p-0 animate-in fade-in duration-300">
       <div class="w-full h-full overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
          
          <div class="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-white/10 shrink-0 shadow-lg">
             <div class="flex items-center gap-3 text-white">
                <Eye :size="20" class="text-blue-400" />
                <h3 class="font-black tracking-widest text-sm uppercase">Estúdio de Criação de Banners</h3>
             </div>
             <button @click="cancelPreview" class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X :size="20" /></button>
          </div>

          <!-- Área de Trabalho: Painel + Preview -->
          <div class="flex flex-col lg:flex-row flex-1 overflow-hidden">
             
             <!-- CANVA: Preview Escalonável -->
             <div class="flex-1 overflow-auto bg-slate-950 custom-scrollbar p-6 flex flex-col items-center justify-start lg:justify-center relative">
                 <div class="w-[1920px] origin-top transition-transform" :style="{ transform: `scale(${previewScale})` }">
                   <!-- BannerCarrosel Injetado com Params Dinamicos Reativos -->
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
                     imagePosition: customImagePosition
                   }]" :delay="10" />
                 </div>
             </div>

             <!-- BARRA LATERAL (SIDEBAR DE PROPRIEDADES) -->
             <div class="w-full lg:w-[420px] shrink-0 bg-slate-900/95 border-l border-white/10 flex flex-col h-full shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-10 relative">
                 <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                     
                     <!-- Abas -->
                     <div class="flex bg-slate-800 p-1.5 rounded-2xl w-full">
                         <button @click="previewTab = 'image'" :class="previewTab === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider">
                             <Palette :size="14" /> Imagem Base
                         </button>
                         <button @click="previewTab = 'text'" :class="previewTab === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider">
                             <Type :size="14" /> Textos e Links
                         </button>
                     </div>

                     <!-- ABA 1: Ajuste de Imagem -->
                     <div v-if="previewTab === 'image'" class="space-y-8 animate-in fade-in duration-300">
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
                                 <button @click="cropperObjectFit = 'none'" :class="cropperObjectFit === 'none' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="text-[10px] font-black tracking-widest uppercase py-4 rounded-lg transition-all w-full">Tamanho Real (Logo)</button>
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
                             <div class="flex justify-between text-[9px] text-slate-500 font-bold uppercase pt-1">
                                <span>Claro</span>
                                <span>Mergulho Escuro</span>
                             </div>
                         </div>
                     </div>

                     <!-- ABA 2: Tipografia Dinâmica -->
                     <div v-if="previewTab === 'text'" class="space-y-6 animate-in fade-in duration-300">
                         <!-- Textos -->
                         <div class="space-y-4">
                             <div>
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Título Grande (Deixe vazio p/ sumir)</label>
                                <input v-model="customTitle1" type="text" placeholder="Ex: Sua Carga" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                             </div>
                             <div>
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Subtítulo Azul (Deixe vazio p/ sumir)</label>
                                <input v-model="customTitle2" type="text" placeholder="Ex: Sempre na Temperatura Certa" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                             </div>
                             <div class="pt-2">
                                 <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-2">Posicionamento na Tela</label>
                                 <div class="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 gap-1.5">
                                     <button @click="customAlignment = 'left'" :class="customAlignment === 'left' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">Esquerda</button>
                                     <button @click="customAlignment = 'center'" :class="customAlignment === 'center' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">Centro</button>
                                     <button @click="customAlignment = 'right'" :class="customAlignment === 'right' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'" class="flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">Direita</button>
                                 </div>
                             </div>
                         </div>

                         <!-- Botão e Links -->
                         <div class="space-y-4 pt-4 border-t border-white/5">
                             <div>
                                <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Texto do Botão (Deixe vazio p/ sumir)</label>
                                <input v-model="customButtonText" type="text" placeholder="Falar com Especialista" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" />
                             </div>
                             <div class="pt-2">
                                 <label class="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-2">Ação do Botão</label>
                                 <select v-model="customButtonAction" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-4 text-[11px] font-black uppercase tracking-widest focus:border-blue-500 outline-none cursor-pointer appearance-none">
                                     <option value="contact">Deslizar para Orçamento</option>
                                     <option value="url">Abrir Link / WhatsApp Externo</option>
                                 </select>
                             </div>
                             <div v-show="customButtonAction === 'url'" class="animate-in slide-in-from-top-2 pt-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-green-400 block mb-1">URL (https://...)</label>
                                <input v-model="customButtonUrl" type="text" placeholder="https://wa.me/55..." class="w-full bg-slate-800 text-green-300 border border-green-500/50 rounded-xl px-4 py-3 text-sm font-bold focus:border-green-500 outline-none" />
                             </div>
                         </div>

                         <!-- Tamanhos de Fonte -->
                         <div class="space-y-6 pt-4 border-t border-white/5">
                             <div class="space-y-3">
                                 <div class="flex justify-between items-center">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-blue-300">Tamanho do Título</label>
                                    <span class="text-xs font-bold text-white">{{ customTitleSize }}%</span>
                                 </div>
                                 <input type="range" v-model.number="customTitleSize" min="50" max="200" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                             </div>
                             <div class="space-y-3">
                                 <div class="flex justify-between items-center">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-blue-300">Tamanho do Subtítulo</label>
                                    <span class="text-xs font-bold text-white">{{ customSubtitleSize }}%</span>
                                 </div>
                                 <input type="range" v-model.number="customSubtitleSize" min="50" max="150" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
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
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
</style>
