import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Terminal,
  X,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Ticket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SyncoraLogo from './SyncoraLogo';

export default function RoleSelection({ onSelectRole = () => {}, onBack = null }) {
  // Modal state: null | 'corporate' | 'event'
  const [activeModal, setActiveModal] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  // 4 Main Workspace Tracks
  const mainWorkspaces = [
    {
      id: 'corporate',
      title: 'Corporate Management',
      badge: 'Enterprise & Operations',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Building2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      description:
        'Unified organizational portal for strategic triage, cross-functional execution, project commitments, and evidence-backed deliverables.',
      buttonText: 'Select Corporate Role',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20',
      action: () => setActiveModal('corporate'),
    },
    {
      id: 'event',
      title: 'Event Management',
      badge: 'Operations & Logistics',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: CalendarDays,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description:
        'End-to-end event planning, budget tracking, vendor coordination, committee task triage, and timeline management.',
      buttonText: 'Select Event Role',
      buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20',
      action: () => setActiveModal('event'),
    },
    {
      id: 'student',
      title: 'Student / Observer',
      badge: 'Learning & Architecture',
      badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      icon: GraduationCap,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      description:
        'Study engineering team discussions, understand architectural trade-offs, and track self-study action items and key takeaways.',
      buttonText: 'Enter Workspace',
      buttonClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20',
      action: () => onSelectRole('student'),
    },
    {
      id: 'developer',
      title: 'Developer / Tech Lead',
      badge: 'System & Architecture',
      badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      icon: Terminal,
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      description:
        'Review technical architecture, track code-level dependencies, and inspect engineering blockers directly from meeting discussions.',
      buttonText: 'Enter Workspace',
      buttonClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20',
      action: () => onSelectRole('developer'),
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col justify-between p-4 sm:p-6 lg:p-12 transition-colors relative">
      
      {/* Top Brand Bar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <SyncoraLogo className="w-10 h-10" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-surface-900 dark:text-white">
                Syncora
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                v1.0
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              AI-Powered Meeting Management & Intelligence Platform
            </p>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-surface-200 dark:border-surface-700 cursor-pointer"
          >
            <span>&larr;</span>
            <span>Back to Welcome</span>
          </button>
        )}
      </header>

      {/* Main Selection Area */}
      <main className="max-w-7xl w-full mx-auto my-auto py-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Choose Your Workspace
          </h1>
          <p className="mt-3 text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
            Syncora tailors meeting intelligence, task triage, and evidence tracking to your role. Select an enterprise workspace to begin.
          </p>
        </div>

        {/* 4 Workspace Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mainWorkspaces.map((workspace) => {
            const IconComponent = workspace.icon;
            return (
              <div
                key={workspace.id}
                onClick={workspace.action}
                className="group relative bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 cursor-pointer overflow-hidden"
              >
                {/* Accent top gradient on hover */}
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Header: Icon + Role Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3.5 rounded-2xl border ${workspace.iconBg} shadow-xs transition-transform duration-300 group-hover:scale-105`}>
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full border ${workspace.badgeColor}`}>
                      {workspace.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {workspace.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                    {workspace.description}
                  </p>
                </div>

                {/* Card Button */}
                <div className="mt-8 pt-4 border-t border-surface-100 dark:border-surface-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      workspace.action();
                    }}
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md group-hover:gap-3 cursor-pointer ${workspace.buttonClass}`}
                  >
                    <span>{workspace.buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* SUB-ROLE SELECTION MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-2xl bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle Ambient Decorative Header Glow */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-2xl pointer-events-none ${
                  activeModal === 'corporate'
                    ? 'bg-indigo-500/10 dark:bg-indigo-500/15'
                    : 'bg-amber-500/10 dark:bg-amber-500/15'
                }`}
              />

              {/* Modal Top Bar */}
              <div className="relative flex items-start justify-between pb-5 border-b border-surface-100 dark:border-surface-800">
                <div className="pr-6">
                  {activeModal === 'corporate' ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Corporate Management</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                        Select Corporate Perspective
                      </h2>
                      <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
                        Choose whether you are operating from the executive management level or executing as an individual contributor.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold mb-2">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Event Management</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                        Select Event Perspective
                      </h2>
                      <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
                        Choose whether you are orchestrating the overall event lifecycle or coordinating on-ground execution.
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-xl text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Close perspective selector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-Role Cards */}
              <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {activeModal === 'corporate' ? (
                  <>
                    {/* Option A: Engineering Manager */}
                    <div
                      onClick={() => {
                        setActiveModal(null);
                        onSelectRole('manager');
                      }}
                      className="group/card relative p-5 sm:p-6 rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-50/60 dark:bg-surface-800/40 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover/card:scale-105 transition-transform">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Leadership & Triage
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">
                          Engineering Manager
                        </h3>
                        <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                          Triage AI-extracted commitments, approve deadlines, assign owners, and verify team deliverables.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-200/60 dark:border-surface-700/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal(null);
                            onSelectRole('manager');
                          }}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all group-hover/card:gap-2.5 cursor-pointer"
                        >
                          <span>Enter as Manager</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Option B: Team Member / Employee */}
                    <div
                      onClick={() => {
                        setActiveModal(null);
                        onSelectRole('employee');
                      }}
                      className="group/card relative p-5 sm:p-6 rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-50/60 dark:bg-surface-800/40 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover/card:scale-105 transition-transform">
                            <Users className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Execution & Delivery
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors">
                          Team Member / Employee
                        </h3>
                        <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                          Access personalized action items, inspect evidence, update delivery status, and log blockers.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-200/60 dark:border-surface-700/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal(null);
                            onSelectRole('employee');
                          }}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all group-hover/card:gap-2.5 cursor-pointer"
                        >
                          <span>Enter as Employee</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Option A: Event Manager / Lead Organizer */}
                    <div
                      onClick={() => {
                        setActiveModal(null);
                        onSelectRole('event_manager');
                      }}
                      className="group/card relative p-5 sm:p-6 rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-50/60 dark:bg-surface-800/40 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover/card:scale-105 transition-transform">
                            <CalendarDays className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Planning & Leadership
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover/card:text-amber-600 dark:group-hover/card:text-amber-400 transition-colors">
                          Event Manager / Lead Organizer
                        </h3>
                        <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                          Approve event agendas, track sponsor & vendor commitments, assign committee duties, and verify run-of-show deliverables.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-200/60 dark:border-surface-700/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal(null);
                            onSelectRole('event_manager');
                          }}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all group-hover/card:gap-2.5 cursor-pointer"
                        >
                          <span>Enter as Event Manager</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Option B: Event Team Member / Volunteer */}
                    <div
                      onClick={() => {
                        setActiveModal(null);
                        onSelectRole('event_member');
                      }}
                      className="group/card relative p-5 sm:p-6 rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-50/60 dark:bg-surface-800/40 hover:border-rose-500 dark:hover:border-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover/card:scale-105 transition-transform">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            On-Ground Execution
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover/card:text-rose-600 dark:group-hover/card:text-rose-400 transition-colors">
                          Event Team Member / Volunteer
                        </h3>
                        <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                          View assigned checklist items, logistics schedules, volunteer duties, and report blockers in real-time.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-200/60 dark:border-surface-700/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal(null);
                            onSelectRole('event_member');
                          }}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all group-hover/card:gap-2.5 cursor-pointer"
                        >
                          <span>Enter as Team Member</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Cancel Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                >
                  Cancel & Return to Workspaces
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto py-4 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-surface-700 dark:text-surface-300">Syncora Platform</span>
        </div>
      </footer>
    </div>
  );
}
