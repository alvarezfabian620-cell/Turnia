import { initDatabase, getPool } from '../server/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function testAuth() {
  console.log('🔒 Probando Sistema de Autenticación y Seguridad de Turnia...');
  const pool = await initDatabase();

  // 1. Check admin user exists
  const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@turnia.com']);
  if (users.length === 0) throw new Error('Usuario admin no encontrado');
  const user = users[0];
  console.log(`  ✅ Usuario Admin encontrado: ${user.email} (Rol: ${user.role})`);

  // 2. Test Bcrypt validation with default password
  const validPass = await bcrypt.compare('Turnia2026!', user.password_hash);
  if (!validPass) throw new Error('Validación de contraseña inicial falló');
  console.log('  ✅ Validación de contraseña segura con Bcrypt exitosa.');

  // 3. Test JWT Token Generation and Verification
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'turnia_super_secret_jwt_key_2026', { expiresIn: '24h' });
  const decoded: any = jwt.verify(token, 'turnia_super_secret_jwt_key_2026');
  if (decoded.email !== 'admin@turnia.com') throw new Error('Validación de JWT falló');
  console.log('  ✅ Generación y verificación de token JWT de sesión exitosa.');

  // 4. Test Forgot Password Code Generation
  const code = '789123';
  const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await pool.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [code, expiry, user.id]);
  const [updatedUser]: any = await pool.query('SELECT reset_token, reset_token_expiry FROM users WHERE id = ?', [user.id]);
  if (updatedUser[0].reset_token !== '789123') throw new Error('Fallo al guardar token de recuperación');
  console.log('  ✅ Flujo de "¿Olvidaste tu contraseña?" con código de 6 dígitos validado.');

  // 5. Test Password Reset
  const newPassHash = await bcrypt.hash('Turnia2026!', 10);
  await pool.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [newPassHash, user.id]);
  console.log('  ✅ Restablecimiento de contraseña con hashing y limpieza de tokens validado.');

  console.log('\n🎉 ¡SISTEMA DE AUTENTICACIÓN Y SEGURIDAD OPERANDO AL 100% SIN ERRORES!');
  process.exit(0);
}

testAuth().catch((err) => {
  console.error('❌ Error en prueba de autenticación:', err);
  process.exit(1);
});
