import React, { useState } from 'react';
import { User, UserRole, PermissionKey, ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../../types';
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
  EyeOff,
  KeyRound,
  ChevronDown,
  ChevronUp
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
  const [regSecurityKey, setRegSecurityKey] = useState('');
  const [regPermissions, setRegPermissions] = useState<PermissionKey[]>(
    ROLE_DEFAULT_PERMISSIONS['Warehouse Operator']
  );
  const [showPermissionsConfig, setShowPermissionsConfig] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRegRole(newRole);
    setRegPermissions(ROLE_DEFAULT_PERMISSIONS[newRole]);
  };

  const togglePermission = (key: PermissionKey) => {
    setRegPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

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

    // If registering for Admin/Manager, check security authorization code
    const isElevated = regRole === 'Admin' || regRole === 'Manager';
    if (isElevated && !regSecurityKey.trim()) {
      setError('Admin authorization key is required for Admin/Manager registration. (Code: ADMIN2026)');
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
        permissions: regPermissions,
        securityKey: regSecurityKey,
      });

      if (res.success && res.user) {
        alert(`Account created successfully with ${res.user.permissions.length} module permissions!`);
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

  const isElevatedRole = regRole === 'Admin' || regRole === 'Manager';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Brand Header */}
        <div className="bg-slate-950 p-7 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">StockPulse WMS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Warehouse Inventory Management & Permission Control System
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
            Sign In
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
            Register User
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
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
                    placeholder="Enter username or email"
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
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 pt-3"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
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
                    placeholder="e.g. sconnor"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sconnor@company.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>
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
                    placeholder="Min 6 characters"
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
                    placeholder="Re-enter password"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Role & Permission Assignment Control */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Permission & Role Control</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {regPermissions.length} of {ALL_PERMISSIONS.length} Permissions
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assigned Security Role *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-blue-500"
                  >
                    <option value="Warehouse Operator">Warehouse Operator (Receive GRN & Outward TOG)</option>
                    <option value="Viewer">Viewer (Read-only catalog & reports)</option>
                    <option value="Manager">Warehouse Manager (Operations, Stock & Reports)</option>
                    <option value="Admin">System Administrator (Full access & User admin)</option>
                  </select>
                </div>

                {/* If Admin/Manager, require Security Authorization Passcode */}
                {isElevatedRole && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Admin Security Key Required *</span>
                    </div>
                    <p className="text-[10px] text-amber-700">
                      Elevated roles grant administrative permissions and require security authorization. (Default key: <span className="font-mono font-bold">ADMIN2026</span>)
                    </p>
                    <input
                      type="password"
                      required
                      value={regSecurityKey}
                      onChange={(e) => setRegSecurityKey(e.target.value)}
                      placeholder="Enter Authorization Security Passcode"
                      className="w-full text-xs font-mono bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-amber-500 mt-1"
                    />
                  </div>
                )}

                {/* Interactive Permissions Checklist Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPermissionsConfig(!showPermissionsConfig)}
                    className="w-full flex items-center justify-between text-xs text-blue-600 hover:text-blue-700 font-semibold py-1"
                  >
                    <span>
                      {showPermissionsConfig ? 'Hide Granular Permissions Matrix' : 'Customize Granted Module Permissions'}
                    </span>
                    {showPermissionsConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showPermissionsConfig && (
                    <div className="mt-2 border border-slate-200 rounded-xl p-2.5 bg-white max-h-48 overflow-y-auto space-y-1.5">
                      {ALL_PERMISSIONS.map((perm) => {
                        const isChecked = regPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                              isChecked ? 'bg-blue-50/70 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.key)}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div className="leading-tight">
                              <span className="block text-[11px] font-semibold">{perm.label}</span>
                              <span className="block text-[9px] text-slate-400">{perm.group}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
