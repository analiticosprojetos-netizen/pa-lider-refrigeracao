import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SettingsService } from '../services/SettingsService'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    companyName: 'LIDER REFRIGERAÇÃO',
    whatsapp: '(11) 99999-9999',
    email: 'contato@liderefrigeracao.com.br',
    instagram: '',
    facebook: '',
    address: '',
    googleMapsUrl: '',
    latitude: '',
    longitude: '',
    cnpj: '',
    logo: '',
    aboutYears: '',
    aboutTitle: '',
    aboutDescription: '',
    aboutImage: '',
    loginBackground: ''
  })
  
  const isLoading = ref(false)

  const loadSettings = async () => {
    isLoading.value = true
    try {
      const data = await SettingsService.getSettings()
      if (data) {
        // Merge only non-null values
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== null)
        )
        Object.assign(settings.value, cleanData)
      }
    } catch (e) {
      console.error('Erro ao carregar configurações:', e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    loadSettings
  }
})
