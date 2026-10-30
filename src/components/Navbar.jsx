import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ChevronDown,
  Briefcase,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Command,
} from 'lucide-react';

export default function Navbar({
  currentRole = 'manager',
  onRoleChange = () => {},
  meeting = null,
}) {
  const [isMeetingDropdownOpen, setIsMeetingDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMeetingDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    {
      id: 'manager',
      label: 'Manager View',
      icon: Briefcase,
      badge: 'Admin',
      description: 'Approve commitments, monitor deliverables & assignees',
    },
    {
      id: 'employee',
      label: 'Employee View',
      icon: Users,
      badge: 'Workspace',
      description: 'My tasks, action items, deadlines & evidence',
    },
    {
      id: 'student',
      label: 'Student View',
      icon: GraduationCap,
      badge: 'Observer',
      description: 'Review architecture decisions, meeting notes & takeaways',
    },
  ];

  const meetingTitle = meeting?.title || 'Sprint 1 Architecture & Milestones';
  const meetingStatus = meeting?.status || 'completed';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo & Workspace Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-bold tracking-tight">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-surface-900 dark:text-white">
                    Team<span className="text-brand-500">OS</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] text-surface-500 dark:text-surface-400 font-medium">
                  Autonomous Engineering Hub
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-6 w-px bg-surface-200 dark:bg-surface-800" />

            {/* Meeting Dropdown Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMeetingDropdownOpen((prev) => !prev)}
                className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 hover:bg-surface-100 dark:bg-surface-800/60 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-200 text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                aria-haspopup="true"
                aria-expanded={isMeetingDropdownOpen}
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-surface-400" />
                  <span className="truncate max-w-[210px] lg:max-w-[260px] text-left font-medium">
                    {meetingTitle}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-200 transition-transform duration-200 ${
                    isMeetingDropdownOpen ? 'rotate-180 text-brand-500' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Panel */}
              {isMeetingDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                      Active Meeting
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                        {meetingTitle}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {meetingStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 text-xs text-surface-600 dark:text-surface-300">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Meeting ID:</span>
                      <code className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-brand-600 dark:text-brand-400">
                        {meeting?._id || 'meet_001'}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Timestamp:</span>
                      <span>Oct 29, 2026 • 10:00 UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Segments:</span>
                      <span className="font-medium text-surface-800 dark:text-surface-200">
                        {meeting?.transcriptSegments?.length || 3} recorded
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Action Items:</span>
                      <span className="font-medium text-surface-800 dark:text-surface-200">
                        {meeting?.tasks?.length || 2} detected
                      </span>
                    </div>
                  </div>

                  <div className="px-3 pt-2 pb-1 border-t border-surface-100 dark:border-surface-800 text-[11px] text-surface-400 flex items-center justify-between">
                    <span>Meeting synced from Audio Pipeline</span>
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center / Right: Mode Switcher Tabs */}
          <div className="flex items-center gap-3">
            <nav
              className="flex items-center p-1 rounded-xl bg-surface-100 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700/60 shadow-inner"
              aria-label="Mode Switcher Tabs"
            >
              {roles.map((role) => {
                const IconComponent = role.icon;
                const isActive = currentRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => onRoleChange(role.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 focus:outline-none ${
                      isActive
                        ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-sm border border-surface-200/80 dark:border-surface-700'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-surface-700/40'
                    }`}
                    title={role.description}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-brand-500' : 'text-surface-400'}`} />
                    <span>{role.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Status / Identity Indicator */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-surface-200 dark:border-surface-800 text-xs text-surface-500 dark:text-surface-400">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-surface-900 shadow">
                {currentRole === 'manager' ? 'M' : currentRole === 'employee' ? 'E' : 'S'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
