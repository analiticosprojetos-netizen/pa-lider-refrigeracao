<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { MessageCircle, Instagram, Facebook } from 'lucide-vue-next'

const settings = ref({
  whatsapp: '5511999999999',
  instagram: 'https://instagram.com/liderrefrigeracao',
  facebook: 'https://facebook.com/liderrefrigeracao'
})

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) Object.assign(settings.value, JSON.parse(saved))
})

const whatsappUrl = computed(() => {
  const number = settings.value.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${number}`
})
</script>

<template>
  <div :class="[
    'fixed z-50 transition-all duration-500',
    'md:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto',
    'bottom-4 left-0 w-full md:w-auto md:left-auto px-4 md:p-0'
  ]">
    <div :class="[
      'flex gap-3 pointer-events-auto transition-all',
      'md:flex-col items-center justify-center',
      'flex-row justify-center'
    ]">
      <a 
        v-for="social in [
          { name: 'WhatsApp', icon: MessageCircle, url: whatsappUrl, color: 'bg-[#25D366]', shadow: 'shadow-[#25D366]/40' },
          { name: 'Instagram', icon: Instagram, url: settings.instagram, color: 'bg-[#E4405F]', shadow: 'shadow-[#E4405F]/40' },
          { name: 'Facebook', icon: Facebook, url: settings.facebook, color: 'bg-[#1877F2]', shadow: 'shadow-[#1877F2]/40' }
        ]" 
        :key="social.name"
        :href="social.url" 
        target="_blank" 
        rel="noopener noreferrer"
        :class="[
          'p-2.5 rounded-xl text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group flex justify-center',
          social.color, social.shadow
        ]"
        :title="social.name"
      >
        <component :is="social.icon" :size="18" class="group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  </div>
</template>
