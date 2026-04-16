<script setup lang="ts">
import { ref, onMounted } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'
import { Snowflake, MapPin, ChevronRight, ChevronLeft } from 'lucide-vue-next'

const props = defineProps<{
  banners?: string[];
  delay?: number;
}>()

const emit = defineEmits(['contact-click'])

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true }, [
  Autoplay({ delay: (props.delay || 6) * 1000, stopOnInteraction: false })
])

const settings = ref({
  address: 'Av. Industrial, 1000 - Setor de Transportes',
  latitude: '',
  longitude: ''
})

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) {
    const parsed = JSON.parse(saved)
    settings.value.address = parsed.address || settings.value.address
    settings.value.latitude = parsed.latitude || ''
    settings.value.longitude = parsed.longitude || ''
  }
})

const mapsUrl = () => {
  return (settings.value.latitude && settings.value.longitude)
    ? `https://www.google.com/maps/search/?api=1&query=${settings.value.latitude},${settings.value.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.value.address)}`
}

const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()
</script>

<template>
  <section class="relative overflow-hidden border-b-[12px] border-blue-800 bg-slate-900 group">
    <div class="embla h-[600px] md:h-[650px] overflow-hidden" ref="emblaRef">
      <div class="embla__container h-full flex">
        
        <!-- BANNER 1: OFICIAL (Design Lider) -->
        <div class="embla__slide relative h-full flex-[0_0_100%] min-w-0 bg-[#0f172a] overflow-hidden">
          <!-- Background Decor -->
          <div class="absolute inset-0 opacity-10 pointer-events-none">
            <Snowflake class="absolute top-20 left-20 text-white w-12 h-12 animate-pulse" />
            <Snowflake class="absolute bottom-20 right-20 text-white w-16 h-16 animate-pulse" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.4),transparent)]" />
          </div>

          <div class="relative z-10 h-full flex items-center">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
                <!-- Text Area -->
                <div class="text-center lg:text-left flex-1 animate-in slide-in-from-left duration-1000">
                  <div class="relative inline-block mb-4">
                    <span class="text-blue-500 font-bold uppercase tracking-[0.5em] text-xs">A Melhor do Setor</span>
                    <div class="absolute -right-8 top-1/2 w-6 h-0.5 bg-blue-500" />
                  </div>
                  <h1 class="text-7xl md:text-9xl font-black text-white italic leading-[0.85] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    LÍDER
                  </h1>
                  <h2 class="text-4xl md:text-6xl font-black text-blue-500 italic leading-none tracking-tighter mt-2">
                    REFRIGERAÇÃO
                  </h2>
                  <div class="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                    <div class="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2">
                      <div class="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                      <span class="text-white text-[10px] font-black uppercase tracking-widest">Atendimento 24h Disponível</span>
                    </div>
                  </div>
                </div>

                <!-- CTA Area -->
                <div class="flex-1 flex flex-col items-center lg:items-end gap-8 animate-in slide-in-from-right duration-1000">
                  <div class="bg-blue-600/20 backdrop-blur-xl p-8 rounded-[40px] border-l-8 border-blue-500 max-w-md shadow-2xl">
                    <h3 class="text-xl md:text-2xl font-black text-white uppercase mb-3 leading-tight tracking-tight">
                      REFORMAS E MANUTENÇÃO EM BAÚS FRIGORÍFICOS
                    </h3>
                    <p class="text-blue-100/70 text-sm font-medium leading-relaxed">
                      Especialistas em sistemas Thermo King e Carrier. Peças originais e técnicos certificados.
                    </p>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button 
                      @click="$emit('contact-click')"
                      class="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 text-base rounded-2xl shadow-3xl shadow-blue-600/30 transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      Solicitar Orçamento
                    </button>
                    
                    <a 
                      :href="mapsUrl()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center gap-3 bg-white text-blue-900 hover:bg-blue-50 font-black px-8 py-4 text-base rounded-2xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest group"
                    >
                      <MapPin :size="20" class="text-blue-600 group-hover:bounce" />
                      Como Chegar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BANNERS CUSTOMIZADOS -->
        <div v-for="(banner, idx) in banners" :key="idx" class="embla__slide relative h-full flex-[0_0_100%] min-w-0">
          <div class="absolute inset-0 overflow-hidden">
            <img 
              :src="banner" 
              alt="Banner Lider" 
              class="w-full h-full object-cover transition-transform duration-1000"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          </div>
          
          <div class="relative z-10 h-full flex items-center">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <!-- Reutiliza o mesmo conteúdo impactante sobre as imagens customizadas -->
              <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
                 <div class="text-center lg:text-left flex-1">
                  <h1 class="text-7xl md:text-9xl font-black text-white italic leading-[0.85] tracking-tighter drop-shadow-2xl">
                    Sua Carga
                  </h1>
                  <h2 class="text-4xl md:text-6xl font-black text-blue-500 italic leading-none tracking-tighter mt-2">
                    Sempre na Temperatura Certa
                  </h2>
                </div>
                <div class="flex-1 flex flex-col items-center lg:items-end gap-8">
                  <button 
                    @click="$emit('contact-click')"
                    class="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 text-base rounded-2xl shadow-3xl shadow-blue-600/30 transform hover:scale-105 transition-all uppercase tracking-widest"
                  >
                    Falar com Especialista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <button @click="scrollPrev" class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 z-20"><ChevronLeft :size="24" /></button>
    <button @click="scrollNext" class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 z-20"><ChevronRight :size="24" /></button>
  </section>
</template>

<style scoped>
.embla__slide {
  flex: 0 0 100%;
}
</style>
