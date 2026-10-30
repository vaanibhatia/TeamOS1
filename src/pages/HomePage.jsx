import React from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Briefcase,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  CheckSquare,
  FileText,
  ListTodo,
  Bookmark,
} from 'lucide-react';
import MeetingCard from '../components/MeetingCard';
import { mockUsers } from '../api/mockData';

/**
 * Returns dynamic time-of-day greeting (Good morning / afternoon / evening)
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage({
  currentRole = 'manager',
  meetings = [],
  tasks = [],
  activeEmployeeId = 'usr_001',
  studentTasks = [],
  studentMeetings = [],
  onSelectMeeting = () => {},
  onViewAllMeetings = () => {},
  onNavigateWorkflow = () => {},
  onNavigate = () => {},
}) {
  const currentUser = mockUsers[currentRole] || mockUsers.manager;
  const greeting = getGreeting();

  // Tasks dataset: use passed shared tasks or fallback to meetings
  const allTasks = tasks.length > 0 ? tasks : meetings.flatMap((m) => m.tasks || []);
  const allDecisions = meetings.flatMap((m) => m.decisions || []);
  const allQuestions = meetings.flatMap((m) => m.openQuestions || []);

  const pendingApprovalsCount = allTasks.filter((t) => t.approvalStatus === 'pending').length;
  const activePendingDeliverables = allTasks.filter((t) => t.approvalStatus === 'approved' && t.workStatus !== 'completed').length;
  const blockedCount = allTasks.filter((t) => t.approvalStatus === 'approved' && t.workStatus === 'blocked').length;

  // Employee specific metrics: only approved & assigned to this employee
  const employeeTasks = allTasks.filter(
    (t) => t.approvalStatus === 'approved' && t.assigneeId === activeEmployeeId
  );
  const employeeInProgress = employeeTasks.filter((t) => t.workStatus === 'in_progress').length;
  const employeeCompleted = employeeTasks.filter((t) => t.workStatus === 'completed').length;
  const employeeBlocked = employeeTasks.filter((t) => t.workStatus === 'blocked').length;

  // Student specific metrics
  const effectiveStudentMeetings =
    studentMeetings && studentMeetings.length > 0
      ? studentMeetings
      : (meetings || []).filter((m) => m.participants?.some((p) => p.id === 'usr_student'));
  const studentPendingCount = (studentTasks || []).filter((t) => t.status !== 'completed').length;
  const studentCompletedCount = (studentTasks || []).filter((t) => t.status === 'completed').length;

  // Recent meetings: if student role, only show student attended meetings
  const recentMeetings = currentRole === 'student'
    ? effectiveStudentMeetings.slice(0, 3)
    : meetings.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Personalized Greeting Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="capitalize">{currentRole} Workspace Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {currentUser.name.split(' ')[0]}! 👋
            </h1>

            <p className="mt-2 text-sm sm:text-base text-brand-100 max-w-2xl leading-relaxed">
              {currentRole === 'manager' &&
                'Review AI-extracted commitments, triage pending task deadlines, and keep team deliverables aligned with recorded evidence.'}
              {currentRole === 'employee' &&
                'Track your personal action items, verify deadlines against spoken audio quotes, and update task progress in real time.'}
              {currentRole === 'student' &&
                'Explore engineering architecture rationales, study unaddressed technical questions, and track your learning progress.'}
            </p>
          </div>

          {/* Quick Date Card / Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <div className="text-white/70 font-medium">Platform Status</div>
              <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>AI Pipeline Active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onViewAllMeetings}
              className="px-4 py-2.5 rounded-2xl bg-white text-surface-900 hover:bg-white/90 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>View All Meetings</span>
              <ArrowRight className="w-4 h-4 text-brand-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Role-Specific Statistics Cards */}
      <section aria-label="Role Statistics">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-surface-900 dark:text-white">
            Workspace Intelligence Metrics
          </h2>
          <span className="text-xs text-surface-500">
            Real-time sync from processed transcripts
          </span>
        </div>

        {/* Manager Stats */}
        {currentRole === 'manager' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onViewAllMeetings()}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-brand-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Total Meetings</span>
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-surface-900 dark:text-white">{meetings.length}</div>
              <p className="mt-1 text-xs text-surface-500">Click to view archives</p>
            </div>

            <div
              onClick={() => onNavigate('manager-approvals')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Pending Approvals</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingApprovalsCount}</div>
              <p className="mt-1 text-xs text-surface-500">AI suggestions requiring review</p>
            </div>

            <div
              onClick={() => onNavigate('manager-pending')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Active Deliverables</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{activePendingDeliverables}</div>
              <p className="mt-1 text-xs text-surface-500">
                {blockedCount > 0 ? `${blockedCount} blocked deliverable` : 'Team tasks in flight'}
              </p>
            </div>

            <div
              onClick={() => onNavigate('dependency-graph')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Dependency Graph</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{allTasks.length} Nodes</div>
              <p className="mt-1 text-xs text-surface-500">Inspect technical blockers</p>
            </div>
          </div>
        )}

        {/* Employee Stats */}
        {currentRole === 'employee' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate('employee-pending')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">My Assigned Tasks</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-surface-900 dark:text-white">{employeeTasks.length}</div>
              <p className="mt-1 text-xs text-surface-500">Approved deliverables for you</p>
            </div>

            <div
              onClick={() => onNavigate('employee-in-progress')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">In Progress</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{employeeInProgress}</div>
              <p className="mt-1 text-xs text-surface-500">Currently executing</p>
            </div>

            <div
              onClick={() => onNavigate('employee-completed')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Completed</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{employeeCompleted}</div>
              <p className="mt-1 text-xs text-surface-500">Shipped and verified</p>
            </div>

            <div
              onClick={() => onNavigate('employee-blocked')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Blocked Tasks</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{employeeBlocked}</div>
              <p className="mt-1 text-xs text-surface-500">Reported difficulties</p>
            </div>
          </div>
        )}

        {/* Student Stats: Meetings Attended, Total Personal Tasks, Pending Tasks, Completed Tasks */}
        {currentRole === 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onViewAllMeetings()}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-violet-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Meetings Attended</span>
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-surface-900 dark:text-white">
                {effectiveStudentMeetings.length}
              </div>
              <p className="mt-1 text-xs text-surface-500">Sessions you participated in</p>
            </div>

            <div
              onClick={() => onNavigate('student-tasks')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-brand-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Total Personal Tasks</span>
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                {studentTasks.length}
              </div>
              <p className="mt-1 text-xs text-surface-500">Personal study & learning tasks</p>
            </div>

            <div
              onClick={() => onNavigate('student-tasks')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Pending Tasks</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {studentPendingCount}
              </div>
              <p className="mt-1 text-xs text-surface-500">In progress & pending study goals</p>
            </div>

            <div
              onClick={() => onNavigate('student-completed')}
              className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-surface-500">Completed Tasks</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {studentCompletedCount}
              </div>
              <p className="mt-1 text-xs text-surface-500">Research milestones achieved</p>
            </div>
          </div>
        )}
      </section>

      {/* 3. Recent Meetings Section */}
      <section aria-label="Recent Meetings">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Recent Meetings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
              {recentMeetings.length} of {meetings.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onViewAllMeetings}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors"
          >
            <span>View All Meetings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Meeting Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentMeetings.map((meeting) => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              onSelectMeeting={onSelectMeeting}
            />
          ))}
        </div>
      </section>

    </div>
  );
}

