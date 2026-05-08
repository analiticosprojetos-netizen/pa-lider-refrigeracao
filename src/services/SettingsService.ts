import { apiFetch } from '../utils/api'

export interface SiteSettings {
  banners: any[];
  specialties: any[];
  carouselDelay: number;
  goalType: string;
  goalTarget: number;
  maxDiscountWarning?: number;
  maxDiscountDanger?: number;
  companyName?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  googleMapsUrl?: string;
  latitude?: string;
  longitude?: string;
  cnpj?: string;
  logo?: string;
  aboutYears?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  loginBackground?: string;
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
