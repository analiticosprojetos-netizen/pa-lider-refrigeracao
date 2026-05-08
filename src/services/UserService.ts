import { apiFetch } from '../utils/api'
import type { UserProfile } from '../stores/auth'

export class UserService {
  static async getAll(): Promise<UserProfile[]> {
    const response = await apiFetch('/auth/users');
    return response.data;
  }

  static async create(user: any): Promise<UserProfile> {
    const response = await apiFetch('/auth/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    return response.data;
  }

  static async update(id: string, updates: any): Promise<UserProfile> {
    const response = await apiFetch(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  static async delete(id: string): Promise<boolean> {
    const response = await apiFetch(`/auth/users/${id}`, {
      method: 'DELETE'
    });
    return response.success;
  }

  static async getRoles(): Promise<string[]> {
    const response = await apiFetch('/auth/roles');
    return response.data;
  }

  static async createRole(name: string): Promise<string> {
    const response = await apiFetch('/auth/roles', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    return response.data;
  }

  static async deleteRole(name: string): Promise<boolean> {
    const response = await apiFetch(`/auth/roles/${name}`, {
      method: 'DELETE'
    });
    return response.success;
  }
}

