import {
  BusinessConfig,
  ServiceItem,
  Professional,
  ClientItem,
  Reservation,
  DaySchedule,
  ActivityItem,
  ReservationStatus,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `Error HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  business: {
    get: (): Promise<BusinessConfig> => fetch(`${API_BASE}/business`).then(handleResponse),
    update: (data: BusinessConfig): Promise<BusinessConfig> =>
      fetch(`${API_BASE}/business`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  services: {
    getAll: (): Promise<ServiceItem[]> => fetch(`${API_BASE}/services`).then(handleResponse),
    create: (data: Omit<ServiceItem, 'id'>): Promise<ServiceItem> =>
      fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<ServiceItem>): Promise<ServiceItem> =>
      fetch(`${API_BASE}/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/services/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
  },

  professionals: {
    getAll: (): Promise<Professional[]> => fetch(`${API_BASE}/professionals`).then(handleResponse),
    create: (data: Omit<Professional, 'id'>): Promise<Professional> =>
      fetch(`${API_BASE}/professionals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<Professional>): Promise<Professional> =>
      fetch(`${API_BASE}/professionals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/professionals/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
  },

  clients: {
    getAll: (): Promise<ClientItem[]> => fetch(`${API_BASE}/clients`).then(handleResponse),
    create: (data: Omit<ClientItem, 'id'>): Promise<ClientItem> =>
      fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<ClientItem>): Promise<ClientItem> =>
      fetch(`${API_BASE}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/clients/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
  },

  reservations: {
    getAll: (params?: { date?: string; status?: string }): Promise<Reservation[]> => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetch(`${API_BASE}/reservations${query ? `?${query}` : ''}`).then(handleResponse);
    },
    create: (data: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> =>
      fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<Reservation>): Promise<Reservation> =>
      fetch(`${API_BASE}/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
    updateStatus: (id: string, status: ReservationStatus): Promise<Reservation> =>
      fetch(`${API_BASE}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/reservations/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
  },

  schedules: {
    getAll: (): Promise<DaySchedule[]> => fetch(`${API_BASE}/schedules`).then(handleResponse),
    update: (data: DaySchedule[]): Promise<DaySchedule[]> =>
      fetch(`${API_BASE}/schedules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  activities: {
    getAll: (): Promise<ActivityItem[]> => fetch(`${API_BASE}/activities`).then(handleResponse),
  },

  reports: {
    getStats: (): Promise<{
      todayCount: number;
      pendingCount: number;
      clientCount: number;
      monthlyRevenue: number;
      totalRevenue: number;
      statusCounts: Record<string, number>;
      topServices: { name: string; count: number }[];
      weeklyData: { week: string; reservas: number; canceladas: number; ingresos: number }[];
    }> => fetch(`${API_BASE}/reports/stats`).then(handleResponse),
    getExportUrl: () => `${API_BASE}/reports/export-csv`,
  },
};
