/**
 * Serviço que abstrai as chamadas HTTP (neste caso, mock) para Autenticação.
 * Esta arquitetura SOLID permite isolar as requisições, então quando o backend
 * verdadeiro chegar, substituiremos apenas isto por 'return api.post(...)'
 */

import type { UserProfile } from '../stores/auth'
import { apiFetch } from '../utils/api'

export class AuthService {
  static async login(identifier: string, password: string): Promise<{ token: string; user: UserProfile }> {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: identifier, password })
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao realizar login')
    }
  }

  static async getMe(): Promise<{ user: UserProfile }> {
    try {
      const response = await apiFetch('/auth/me');
      return { user: response.data };
    } catch (err) {
      return { user: null as any };
    }
  }

  static async updateProfile(data: any): Promise<any> {
    const response = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data;
  }

  static async getUsers(): Promise<any[]> {
    const response = await apiFetch('/auth/users');
    return response.data;
  }
}
