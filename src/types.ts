export type ViewMode =
  | 'dashboard'
  | 'reservas'
  | 'calendario'
  | 'clientes'
  | 'servicios'
  | 'profesionales'
  | 'horarios'
  | 'reportes'
  | 'configuracion';

export type ReservationStatus = 'en_curso' | 'confirmada' | 'pendiente' | 'completada' | 'cancelada';

export interface Reservation {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string;
  durationMinutes: number;
  price: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  active: boolean;
  category: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  status: 'disponible' | 'ocupado' | 'ausente';
  monthlyBookings: number;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  specialties: string[];
}

export interface ClientItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lastVisit: string;
  notes?: string;
}

export interface TimeBlock {
  id: string;
  start: string;
  end: string;
  isBreak?: boolean;
  label?: string;
}

export interface DaySchedule {
  dayName: string; // 'LUNES', 'MARTES', etc.
  dayCode: number; // 1 = Monday, 7 = Sunday
  active: boolean;
  blocks: TimeBlock[];
}

export interface ActivityItem {
  id: string;
  title: string;
  clientName?: string;
  timeAgo: string;
  type: 'cancellation' | 'new_client' | 'payment' | 'schedule_update' | 'new_booking';
  amount?: number;
  timestamp: string;
}

export interface BusinessConfig {
  name: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  acceptNewBookings: boolean;
  showPricesPublicly: boolean;
  timeZone: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message: string;
}

