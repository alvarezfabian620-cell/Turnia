import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'turnia_db.json');

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
  dayName: string;
  dayCode: number;
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

export interface DatabaseSchema {
  businessConfig: BusinessConfig;
  services: ServiceItem[];
  professionals: Professional[];
  clients: ClientItem[];
  reservations: Reservation[];
  schedules: DaySchedule[];
  activities: ActivityItem[];
}

const DEFAULT_DB_DATA: DatabaseSchema = {
  businessConfig: {
    name: 'Turnia Negocio & Reservas',
    category: 'Estética & Bienestar',
    description: 'Gestión inteligente de reservas y turnos.',
    phone: '+57 300 000 0000',
    email: 'contacto@turnia.app',
    address: 'Calle Principal #10-20',
    logoUrl: '',
    acceptNewBookings: true,
    showPricesPublicly: true,
    timeZone: 'America/Bogota',
  },
  services: [],
  professionals: [],
  clients: [],
  reservations: [],
  schedules: [
    {
      dayName: 'LUNES',
      dayCode: 1,
      active: true,
      blocks: [
        { id: 'b-1', start: '09:00', end: '13:00' },
        { id: 'b-2', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' },
        { id: 'b-3', start: '14:00', end: '19:00' },
      ],
    },
    {
      dayName: 'MARTES',
      dayCode: 2,
      active: true,
      blocks: [
        { id: 'b-4', start: '09:00', end: '13:00' },
        { id: 'b-5', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' },
        { id: 'b-6', start: '14:00', end: '19:00' },
      ],
    },
    {
      dayName: 'MIÉRCOLES',
      dayCode: 3,
      active: true,
      blocks: [
        { id: 'b-7', start: '09:00', end: '13:00' },
        { id: 'b-8', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' },
        { id: 'b-9', start: '14:00', end: '19:00' },
      ],
    },
    {
      dayName: 'JUEVES',
      dayCode: 4,
      active: true,
      blocks: [
        { id: 'b-10', start: '09:00', end: '13:00' },
        { id: 'b-11', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' },
        { id: 'b-12', start: '14:00', end: '19:00' },
      ],
    },
    {
      dayName: 'VIERNES',
      dayCode: 5,
      active: true,
      blocks: [
        { id: 'b-13', start: '09:00', end: '13:00' },
        { id: 'b-14', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' },
        { id: 'b-15', start: '14:00', end: '20:00' },
      ],
    },
    {
      dayName: 'SÁBADO',
      dayCode: 6,
      active: true,
      blocks: [{ id: 'b-16', start: '09:00', end: '15:00' }],
    },
    {
      dayName: 'DOMINGO',
      dayCode: 7,
      active: false,
      blocks: [],
    },
  ],
  activities: [],
};

class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      this.saveData(DEFAULT_DB_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
    }

    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_DB_DATA,
        ...parsed,
      };
    } catch (err) {
      console.error('Error reading database file, using defaults:', err);
      return JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
    }
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDataDirectory();
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.saveData(this.data);
  }

  public getAll(): DatabaseSchema {
    return this.data;
  }
}

export const db = new JSONDatabase();
