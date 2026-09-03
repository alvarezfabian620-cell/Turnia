import { initDatabase } from '../server/db.js';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  console.log('🌱 Inicializando usuarios de prueba en MySQL...');
  const pool = await initDatabase();
  const hash = await bcrypt.hash('Turnia2026!', 10);
  const now = new Date().toISOString();

  // 1. Admin
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-admin', 'Fabian Alvarez', 'admin@turnia.com', ?, 'admin', NULL, NULL, 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // 2. Empleado: Carlos Mendoza
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-emp-1', 'Carlos Mendoza', 'carlos@turnia.com', ?, 'empleado', 'prof-1', NULL, 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'empleado', professional_id = 'prof-1', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // 3. Empleado: Mateo Valenzuela
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-emp-2', 'Mateo Valenzuela', 'mateo@turnia.com', ?, 'empleado', 'prof-1', NULL, 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'empleado', professional_id = 'prof-1', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  // 4. Cliente: Andrés Felipe Castro
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, professional_id, client_id, failed_attempts, created_at)
     VALUES ('usr-cli-1', 'Andrés Felipe Castro', 'cliente@turnia.com', ?, 'cliente', NULL, 'cli-1', 0, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'cliente', client_id = 'cli-1', failed_attempts = 0, lock_until = NULL`,
    [hash, now]
  );

  const [users]: any = await pool.query(
    'SELECT id, name, email, role, professional_id, client_id, failed_attempts, lock_until FROM users'
  );
  console.log('✅ USUARIOS ACTIVOS EN MYSQL:', users);
}

seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error en seedUsers:', err);
    process.exit(1);
  });
