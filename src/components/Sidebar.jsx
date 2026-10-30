import React from 'react';
import {
  Layers,
  Home,
  Calendar,
  FileText,
  Briefcase,
  Users,
  GraduationCap,
  Sparkles,
  ArrowLeftRight,
  LogOut,
  ChevronRight,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  GitCommit,
  Bookmark,
} from 'lucide-react';
import { mockUsers } from '../api/mockData';

export default function Sidebar({
  currentRole = 'manager',
  currentView = 'home',
  onNavigate = () => {},
  onSwitchRole = () => {},
  meetingTitle = '',
  hasActiveMeeting = false,
  isOpen = true,
  onCloseMobile = () => {},
  onOpenAddTask = () => {},
  counts = {
    needsApproval: 0,
    managerPending: 0,
    employeePending: 0,
    employeeBlocked: 0,
    employeeInProgress: 0,
  },
}) {
  const currentUser = mockUsers[currentRole] || mockUsers.manager;

  const roleLabels = {
    manager: { label: 'Manager Workspace', badge: 'Leadership', icon: Briefcase, color: 'text-indigo-500' },
    employee: { label: 'Employee Workspace', badge: 'Execution', icon: Users, color: 'text-emerald-500' },
    student: { label: 'Student Workspace', badge: 'Observer', icon: GraduationCap, color: 'text-violet-500' },
  };

  const currentRoleInfo = roleLabels[currentRole] || roleLabels.manager;
  const RoleIcon = currentRoleInfo.icon;

  // Build role-specific sidebar items per specifications
  let navItems = [];

  if (currentRole === 'manager') {
    navItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'manager-pending', label: 'Pending Tasks', icon: Clock, count: counts.managerPending },
      { id: 'manager-completed', label: 'Completed Tasks', icon: CheckCircle2 },
      { id: 'manager-approvals', label: 'Needs Approval', icon: AlertCircle, count: counts.needsApproval, highlight: counts.needsApproval > 0 },
      { id: 'manager-add-task', label: 'Add Task', icon: PlusCircle, isAction: true },
      { id: 'dependency-graph', label: 'Dependency Graph', icon: GitCommit },
    ];
  } else if (currentRole === 'employee') {
    navItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'employee-pending', label: 'My Pending Tasks', icon: Clock, count: counts.employeePending },
      { id: 'employee-in-progress', label: 'In Progress', icon: CheckSquare, count: counts.employeeInProgress },
      { id: 'employee-completed', label: 'Completed Tasks', icon: CheckCircle2 },
      { id: 'employee-blocked', label: 'Blocked Tasks', icon: AlertTriangle, count: counts.employeeBlocked, danger: counts.employeeBlocked > 0 },
      { id: 'dependency-graph', label: 'Dependency Graph', icon: GitCommit },
    ];
  } else {
    // Student Workspace: strictly Home, My Tasks, Completed Tasks
    navItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'student-tasks', label: 'My Tasks', icon: Bookmark, count: counts.studentPending },
      { id: 'student-completed', label: 'Completed Tasks', icon: CheckCircle2, count: counts.studentCompleted },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div>
          {/* Brand Logo */}
          <div className="h-16 px-6 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-surface-900 dark:text-white">
                    Team<span className="text-brand-500">OS</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    v1.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Workspace Role Indicator Card */}
          <div className="p-4">
            <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-surface-900 dark:text-white">
                  <RoleIcon className={`w-3.5 h-3.5 ${currentRoleInfo.color}`} />
                  <span>{currentRoleInfo.label}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                  {currentRoleInfo.badge}
                </span>
              </div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">
                Signed in as {currentUser.name}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1" aria-label="Sidebar Navigation">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Workspace Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.isAction) {
                      onOpenAddTask();
                    } else {
                      onNavigate(item.id);
                    }
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80 shadow-xs'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                      }`}
                    />
                    <div className="text-left truncate">
                      <div className="truncate">{item.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          item.danger
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : item.highlight
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* General Shared Nav Section */}
            <div className="pt-3 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-surface-400 border-t border-surface-100 dark:border-surface-800 mt-2">
              Shared Archives
            </div>

            <button
              type="button"
              onClick={() => {
                onNavigate('meetings');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                currentView === 'meetings'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-surface-400" />
                <span>All Meetings</span>
              </div>
            </button>

            {hasActiveMeeting && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('meeting-details');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  currentView === 'meeting-details'
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-surface-400" />
                  <span className="truncate">{meetingTitle || 'Meeting Details'}</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-800 space-y-2">
          {/* User profile pill */}
          <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-800 flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${currentUser.color} text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0`}>
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-surface-900 dark:text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-surface-500 dark:text-surface-400 truncate">
                {currentUser.title}
              </div>
            </div>
          </div>

          {/* Switch Role Action */}
          <button
            type="button"
            onClick={onSwitchRole}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-surface-700 dark:text-surface-300 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
            title="Switch Workspace / Role"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-brand-500" />
            <span>Switch Role / Workspace</span>
          </button>
        </div>
      </aside>
    </>
  );
}
