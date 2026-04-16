import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthService } from '../services/AuthService'

export interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  estoque: Permission;
  orcamentos: Permission;
  clientes: Permission;
  historico: Permission;
  financeiro: Permission;
  config: Permission;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  permissions: RolePermissions;
}


export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('lider_jwt_token'))
  const user = ref<UserProfile | null>(
    localStorage.getItem('lider_user') 
      ? JSON.parse(localStorage.getItem('lider_user') as string) 
      : null
  )

  const login = async (identifier: string, password: string) => {
    try {
      const response = await AuthService.login(identifier, password)
      token.value = response.token
      user.value = response.user

      // Salva para persistir a sessão local
      localStorage.setItem('lider_jwt_token', response.token)
      localStorage.setItem('lider_user', JSON.stringify(response.user))

      return true
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao realizar login')
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('lider_jwt_token')
    localStorage.removeItem('lider_user')
  }

  const hasPermission = (tab: keyof RolePermissions, action: keyof Permission) => {
    if (!user.value) return false;
    if (user.value.role === 'ADMIN') return true;
    return user.value.permissions[tab]?.[action] || false;
  };

  return {
    token,
    user,
    login,
    logout,
    hasPermission
  }
})
