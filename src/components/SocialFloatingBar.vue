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
  <div class="fixed right-4 bottom-1/2 translate-y-1/2 z-50 flex flex-col gap-4 pointer-events-none">
    <div class="flex flex-col gap-3 pointer-events-auto">
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
          'p-2.5 rounded-xl text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group',
          social.color, social.shadow
        ]"
        :title="social.name"
      >
        <component :is="social.icon" :size="20" class="group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  </div>
</template>
