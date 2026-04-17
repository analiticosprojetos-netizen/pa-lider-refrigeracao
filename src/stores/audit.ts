import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface AuditLog {
  id: string
  timestamp: string // ISO string para facilitar exibição/ordenação
  user: string
  action: 'CRIOU' | 'EDITOU' | 'EXCLUIU' | 'SISTEMA'
  module: string
  details: string
}

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([])

  // Inicializa os dados salvos no localStorage
  const loadLogs = () => {
    const saved = localStorage.getItem('lider_audit_logs')
    if (saved) {
      try {
        logs.value = JSON.parse(saved)
      } catch (e) {
        console.error('Falha ao parsear logs de auditoria:', e)
      }
    }
  }

  // Registra um novo evento no sistema
  const addLog = (
    module: string, 
    action: AuditLog['action'], 
    details: string,
    forcedUsername?: string
  ) => {
    const authStore = useAuthStore()
    const currentUser = forcedUsername || authStore.user?.username || 'Sistema'

    const newLog: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'log-' + Date.now() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      user: currentUser,
      action,
      module,
      details
    }

    logs.value.unshift(newLog) // Insere no topo

    // Limita o histórico a 2000 registros para evitar travamento da performance no localStorage
    if (logs.value.length > 2000) {
      logs.value = logs.value.slice(0, 2000)
    }

    localStorage.setItem('lider_audit_logs', JSON.stringify(logs.value))
  }

  return {
    logs,
    loadLogs,
    addLog
  }
})
