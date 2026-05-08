import { apiFetch } from '../utils/api'

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: 'CRIOU' | 'EDITOU' | 'EXCLUIU' | 'SISTEMA'
  module: string
  details: string
}

export class AuditService {
  static async getLogs(): Promise<AuditLog[]> {
    const response = await apiFetch('/audit');
    return response.data;
  }

  static async addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const response = await apiFetch('/audit', {
      method: 'POST',
      body: JSON.stringify(log)
    });
    return response.data;
  }
}
