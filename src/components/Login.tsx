import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { User } from '../types';

import { MOCK_USERS } from '../mockUsers';
import { useDepartment } from '../context/DepartmentContext';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBack?: () => void;
}

export default function Login({ onLoginSuccess, onBack }: LoginProps) {
  const { setDepartmentContext } = useDepartment();
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery states
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, complete todos los campos.');
      return;
    }

    // 1. Mock Local check
    const mockUser = MOCK_USERS.find(
      u => (u.email === email.trim() || u.username === email.trim()) && u.password === password
    );

    if (mockUser) {
      if (mockUser.role === 'Administrador' && mockUser.department) {
        setDepartmentContext(mockUser.department);
      } else if (mockUser.role === 'Super Admin') {
        setDepartmentContext(null); 
      }
      
      const mockToken = 'mock-jwt-token-' + mockUser.id;
      if (rememberMe) {
        localStorage.setItem('ecu_crm_user', JSON.stringify(mockUser));
        localStorage.setItem('ecu_crm_token', mockToken);
      } else {
        sessionStorage.setItem('ecu_crm_user', JSON.stringify(mockUser));
        sessionStorage.setItem('ecu_crm_token', mockToken);
      }
      onLoginSuccess(mockUser as User, mockToken);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('ecu_crm_user', JSON.stringify(data.user));
        localStorage.setItem('ecu_crm_token', data.token);
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMessage(data.message || 'Error al iniciar sesión. Verifique sus credenciales.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      // Legacy Fallback local check
      if (email === 'sirek' && password === 'Erick1212') {
        const legacyUser: User = {
          id: 'carlos-andrade',
          name: 'Carlos Andrade',
          email: 'sirek',
          role: 'Super Admin',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnJV8Wsm0tliOIswMbx2sPkIv8KpHT4tUQOCdi_fZOyteQQFG3cWkuvW0eSugv0c9WIAc9NKrZHNaG_jDmDZfcFXE5Q9aL0hFPnqES0EDdID3wAfcLCFHb8NLAP5OlmeHUF76VlT9--TVYUJlov2dvW7OYA9rmQaBqhZqqn7-_Q2NXVl92qb8lrhy4QNwHKtOHHjBCDm8A6IaballwwYaAODjJgY9dGk27w_hI5JBnPah3d5Omm05RfIbiYQRXugNnC30pP0gDU8w'
        };
        const mockToken = 'mock-jwt-token-carlos-andrade';
        localStorage.setItem('ecu_crm_user', JSON.stringify(legacyUser));
        localStorage.setItem('ecu_crm_token', mockToken);
        onLoginSuccess(legacyUser, mockToken);
      } else {
        setErrorMessage('Credenciales inválidas o error de conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMessage('');

    if (!recoveryEmail.trim() || !recoveryPin.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setRecoveryError('Complete todos los campos de recuperación.');
      return;
    }

    if (recoveryPin !== '1212') {
      setRecoveryError('PIN de seguridad incorrecto.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail,
          pin: recoveryPin,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryMessage('¡Contraseña restablecida con éxito! Ya puede iniciar sesión.');
        setRecoveryEmail('');
        setRecoveryPin('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setRecoveryMode(false);
          setRecoveryMessage('');
        }, 2500);
      } else {
        setRecoveryError(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (err) {
      setRecoveryError('Error de red al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Premium Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / Header Area */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl font-display shadow-lg shadow-blue-500/20 border border-blue-400/25 mb-4 animate-bounce-slow">
            S
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
            SID<span className="text-blue-500">-</span>CRM
          </h1>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Suite Comercial y Facturación Electrónica SRI
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/55 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          {!recoveryMode ? (
            <>
              <h2 className="text-xl font-bold text-slate-100 mb-6">Iniciar Sesión</h2>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg flex items-start gap-2 mb-6">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Usuario o Correo
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sirek o usuario@sidcrm.com.ec"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setRecoveryMode(true)}
                      className="text-xs text-blue-400 hover:underline cursor-pointer"
                    >
                      ¿Olvidó contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 rounded-lg pl-10 pr-12 py-2.5 text-sm outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
                    />
                    <span>Recordar sesión en este equipo</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg py-3 text-sm transition-all shadow-lg shadow-blue-500/15 cursor-pointer mt-2 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Ingresando al sistema...</span>
                    </>
                  ) : (
                    <span>Ingresar</span>
                  )}
                </button>

              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-100 mb-4">Recuperar Contraseña</h2>
              <p className="text-[11px] text-slate-400 mb-6">Restablezca sus credenciales ingresando su usuario y el PIN de seguridad de 4 dígitos.</p>

              {recoveryError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg flex items-start gap-2 mb-6">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoveryMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-lg flex items-start gap-2 mb-6">
                  <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                  <span>{recoveryMessage}</span>
                </div>
              )}

              <form onSubmit={handleRecoverPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Usuario o Correo</label>
                  <input
                    type="text"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="sirek o correo@ejemplo.com"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">PIN de Seguridad (4 dígitos)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={recoveryPin}
                    onChange={(e) => setRecoveryPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 rounded-lg px-3 py-2 text-sm outline-none font-mono text-center tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg py-2.5 text-sm transition-all cursor-pointer shadow-md"
                  >
                    {isLoading ? 'Restableciendo...' : 'Actualizar Contraseña'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMode(false);
                      setRecoveryError('');
                      setRecoveryMessage('');
                    }}
                    className="w-full border border-slate-800 hover:bg-slate-800/40 text-slate-400 rounded-lg py-2 text-xs transition-all cursor-pointer"
                  >
                    Volver al Login
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

        {/* Footer Credit */}
        <p className="text-center text-xs text-slate-600 mt-8">
          SID-CRM • Pichincha y Guayas, Ecuador<br />
          Soporte Técnico Autorizado por SRI
        </p>

      </div>
    </div>
  );
}
