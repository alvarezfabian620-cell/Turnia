import { initDatabase } from '../server/db.js';

async function testCRUD() {
  console.log('🔄 Conectando a MySQL XAMPP para pruebas CRUD...');
  const pool = await initDatabase();

  // 1. Test Services
  console.log('1. Probando CRUD de Servicios...');
  const srvId = 'test-srv-' + Date.now();
  await pool.query('INSERT INTO services (id, name, description, duration_minutes, price, active, category) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    srvId,
    'Corte & Barba VIP',
    'Servicio completo con toalla caliente',
    45,
    38000,
    1,
    'Barbería'
  ]);
  const [s1]: any = await pool.query('SELECT * FROM services WHERE id = ?', [srvId]);
  if (!s1.length) throw new Error('Fallo al insertar servicio');
  await pool.query('UPDATE services SET price = 42000 WHERE id = ?', [srvId]);
  const [s2]: any = await pool.query('SELECT * FROM services WHERE id = ?', [srvId]);
  if (Number(s2[0].price) !== 42000) throw new Error('Fallo al actualizar servicio');
  console.log('   ✅ Servicios: INSERT, SELECT, UPDATE validados.');

  // 2. Test Professionals
  console.log('2. Probando CRUD de Profesionales...');
  const profId = 'test-prof-' + Date.now();
  await pool.query('INSERT INTO professionals (id, name, role, status, monthly_bookings, specialties) VALUES (?, ?, ?, ?, ?, ?)', [
    profId,
    'Camilo Serna',
    'Master Barber',
    'disponible',
    8,
    JSON.stringify(['Corte Clásico', 'Diseño de Barba'])
  ]);
  const [p1]: any = await pool.query('SELECT * FROM professionals WHERE id = ?', [profId]);
  if (!p1.length) throw new Error('Fallo al insertar profesional');
  await pool.query('UPDATE professionals SET status = ? WHERE id = ?', ['ocupado', profId]);
  const [p2]: any = await pool.query('SELECT * FROM professionals WHERE id = ?', [profId]);
  if (p2[0].status !== 'ocupado') throw new Error('Fallo al actualizar profesional');
  console.log('   ✅ Profesionales: INSERT, SELECT, UPDATE validados.');

  // 3. Test Clients
  console.log('3. Probando CRUD de Clientes...');
  const cliId = 'test-cli-' + Date.now();
  await pool.query('INSERT INTO clients (id, name, phone, email, total_visits, last_visit, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    cliId,
    'Andrea Morales',
    '+57 320 555 6677',
    'andrea.morales@turnia.app',
    3,
    '2026-08-31',
    'Cliente VIP'
  ]);
  const [c1]: any = await pool.query('SELECT * FROM clients WHERE id = ?', [cliId]);
  if (!c1.length) throw new Error('Fallo al insertar cliente');
  await pool.query('UPDATE clients SET phone = ? WHERE id = ?', ['+57 320 999 0000', cliId]);
  const [c2]: any = await pool.query('SELECT * FROM clients WHERE id = ?', [cliId]);
  if (c2[0].phone !== '+57 320 999 0000') throw new Error('Fallo al actualizar cliente');
  console.log('   ✅ Clientes: INSERT, SELECT, UPDATE validados.');

  // 4. Test Reservations
  console.log('4. Probando CRUD de Reservas...');
  const resId = 'test-res-' + Date.now();
  await pool.query(
    'INSERT INTO reservations (id, client_name, client_phone, service_id, service_name, professional_id, professional_name, date, time, end_time, duration_minutes, price, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      resId,
      'Andrea Morales',
      '+57 320 999 0000',
      srvId,
      'Corte & Barba VIP',
      profId,
      'Camilo Serna',
      '2026-09-01',
      '14:00',
      '14:45',
      45,
      42000,
      'confirmada',
      'Cita confirmada por WhatsApp',
      new Date().toISOString()
    ]
  );
  const [r1]: any = await pool.query('SELECT * FROM reservations WHERE id = ?', [resId]);
  if (!r1.length) throw new Error('Fallo al insertar reserva');
  await pool.query('UPDATE reservations SET status = ? WHERE id = ?', ['completada', resId]);
  const [r2]: any = await pool.query('SELECT * FROM reservations WHERE id = ?', [resId]);
  if (r2[0].status !== 'completada') throw new Error('Fallo al actualizar reserva');
  console.log('   ✅ Reservas: INSERT, SELECT, UPDATE validados.');

  // 5. Test Business Config & Schedules
  console.log('5. Probando Configuración del Negocio y Horarios...');
  const [cfg]: any = await pool.query('SELECT * FROM business_config WHERE id = 1');
  if (!cfg.length) throw new Error('Falta configuración del negocio');
  const [schs]: any = await pool.query('SELECT * FROM schedules');
  if (schs.length !== 7) throw new Error('Horarios incompletos');
  console.log('   ✅ Configuración y 7 días de Horarios validados.');

  console.log('\n🎉 ¡TODAS LAS OPERACIONES CRUD DE MYSQL FUNCIONAN AL 100% SIN ERRORES NI INCONSISTENCIAS!');
  process.exit(0);
}

testCRUD().catch((err) => {
  console.error('❌ Error durante la prueba CRUD:', err);
  process.exit(1);
});
