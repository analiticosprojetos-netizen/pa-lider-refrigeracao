import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { AuditService, type AuditLog } from '../services/AuditService'

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([])
  const isLoading = ref(false)

  // Inicializa os dados do servidor
  const loadLogs = async () => {
    isLoading.value = true
    try {
      logs.value = await AuditService.getLogs()
    } catch (e) {
      console.error('Falha ao carregar logs de auditoria:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Registra um novo evento no sistema (agora envia para o backend)
  const addLog = async (
    module: string, 
    action: AuditLog['action'], 
    details: string,
    forcedUsername?: string
  ) => {
    const authStore = useAuthStore()
    const currentUser = forcedUsername || authStore.user?.username || 'Sistema'

    const newLogData: Omit<AuditLog, 'id' | 'timestamp'> = {
      user: currentUser,
      action,
      module,
      details
    }

    try {
      const savedLog = await AuditService.addLog(newLogData)
      logs.value.unshift(savedLog) // Insere no topo para UI
      
      // Limita o histórico local para performance da UI
      if (logs.value.length > 2000) {
        logs.value = logs.value.slice(0, 2000)
      }
    } catch (e) {
      console.error('Erro ao salvar log de auditoria no servidor:', e)
    }
  }

  return {
    logs,
    isLoading,
    loadLogs,
    addLog
  }
})

