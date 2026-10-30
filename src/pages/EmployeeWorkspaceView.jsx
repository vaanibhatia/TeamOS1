import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  MessageSquare,
  Calendar,
  Sparkles,
  Tag,
  Send,
  User,
  ExternalLink,
  ChevronDown,
  Lock,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';
import { mockEmployees } from '../api/mockData';

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function EmployeeWorkspaceView({
  subView = 'pending', // 'pending' | 'in-progress' | 'completed' | 'blocked'
  tasks = [],
  onUpdateTasks = () => {},
  activeEmployeeId = 'usr_001',
  onChangeActiveEmployee = () => {},
  employees = mockEmployees,
  onOpenEvidence = () => {},
}) {
  // Blocker modal state: { taskId, isOpen }
  const [blockerModalTaskId, setBlockerModalTaskId] = useState(null);
  const [blockerReason, setBlockerReason] = useState('');

  // Deadline extension modal state: { taskId, isOpen }
  const [extensionModalTaskId, setExtensionModalTaskId] = useState(null);
  const [extensionDate, setExtensionDate] = useState('2026-11-12');
  const [extensionReason, setExtensionReason] = useState('');

  // Quick notes state: { [taskId]: string }
  const [noteInputs, setNoteInputs] = useState({});

  const activeEmployee = employees.find((e) => e._id === activeEmployeeId) || employees[0];

  // 1. IMPORTANT RULE: Only approved and assigned tasks appear in the employee's official task list
  const officialEmployeeTasks = tasks.filter(
    (t) => t.approvalStatus === 'approved' && t.assigneeId === activeEmployeeId
  );

  // Sub-view filters
  const pendingTasks = officialEmployeeTasks.filter(
    (t) => t.workStatus === 'not_started' || !t.workStatus
  );
  const inProgressTasks = officialEmployeeTasks.filter(
    (t) => t.workStatus === 'in_progress'
  );
  const completedTasks = officialEmployeeTasks.filter(
    (t) => t.workStatus === 'completed'
  );
  const blockedTasks = officialEmployeeTasks.filter(
    (t) => t.workStatus === 'blocked'
  );

  // Status transitions
  const handleSetStatus = (taskId, newStatus) => {
    const updated = tasks.map((t) => {
      if (t._id === taskId) {
        return {
          ...t,
          workStatus: newStatus,
          // Clear blocker details if resuming
          blockerDetails: newStatus === 'blocked' ? t.blockerDetails : null,
        };
      }
      return t;
    });

    onUpdateTasks(updated);
  };

  // Submit blocker
  const handleReportBlockerSubmit = (e) => {
    e.preventDefault();
    if (!blockerModalTaskId || !blockerReason.trim()) return;

    const updated = tasks.map((t) => {
      if (t._id === blockerModalTaskId) {
        return {
          ...t,
          workStatus: 'blocked',
          blockerDetails: {
            reason: blockerReason.trim(),
            reportedAt: new Date().toISOString(),
            severity: 'high',
          },
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    setBlockerModalTaskId(null);
    setBlockerReason('');
  };

  // Submit deadline change request
  const handleExtensionSubmit = (e) => {
    e.preventDefault();
    if (!extensionModalTaskId || !extensionReason.trim()) return;

    const updated = tasks.map((t) => {
      if (t._id === extensionModalTaskId) {
        const existingReqs = t.deadlineChangeRequests || [];
        return {
          ...t,
          deadlineChangeRequests: [
            ...existingReqs,
            {
              id: `req_${Date.now()}`,
              requestedDeadlineAt: new Date(`${extensionDate}T18:00:00.000Z`).toISOString(),
              reason: extensionReason.trim(),
              requestedAt: new Date().toISOString(),
              status: 'pending',
            },
          ],
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    setExtensionModalTaskId(null);
    setExtensionReason('');
  };

  // Save employee note
  const handleSaveNote = (taskId) => {
    const noteText = (noteInputs[taskId] || '').trim();
    if (!noteText) return;

    const updated = tasks.map((t) => {
      if (t._id === taskId) {
        const existingNotes = t.notes || [];
        return {
          ...t,
          notes: [
            ...existingNotes,
            {
              id: `note_${Date.now()}`,
              text: noteText,
              authorName: activeEmployee?.name || 'Employee',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    setNoteInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const getSubViewTitle = () => {
    switch (subView) {
      case 'pending':
        return {
          title: 'My Pending Tasks',
          desc: 'Officially assigned deliverables waiting to be kicked off.',
          list: pendingTasks,
        };
      case 'in-progress':
        return {
          title: 'In Progress Tasks',
          desc: 'Tasks actively being executed. Update progress, report blockers, or request extensions.',
          list: inProgressTasks,
        };
      case 'completed':
        return {
          title: 'Completed Tasks',
          desc: 'Deliverables verified and finished.',
          list: completedTasks,
        };
      case 'blocked':
        return {
          title: 'Blocked Tasks',
          desc: 'Tasks blocked by technical difficulties or pending dependencies. Shared with manager.',
          list: blockedTasks,
        };
      default:
        return {
          title: 'My Deliverables',
          desc: 'Your assigned work stream.',
          list: officialEmployeeTasks,
        };
    }
  };

  const currentViewData = getSubViewTitle();

  return (
    <div className="space-y-6">
      
      {/* 1. EMPLOYEE HEADER BAR WITH TEAM MEMBER SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Employee Workspace
            </span>
            <span className="text-xs text-surface-400">• Official Assigned Deliverables</span>
          </div>

          <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white">
            {currentViewData.title}
          </h2>
          <p className="text-xs text-surface-500 mt-1">
            {currentViewData.desc}
          </p>
        </div>

        {/* Profile Switcher (Rahul Sharma / Priya Patel) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-400 font-semibold">Active Member:</span>
            <select
              value={activeEmployeeId}
              onChange={(e) => onChangeActiveEmployee(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.title?.split(' ')[0] || 'Engineer'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Permissions Notification Callout */}
      <div className="p-3.5 rounded-2xl bg-surface-100/70 dark:bg-surface-900/40 border border-surface-200/80 dark:border-surface-800 flex items-center justify-between gap-3 text-xs text-surface-600 dark:text-surface-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-surface-400 flex-shrink-0" />
          <span>
            <strong>Role-Based Permission:</strong> Official descriptions, deadlines, and ownership are managed by your engineering manager. You can update work status, report blockers, and request deadline adjustments below.
          </span>
        </div>
      </div>

      {/* 2. TASK LIST */}
      <div className="space-y-4">
        {currentViewData.list.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              No tasks in this category
            </h3>
            <p className="text-xs text-surface-500">
              {subView === 'blocked'
                ? 'No blocked tasks! All active deliverables are moving forward.'
                : subView === 'pending'
                ? 'No pending kickoff tasks for this employee.'
                : 'Tasks assigned to this employee will appear here once approved by manager.'}
            </p>
          </div>
        ) : (
          currentViewData.list.map((task) => {
            const isBlocked = task.workStatus === 'blocked';
            const isInProgress = task.workStatus === 'in_progress';
            const isCompleted = task.workStatus === 'completed';
            const isNotStarted = task.workStatus === 'not_started' || !task.workStatus;
            const hasPendingExtension = (task.deadlineChangeRequests || []).some((r) => r.status === 'pending');

            return (
              <div
                key={task._id}
                className={`p-6 rounded-3xl bg-white dark:bg-surface-900 border transition-all space-y-4 shadow-sm ${
                  isBlocked
                    ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20'
                    : 'border-surface-200 dark:border-surface-800'
                }`}
              >
                {/* Header: Task ID, Status & Official Lock Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                      {task._id}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isInProgress
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : isBlocked
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 border border-surface-200 dark:border-surface-700'
                      }`}
                    >
                      {task.workStatus?.replace('_', ' ') || 'not started'}
                    </span>

                    {/* Permission locked badge */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-surface-400 px-2 py-0.5 rounded bg-surface-50 dark:bg-surface-800/60">
                      <Lock className="w-3 h-3" />
                      <span>Official Spec</span>
                    </span>
                  </div>

                  {/* Official Deadline */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-surface-600 dark:text-surface-300">
                      <Calendar className="w-3.5 h-3.5 text-surface-400" />
                      <span>Official Deadline: {formatDateTime(task.approvedDeadlineAt)}</span>
                    </div>

                    {task.evidenceSegmentIds && task.evidenceSegmentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                        title="View spoken meeting evidence"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Evidence</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Content (Read-Only as per specification) */}
                <div>
                  <h3 className="text-base font-bold text-surface-900 dark:text-white">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Blocker Alert Banner */}
                {isBlocked && task.blockerDetails && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Blocker Difficulty Reported:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(task._id, 'in_progress')}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-surface-900 text-rose-700 dark:text-rose-300 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resolve Blocker & Resume</span>
                      </button>
                    </div>
                    <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                      "{task.blockerDetails.reason}"
                    </p>
                  </div>
                )}

                {/* Deadline Extension Alert if Pending */}
                {hasPendingExtension && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>Deadline change request submitted — waiting for manager approval.</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Pending
                    </span>
                  </div>
                )}

                {/* ACTION CONTROLS */}
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isNotStarted && (
                      <button
                        type="button"
                        onClick={() => handleSetStatus(task._id, 'in_progress')}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Kickoff & Start Working</span>
                      </button>
                    )}

                    {isInProgress && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(task._id, 'completed')}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Completed</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBlockerModalTaskId(task._id);
                            setBlockerReason('');
                          }}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Report Blocker</span>
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleSetStatus(task._id, 'in_progress')}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen Task</span>
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => {
                          setExtensionModalTaskId(task._id);
                          setExtensionReason('');
                        }}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-surface-400" />
                        <span>Request Deadline Extension</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Employee Blocker / Clarification Notes Input */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noteInputs[task._id] || ''}
                      onChange={(e) =>
                        setNoteInputs((prev) => ({
                          ...prev,
                          [task._id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNote(task._id);
                      }}
                      placeholder="Add an update note or clarification question for the team lead..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(task._id)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Log Note</span>
                    </button>
                  </div>

                  {/* Render existing notes */}
                  {task.notes && task.notes.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {task.notes.map((note) => (
                        <div
                          key={note.id}
                          className="px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800/40 text-xs text-surface-700 dark:text-surface-300 flex items-start justify-between gap-2"
                        >
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{note.text}</span>
                          </div>
                          <span className="text-[10px] text-surface-400 whitespace-nowrap">
                            {note.authorName} • {formatDateTime(note.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. REPORT BLOCKER MODAL */}
      {blockerModalTaskId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-surface-950/60 backdrop-blur-xs"
            onClick={() => setBlockerModalTaskId(null)}
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report Blocker & Difficulties</span>
                </div>
              </div>

              <p className="text-xs text-surface-500">
                Explain the technical blocker preventing progress. This will alert your manager and update the team dependency graph.
              </p>

              <form onSubmit={handleReportBlockerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Blocker Reason *
                  </label>
                  <textarea
                    rows={4}
                    value={blockerReason}
                    onChange={(e) => setBlockerReason(e.target.value)}
                    placeholder="Describe what is blocking this deliverable (e.g., missing API endpoint, 502 Bad Gateway, waiting on dependency)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBlockerModalTaskId(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                  >
                    Confirm & Mark Blocked
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. REQUEST DEADLINE EXTENSION MODAL */}
      {extensionModalTaskId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-surface-950/60 backdrop-blur-xs"
            onClick={() => setExtensionModalTaskId(null)}
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Request Deadline Extension / Clarification</span>
                </div>
              </div>

              <p className="text-xs text-surface-500">
                Submit an extension request to the engineering manager with an explanation of the timeline adjustment.
              </p>

              <form onSubmit={handleExtensionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Proposed New Deadline *
                  </label>
                  <input
                    type="date"
                    value={extensionDate}
                    onChange={(e) => setExtensionDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Justification & Difficulties *
                  </label>
                  <textarea
                    rows={3}
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    placeholder="Explain why extra time is needed (e.g., unexpected scope, upstream dependency delay)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setExtensionModalTaskId(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                  >
                    Submit Request to Manager
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

