import { apiFetch } from '../utils/api'

export interface SiteSettings {
  banners: any[];
  specialties: any[];
  carouselDelay: number;
  goalType: string;
  goalTarget: number;
  maxDiscountWarning: number;
  maxDiscountDanger: number;
}

export class SettingsService {
  static async getSettings(): Promise<SiteSettings> {
    const response = await apiFetch('/settings');
    return response.data;
  }

  static async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const response = await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    return response.data;
  }
}
