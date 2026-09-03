import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../db.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'turnia_super_secret_jwt_key_2026';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, businessName, category, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Por favor completa todos los campos requeridos (nombre, correo y contraseña).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres por seguridad.' });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existing]: any = await pool.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este correo electrónico ya se encuentra registrado en Turnia. Inicia sesión o recupera tu clave.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    const userRole = 'admin';
    const createdAt = new Date().toISOString();

    // Insert user
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, failed_attempts, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [userId, name.trim(), cleanEmail, passwordHash, userRole, createdAt]
    );

    // Update business configuration with their new business info if provided
    if (businessName && businessName.trim()) {
      await pool.query(
        `UPDATE business_config SET 
          name = ?, category = ?, phone = ?, email = ?
         WHERE id = 1`,
        [
          businessName.trim(),
          category ? category.trim() : 'Estética & Bienestar',
          phone ? phone.trim() : '',
          cleanEmail,
        ]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: userRole,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        `Nueva cuenta de negocio registrada: ${businessName || name}`,
        name.trim(),
        'Justo ahora',
        'new_client',
        null,
        createdAt,
      ]
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: userRole,
      },
      message: '¡Tu cuenta ha sido creada exitosamente! Bienvenido a Turnia.',
    });
  } catch (err: any) {
    console.error('Error en register:', err);
    res.status(500).json({ error: 'Error al registrar la cuenta. Intenta nuevamente.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor ingresa correo y contraseña.' });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [rows]: any = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo o contraseña.' });
    }

    const user = rows[0];

    // Check account lockout
    if (user.lock_until) {
      const lockUntilDate = new Date(user.lock_until);
      const now = new Date();
      if (lockUntilDate > now) {
        const remainingMins = Math.ceil((lockUntilDate.getTime() - now.getTime()) / (1000 * 60));
        return res.status(403).json({
          error: `Cuenta bloqueada temporalmente por seguridad tras múltiples intentos fallidos. Intenta nuevamente en ${remainingMins} minuto(s).`,
        });
      } else {
        // Lockout expired, reset attempts
        await pool.query('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?', [user.id]);
      }
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const newAttempts = (user.failed_attempts || 0) + 1;
      let lockUntil: string | null = null;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockDate = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        lockUntil = lockDate.toISOString();
      }

      await pool.query('UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?', [
        newAttempts,
        lockUntil,
        user.id,
      ]);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        return res.status(403).json({
          error: `Has superado el límite de intentos permitidos (${MAX_FAILED_ATTEMPTS}). Tu cuenta ha sido bloqueada por ${LOCKOUT_MINUTES} minutos por seguridad.`,
        });
      }

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newAttempts;
      return res.status(401).json({
        error: `Contraseña incorrecta. Te quedan ${remainingAttempts} intento(s) antes del bloqueo de seguridad.`,
      });
    }

    // Successful login - Reset attempts
    await pool.query('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?', [user.id]);

    // Generate JWT
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn }
    );

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        `Inicio de sesión exitoso: ${user.name}`,
        user.name,
        'Justo ahora',
        'schedule_update',
        null,
        new Date().toISOString(),
      ]
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Inicio de sesión exitoso',
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor al procesar el inicio de sesión.' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Por favor ingresa tu correo electrónico.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (rows.length === 0) {
      // Security practice: Don't leak if email exists or not, but return friendly message
      return res.json({
        success: true,
        message: 'Si el correo está registrado en la plataforma, recibirás un código de recuperación de 6 dígitos.',
      });
    }

    const user = rows[0];
    // Generate 6-digit verification code
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    await pool.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [
      verificationCode,
      expiry,
      user.id,
    ]);

    console.log(`🔑 [SEGURIDAD] Código de recuperación generado para ${cleanEmail}: ${verificationCode}`);

    res.json({
      success: true,
      message: `Código de recuperación generado correctamente.`,
      code: verificationCode, // Returned for instant UI feedback / testing
    });
  } catch (err: any) {
    console.error('Error en forgot-password:', err);
    res.status(500).json({ error: 'Error al solicitar la recuperación de contraseña.' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios (correo, código y nueva contraseña).' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres por seguridad.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No se encontró una solicitud válida para este correo.' });
    }

    const user = rows[0];

    if (!user.reset_token || user.reset_token !== code.trim()) {
      return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
    }

    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ error: 'El código de verificación ha expirado. Solicita uno nuevo.' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token & lockouts
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, failed_attempts = 0, lock_until = NULL WHERE id = ?',
      [newHash, user.id]
    );

    // Audit activity
    await pool.query(
      `INSERT INTO activities (id, title, client_name, time_ago, type, amount, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act-${Date.now()}`,
        `Contraseña restablecida exitosamente: ${user.name}`,
        user.name,
        'Justo ahora',
        'schedule_update',
        null,
        new Date().toISOString(),
      ]
    );

    res.json({
      success: true,
      message: '¡Tu contraseña ha sido restablecida exitosamente! Ya puedes iniciar sesión con tu nueva clave.',
    });
  } catch (err: any) {
    console.error('Error en reset-password:', err);
    res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
});

// GET /api/auth/me (Protected Route Verification)
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autenticado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const pool = getPool();
    const [rows]: any = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [
      decoded.id,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o sesión inválida.' });
    }

    res.json({ user: rows[0] });
  } catch (err: any) {
    res.status(401).json({ error: 'Sesión expirada o inválida. Por favor inicia sesión de nuevo.' });
  }
});
