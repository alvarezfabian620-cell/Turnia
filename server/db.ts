import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

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

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_NAME = process.env.DB_NAME || 'turnia_db';

let pool: mysql.Pool;

export async function initDatabase(): Promise<mysql.Pool> {
  // 1. Connect without DB to ensure database exists in XAMPP MySQL
  const tempConnection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await tempConnection.end();

  // 2. Create connection pool to turnia_db
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
  });

  // 3. Create Tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS business_config (
      id INT PRIMARY KEY DEFAULT 1,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      description TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      address VARCHAR(255),
      logo_url TEXT,
      accept_new_bookings TINYINT(1) DEFAULT 1,
      show_prices_publicly TINYINT(1) DEFAULT 1,
      time_zone VARCHAR(100) DEFAULT 'America/Bogota'
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      duration_minutes INT NOT NULL DEFAULT 30,
      price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      active TINYINT(1) DEFAULT 1,
      category VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS professionals (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'disponible',
      monthly_bookings INT DEFAULT 0,
      avatar_url TEXT,
      email VARCHAR(255),
      phone VARCHAR(50),
      specialties TEXT
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      total_visits INT DEFAULT 0,
      last_visit VARCHAR(50),
      notes TEXT
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(100) PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(50),
      client_email VARCHAR(255),
      service_id VARCHAR(100) NOT NULL,
      service_name VARCHAR(255) NOT NULL,
      professional_id VARCHAR(100) NOT NULL,
      professional_name VARCHAR(255) NOT NULL,
      date VARCHAR(20) NOT NULL,
      time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10),
      duration_minutes INT NOT NULL DEFAULT 30,
      price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      status VARCHAR(50) NOT NULL DEFAULT 'confirmada',
      notes TEXT,
      created_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      day_code INT PRIMARY KEY,
      day_name VARCHAR(50) NOT NULL,
      active TINYINT(1) DEFAULT 1,
      blocks TEXT NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      client_name VARCHAR(255),
      time_ago VARCHAR(100),
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(12, 2),
      timestamp VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  // 4. Seed default business config if table is empty
  const [businessRows]: any = await pool.query('SELECT * FROM business_config WHERE id = 1');
  if (businessRows.length === 0) {
    await pool.query(`
      INSERT INTO business_config (id, name, category, description, phone, email, address, logo_url, accept_new_bookings, show_prices_publicly, time_zone)
      VALUES (1, 'Turnia Negocio & Reservas', 'Estética & Bienestar', 'Gestión inteligente de reservas y turnos.', '+57 300 000 0000', 'contacto@turnia.app', 'Calle Principal #10-20', '', 1, 1, 'America/Bogota')
    `);
  }

  // 5. Seed default weekly schedules if empty
  const [scheduleRows]: any = await pool.query('SELECT * FROM schedules');
  if (scheduleRows.length === 0) {
    const defaultSchedules = [
      { dayCode: 1, dayName: 'LUNES', active: 1, blocks: JSON.stringify([{ id: 'b-1', start: '09:00', end: '13:00' }, { id: 'b-2', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' }, { id: 'b-3', start: '14:00', end: '19:00' }]) },
      { dayCode: 2, dayName: 'MARTES', active: 1, blocks: JSON.stringify([{ id: 'b-4', start: '09:00', end: '13:00' }, { id: 'b-5', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' }, { id: 'b-6', start: '14:00', end: '19:00' }]) },
      { dayCode: 3, dayName: 'MIÉRCOLES', active: 1, blocks: JSON.stringify([{ id: 'b-7', start: '09:00', end: '13:00' }, { id: 'b-8', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' }, { id: 'b-9', start: '14:00', end: '19:00' }]) },
      { dayCode: 4, dayName: 'JUEVES', active: 1, blocks: JSON.stringify([{ id: 'b-10', start: '09:00', end: '13:00' }, { id: 'b-11', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' }, { id: 'b-12', start: '14:00', end: '19:00' }]) },
      { dayCode: 5, dayName: 'VIERNES', active: 1, blocks: JSON.stringify([{ id: 'b-13', start: '09:00', end: '13:00' }, { id: 'b-14', start: '13:00', end: '14:00', isBreak: true, label: 'Almuerzo' }, { id: 'b-15', start: '14:00', end: '20:00' }]) },
      { dayCode: 6, dayName: 'SÁBADO', active: 1, blocks: JSON.stringify([{ id: 'b-16', start: '09:00', end: '15:00' }]) },
      { dayCode: 7, dayName: 'DOMINGO', active: 0, blocks: JSON.stringify([]) },
    ];

    for (const sch of defaultSchedules) {
      await pool.query('INSERT INTO schedules (day_code, day_name, active, blocks) VALUES (?, ?, ?, ?)', [
        sch.dayCode,
        sch.dayName,
        sch.active,
        sch.blocks,
      ]);
    }
  }

  console.log(`✅ Base de datos MySQL (XAMPP) "${DB_NAME}" inicializada y lista.`);
  return pool;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}
