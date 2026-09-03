import {
  BusinessConfig,
  ServiceItem,
  Professional,
  ClientItem,
  Reservation,
  DaySchedule,
  ActivityItem,
  ReservationStatus,
  AuthUser,
  LoginResponse,
} from '../types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('turnia_auth_token') || sessionStorage.getItem('turnia_auth_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `Error HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  auth: {
    register: (data: {
      name: string;
      businessName?: string;
      category?: string;
      email: string;
      phone?: string;
      password: string;
    }): Promise<LoginResponse> =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse),

    login: (credentials: { email: string; password: string; rememberMe?: boolean }): Promise<LoginResponse> =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    forgotPassword: (email: string): Promise<{ success: boolean; message: string; code?: string }> =>
      fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(handleResponse),

    resetPassword: (payload: { email: string; code: string; newPassword: string }): Promise<{ success: boolean; message: string }> =>
      fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(handleResponse),

    getMe: (): Promise<{ user: AuthUser }> =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    logout: () => {
      localStorage.removeItem('turnia_auth_token');
      localStorage.removeItem('turnia_auth_user');
      sessionStorage.removeItem('turnia_auth_token');
      sessionStorage.removeItem('turnia_auth_user');
    },
  },

  business: {
    get: (): Promise<BusinessConfig> =>
      fetch(`${API_BASE}/business`, { headers: getAuthHeaders() }).then(handleResponse),
    update: (data: BusinessConfig): Promise<BusinessConfig> =>
      fetch(`${API_BASE}/business`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  services: {
    getAll: (): Promise<ServiceItem[]> =>
      fetch(`${API_BASE}/services`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data: Omit<ServiceItem, 'id'>): Promise<ServiceItem> =>
      fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<ServiceItem>): Promise<ServiceItem> =>
      fetch(`${API_BASE}/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  professionals: {
    getAll: (): Promise<Professional[]> =>
      fetch(`${API_BASE}/professionals`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data: Omit<Professional, 'id'>): Promise<Professional> =>
      fetch(`${API_BASE}/professionals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<Professional>): Promise<Professional> =>
      fetch(`${API_BASE}/professionals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/professionals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  clients: {
    getAll: (): Promise<ClientItem[]> =>
      fetch(`${API_BASE}/clients`, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data: Omit<ClientItem, 'id'>): Promise<ClientItem> =>
      fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<ClientItem>): Promise<ClientItem> =>
      fetch(`${API_BASE}/clients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  reservations: {
    getAll: (params?: { date?: string; status?: string }): Promise<Reservation[]> => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return fetch(`${API_BASE}/reservations${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse);
    },
    create: (data: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> =>
      fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id: string, data: Partial<Reservation>): Promise<Reservation> =>
      fetch(`${API_BASE}/reservations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    updateStatus: (id: string, status: ReservationStatus): Promise<Reservation> =>
      fetch(`${API_BASE}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }).then(handleResponse),
    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      fetch(`${API_BASE}/reservations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  schedules: {
    getAll: (): Promise<DaySchedule[]> =>
      fetch(`${API_BASE}/schedules`, { headers: getAuthHeaders() }).then(handleResponse),
    update: (schedules: DaySchedule[]): Promise<DaySchedule[]> =>
      fetch(`${API_BASE}/schedules`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(schedules),
      }).then(handleResponse),
  },

  activities: {
    getAll: (): Promise<ActivityItem[]> =>
      fetch(`${API_BASE}/activities`, { headers: getAuthHeaders() }).then(handleResponse),
  },
};
