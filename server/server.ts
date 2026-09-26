import express from 'express';
import http from 'http';
import cors from 'cors';
import { initDatabase } from './db.js';
import { initWebSocketServer } from './websocket.js';
import { businessRouter } from './routes/business.js';
import { servicesRouter } from './routes/services.js';
import { professionalsRouter } from './routes/professionals.js';
import { clientsRouter } from './routes/clients.js';
import { reservationsRouter } from './routes/reservations.js';
import { schedulesRouter } from './routes/schedules.js';
import { activitiesRouter } from './routes/activities.js';
import { reportsRouter } from './routes/reports.js';
import { authRouter } from './routes/auth.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// 1. Enterprise Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible CDN & dev scripts
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS & Payload sanitization
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 3. Rate Limiting Protection (Anti-DDoS & Anti-Bruteforce)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Max 30 peticiones de autenticación por IP en 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas solicitudes de autenticación desde esta IP. Por favor intenta nuevamente en 15 minutos.',
  },
});

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Max 1000 peticiones generales por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Límite de solicitudes de API excedido. Por favor intenta más tarde.',
  },
});

app.use('/api/', globalApiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// API Routes
app.use('/api/auth', authRouter);
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

    // Attach WebSocket server to HTTP server
    initWebSocketServer(server);

    server.listen(PORT, () => {
      console.log(`🚀 Servidor Backend de Turnia corriendo en http://localhost:${PORT} con MySQL (XAMPP) & WebSockets (/ws)`);
    });
  } catch (err: any) {
    console.error('❌ Error fatal al iniciar el backend / MySQL:', err.message);
    process.exit(1);
  }
}

startServer();
