<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
    <router-view />
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import BackToTop from './components/BackToTop.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
  // Inicializa configurações globais
  await settingsStore.loadSettings()
  
  // Verifica sessão se houver token
  if (authStore.token) {
    await authStore.checkSession()
  }
})
</script>

