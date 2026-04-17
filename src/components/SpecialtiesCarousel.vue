<script setup lang="ts">
import { ref, onMounted } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'
import { 
  Truck, 
  Award, 
  Snowflake, 
  Thermometer, 
  ShieldCheck, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-vue-next'

const props = defineProps<{
  items?: any[]
}>()

const [emblaRef, emblaApi] = emblaCarouselVue({ 
  loop: true, 
  align: 'start', 
  slidesToScroll: 1, 
  breakpoints: { 
    '(min-width: 768px)': { slidesToScroll: 2 }, 
    '(min-width: 1024px)': { slidesToScroll: 4 } 
  } 
}, [ 
  Autoplay({ delay: 12000, stopOnInteraction: false }) 
])

const defaultSpecialties = [
  { 
    title: 'Baús Frigoríficos', 
    desc: 'Reforma completa e isolamento térmico de alta performance para baús frigoríficos.', 
    icon: Truck, 
    type: 'Serviço' 
  },
  { 
    title: 'Carrier', 
    desc: 'Representante autorizado. Peças originais e suporte especializado Carrier Transicold.', 
    icon: Award, 
    type: 'Autorizada' 
  },
  { 
    title: 'Thermo Star', 
    desc: 'Soluções em refrigeração para transporte. Manutenção técnica autorizada de fábrica.', 
    icon: Snowflake, 
    type: 'Autorizada' 
  },
  { 
    title: 'Thermo King', 
    desc: 'Referência mundial em refrigeração. Técnicos treinados e certificados pela marca.', 
    icon: Thermometer, 
    type: 'Autorizada' 
  },
  { 
    title: 'Frigo King', 
    desc: 'Equipamentos robustos para logística de perecíveis. Atendimento técnica oficial.', 
    icon: ShieldCheck, 
    type: 'Autorizada' 
  },
  { 
    title: 'Logística de Frio', 
    desc: 'Gestão completa da cadeia de frio, garantindo a integridade térmica da sua carga.', 
    icon: CheckCircle2, 
    type: 'Serviço' 
  }
]

import { computed } from 'vue'
const displaySpecialties = computed(() => {
  if (props.items && props.items.length > 0) {
    return props.items.map(item => ({
      ...item,
      icon: item.iconName ? {
        Truck, Award, Snowflake, Thermometer, ShieldCheck, CheckCircle2, Package
      }[item.iconName] || Package : Package
    }))
  }
  return defaultSpecialties
})

const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()
</script>

<template>
  <div class="relative group max-w-7xl mx-auto">
    <div class="embla overflow-hidden px-2" ref="emblaRef">
      <div class="embla__container flex -ml-3 md:-ml-4">
        <div v-for="(spec, index) in displaySpecialties" :key="spec.title" 
             class="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-3 md:pl-4 py-4">
          <div class="h-full bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[40px] border border-blue-50 dark:border-slate-800 shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center">
            
            <!-- Icon/Brand Logo Container -->
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 mb-8 border border-blue-100/50 dark:border-blue-900/30 group-hover:scale-110 transition-transform shadow-inner overflow-hidden uppercase relative">
              <div class="absolute top-2 right-2 text-[10px] font-black opacity-20">#{{ index + 1 }}</div>
              <img v-if="spec.logo" :src="spec.logo" class="w-full h-full object-contain p-2" />
              <component v-else :is="spec.icon" :size="40" stroke-width="1.5" />
            </div>

            <!-- Type Badge -->
            <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
              {{ spec.type }}
            </span>

            <h3 class="text-xl md:text-2xl font-black text-blue-900 dark:text-white mb-4 uppercase tracking-tighter">
              {{ spec.title }}
            </h3>
            
            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold">
              {{ spec.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <button @click="scrollPrev" class="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-blue-50 dark:border-slate-800 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
      <ChevronLeft :size="24" />
    </button>
    <button @click="scrollNext" class="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-blue-50 dark:border-slate-800 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
      <ChevronRight :size="24" />
    </button>
  </div>
</template>

<style scoped>
.embla__slide {
  backface-visibility: hidden;
}
</style>
