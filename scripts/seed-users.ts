import { initDatabase } from '../server/db.js';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  console.log('🌱 Actualizando vínculos de profesionales en MySQL...');
  const pool = await initDatabase();
  const hash = await bcrypt.hash('Turnia2026!', 10);
  const now = new Date().toISOString();

  // 1. Admin: Fabian Alvarez
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-admin', 'Fabian Alvarez', 'admin@turnia.com', ?, 'admin', NULL, NULL, 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // 2. Empleado: Carlos Mendoza -> VINCULADO EXACTAMENTE A prof-5 (Carlos Mendoza)
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-emp-1', 'Carlos Mendoza', 'carlos@turnia.com', ?, 'empleado', 'prof-5', NULL, 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'empleado', professional_id = 'prof-5', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // 3. Empleado: Mateo Valenzuela -> VINCULADO EXACTAMENTE A prof-1 (Mateo Valenzuela)
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-emp-2', 'Mateo Valenzuela', 'mateo@turnia.com', ?, 'empleado', 'prof-1', NULL, 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'empleado', professional_id = 'prof-1', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // 4. Cliente: Andrés Felipe Castro -> VINCULADO A cli-1
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-cli-1', 'Andrés Felipe Castro', 'cliente@turnia.com', ?, 'cliente', NULL, 'cli-1', 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'cliente', client_id = 'cli-1', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // Add 1-2 real sample appointments specifically for Carlos Mendoza (prof-5)
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  await pool.query(
    `INSERT INTO reservations (id, client_name, client_phone, client_email, service_id, service_name, professional_id, professional_name, date, time, duration_minutes, price, status, notes, created_at)
     VALUES 
     ('res-carlos-1', 'Laura Restrepo', '+57 311 234 5678', 'laura.r@test.com', 'srv-5', 'Tratamiento de Hidratación Profunda', 'prof-5', 'Carlos Mendoza', ?, '10:00', 45, 65000, 'confirmada', 'Cliente frecuente', ?),
     ('res-carlos-2', 'Camila Ortiz', '+57 320 876 5432', 'camila.o@test.com', 'srv-7', 'Manicure & Spa de Manos', 'prof-5', 'Carlos Mendoza', ?, '15:00', 40, 32000, 'pendiente', 'Primera visita', ?)
     ON DUPLICATE KEY UPDATE professional_id = 'prof-5', professional_name = 'Carlos Mendoza'`,
    [todayStr, now, todayStr, now]
  );

  const [users]: any = await pool.query(
    'SELECT id, name, email, role, professional_id, client_id FROM users'
  );
  console.log('✅ USUARIOS Y PROFESIONALES VINCULADOS CON EXACTITUD:', users);
}

seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error en seedUsers:', err);
    process.exit(1);
  });
