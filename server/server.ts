import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import { businessRouter } from './routes/business.js';
import { servicesRouter } from './routes/services.js';
import { professionalsRouter } from './routes/professionals.js';
import { clientsRouter } from './routes/clients.js';
import { reservationsRouter } from './routes/reservations.js';
import { schedulesRouter } from './routes/schedules.js';
import { activitiesRouter } from './routes/activities.js';
import { reportsRouter } from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/business', businessRouter);
app.use('/api/services', servicesRouter);
app.use('/api/professionals', professionalsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL XAMPP', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Error desconocido' });
});

async function startServer() {
  try {
    console.log('🔄 Conectando e inicializando MySQL (XAMPP)...');
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Backend de Turnia corriendo en http://localhost:${PORT} con MySQL (XAMPP)`);
    });
  } catch (err: any) {
    console.error('❌ Error fatal al iniciar el backend / MySQL:', err.message);
    process.exit(1);
  }
}

startServer();
