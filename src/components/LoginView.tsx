import React, { useState } from 'react';
import { api } from '../services/api';
import { AuthUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser, token: string, rememberMe: boolean) => void;
  businessName?: string;
  logoUrl?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  businessName = 'TURNIA',
}) => {
  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [email, setEmail] = useState('admin@turnia.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regCategory, setRegCategory] = useState('Barbería & Peluquería');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Flow States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [generatedDevCode, setGeneratedDevCode] = useState<string | null>(null);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (rememberMe) {
        localStorage.setItem('turnia_auth_token', res.token);
        localStorage.setItem('turnia_auth_user', JSON.stringify(res.user));
      } else {
        sessionStorage.setItem('turnia_auth_token', res.token);
        sessionStorage.setItem('turnia_auth_user', JSON.stringify(res.user));
      }

      onLoginSuccess(res.user, res.token, rememberMe);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Por favor completa tu nombre, correo y contraseña.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.register({
        name: regName.trim(),
        businessName: regBusinessName.trim() || 'Mi Negocio Turnia',
        category: regCategory,
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      });

      localStorage.setItem('turnia_auth_token', res.token);
      localStorage.setItem('turnia_auth_user', JSON.stringify(res.user));

      setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo a tu plataforma...');
      setTimeout(() => {
        onLoginSuccess(res.user, res.token, true);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Request (Step 1)
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setForgotError('Por favor ingresa tu correo electrónico registrado.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message);
      if (res.code) {
        setGeneratedDevCode(res.code);
        setVerificationCode(res.code);
      }
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.message || 'Error al solicitar el código de recuperación.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Password Reset Confirmation (Step 2)
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!verificationCode.trim()) {
      setForgotError('Por favor ingresa el código de 6 dígitos.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.auth.resetPassword({
        email: forgotEmail.trim(),
        code: verificationCode.trim(),
        newPassword,
      });

      setForgotSuccess(res.message);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setEmail(forgotEmail);
        setPassword(newPassword);
        setForgotSuccess(null);
        setGeneratedDevCode(null);
      }, 2500);
    } catch (err: any) {
      setForgotError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecf2] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background Decorative Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#24389c]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3f51b5]/15 rounded-full blur-3xl" />
      </div>

      {/* Main Login Card Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#e1e3e4]">
        {/* LEFT COLUMN: Form (Login or Register) */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191c1d] tracking-tight">
                {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h1>
              <p className="text-xs sm:text-sm text-[#757684] mt-1.5">
                {authMode === 'login'
                  ? 'Ingresa tus credenciales para acceder a tu plataforma'
                  : 'Registra tu negocio y empieza a gestionar tus reservas'}
              </p>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#ffdad6]/60 border border-[#ffdad6] text-[#93000a] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                  error
                </span>
                <p className="font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#dee0ff] border border-[#bac3ff] text-[#24389c] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <p className="font-medium leading-relaxed">{successMessage}</p>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#454652] mb-1.5 tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#757684] text-[18px] pointer-events-none">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@turnia.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e1e3e4] rounded-xl text-sm text-[#191c1d] placeholder-[#9e9fa8] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase text-[#454652] tracking-wider">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setShowForgotModal(true);
                        setForgotStep(1);
                        setForgotError(null);
                      }}
                      className="text-xs text-[#24389c] hover:underline font-semibold transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#757684] text-[18px] pointer-events-none">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#e1e3e4] rounded-xl text-sm text-[#191c1d] placeholder-[#9e9fa8] focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/15 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#757684] hover:text-[#191c1d] transition-colors p-0.5"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#24389c] rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-[#454652]">
                      Recordar mi sesión
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#1e2b82] hover:bg-[#18236d] active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTER FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#454652] mb-1 tracking-wider">
                      Tu Nombre *
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#757684] text-[16px] pointer-events-none">
                        person
                      </span>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Fabian Alvarez"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e3e4] rounded-xl text-xs sm:text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#454652] mb-1 tracking-wider">
                      Nombre del Negocio *
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#757684] text-[16px] pointer-events-none">
                        storefront
                      </span>
                      <input
                        type="text"
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="Ej. Elite Barber Studio"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e3e4] rounded-xl text-xs sm:text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#454652] mb-1 tracking-wider">
                      Correo Electrónico *
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#757684] text-[16px] pointer-events-none">
                        mail
                      </span>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="contacto@tunegocio.com"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#e1e3e4] rounded-xl text-xs sm:text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#454652] mb-1 tracking-wider">
                      Categoría
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e1e3e4] rounded-xl text-xs sm:text-sm text-[#191c1d] focus:border-[#24389c] outline-none"
                    >
                      <option value="Barbería & Peluquería">Barbería & Peluquería</option>
                      <option value="Estética & Spa">Estética & Spa</option>
                      <option value="Salud & Bienestar">Salud & Bienestar</option>
                      <option value="Consultorio & Citas">Consultorio & Citas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#454652] mb-1 tracking-wider">
                    Contraseña segura (mínimo 6 caracteres) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[#757684] text-[16px] pointer-events-none">
                      lock
                    </span>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2 bg-white border border-[#e1e3e4] rounded-xl text-xs sm:text-sm text-[#191c1d] focus:border-[#24389c] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 text-[#757684] hover:text-[#191c1d] p-0.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#1e2b82] hover:bg-[#18236d] active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Crear cuenta y comenzar</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle between Login and Register */}
            <div className="mt-5 pt-3 border-t border-[#f3f4f5] text-center">
              {authMode === 'login' ? (
                <p className="text-xs text-[#454652]">
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#24389c] font-bold hover:underline"
                  >
                    Regístrate gratis
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[#454652]">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#24389c] font-bold hover:underline"
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Footer Info / Support */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-[#757684]">
              ¿Problemas para acceder?{' '}
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Credenciales de acceso por defecto:\n\nUsuario: admin@turnia.com\nContraseña: Turnia2026!\n\nSi necesitas asistencia técnica, contacta a soporte@turnia.app.'
                  )
                }
                className="text-[#24389c] font-semibold hover:underline"
              >
                Soporte técnico
              </button>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Brand Identity Banner */}
        <div className="bg-[#1a2b7b] p-8 sm:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle geometric circles */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#00d2ff]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Turnia Stylized Vector Icon matching design */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#131f5c] border-2 border-white/20 shadow-2xl flex items-center justify-center relative p-3 backdrop-blur-sm">
              {/* Cyan Arc 'T' Accents */}
              <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-[#00d2ff] rounded-tl-2xl pointer-events-none" />
              
              {/* Calendar with Checkmark Icon */}
              <div className="w-full h-full bg-[#0a1238] rounded-2xl flex flex-col items-center justify-center border border-white/10 p-2 shadow-inner">
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                  <div className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                  <div className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                  <div className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                  <div className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                  <div className="w-2 h-2 rounded-full bg-[#00d2ff]" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#00d2ff] flex items-center justify-center text-[#0a1238]">
                  <span className="material-symbols-outlined text-[16px] font-extrabold">
                    check
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-widest uppercase">
            {businessName}
          </h2>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#bac3ff] mt-1.5">
            Gestión & Agenda
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e1e3e4] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#f3f4f5] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dee0ff] text-[#24389c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">lock_reset</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#191c1d]">Recuperar Contraseña</h3>
                  <p className="text-xs text-[#757684]">
                    {forgotStep === 1 ? 'Paso 1: Solicitar código' : 'Paso 2: Restablecer clave'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-[#757684] hover:text-[#191c1d] rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Alert Messages */}
            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-[#ffdad6]/70 text-[#93000a] text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#dee0ff] text-[#24389c] text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Request code by email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-xs text-[#454652] leading-relaxed">
                  Ingresa el correo electrónico asociado a tu cuenta de Turnia para generar un código seguro de verificación de 6 dígitos.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#454652] mb-1 tracking-wider">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@turnia.com"
                    required
                    className="w-full px-3.5 py-2.5 border border-[#e1e3e4] rounded-xl text-sm focus:border-[#24389c] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#f3f4f5]">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 border border-[#e1e3e4] rounded-xl text-xs font-semibold text-[#454652] hover:bg-[#f3f4f5]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {forgotLoading ? 'Generando...' : 'Continuar ->'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Input verification code and new password */}
            {forgotStep === 2 && (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                {generatedDevCode && (
                  <div className="p-3 bg-[#f8f9fa] border border-[#bac3ff] rounded-xl text-xs text-[#24389c]">
                    <span className="font-bold block mb-0.5">Código de verificación generado:</span>
                    <span className="font-mono text-base font-extrabold tracking-widest text-[#191c1d]">
                      {generatedDevCode}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-[#454652] mb-1 tracking-wider">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full px-3.5 py-2.5 border border-[#e1e3e4] rounded-xl text-sm font-mono text-center tracking-widest text-base font-bold focus:border-[#24389c] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#454652] mb-1 tracking-wider">
                    Nueva contraseña (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 border border-[#e1e3e4] rounded-xl text-sm focus:border-[#24389c] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#454652] mb-1 tracking-wider">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 border border-[#e1e3e4] rounded-xl text-sm focus:border-[#24389c] outline-none font-mono"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#f3f4f5]">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-[#24389c] hover:underline font-semibold"
                  >
                    ← Volver a solicitar
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 border border-[#e1e3e4] rounded-xl text-xs font-semibold text-[#454652] hover:bg-[#f3f4f5]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2 bg-[#24389c] hover:bg-[#1d2d7c] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      {forgotLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
