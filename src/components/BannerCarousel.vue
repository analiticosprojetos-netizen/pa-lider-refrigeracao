<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'
import { Snowflake, MapPin, ChevronRight, ChevronLeft } from 'lucide-vue-next'

const props = defineProps<{
  banners?: any[];
  delay?: number;
}>()

const emit = defineEmits(['contact-click'])

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true, watchDrag: true }, [
  Autoplay({ delay: (props.delay || 6) * 1000, stopOnInteraction: false })
])

// Observa mudanças dinâmicas na array de Banners vinda do Dashboard
watch(() => props.banners, async () => {
  await nextTick()
  if (emblaApi.value) {
    emblaApi.value.reInit()
  }
}, { deep: true })

// Observa mudança dinâmica na velocidade
watch(() => props.delay, (newDelay) => {
  if (emblaApi.value) {
    const plugins = emblaApi.value.plugins()
    if (plugins.autoplay) {
      // Atualizar o delay dinamicamente não é suportado oficialmente no fly do embla3+, mas podemos reinjetar via destroy:
      plugins.autoplay.options.delay = (newDelay || 6) * 1000;
      emblaApi.value.reInit()
    }
  }
})

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
          <div class="absolute inset-0 opacity-20 pointer-events-none">
            <Snowflake class="absolute top-10 left-10 text-white w-8 h-8 md:w-12 md:h-12 animate-pulse" />
            <Snowflake class="absolute bottom-10 right-10 text-white w-10 h-10 md:w-16 md:h-16 animate-pulse" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.4),transparent)]" />
          </div>

          <div class="relative z-10 h-full flex items-center">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
                <!-- Text Area (Mobile: Somente o selo 24h simples) -->
                <div class="text-center lg:text-left flex-1 animate-in slide-in-from-left duration-1000 flex flex-col items-center lg:items-start">
                  <div class="flex flex-col">
                    <div class="relative inline-block mb-2 md:mb-4">
                      <span class="text-blue-500 font-bold uppercase tracking-[0.5em] text-[8px] md:text-xs">A Melhor do Setor</span>
                      <div class="absolute -right-6 md:-right-8 top-1/2 w-4 md:w-6 h-0.5 bg-blue-500" />
                    </div>
                    <h1 class="text-5xl sm:text-7xl md:text-9xl font-black text-white italic leading-[0.85] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      LÍDER
                    </h1>
                    <h2 class="text-2xl sm:text-4xl md:text-6xl font-black text-blue-500 italic leading-none tracking-tighter mt-1 md:mt-2">
                      REFRIGERAÇÃO
                    </h2>
                  </div>
                  
                  <div class="mt-4 md:mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                    <div class="bg-blue-600/20 md:bg-white/10 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/10 flex items-center gap-2">
                      <div class="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400 animate-ping" />
                      <span class="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">Atendimento 24h Disponível</span>
                    </div>
                  </div>
                </div>

                <!-- CTA Area -->
                <div class="flex-1 flex flex-col items-center lg:items-end gap-6 sm:gap-8 animate-in slide-in-from-right duration-1000 w-full max-w-lg mx-auto lg:mx-0">
                  <div class="bg-blue-600/10 backdrop-blur-xl p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] border-l-4 sm:border-l-8 border-blue-500 w-full shadow-2xl">
                    <h3 class="text-sm md:text-2xl font-black text-white uppercase mb-1.5 sm:mb-3 leading-tight tracking-tight">
                      REFORMAS E MANUTENÇÃO EM BAÚS FRIGORÍFICOS
                    </h3>
                    <p class="text-blue-100/60 text-[9px] sm:text-sm font-medium leading-relaxed">
                      Especialistas em sistemas Thermo King e Carrier. Peças originais e técnicos certificados.
                    </p>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                    <button 
                      @click="$emit('contact-click')"
                      class="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-base rounded-2xl shadow-3xl shadow-blue-600/30 transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      Solicitar Orçamento
                    </button>
                    
                    <a 
                      :href="mapsUrl()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center gap-3 bg-white text-blue-900 hover:bg-blue-50 font-black px-6 sm:px-8 py-2.5 sm:py-4 text-[10px] sm:text-base rounded-2xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest group"
                    >
                      <MapPin :size="16" class="text-blue-600 md:w-5 md:h-5" />
                      Como Chegar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BANNERS CUSTOMIZADOS -->
        <div v-for="(banner, idx) in banners" :key="idx" 
             class="embla__slide relative h-full flex-[0_0_100%] min-w-0 bg-[#0f172a] flex flex-col md:block">
          <!-- Fundo Decorativo Lider Premium (Preenche os black bars) -->
          <div class="absolute inset-0 opacity-20 pointer-events-none">
            <Snowflake class="absolute top-20 left-20 text-white w-12 h-12 animate-pulse transition-opacity" />
            <Snowflake class="absolute bottom-20 right-20 text-blue-300 w-16 h-16 animate-pulse transition-opacity" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.5),transparent)]" />
          </div>

          <div class="overflow-hidden flex transition-all duration-500"
               :class="{
                 'relative h-[45%] md:absolute md:inset-0 w-full': banner.objectFit !== 'cover',
                 'absolute inset-0 w-full h-full': banner.objectFit === 'cover',
                 'p-4 md:p-16 lg:p-24': banner.objectFit !== 'cover',
                 'items-start justify-start': banner.imagePosition === 'top-left',
                 'items-start justify-center': banner.imagePosition === 'top-center',
                 'items-start justify-end': banner.imagePosition === 'top-right',
                 'items-center justify-start': banner.imagePosition === 'center-left',
                 'items-center justify-center': !banner.imagePosition || banner.imagePosition === 'center',
                 'items-center justify-end': banner.imagePosition === 'center-right',
                 'items-end justify-start': banner.imagePosition === 'bottom-left',
                 'items-end justify-center': banner.imagePosition === 'bottom-center',
                 'items-end justify-end': banner.imagePosition === 'bottom-right',
               }">
            <img 
              :src="typeof banner === 'string' ? banner : banner.src" 
              alt="Banner Lider" 
              class="transition-all duration-1000 relative z-10"
              :class="{
                'w-full h-full object-cover': !banner.objectFit || banner.objectFit === 'cover',
                'w-full h-full object-contain': banner.objectFit === 'contain',
                'object-none': banner.objectFit === 'none'
              }"
              :style="{ 
                opacity: typeof banner === 'string' ? 0.5 : (1 - (banner.overlay / 100)),
                transform: banner.imageScale ? `scale(${banner.imageScale/100})` : ''
              }"
            />
          </div>
          
          <div class="relative z-10 flex items-center transition-all duration-500 shadow-2xl md:shadow-none"
               :class="{
                 'h-[55%] md:h-full w-full bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent md:bg-none': banner.objectFit !== 'cover',
                 'h-full w-full absolute inset-0': banner.objectFit === 'cover'
               }">
            <div class="w-full h-full flex flex-col justify-center px-6 sm:px-16 lg:px-24"
                 :class="{ 
                    'items-start text-left': !banner.alignment || banner.alignment === 'left',
                    'items-center text-center max-w-7xl mx-auto': banner.alignment === 'center',
                    'items-end text-right': banner.alignment === 'right'
                 }">
              <div 
                v-if="banner.title1 !== '' || banner.title2 !== '' || banner.buttonText !== ''"
                class="flex flex-col gap-8 w-full"
                :class="{
                  'items-start': !banner.alignment || banner.alignment === 'left',
                  'items-center': banner.alignment === 'center',
                  'items-end': banner.alignment === 'right'
                }">
                  <!-- Logotipo Flutuante (Opcional) -->
                  <div v-if="banner.overlayLogo" 
                       class="w-32 md:w-48 lg:w-56 h-auto animate-in fade-in slide-in-from-top duration-700">
                    <img :src="banner.overlayLogo" class="w-full h-auto object-contain drop-shadow-2xl" />
                  </div>

                  <div class="flex flex-col" :class="{
                        'items-start': !banner.alignment || banner.alignment === 'left',
                        'items-center': banner.alignment === 'center',
                        'items-end': banner.alignment === 'right'
                  }">
                    <h1 v-if="banner.title1 !== ''" 
                        class="text-white font-black italic leading-[0.85] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        :style="{ fontSize: banner.titleSize ? `calc(${(banner.titleSize/100)} * clamp(1.4rem, 5vw, 8rem))` : '' }">
                      {{ banner.title1 ?? 'Sua Carga' }}
                    </h1>
                    <h2 v-if="banner.title2 !== ''" 
                        class="font-black text-blue-500 italic leading-none tracking-tighter mt-2 md:mt-4 drop-shadow-md"
                        :style="{ fontSize: banner.subtitleSize ? `calc(${(banner.subtitleSize/100)} * clamp(0.8rem, 3vw, 4rem))` : '' }">
                      {{ banner.title2 ?? 'Sempre na Temperatura Certa' }}
                    </h2>
                  </div>
                  <div v-if="banner.buttonText !== ''" class="mt-6 md:mt-12">
                    <a v-if="banner.buttonAction === 'url'" :href="banner.buttonUrl" target="_blank"
                       class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-black px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-base rounded-2xl shadow-3xl shadow-blue-600/30 transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                       {{ banner.buttonText ?? 'Falar com Especialista' }}
                    </a>
                    <button v-else @click="$emit('contact-click')"
                       class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-black px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-base rounded-2xl shadow-3xl shadow-blue-600/30 transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                       {{ banner.buttonText ?? 'Falar com Especialista' }}
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
