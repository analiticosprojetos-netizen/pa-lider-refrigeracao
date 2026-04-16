/**
 * Serviço que abstrai as chamadas HTTP (neste caso, mock) para Autenticação.
 * Esta arquitetura SOLID permite isolar as requisições, então quando o backend
 * verdadeiro chegar, substituiremos apenas isto por 'return api.post(...)'
 */

import type { UserProfile } from '../stores/auth'

export class AuthService {
  /**
   * Simula o endpoint POST /api/auth/login
   */
  static async login(identifier: string, password: string): Promise<{ token: string; user: UserProfile }> {
    return new Promise((resolve, reject) => {
      // Mocked Backend Delay
      setTimeout(() => {
        if ((identifier === 'admin' || identifier === 'admin@lider.com') && password === '1234') {
          resolve({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_token.v1',
            user: {
              id: '1',
              username: 'admin',
              email: 'admin@lider.com',
              role: 'ADMIN',
              permissions: {
                estoque: { view: true, edit: true, delete: true },
                orcamentos: { view: true, edit: true, delete: true },
                clientes: { view: true, edit: true, delete: true },
                historico: { view: true, edit: true, delete: true },
                financeiro: { view: true, edit: true, delete: true },
                config: { view: true, edit: true, delete: true },
              }
            }

          })
        } else {
          reject(new Error('Credenciais inválidas. Use admin / 1234.'))
        }
      }, 800)
    })
  }

  /**
   * Simula obtenção do perfil logado (Me)
   * GET /api/auth/me
   */
  static async getMe(): Promise<{ user: UserProfile }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem('lider_user')
        if (stored) return resolve({ user: JSON.parse(stored) })
        resolve({ user: null as any })
      }, 300)
    })
  }
}
