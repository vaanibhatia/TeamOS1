import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Calendar,
  Sparkles,
  ExternalLink,
  Tag,
  Check,
  X,
  Plus,
  ArrowRight,
  Filter,
  AlertCircle,
  MessageSquare,
  Lock,
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

function toInputDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export default function ManagerWorkspaceView({
  subView = 'approvals', // 'approvals' | 'pending' | 'completed' | 'add-task'
  tasks = [],
  onUpdateTasks = () => {},
  employees = mockEmployees,
  onOpenEvidence = () => {},
  onOpenAddTask = () => {},
}) {
  // Local drafts for inline editing in Needs Approval queue
  const [drafts, setDrafts] = useState({});

  const employeeMap = (employees || []).reduce((acc, emp) => {
    acc[emp._id] = emp;
    return acc;
  }, {});

  // Categorize tasks
  const needsApprovalTasks = tasks.filter((t) => t.approvalStatus === 'pending');
  const activePendingTasks = tasks.filter(
    (t) => t.approvalStatus === 'approved' && t.workStatus !== 'completed'
  );
  const completedTasks = tasks.filter(
    (t) => t.approvalStatus === 'approved' && t.workStatus === 'completed'
  );
  const blockedTasks = tasks.filter(
    (t) => t.approvalStatus === 'approved' && t.workStatus === 'blocked'
  );

  const getDraft = (task) => {
    const existing = drafts[task._id];
    if (existing) return existing;
    return {
      title: task.title || '',
      description: task.description || '',
      assigneeId: task.assigneeId || (task.suggestedOwnerSpeakerId === 'speaker_1' ? 'usr_001' : employees[0]?._id || ''),
      approvedDeadlineAt: toInputDate(task.approvedDeadlineAt) || '2026-11-06',
    };
  };

  const handleFieldChange = (taskId, field, value) => {
    const task = tasks.find((t) => t._id === taskId);
    const currentDraft = getDraft(task);
    setDrafts((prev) => ({
      ...prev,
      [taskId]: {
        ...currentDraft,
        [field]: value,
      },
    }));
  };

  // Manager Approve Action
  const handleApprove = (task) => {
    const currentDraft = getDraft(task);
    const approvedDeadlineIso = currentDraft.approvedDeadlineAt
      ? new Date(`${currentDraft.approvedDeadlineAt}T18:00:00.000Z`).toISOString()
      : task.approvedDeadlineAt || new Date().toISOString();

    const updated = tasks.map((t) => {
      if (t._id === task._id) {
        return {
          ...t,
          title: currentDraft.title.trim() || t.title,
          description: currentDraft.description.trim(),
          assigneeId: currentDraft.assigneeId || employees[0]?._id || null,
          approvedDeadlineAt: approvedDeadlineIso,
          approvalStatus: 'approved',
          workStatus: t.workStatus || 'not_started',
        };
      }
      return t;
    });

    onUpdateTasks(updated);
  };

  // Manager Reject Action
  const handleReject = (task) => {
    const updated = tasks.map((t) => {
      if (t._id === task._id) {
        return {
          ...t,
          approvalStatus: 'rejected',
        };
      }
      return t;
    });

    onUpdateTasks(updated);
  };

  // Manager Approve Deadline Change Request
  const handleResolveChangeRequest = (taskId, requestId, approve = true) => {
    const updated = tasks.map((t) => {
      if (t._id === taskId) {
        const req = (t.deadlineChangeRequests || []).find((r) => r.id === requestId);
        const updatedRequests = (t.deadlineChangeRequests || []).map((r) =>
          r.id === requestId ? { ...r, status: approve ? 'approved' : 'rejected' } : r
        );

        return {
          ...t,
          approvedDeadlineAt: approve && req?.requestedDeadlineAt ? req.requestedDeadlineAt : t.approvedDeadlineAt,
          deadlineChangeRequests: updatedRequests,
        };
      }
      return t;
    });

    onUpdateTasks(updated);
  };

  const getWorkStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3 text-blue-500" />
            In Progress
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Blocked
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
            <Clock className="w-3 h-3 text-surface-400" />
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Manager Workspace
            </span>
            <span className="text-xs text-surface-400">• Organizational Oversight</span>
          </div>
          <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white">
            {subView === 'approvals' && 'Needs Approval — AI Extracted Suggestions'}
            {subView === 'pending' && 'Team Pending & Active Deliverables'}
            {subView === 'completed' && 'Team Completed Deliverables'}
            {subView === 'add-task' && 'Create & Assign Manual Task'}
          </h2>
          <p className="text-xs text-surface-500 mt-1 max-w-2xl">
            {subView === 'approvals' &&
              'AI-extracted tasks remain suggestions until approved. Edit descriptions, confirm assignees, and set deadlines.'}
            {subView === 'pending' &&
              'Track active deliverables, view employee progress updates, manage blockers, and resolve deadline change requests.'}
            {subView === 'completed' &&
              'Verified deliverables shipped by team members across engineering milestones.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddTask}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Task</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-VIEW: NEEDS APPROVAL (AI Suggestions) */}
      {subView === 'approvals' && (
        <div className="space-y-4">
          {needsApprovalTasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-surface-900 dark:text-white">
                Queue is Clear! No Pending Suggestions
              </h3>
              <p className="text-xs text-surface-500">
                All AI-extracted task commitments have been triaged and approved for execution.
              </p>
            </div>
          ) : (
            needsApprovalTasks.map((task) => {
              const draft = getDraft(task);
              const hasUncertainties = task.uncertaintyFlags && task.uncertaintyFlags.length > 0;

              return (
                <div
                  key={task._id}
                  className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4"
                >
                  {/* Top Bar: Title & Confidence */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-100 dark:border-surface-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                        {task._id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        AI Extracted Suggestion
                      </span>
                      {task.suggestedDeadlineText && (
                        <span className="text-xs text-surface-500">
                          Spoken Deadline: <strong>"{task.suggestedDeadlineText}"</strong>
                        </span>
                      )}
                    </div>

                    {task.evidenceSegmentIds && task.evidenceSegmentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>View Evidence ({task.evidenceSegmentIds.join(', ')})</span>
                      </button>
                    )}
                  </div>

                  {/* Uncertainty alert if any */}
                  {hasUncertainties && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Uncertainties Requiring Confirmation:</span>
                      </div>
                      <ul className="list-disc pl-5 text-xs space-y-0.5 text-amber-900/80 dark:text-amber-200/90">
                        {task.uncertaintyFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Editable Fields: Title & Description */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                        Task Title (Editable)
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => handleFieldChange(task._id, 'title', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                        Description & Technical Scope (Editable)
                      </label>
                      <textarea
                        rows={2}
                        value={draft.description}
                        onChange={(e) => handleFieldChange(task._id, 'description', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </div>
                  </div>

                  {/* Assignee & Deadline Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                        Assign Employee *
                      </label>
                      <select
                        value={draft.assigneeId}
                        onChange={(e) => handleFieldChange(task._id, 'assigneeId', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      >
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({emp.title || 'Engineer'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                        Approved Deadline Date *
                      </label>
                      <input
                        type="date"
                        value={draft.approvedDeadlineAt}
                        onChange={(e) => handleFieldChange(task._id, 'approvedDeadlineAt', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </div>
                  </div>

                  {/* Bottom Actions: Approve or Reject */}
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleReject(task)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-rose-50 text-surface-600 hover:text-rose-600 dark:bg-surface-800 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Suggestion</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(task)}
                      className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Assign to Employee</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. SUB-VIEW: PENDING & ACTIVE DELIVERABLES */}
      {subView === 'pending' && (
        <div className="space-y-4">
          {activePendingTasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-surface-900 dark:text-white">
                No Active Deliverables Pending
              </h3>
              <p className="text-xs text-surface-500">
                All approved deliverables have been completed.
              </p>
            </div>
          ) : (
            activePendingTasks.map((task) => {
              const assignee = employeeMap[task.assigneeId];
              const isBlocked = task.workStatus === 'blocked';
              const pendingChangeReqs = (task.deadlineChangeRequests || []).filter((r) => r.status === 'pending');

              return (
                <div
                  key={task._id}
                  className={`p-6 rounded-3xl bg-white dark:bg-surface-900 border transition-all space-y-4 shadow-xs ${
                    isBlocked
                      ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-surface-200 dark:border-surface-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                        {task._id}
                      </span>
                      {getWorkStatusBadge(task.workStatus)}
                      <span className="text-xs text-surface-500">
                        Assigned to: <strong className="text-surface-800 dark:text-surface-200">{assignee?.name || 'Unassigned'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-surface-500">
                      <div className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-surface-400" />
                        <span>Deadline: {formatDateTime(task.approvedDeadlineAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-surface-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Active Blocker Alert */}
                  {isBlocked && task.blockerDetails && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Blocker Reported by {assignee?.name || 'Employee'}:</span>
                      </div>
                      <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                        "{task.blockerDetails.reason}"
                      </p>
                    </div>
                  )}

                  {/* Deadline Change Requests from Employee */}
                  {pendingChangeReqs.length > 0 && (
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>Deadline Extension Requested by {assignee?.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          Action Required
                        </span>
                      </div>

                      {pendingChangeReqs.map((req) => (
                        <div key={req.id} className="text-xs space-y-2">
                          <p className="text-surface-700 dark:text-surface-300">
                            <strong>Proposed New Date:</strong> {formatDateTime(req.requestedDeadlineAt)}
                          </p>
                          <p className="text-surface-600 dark:text-surface-400 italic">
                            Reason: "{req.reason}"
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleResolveChangeRequest(task._id, req.id, true)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            >
                              Approve New Deadline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveChangeRequest(task._id, req.id, false)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes & Transcript Evidence */}
                  <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs text-surface-400">
                    <span>
                      {(task.notes || []).length} employee notes logged
                    </span>
                    {task.evidenceSegmentIds && task.evidenceSegmentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Inspect Evidence</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. SUB-VIEW: COMPLETED DELIVERABLES */}
      {subView === 'completed' && (
        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8">
              <Clock className="w-10 h-10 text-surface-400 mx-auto mb-2 opacity-50" />
              <h3 className="text-base font-bold text-surface-900 dark:text-white">
                No Completed Deliverables Yet
              </h3>
              <p className="text-xs text-surface-500">
                Tasks marked completed by employees will appear here.
              </p>
            </div>
          ) : (
            completedTasks.map((task) => {
              const assignee = employeeMap[task.assigneeId];
              return (
                <div
                  key={task._id}
                  className="p-5 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                        {task._id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Shipped
                      </span>
                      <span className="text-xs text-surface-500">
                        Owner: <strong>{assignee?.name || 'Employee'}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-surface-900 dark:text-white">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-surface-500 max-w-2xl line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                    <div className="text-right text-xs text-surface-400">
                      <div>Deadline: {formatDateTime(task.approvedDeadlineAt)}</div>
                    </div>
                    {task.evidenceSegmentIds && task.evidenceSegmentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                        className="p-2 rounded-xl text-surface-400 hover:text-brand-500 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                        title="View Transcript Evidence"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

