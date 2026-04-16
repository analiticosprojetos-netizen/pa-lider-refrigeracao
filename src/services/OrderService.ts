export const EQUIPMENT_DATABASE: Record<string, string[]> = {
  "Thermo King": [
    "SLXi 100", "SLXi 200", "SLXi 300", "SLXi 400", "SLXi Spectrum", 
    "SLX 100", "SLX 200", "SLX 300", "SL 200", "SL 400", 
    "T-600R", "T-800R", "T-1000R", "T-1200R",
    "MD 200", "MD 300", "MD 400", 
    "RD-II 30", "RD-II 50", "RD-II 100", "RD-II 110",
    "V-200", "V-300", "V-500", "B-100", "B-200",
    "SB 190", "SB 210", "SB 230", "SB 250", "SB 310", "SB Spectrum",
    "Advancer Spectrum", "Advancer A-400", "Advancer A-500", "Advancer A-600", "Advancer A-Vector"
  ],
  "Carrier": [
    "Xarios 150", "Xarios 200", "Xarios 300", "Xarios 350", "Xarios 400",
    "Supra 450", "Supra 550", "Supra 650", "Supra 750", "Supra 850", "Supra 950",
    "Vector 1350", "Vector 1550", "Vector 1800", "Vector 1950", "Vector HE 17", "Vector HE 19",
    "Neos 100", "Neos 200", "Neos 300",
    "Vector 1950 MT", "Supra 850 MT"
  ],
  "Thermo Star": [
    "TS 200", "TS 300", "TS 400", "TS 500",
    "TS 700", "TS 900",
    "TS Light 150", "TS Light 250"
  ],
  "Frigo King": [
    "FK 200", "FK 300", "FK 400", "FK 500",
    "FK Light 100", "FK Light 200",
    "FK Slim", "FK Plus", "FK Max"
  ],
  "Rodofrio": ["RF-10", "RF-20", "RF-30", "RF-40", "RF-50"],
  "Macc": ["M-10", "M-20", "M-30"],
  "Eurofrigo": ["EF-200", "EF-300", "EF-400"]
};

export const SERVICE_TYPES = [
  "Preventiva",
  "Corretiva",
  "Reforma de Baú",
  "Troca de Óleo/Filtros",
  "Carga de Gás",
  "Reparo Elétrico",
  "Instalação de Equipamento",
  "Higienização",
  "Socorro Mecânico",
  "Vistoria Técnica"
];

export interface OrderPart {
  id: string; // Adicionado ID para paridade com Item[] do original
  inventoryPartId?: string;
  description: string;
  qty: number;
  value: number; // Alterado de price para value
}

export interface OrderServiceItem { // Renomeado de OrderLabor para item
  id: string;
  description: string;
  value: number; // Alterado de price para value
  qty: number;
}

export interface ServiceOrder {
  id: string;
  date: string; // Adicionado field date formatado como string
  clientName: string;
  document: string;
  phone: string;
  email: string;
  plate: string;
  vehicleModel: string;
  equipBrand: string;
  equipModel: string;
  serviceType: string;
  problem: string;
  diagnosis: string;
  startTime: string;
  endTime: string;
  travelValue: number;
  discountPercent: number;
  discountValue: number;
  warranty: string;
  technician: string;
  observations: string;
  status: 'Pendente' | 'Executado' | 'Cancelado';
  services: OrderServiceItem[];
  parts: OrderPart[];
  partsValue: number;
  servicesValue: number;
  subtotal: number;
  total: number;
  createdAt: string;
  executedAt?: string | null;
  cancelledAt?: string | null;
  origin?: 'site' | 'manual';
  report?: string;
}

export class OrderService {
  static async getOrders(): Promise<ServiceOrder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('lider_orders');
        resolve(data ? JSON.parse(data) : []);
      }, 700);
    });
  }

  static async createOrder(order: Omit<ServiceOrder, 'id' | 'createdAt' | 'status' | 'date'>): Promise<ServiceOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        // Simulação de busca do próximo sequencial
        const savedOrders = JSON.parse(localStorage.getItem('lider_orders') || '[]');
        const todayOrders = savedOrders.filter((o: any) => o.id.toString().startsWith(datePrefix));
        
        let nextNum = 1;
        if (todayOrders.length > 0) {
          const nums = todayOrders.map((o: any) => {
            const parts = o.id.split(' - ');
            return parts.length > 1 ? parseInt(parts[1]) : 0;
          }).filter((n: any) => !isNaN(n));
          nextNum = Math.max(0, ...nums) + 1;
        }

        const newOrder: ServiceOrder = {
          ...order,
          id: `${datePrefix} - ${nextNum}`,
          date: now.toLocaleString(),
          status: 'Pendente',
          createdAt: now.toISOString()
        };
        resolve(newOrder);
      }, 500);
    });
  }

  static async updateOrder(order: ServiceOrder): Promise<ServiceOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(order);
      }, 500);
    });
  }

  static async updateOrderStatus(id: string, status: 'Executado' | 'Cancelado' | 'Pendente'): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 400);
    });
  }
}

