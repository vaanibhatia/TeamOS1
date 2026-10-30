import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Tag,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { mockEmployees } from '../api/mockData';

/**
 * Format ISO or date string to human-readable format
 */
function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format ISO string to YYYY-MM-DD for native <input type="date" />
 */
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

export default function ManagerDashboard({
  meetingData,
  onUpdateMeetingData = () => {},
  employees = mockEmployees,
  onOpenEvidence = () => {},
}) {
  // Collapsible summary toggle
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  // Local draft state for pending tasks: { [taskId]: { title, description, assigneeId, approvedDeadlineAt } }
  const [drafts, setDrafts] = useState({});

  if (!meetingData) {
    return (
      <div className="p-8 text-center text-surface-500">
        No meeting data available.
      </div>
    );
  }

  // Employee mapping
  const employeeMap = (employees || []).reduce((acc, emp) => {
    acc[emp._id] = emp;
    return acc;
  }, {});

  // Filter tasks
  const pendingTasks = (meetingData.tasks || []).filter(
    (t) => t.approvalStatus === 'pending'
  );
  const approvedTasks = (meetingData.tasks || []).filter(
    (t) => t.approvalStatus === 'approved'
  );

  // Helper to retrieve draft value or fall back to task property
  const getDraft = (task) => {
    const existing = drafts[task._id];
    if (existing) return existing;

    // Default pre-filled values
    return {
      title: task.title || '',
      description: task.description || '',
      assigneeId: task.assigneeId || (task.suggestedOwnerSpeakerId === 'speaker_1' ? 'usr_001' : ''),
      approvedDeadlineAt: toInputDate(task.approvedDeadlineAt) || '2026-11-06',
    };
  };

  const handleFieldChange = (taskId, field, value) => {
    const task = meetingData.tasks.find((t) => t._id === taskId);
    const currentDraft = getDraft(task);
    setDrafts((prev) => ({
      ...prev,
      [taskId]: {
        ...currentDraft,
        [field]: value,
      },
    }));
  };

  // Approve action
  const handleApprove = (task) => {
    const currentDraft = getDraft(task);
    const approvedDeadlineIso = currentDraft.approvedDeadlineAt
      ? new Date(`${currentDraft.approvedDeadlineAt}T18:00:00.000Z`).toISOString()
      : task.approvedDeadlineAt || new Date().toISOString();

    const updatedTasks = meetingData.tasks.map((t) => {
      if (t._id === task._id) {
        return {
          ...t,
          title: currentDraft.title.trim() || t.title,
          description: currentDraft.description.trim(),
          assigneeId: currentDraft.assigneeId || null,
          approvedDeadlineAt: approvedDeadlineIso,
          approvalStatus: 'approved',
          workStatus: t.workStatus || 'not_started',
        };
      }
      return t;
    });

    onUpdateMeetingData({
      ...meetingData,
      tasks: updatedTasks,
    });
  };

  // Reject action
  const handleReject = (task) => {
    const updatedTasks = meetingData.tasks.map((t) => {
      if (t._id === task._id) {
        return {
          ...t,
          approvalStatus: 'rejected',
        };
      }
      return t;
    });

    onUpdateMeetingData({
      ...meetingData,
      tasks: updatedTasks,
    });
  };

  // Work status color and label helper
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
    <div className="space-y-8">
      {/* 1. HEADER SECTION */}
      <section className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                {meetingData._id}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  meetingData.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/70 dark:text-brand-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {meetingData.status || 'completed'}
              </span>

              <span className="text-xs text-surface-400 dark:text-surface-500">
                • Manager Triage Workspace
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
              {meetingData.title}
            </h1>

            <div className="flex items-center gap-2 mt-2 text-xs text-surface-500 dark:text-surface-400">
              <Calendar className="w-4 h-4 text-surface-400" />
              <span>Started: {formatDateTime(meetingData.startedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Pending Triage
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {pendingTasks.length}
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Approved
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {approvedTasks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Summary Container (Decisions & Open Questions) */}
        <div className="rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden bg-surface-50/50 dark:bg-surface-800/20">
          <button
            type="button"
            onClick={() => setIsSummaryOpen((prev) => !prev)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left bg-surface-100/60 dark:bg-surface-800/60 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none"
            aria-expanded={isSummaryOpen}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-bold text-surface-900 dark:text-white">
                Meeting Intelligence Summary
              </span>
              <span className="text-xs text-surface-500">
                ({meetingData.decisions?.length || 0} Decisions,{' '}
                {meetingData.openQuestions?.length || 0} Open Questions)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-surface-500">
              <span>{isSummaryOpen ? 'Collapse' : 'Expand'}</span>
              {isSummaryOpen ? (
                <ChevronUp className="w-4 h-4 text-surface-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-surface-400" />
              )}
            </div>
          </button>

          {isSummaryOpen && (
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-surface-200 dark:border-surface-800 animate-in fade-in duration-200">
              {/* Decisions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Decisions ({meetingData.decisions?.length || 0})</span>
                  </div>
                </div>

                {meetingData.decisions && meetingData.decisions.length > 0 ? (
                  <div className="space-y-2.5">
                    {meetingData.decisions.map((dec) => (
                      <div
                        key={dec._id}
                        className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800/60 shadow-xs flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-surface-900 dark:text-white leading-relaxed">
                            {dec.title}
                          </p>
                          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            {Math.round((dec.confidence || 1) * 100)}% Conf
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-surface-100 dark:border-surface-800 text-[11px]">
                          <span className="text-surface-400 font-mono">
                            {dec._id}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenEvidence(dec.evidenceSegmentIds)}
                            className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <span>View Context</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-surface-400 italic">No decisions extracted.</p>
                )}
              </div>

              {/* Open Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Open Questions ({meetingData.openQuestions?.length || 0})</span>
                  </div>
                </div>

                {meetingData.openQuestions && meetingData.openQuestions.length > 0 ? (
                  <div className="space-y-2.5">
                    {meetingData.openQuestions.map((q) => (
                      <div
                        key={q._id}
                        className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800/60 shadow-xs flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-surface-900 dark:text-white leading-relaxed">
                            {q.question}
                          </p>
                          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {Math.round((q.confidence || 1) * 100)}% Conf
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-surface-100 dark:border-surface-800 text-[11px]">
                          <span className="text-surface-400 font-mono">
                            {q._id}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenEvidence(q.evidenceSegmentIds)}
                            className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <span>View Context</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-surface-400 italic">No open questions extracted.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. PENDING APPROVALS QUEUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                Pending Approvals Queue
              </h2>
              <p className="text-xs text-surface-500">
                Review extracted commitments, assign responsible owners, approve deadlines, and commit to sprint.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {pendingTasks.length} Pending
          </span>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
            <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
              All caught up!
            </h3>
            <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
              There are no pending commitments requiring approval from this meeting.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {pendingTasks.map((task) => {
              const draft = getDraft(task);
              const uncertaintyFlags = Array.isArray(task.uncertaintyFlags)
                ? task.uncertaintyFlags
                : task.uncertaintyFlag
                ? [task.uncertaintyFlag]
                : [];

              return (
                <div
                  key={task._id}
                  className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-4 hover:border-surface-300 dark:hover:border-surface-700 transition-all"
                >
                  {/* Top Bar: Tags & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-100 dark:border-surface-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold">
                        {task._id}
                      </span>

                      {/* Read-only tag: type */}
                      <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[11px]">
                        <Tag className="w-3 h-3" />
                        {task.type || 'commitment'}
                      </span>

                      {/* Read-only tag: suggestedOwnerSpeakerId */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-[11px]">
                        <User className="w-3 h-3 text-surface-400" />
                        Suggested Owner:{' '}
                        <span className="font-semibold">{task.suggestedOwnerSpeakerId || 'speaker_1'}</span>
                      </span>

                      {/* Read-only tag: suggestedDeadlineText */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-[11px]">
                        <Clock className="w-3 h-3 text-surface-400" />
                        Suggested Deadline:{' '}
                        <span className="font-semibold">"{task.suggestedDeadlineText || 'Unspecified'}"</span>
                      </span>
                    </div>

                    {/* Uncertainty flags badge if present */}
                    {uncertaintyFlags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {uncertaintyFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Editable Inputs: Title and Description */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                        Task Title (Editable)
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => handleFieldChange(task._id, 'title', e.target.value)}
                        placeholder="Task title..."
                        className="w-full px-3.5 py-2 rounded-xl text-sm font-medium border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                        Description / Deliverable Criteria (Editable)
                      </label>
                      <textarea
                        rows={2}
                        value={draft.description}
                        onChange={(e) => handleFieldChange(task._id, 'description', e.target.value)}
                        placeholder="Specify requirements, acceptance criteria, or context for the owner..."
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-normal border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </div>
                  </div>

                  {/* Controls: Assignee Dropdown & Native Date Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/80 dark:border-surface-800">
                    {/* Assignee Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                        Official Assignee <span className="text-brand-500">*</span>
                      </label>
                      <select
                        value={draft.assigneeId}
                        onChange={(e) => handleFieldChange(task._id, 'assigneeId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs font-medium border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer"
                      >
                        <option value="">Select Assignee...</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({emp.role} • {emp.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Native Date Input */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                        Approved Deadline <span className="text-brand-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={draft.approvedDeadlineAt}
                        onChange={(e) =>
                          handleFieldChange(task._id, 'approvedDeadlineAt', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg text-xs font-medium border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-amber-300 dark:border-amber-700/60 bg-amber-50/60 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>View Evidence ({task.evidenceSegmentIds?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Reject Button */}
                      <button
                        type="button"
                        onClick={() => handleReject(task)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      {/* Approve Button */}
                      <button
                        type="button"
                        onClick={() => handleApprove(task)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Approve Commitment</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. APPROVED TASKS TABLE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                Approved Tasks Table
              </h2>
              <p className="text-xs text-surface-500">
                Committed deliverables actively tracked across the sprint.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {approvedTasks.length} Active
          </span>
        </div>

        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm overflow-hidden">
          {approvedTasks.length === 0 ? (
            <div className="p-8 text-center text-surface-500 text-xs">
              No tasks currently approved. Use the queue above to approve commitments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-800/40 text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    <th scope="col" className="py-3 px-4">Task Title</th>
                    <th scope="col" className="py-3 px-4">Assigned Employee</th>
                    <th scope="col" className="py-3 px-4">Approved Deadline</th>
                    <th scope="col" className="py-3 px-4">Work Status</th>
                    <th scope="col" className="py-3 px-4 text-right">Evidence Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-xs">
                  {approvedTasks.map((task) => {
                    const assignee = task.assigneeId ? employeeMap[task.assigneeId] : null;

                    return (
                      <tr
                        key={task._id}
                        className="hover:bg-surface-50/60 dark:hover:bg-surface-800/30 transition-colors"
                      >
                        {/* Task Title */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-surface-900 dark:text-white">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-surface-500 line-clamp-1 mt-0.5">
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[10px] text-surface-400">
                              {task._id}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-100 dark:bg-surface-800 text-surface-500">
                              {task.type}
                            </span>
                          </div>
                        </td>

                        {/* Assigned Employee Name */}
                        <td className="py-3.5 px-4">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-[10px] flex items-center justify-center">
                                {assignee.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-surface-800 dark:text-surface-200">
                                  {assignee.name}
                                </div>
                                <div className="text-[10px] text-surface-400">
                                  {assignee.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-surface-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Approved Deadline */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-surface-700 dark:text-surface-300">
                            <Calendar className="w-3.5 h-3.5 text-surface-400" />
                            <span>
                              {task.approvedDeadlineAt
                                ? new Date(task.approvedDeadlineAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'No deadline'}
                            </span>
                          </div>
                        </td>

                        {/* Work Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getWorkStatusBadge(task.workStatus)}
                        </td>

                        {/* Action: Inspect Evidence */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 transition-colors cursor-pointer"
                            title="Inspect evidence in drawer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-500" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

