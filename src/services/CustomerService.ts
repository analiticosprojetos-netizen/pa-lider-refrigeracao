export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  plate?: string;
  vehicleModel?: string;
  equipBrand?: string;
  equipModel?: string;
  createdAt?: string;
}

export class CustomerService {
  /**
   * GET /api/customers
   */
  static async getCustomers(): Promise<Customer[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem('lider_customers');
        resolve(data ? JSON.parse(data) : []);
      }, 500);
    });
  }

  /**
   * POST /api/customers
   */
  static async addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer: Customer = {
          ...customer,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toLocaleDateString()
        };
        resolve(newCustomer);
      }, 400);
    });
  }

  /**
   * PUT /api/customers/:id
   */
  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...updates } as Customer);
      }, 400);
    });
  }
}

