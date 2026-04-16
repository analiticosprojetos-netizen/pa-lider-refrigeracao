<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Camera, Save } from 'lucide-vue-next'

const settings = ref({
  banners: [] as string[],
  carouselDelay: 6
})

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) {
    const parsed = JSON.parse(saved)
    settings.value.banners = parsed.banners || []
    settings.value.carouselDelay = parsed.carouselDelay || 6
  }
})

const addBanner = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('A imagem é muito grande. Escolha uma imagem de até 3MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          settings.value.banners.push(ev.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
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
  alert('Configurações de banners salvas!')
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-[32px] p-10 border border-blue-50 dark:border-slate-800 shadow-xl max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
    <div class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
          <Camera :size="24" />
        </div>
        <div>
          <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Gerenciamento de Banners</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Carrossel da Página Inicial</p>
        </div>
      </div>
      <button @click="save" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
         <Save :size="16" /> Salvar Alterações
      </button>
    </div>

    <div class="space-y-8">
      <div class="space-y-2">
         <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tempo de Transição (Segundos)</label>
         <input v-model.number="settings.carouselDelay" type="number" class="w-32 px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-blue-500 outline-none text-sm font-bold dark:text-white" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div v-for="(banner, idx) in settings.banners" :key="idx" class="relative group rounded-2xl overflow-hidden border dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-800">
            <img :src="banner" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button @click="removeBanner(idx)" class="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                  <Trash2 :size="18" />
               </button>
            </div>
         </div>
         
         <button @click="addBanner" class="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all aspect-video">
            <Plus :size="32" />
            <span class="text-[10px] font-black uppercase tracking-widest">Adicionar Banner</span>
         </button>
      </div>
    </div>
  </div>
</template>
