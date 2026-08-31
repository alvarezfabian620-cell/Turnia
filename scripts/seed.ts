import { initDatabase } from '../server/db.js';

export async function runSeeder(forceClear = false) {
  console.log('🌱 Iniciando Seeder de Turnia en MySQL (XAMPP)...');
  const pool = await initDatabase();

  if (forceClear) {
    console.log('🧹 Limpiando tablas previas...');
    await pool.query('DELETE FROM activities');
    await pool.query('DELETE FROM reservations');
    await pool.query('DELETE FROM clients');
    await pool.query('DELETE FROM professionals');
    await pool.query('DELETE FROM services');
  }

  // 1. Seed Services
  const [existingServices]: any = await pool.query('SELECT COUNT(*) as count FROM services');
  if (existingServices[0].count === 0 || forceClear) {
    console.log('  -> Insertando catálogo de servicios...');
    const services = [
      {
        id: 'srv-1',
        name: 'Corte Clásico & Estilizado',
        description: 'Corte personalizado con lavado, peinado y asesoría de imagen.',
        durationMinutes: 30,
        price: 30000,
        active: 1,
        category: 'Barbería & Peluquería',
      },
      {
        id: 'srv-2',
        name: 'Perfilado y Ritual de Barba',
        description: 'Arreglo con toalla caliente, aceites esenciales y navaja tradicional.',
        durationMinutes: 25,
        price: 25000,
        active: 1,
        category: 'Barbería & Peluquería',
      },
      {
        id: 'srv-3',
        name: 'Combo Turnia VIP (Corte + Barba)',
        description: 'Experiencia completa: corte premium, ritual de barba y exfoliación facial.',
        durationMinutes: 50,
        price: 50000,
        active: 1,
        category: 'Combos & Especiales',
      },
      {
        id: 'srv-4',
        name: 'Balayage & Diseño de Color',
        description: 'Técnica de aclarado suave con matización e hidratación post-color.',
        durationMinutes: 120,
        price: 130000,
        active: 1,
        category: 'Color & Estética',
      },
      {
        id: 'srv-5',
        name: 'Tratamiento de Hidratación Profunda',
        description: 'Nutrición capilar intensiva con keratina y sellado térmico.',
        durationMinutes: 45,
        price: 65000,
        active: 1,
        category: 'Cuidado Capilar',
      },
      {
        id: 'srv-6',
        name: 'Limpieza Facial Profunda & Mascarilla',
        description: 'Extracción de impurezas, vapor de ozono y mascarilla hidratante.',
        durationMinutes: 45,
        price: 55000,
        active: 1,
        category: 'Estética & Spa',
      },
      {
        id: 'srv-7',
        name: 'Manicure & Spa de Manos',
        description: 'Exfoliación, limado, cutícula, masaje y esmaltado semipermanente.',
        durationMinutes: 40,
        price: 32000,
        active: 1,
        category: 'Manicura & Pedicura',
      },
    ];

    for (const s of services) {
      await pool.query(
        'INSERT INTO services (id, name, description, duration_minutes, price, active, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.description, s.durationMinutes, s.price, s.active, s.category]
      );
    }
  }

  // 2. Seed Professionals
  const [existingProfs]: any = await pool.query('SELECT COUNT(*) as count FROM professionals');
  if (existingProfs[0].count === 0 || forceClear) {
    console.log('  -> Insertando equipo de profesionales...');
    const professionals = [
      {
        id: 'prof-1',
        name: 'Mateo Valenzuela',
        role: 'Master Barber',
        status: 'disponible',
        monthlyBookings: 18,
        email: 'mateo.valenzuela@turnia.app',
        phone: '+57 310 888 1122',
        specialties: JSON.stringify(['Corte Clásico', 'Diseño de Barba', 'Fade']),
      },
      {
        id: 'prof-2',
        name: 'Sofía Benítez',
        role: 'Estilista & Colorista',
        status: 'disponible',
        monthlyBookings: 24,
        email: 'sofia.benitez@turnia.app',
        phone: '+57 315 777 3344',
        specialties: JSON.stringify(['Balayage', 'Colorimetría', 'Corte Dama']),
      },
      {
        id: 'prof-3',
        name: 'David Herrera',
        role: 'Terapeuta Capilar & Spa',
        status: 'ocupado',
        monthlyBookings: 12,
        email: 'david.herrera@turnia.app',
        phone: '+57 300 444 5566',
        specialties: JSON.stringify(['Hidratación Capilar', 'Masajes', 'Afeitado']),
      },
      {
        id: 'prof-4',
        name: 'Valentina Ríos',
        role: 'Especialista en Estética Facial',
        status: 'disponible',
        monthlyBookings: 15,
        email: 'valentina.rios@turnia.app',
        phone: '+57 318 222 9900',
        specialties: JSON.stringify(['Limpieza Facial', 'Cejas', 'Pestañas']),
      },
      {
        id: 'prof-5',
        name: 'Carlos Mendoza',
        role: 'Estilista Integral',
        status: 'ausente',
        monthlyBookings: 8,
        email: 'carlos.mendoza@turnia.app',
        phone: '+57 312 666 7788',
        specialties: JSON.stringify(['Alisados', 'Tratamientos', 'Peinados']),
      },
    ];

    for (const p of professionals) {
      await pool.query(
        'INSERT INTO professionals (id, name, role, status, monthly_bookings, email, phone, specialties) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.role, p.status, p.monthlyBookings, p.email, p.phone, p.specialties]
      );
    }
  }

  // 3. Seed Clients (Usuarios / Clientes)
  const [existingClients]: any = await pool.query('SELECT COUNT(*) as count FROM clients');
  if (existingClients[0].count === 0 || forceClear) {
    console.log('  -> Insertando usuarios y clientes...');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const clients = [
      {
        id: 'cli-1',
        name: 'Valentina Morales',
        phone: '+57 310 444 5566',
        email: 'valentina.morales@gmail.com',
        totalVisits: 6,
        lastVisit: todayStr,
        notes: 'Cliente VIP. Prefiere citas en las tardes y café sin azúcar.',
      },
      {
        id: 'cli-2',
        name: 'Carlos Eduardo Vega',
        phone: '+57 312 888 9900',
        email: 'carlos.vega@outlook.com',
        totalVisits: 4,
        lastVisit: todayStr,
        notes: 'Corte clásico con tijera en los laterales, ritual de barba con toalla tibia.',
      },
      {
        id: 'cli-3',
        name: 'Mariana Restrepo',
        phone: '+57 315 222 3344',
        email: 'mariana.r@gmail.com',
        totalVisits: 9,
        lastVisit: todayStr,
        notes: 'Siempre realiza cita con Sofía Benítez para retoque de balayage.',
      },
      {
        id: 'cli-4',
        name: 'Santiago Gómez',
        phone: '+57 301 777 8899',
        email: 'santiago.gomez@empresa.co',
        totalVisits: 3,
        lastVisit: '2026-08-25',
        notes: 'Muy puntual, solicita factura electrónica de sus servicios.',
      },
      {
        id: 'cli-5',
        name: 'Laura Camila Duque',
        phone: '+57 318 666 4433',
        email: 'laura.duque@hotmail.com',
        totalVisits: 5,
        lastVisit: '2026-08-28',
        notes: 'Alérgica a tintes con amoníaco. Usar productos orgánicos.',
      },
      {
        id: 'cli-6',
        name: 'Andrés Felipe Castro',
        phone: '+57 300 111 2233',
        email: 'andres.castro@gmail.com',
        totalVisits: 7,
        lastVisit: todayStr,
        notes: 'Cliente quincenal para Combo VIP.',
      },
      {
        id: 'cli-7',
        name: 'Gabriela Silva',
        phone: '+57 314 999 1122',
        email: 'gabriela.silva@yahoo.com',
        totalVisits: 2,
        lastVisit: '2026-08-26',
        notes: 'Interesada en sesiones de limpieza facial mensuales.',
      },
    ];

    for (const c of clients) {
      await pool.query(
        'INSERT INTO clients (id, name, phone, email, total_visits, last_visit, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.name, c.phone, c.email, c.totalVisits, c.lastVisit, c.notes]
      );
    }
  }

  // 4. Seed Reservations
  const [existingRes]: any = await pool.query('SELECT COUNT(*) as count FROM reservations');
  if (existingRes[0].count === 0 || forceClear) {
    console.log('  -> Insertando reservas de prueba para la agenda...');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const reservations = [
      {
        id: 'res-101',
        clientName: 'Valentina Morales',
        clientPhone: '+57 310 444 5566',
        clientEmail: 'valentina.morales@gmail.com',
        serviceId: 'srv-4',
        serviceName: 'Balayage & Diseño de Color',
        professionalId: 'prof-2',
        professionalName: 'Sofía Benítez',
        date: todayStr,
        time: '09:30',
        endTime: '11:30',
        durationMinutes: 120,
        price: 130000,
        status: 'en_curso',
        notes: 'Retoque de mechas y matización beige cálido.',
      },
      {
        id: 'res-102',
        clientName: 'Carlos Eduardo Vega',
        clientPhone: '+57 312 888 9900',
        clientEmail: 'carlos.vega@outlook.com',
        serviceId: 'srv-3',
        serviceName: 'Combo Turnia VIP (Corte + Barba)',
        professionalId: 'prof-1',
        professionalName: 'Mateo Valenzuela',
        date: todayStr,
        time: '11:00',
        endTime: '11:50',
        durationMinutes: 50,
        price: 50000,
        status: 'confirmada',
        notes: 'Llegará 5 minutos antes.',
      },
      {
        id: 'res-103',
        clientName: 'Mariana Restrepo',
        clientPhone: '+57 315 222 3344',
        clientEmail: 'mariana.r@gmail.com',
        serviceId: 'srv-5',
        serviceName: 'Tratamiento de Hidratación Profunda',
        professionalId: 'prof-3',
        professionalName: 'David Herrera',
        date: todayStr,
        time: '14:00',
        endTime: '14:45',
        durationMinutes: 45,
        price: 65000,
        status: 'confirmada',
        notes: 'Aplicar ampolleta reparadora.',
      },
      {
        id: 'res-104',
        clientName: 'Andrés Felipe Castro',
        clientPhone: '+57 300 111 2233',
        clientEmail: 'andres.castro@gmail.com',
        serviceId: 'srv-1',
        serviceName: 'Corte Clásico & Estilizado',
        professionalId: 'prof-1',
        professionalName: 'Mateo Valenzuela',
        date: todayStr,
        time: '15:30',
        endTime: '16:00',
        durationMinutes: 30,
        price: 30000,
        status: 'pendiente',
        notes: 'Confirmación pendiente por WhatsApp.',
      },
      {
        id: 'res-105',
        clientName: 'Gabriela Silva',
        clientPhone: '+57 314 999 1122',
        clientEmail: 'gabriela.silva@yahoo.com',
        serviceId: 'srv-6',
        serviceName: 'Limpieza Facial Profunda & Mascarilla',
        professionalId: 'prof-4',
        professionalName: 'Valentina Ríos',
        date: todayStr,
        time: '16:30',
        endTime: '17:15',
        durationMinutes: 45,
        price: 55000,
        status: 'confirmada',
        notes: 'Piel sensible.',
      },
      {
        id: 'res-106',
        clientName: 'Santiago Gómez',
        clientPhone: '+57 301 777 8899',
        clientEmail: 'santiago.gomez@empresa.co',
        serviceId: 'srv-2',
        serviceName: 'Perfilado y Ritual de Barba',
        professionalId: 'prof-1',
        professionalName: 'Mateo Valenzuela',
        date: todayStr,
        time: '08:30',
        endTime: '08:55',
        durationMinutes: 25,
        price: 25000,
        status: 'completada',
        notes: 'Servicio pagado en efectivo.',
      },
    ];

    for (const r of reservations) {
      await pool.query(
        `INSERT INTO reservations 
          (id, client_name, client_phone, client_email, service_id, service_name, professional_id, professional_name, date, time, end_time, duration_minutes, price, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.clientName,
          r.clientPhone,
          r.clientEmail,
          r.serviceId,
          r.serviceName,
          r.professionalId,
          r.professionalName,
          r.date,
          r.time,
          r.endTime,
          r.durationMinutes,
          r.price,
          r.status,
          r.notes,
          new Date().toISOString(),
        ]
      );
    }
  }

  // 5. Seed Activities
  const [existingAct]: any = await pool.query('SELECT COUNT(*) as count FROM activities');
  if (existingAct[0].count === 0 || forceClear) {
    console.log('  -> Insertando historial de actividad reciente...');
    const activities = [
      {
        id: 'act-1',
        title: 'Cita en curso: Valentina Morales',
        clientName: 'Valentina Morales',
        timeAgo: 'En curso',
        type: 'new_booking',
        amount: 130000,
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        id: 'act-2',
        title: 'Nueva reserva confirmada: Carlos Eduardo Vega',
        clientName: 'Carlos Eduardo Vega',
        timeAgo: 'Hace 25 min',
        type: 'new_booking',
        amount: 50000,
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'act-3',
        title: 'Pago recibido: Santiago Gómez',
        clientName: 'Santiago Gómez',
        timeAgo: 'Hace 1 hora',
        type: 'payment',
        amount: 25000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: 'act-4',
        title: 'Nuevo cliente registrado: Gabriela Silva',
        clientName: 'Gabriela Silva',
        timeAgo: 'Hace 2 horas',
        type: 'new_client',
        amount: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];

    for (const a of activities) {
      await pool.query(
        'INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.title, a.clientName, a.timeAgo, a.type, a.amount, a.timestamp]
      );
    }
  }

  console.log('✨ ¡Seeder ejecutado con éxito en MySQL (turnia_db)!');
}

if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  const force = process.argv.includes('--force') || process.argv.includes('-f');
  runSeeder(force)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error en seeder:', err);
      process.exit(1);
    });
}
