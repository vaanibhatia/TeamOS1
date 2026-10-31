import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import SyncoraLogo from './SyncoraLogo';

/**
 * Demo credentials specified for the 3 Syncora workspace roles
 */
export const DEMO_CREDENTIALS = {
  manager: {
    email: 'manager@syncora.io',
    password: 'manager123',
    role: 'manager',
    roleTitle: 'Engineering Manager',
    badge: 'Leadership & Triage',
  },
  employee: {
    email: 'employee@syncora.io',
    password: 'employee123',
    role: 'employee',
    roleTitle: 'Team Member / Employee',
    badge: 'Execution & Delivery',
  },
  student: {
    email: 'student@syncora.io',
    password: 'student123',
    role: 'student',
    roleTitle: 'Student / Observer',
    badge: 'Learning & Architecture',
  },
};

export default function LoginModal({
  isOpen = false,
  onClose = () => {},
  role = null, // { id, title, badge, badgeColor, icon, iconBg, user, buttonClass }
  onLoginSuccess = () => {},
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const roleId = role?.id || 'manager';
  const demoCreds = DEMO_CREDENTIALS[roleId] || DEMO_CREDENTIALS.manager;

  // Reset form when modal opens or role changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
      setIsAutoFilled(false);
      setShowPassword(false);
    }
  }, [isOpen, roleId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !role) return null;

  // 1-Click Demo Login auto-fill
  const handleAutoFillDemo = () => {
    setEmail(demoCreds.email);
    setPassword(demoCreds.password);
    setError('');
    setIsAutoFilled(true);
  };

  /**
   * Backend-ready login handler
   * Designed for direct plug-and-play with real authentication backend.
   */
  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // =========================================================================
      // TODO: Replace with real backend API authentication call, for example:
      //
      // const response = await axios.post('/api/auth/login', {
      //   email: email.trim(),
      //   password: password.trim(),
      //   role: role.id,
      // });
      // const { token, user } = response.data;
      // =========================================================================

      // Simulated network latency for realistic feedback
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Client validation against demo credentials or valid format
      const isDemoMatch =
        email.trim().toLowerCase() === demoCreds.email.toLowerCase() &&
        password === demoCreds.password;

      // Allow demo credentials or any valid email structure for testing
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!isDemoMatch && !isValidEmail) {
        throw new Error('Please enter a valid email address.');
      }

      // Construct session object
      const token = `syncora_jwt_${role.id}_${Date.now()}`;
      const authenticatedUser = {
        ...role.user,
        email: email.trim(),
      };

      const session = {
        token,
        role: role.id,
        user: authenticatedUser,
        loggedInAt: new Date().toISOString(),
      };

      // Store authentication state in localStorage
      localStorage.setItem('syncora_auth', JSON.stringify(session));
      localStorage.setItem('syncora_token', token);

      // Trigger success callback to navigate to dashboard
      onLoginSuccess(session);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = role.icon;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Top Bar: Close button & Syncora logo badge */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <SyncoraLogo className="w-7 h-7" />
              <span className="font-extrabold text-sm tracking-tight text-surface-900 dark:text-white">
                Syncora <span className="text-xs font-semibold text-surface-400">Auth</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Header Banner */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Role Icon */}
                <div className={`p-2.5 rounded-xl border ${role.iconBg} shadow-xs`}>
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                </div>

                {/* User Avatar */}
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${role.user.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                  {role.user.avatar}
                </div>

                <div>
                  <h2
                    id="login-modal-title"
                    className="text-lg font-bold text-surface-900 dark:text-white leading-tight"
                  >
                    {role.title}
                  </h2>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {role.user.name} • {role.user.title?.split(' ')[0] || 'User'}
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                {role.badge}
              </span>
            </div>
          </div>

          {/* 1-Click Demo Login Quick Access Card */}
          <div className="rounded-2xl p-3.5 bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-violet-500/10 border border-brand-500/20 dark:border-brand-500/30">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Sign-In</span>
              </div>
              <span className="text-[10px] font-mono text-surface-400">
                Pass: {demoCreds.password}
              </span>
            </div>

            <p className="text-[11px] text-surface-600 dark:text-surface-400 mb-2.5 leading-relaxed">
              Use pre-configured demo credentials for the <span className="font-semibold">{role.title}</span> workspace.
            </p>

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isAutoFilled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-surface-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 shadow-xs'
              }`}
            >
              {isAutoFilled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Credentials Filled ({demoCreds.email})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Demo Login ({demoCreds.email})</span>
                </>
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={demoCreds.email}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300">
                  Password
                </label>
                <span className="text-[10px] text-surface-400">
                  Demo: <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">{demoCreds.password}</span>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${role.buttonClass}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="pt-2 text-center text-[11px] text-surface-400 border-t border-surface-100 dark:border-surface-800 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Client session managed in localStorage • Backend-ready API architecture</span>
          </div>

        </div>
      </div>
    </div>
  );
}

