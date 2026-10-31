import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import SyncoraLogo from '../components/SyncoraLogo';

export const ROLE_CONFIG = {
  manager: {
    id: 'manager',
    title: 'Engineering Manager',
    badge: 'Leadership & Triage',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    demoEmail: 'manager@syncora.io',
    demoPassword: 'manager123',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25',
  },
  employee: {
    id: 'employee',
    title: 'Team Member / Employee',
    badge: 'Execution & Delivery',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    demoEmail: 'employee@syncora.io',
    demoPassword: 'employee123',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
  },
  student: {
    id: 'student',
    title: 'Student / Observer',
    badge: 'Learning & Architecture',
    badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    demoEmail: 'student@syncora.io',
    demoPassword: 'student123',
    buttonClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25',
  },
  developer: {
    id: 'developer',
    title: 'Developer / Tech Lead',
    badge: 'System & Architecture',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    demoEmail: 'developer@syncora.io',
    demoPassword: 'developer123',
    buttonClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25',
  },
  event_manager: {
    id: 'event_manager',
    title: 'Event Manager / Lead Organizer',
    badge: 'Planning & Leadership',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    demoEmail: 'elena.rostova@syncora.events',
    demoPassword: 'eventlead123',
    buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25',
  },
  event_member: {
    id: 'event_member',
    title: 'Event Team Member / Volunteer',
    badge: 'On-Ground Execution',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    demoEmail: 'marcus.vance@syncora.events',
    demoPassword: 'volunteer123',
    buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25',
  },
};

export default function LoginPage({
  roleId = 'manager',
  onBack = () => { },
  onLoginSuccess = () => { },
}) {
  const role = ROLE_CONFIG[roleId] || ROLE_CONFIG.manager;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Reset form whenever role changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setIsAutoFilled(false);
    setShowPassword(false);
  }, [roleId]);

  // 1-Click Demo Fill action
  const handleDemoFill = () => {
    setEmail(role.demoEmail);
    setPassword(role.demoPassword);
    setError('');
    setIsAutoFilled(true);
  };

  // Submit Handler with Backend-Ready Structure
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Frontend simulation ready for backend swap:
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim(), password: password.trim(), role: role.id })
      // });
      // const data = await res.json();

      // Simulated network roundtrip latency
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Persist user session to localStorage as requested:
      localStorage.setItem(
        'syncora_user',
        JSON.stringify({ role: role.id, email: email.trim() })
      );

      // Trigger navigation to the role-specific dashboard
      onLoginSuccess({ role: role.id, email: email.trim() });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col justify-between p-4 sm:p-6 lg:p-12 transition-colors">

      {/* Top Header with Back Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Workspace Selection</span>
        </button>

        <div className="flex items-center gap-2">
          <SyncoraLogo className="w-8 h-8" />
          <span className="font-extrabold text-base tracking-tight text-surface-900 dark:text-white">
            Syncora
          </span>
          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            v1.0
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="relative rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-7 sm:p-9 space-y-6 animate-in fade-in zoom-in-95 duration-150">

          {/* Card Header: Syncora Logo, Role Name & Badge */}
          <div className="text-center space-y-2.5">
            <div className="flex justify-center mb-3">
              <SyncoraLogo className="w-12 h-12" />
            </div>

            <div className="inline-flex items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${role.badgeColor}`}>
                {role.badge}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
              {role.title} Login
            </h1>

            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto leading-relaxed">
              Sign in to access your role-specific meeting intelligence and deliverables.
            </p>
          </div>

          {/* 1-Click Demo Fill Action Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-violet-500/10 border border-brand-500/20 dark:border-brand-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo Credentials</span>
              </div>
              <span className="font-mono text-[11px] text-surface-400">
                Pass: {role.demoPassword}
              </span>
            </div>

            <p className="text-[11px] text-surface-600 dark:text-surface-400">
              Auto-fill standard test credentials for <strong className="text-surface-800 dark:text-surface-200">{role.demoEmail}</strong>.
            </p>

            <button
              type="button"
              onClick={handleDemoFill}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${isAutoFilled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-surface-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/60'
                }`}
            >
              {isAutoFilled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Credentials Filled ({role.demoEmail})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Demo Fill</span>
                </>
              )}
            </button>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">

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
                  placeholder={role.demoEmail}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all font-medium"
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
                  Demo: <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">{role.demoPassword}</span>
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
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center text-[11px] text-surface-400 border-t border-surface-100 dark:border-surface-800 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ready for backend integration (`/api/auth/login`)</span>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-surface-700 dark:text-surface-300">Syncora Platform</span>
        </div>
      </footer>

    </div>
  );
}
