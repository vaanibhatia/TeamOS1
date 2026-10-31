import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  GraduationCap,
  ArrowLeftRight,
  LogOut,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { mockUsers, mockNotifications } from '../api/mockData';

export default function TopBar({
  currentRole = 'manager',
  currentUser: passedUser = null,
  currentView = 'home',
  onSwitchRole = () => {},
  onLogout = () => {},
  onSelectMeeting = () => {},
  selectedMeetingId = 'meet_001',
  meetings = [],
  onOpenMobileSidebar = () => {},
  searchQuery = '',
  onSearchChange = () => {},
}) {
  const currentUser = passedUser || mockUsers[currentRole] || mockUsers.manager;
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMeetingDropdownOpen, setIsMeetingDropdownOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const meetingDropdownRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (meetingDropdownRef.current && !meetingDropdownRef.current.contains(event.target)) {
        setIsMeetingDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const activeMeeting = meetings.find((m) => m._id === selectedMeetingId) || meetings[0];

  const viewTitles = {
    home: currentRole === 'developer' ? 'Developer Board • System Architecture & Sprint' : 'Workspace Overview',
    meetings: 'All Meetings',
    'meeting-details': activeMeeting ? activeMeeting.title : 'Meeting Details',
    'manager-approvals': 'Needs Approval (AI Suggestions)',
    'manager-pending': 'Pending Deliverables',
    'manager-completed': 'Completed Deliverables',
    'dependency-graph': 'Task Dependency Graph',
    'developer-dashboard': 'Developer Board • Architecture & Engineering Sprint',
    'dev-graph': 'Project & Architecture Dependency Graph',
    'dev-kanban': 'Engineering Code Task Board',
    'dev-blockers': 'Technical Blocker & Ambiguity Radar',
    'employee-pending': 'My Pending Tasks',
    'employee-in-progress': 'In Progress Tasks',
    'employee-completed': 'Completed Tasks',
    'employee-blocked': 'Blocked Tasks',
    'student-tasks': 'My Personal Study Tasks',
    'student-completed': 'Completed Study Tasks',
    'student-checklist': 'Architecture Study Checklist',
    'role-workflow':
      currentRole === 'manager'
        ? 'Triage & Approvals Queue'
        : currentRole === 'employee'
        ? 'My Action Items & Deliverables'
        : 'Architecture Study Checklist',
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="font-extrabold text-surface-900 dark:text-white">
              Syncora
            </span>
            <span className="text-surface-300 dark:text-surface-600">/</span>
            <span className="font-semibold text-surface-600 dark:text-surface-300 capitalize">
              {currentRole} Workspace
            </span>
            <span className="text-surface-300 dark:text-surface-600">/</span>
            <span className="text-surface-500 dark:text-surface-400 font-medium truncate max-w-[220px]">
              {viewTitles[currentView] || 'Overview'}
            </span>
          </nav>
        </div>

        {/* Center: Search & Active Meeting Selector */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search meetings, decisions, or transcripts..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Meeting Selector, Notifications & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Active Meeting Dropdown */}
          <div className="relative" ref={meetingDropdownRef}>
            <button
              type="button"
              onClick={() => setIsMeetingDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 hover:bg-surface-100 dark:bg-surface-800/60 dark:hover:bg-surface-800 text-xs font-semibold text-surface-700 dark:text-surface-200 transition-colors shadow-xs"
              title="Active Meeting"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {activeMeeting?.title || 'Select Meeting'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-surface-400 transition-transform ${
                  isMeetingDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMeetingDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-surface-100 dark:border-surface-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                    Switch Active Meeting
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {meetings.map((m) => {
                    const isSelected = m._id === selectedMeetingId;
                    return (
                      <div
                        key={m._id}
                        onClick={() => {
                          onSelectMeeting(m._id);
                          setIsMeetingDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 flex items-start justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                            : 'hover:bg-surface-50 dark:hover:bg-surface-800/60 text-surface-700 dark:text-surface-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{m.title}</p>
                          <p className="text-[10px] text-surface-400 mt-0.5">
                            {m.duration} • {m.tasks?.length || 0} tasks • {m.decisions?.length || 0} decisions
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Menu */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="relative p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-surface-900 animate-pulse" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2.5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-surface-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onSelectMeeting(notif.meetingId);
                        setIsNotificationOpen(false);
                      }}
                      className={`p-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-surface-800 dark:text-surface-200">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-surface-400 whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Name & Email Display on Navbar */}
          <div className="hidden md:flex items-center gap-2.5 pl-2">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.color || 'from-indigo-600 to-violet-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0`}>
              {currentUser.avatar || 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-surface-900 dark:text-white leading-tight truncate max-w-[130px] lg:max-w-[160px] capitalize">
                {currentUser.name || currentUser.email?.split('@')[0] || `${currentRole} User`}
              </span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400 leading-tight truncate max-w-[130px] lg:max-w-[160px]">
                {currentUser.email || `${currentRole}@syncora.io`}
              </span>
            </div>
          </div>

          {/* Direct Navbar Logout Button */}
          <button
            type="button"
            onClick={onLogout || onSwitchRole}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 transition-colors cursor-pointer shadow-xs"
            title="Log out and return to workspace selection"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Profile Menu (Mobile dropdown) */}
          <div className="relative md:hidden" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none"
              aria-label="User profile menu"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.color || 'from-indigo-600 to-violet-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                {currentUser.avatar || 'U'}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-surface-400 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* User info */}
                <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                  <p className="text-xs font-bold text-surface-900 dark:text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">
                    {currentUser.email}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 capitalize">
                    <span>{currentRole} Role</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchRole();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/80 transition-colors text-left"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-brand-500" />
                    <span>Switch Workspace Role</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      (onLogout || onSwitchRole)();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

