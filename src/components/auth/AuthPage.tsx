import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Layers, 
  Lock, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Warehouse Operator');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await StorageService.login(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await StorageService.register({
        fullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole,
      });

      if (res.success && res.user) {
        alert(`Account created successfully as ${res.user.role}!`);
        onAuthSuccess(res.user);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login helper
  const quickLogin = async (username: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await StorageService.login(username, pass);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setError(res.error || 'Quick login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background radial accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Brand Header */}
        <div className="bg-slate-950 p-7 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">StockPulse WMS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Warehouse & Inventory Management with Role Permissions
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-3.5 transition-all text-center ${
              tab === 'login'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In to System
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-3.5 transition-all text-center ${
              tab === 'register'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register New User
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. admin or operator"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo 1-Click Logins */}
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Quick Demo Accounts
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => quickLogin('admin', 'admin123')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-center transition-colors group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 block">Admin</span>
                    <span className="text-[9px] text-slate-400 block">All Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickLogin('manager', 'manager123')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-center transition-colors group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 block">Manager</span>
                    <span className="text-[9px] text-slate-400 block">Operations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickLogin('operator', 'operator123')}
                    className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-center transition-colors group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 block">Operator</span>
                    <span className="text-[9px] text-slate-400 block">GRN & TOG</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. jdoe"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jdoe@company.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requested Role *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                >
                  <option value="Warehouse Operator">Warehouse Operator (Receive & Transfer)</option>
                  <option value="Manager">Warehouse Manager (Inventory & Reports)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                  <option value="Admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Creating Account...' : 'Register User'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
