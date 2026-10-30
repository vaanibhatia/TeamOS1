import React from 'react';
import {
  Briefcase,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  UserCheck,
} from 'lucide-react';
import SyncoraLogo from './SyncoraLogo';
import { mockUsers, mockEmployees } from '../api/mockData';

export default function RoleSelection({ onSelectRole = () => {} }) {
  const roles = [
    {
      id: 'manager',
      title: 'Engineering Manager',
      badge: 'Leadership & Triage',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Briefcase,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      user: mockUsers.manager,
      description:
        'Triage AI-extracted commitments, approve deadlines, assign owners, and verify team deliverables against meeting evidence.',
      features: [
        'Pending task approvals queue',
        'Decision confidence metrics',
        'Assignee delegation & deadline controls',
        'Direct evidence verification drawer',
      ],
      buttonText: 'Enter Manager Workspace',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20',
    },
    {
      id: 'employee',
      title: 'Team Member / Employee',
      badge: 'Execution & Delivery',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      user: mockUsers.employee,
      description:
        'Access personalized action items, inspect spoken evidence, update delivery status, and log blockers directly to the team lead.',
      features: [
        'Personal action items list',
        'One-click transcript evidence jumping',
        'Real-time work status transitions',
        'Blocker & clarification notes sync',
      ],
      buttonText: 'Enter Employee Workspace',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
    },
    {
      id: 'student',
      title: 'Student / Observer',
      badge: 'Learning & Architecture',
      badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      icon: GraduationCap,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      user: mockUsers.student,
      description:
        'Study engineering team discussions, understand architectural trade-offs, and track self-study action items and key takeaways.',
      features: [
        'Architectural decision breakdowns',
        'Unresolved questions & context',
        'Interactive learning checklist',
        'Full raw timestamped transcript stream',
      ],
      buttonText: 'Enter Student Workspace',
      buttonClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col justify-between p-4 sm:p-6 lg:p-12 transition-colors">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
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

        <div className="hidden sm:flex items-center gap-2 text-xs text-surface-500 bg-white dark:bg-surface-900 px-3 py-1.5 rounded-full border border-surface-200 dark:border-surface-800 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Verifiable Evidence Tracing</span>
        </div>
      </div>

      {/* Main Selection Area */}
      <main className="max-w-6xl w-full mx-auto my-auto py-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Your Perspective</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Choose Your Workspace
          </h1>
          <p className="mt-3 text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
            Syncora tailors meeting intelligence, task triage, and evidence tracking to your role. Select a workspace to begin.
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="group relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between p-6 sm:p-7 cursor-pointer"
              >
                {/* Accent top gradient on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Header: Icon + Role Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl border ${role.iconBg} shadow-xs`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${role.badgeColor}`}>
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed min-h-[56px]">
                    {role.description}
                  </p>

                  {/* Mock User Identity Chip */}
                  <div className="mt-4 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60 flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${role.user.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                      {role.user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-surface-800 dark:text-surface-200 truncate">
                        {role.user.name}
                      </div>
                      <div className="text-[11px] text-surface-500 dark:text-surface-400 truncate">
                        {role.user.title}
                      </div>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800/80 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                      Key Capabilities:
                    </div>
                    {role.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Button */}
                <div className="mt-6 pt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRole(role.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md group-hover:gap-3 ${role.buttonClass}`}
                  >
                    <span>{role.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-surface-700 dark:text-surface-300">Syncora Platform</span>
          <span>•</span>
          <span>Technical Contract v1.0 Compliant</span>
        </div>
        <div>Pure JavaScript • React 18 • Vite • Tailwind CSS</div>
      </footer>
    </div>
  );
}

