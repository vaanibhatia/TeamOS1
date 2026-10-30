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
} from 'lucide-react';
import { mockEmployees } from '../api/mockData';

export default function EmployeeDashboard({
  meetingData,
  onUpdateMeetingData = () => {},
  employees = mockEmployees,
  onOpenEvidence = () => {},
}) {
  // 1. Employee selector state (default to first employee, Rahul Sharma: "usr_001")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    employees[0]?._id || 'usr_001'
  );

  // Local draft state for blocker / clarification notes: { [taskId]: string }
  const [noteInputs, setNoteInputs] = useState({});

  if (!meetingData) {
    return (
      <div className="p-8 text-center text-surface-500">
        No meeting data available.
      </div>
    );
  }

  const selectedEmployee =
    employees.find((e) => e._id === selectedEmployeeId) || employees[0];

  // 2. Filter tasks where approvalStatus === "approved" AND assigneeId === selectedEmployeeId
  const employeeTasks = (meetingData.tasks || []).filter(
    (t) => t.approvalStatus === 'approved' && t.assigneeId === selectedEmployeeId
  );

  // Stats calculation
  const completedCount = employeeTasks.filter(
    (t) => t.workStatus === 'completed'
  ).length;
  const inProgressCount = employeeTasks.filter(
    (t) => t.workStatus === 'in_progress'
  ).length;
  const blockedCount = employeeTasks.filter(
    (t) => t.workStatus === 'blocked'
  ).length;

  // Handle work status change
  const handleStatusChange = (taskId, newStatus) => {
    const updatedTasks = (meetingData.tasks || []).map((t) => {
      if (t._id === taskId) {
        return {
          ...t,
          workStatus: newStatus,
        };
      }
      return t;
    });

    onUpdateMeetingData({
      ...meetingData,
      tasks: updatedTasks,
    });
  };

  // Handle saving note (blocker / clarification)
  const handleSaveNote = (taskId) => {
    const noteText = (noteInputs[taskId] || '').trim();
    if (!noteText) return;

    const updatedTasks = (meetingData.tasks || []).map((t) => {
      if (t._id === taskId) {
        const existingNotes = Array.isArray(t.notes) ? t.notes : t.notes ? [t.notes] : [];
        return {
          ...t,
          notes: [
            ...existingNotes,
            {
              id: `note_${Date.now()}`,
              text: noteText,
              authorName: selectedEmployee?.name || 'Employee',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return t;
    });

    onUpdateMeetingData({
      ...meetingData,
      tasks: updatedTasks,
    });

    // Clear input
    setNoteInputs((prev) => ({
      ...prev,
      [taskId]: '',
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP BANNER & EMPLOYEE SELECTOR */}
      <section className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20 flex-shrink-0">
              {selectedEmployee?.name ? selectedEmployee.name.charAt(0) : 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Employee View
                </span>
                <span className="text-xs text-surface-400">
                  • Individual Action Workspace
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-surface-900 dark:text-white">
                Sprint Deliverables Board
              </h1>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Track assigned commitments, inspect meeting context, update delivery status, and flag blockers.
              </p>
            </div>
          </div>

          {/* Employee Selector Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 flex flex-col gap-1.5 min-w-[260px]">
              <label
                htmlFor="employee-select"
                className="text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>Viewing tasks as:</span>
              </label>
              <div className="relative">
                <select
                  id="employee-select"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 rounded-lg text-sm font-semibold border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer appearance-none shadow-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 text-center flex-1 sm:flex-initial min-w-[70px]">
                <div className="text-[10px] text-surface-500 uppercase font-semibold">
                  Total
                </div>
                <div className="text-base font-bold text-surface-900 dark:text-white">
                  {employeeTasks.length}
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-center flex-1 sm:flex-initial min-w-[70px]">
                <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">
                  Active
                </div>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {inProgressCount}
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center flex-1 sm:flex-initial min-w-[70px]">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                  Done
                </div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {completedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TASK LIST / EMPTY STATE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Approved Action Items
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
              {employeeTasks.length} assigned
            </span>
          </div>

          {blockedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              {blockedCount} Blocked
            </span>
          )}
        </div>

        {employeeTasks.length === 0 ? (
          /* Clean Empty-State Message */
          <div className="p-12 rounded-2xl border border-dashed border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto text-surface-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
                No approved tasks assigned to {selectedEmployee?.name || 'this employee'}
              </h3>
              <p className="text-xs text-surface-500 max-w-md mx-auto">
                When meeting commitments are approved by a manager and assigned to{' '}
                <span className="font-semibold text-surface-700 dark:text-surface-300">
                  {selectedEmployee?.name}
                </span>
                , they will appear here with full transcript evidence and deadline tracking.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-surface-400">
              Tip: Switch to Manager View to approve pending tasks or assign them to this employee.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {employeeTasks.map((task) => {
              const notesList = Array.isArray(task.notes)
                ? task.notes
                : task.notes
                ? [task.notes]
                : [];

              return (
                <div
                  key={task._id}
                  className={`p-6 rounded-2xl border transition-all shadow-sm space-y-5 bg-white dark:bg-surface-900 ${
                    task.workStatus === 'blocked'
                      ? 'border-rose-300 dark:border-rose-800/80 ring-1 ring-rose-500/20'
                      : task.workStatus === 'completed'
                      ? 'border-emerald-200 dark:border-emerald-800/60'
                      : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700'
                  }`}
                >
                  {/* Task Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                        {task._id}
                      </span>

                      {/* Task Type Tag */}
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        <Tag className="w-3 h-3" />
                        {task.type}
                      </span>

                      {/* Approved Deadline Badge */}
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                        <Calendar className="w-3 h-3 text-surface-400" />
                        Deadline:{' '}
                        {task.approvedDeadlineAt
                          ? new Date(task.approvedDeadlineAt).toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )
                          : 'Not set'}
                      </span>
                    </div>

                    {/* View Evidence Button */}
                    <button
                      type="button"
                      onClick={() => onOpenEvidence(task.evidenceSegmentIds)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-300 dark:border-amber-700/60 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                      title="Inspect transcript evidence in drawer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>View Evidence ({task.evidenceSegmentIds?.length || 0})</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  </div>

                  {/* Task Content: Title and Description */}
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed bg-surface-50 dark:bg-surface-800/40 p-3 rounded-xl border border-surface-100 dark:border-surface-800/60">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Controls: Work Status Selector */}
                  <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/70 dark:border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                        Delivery Status:
                      </span>
                      <p className="text-[11px] text-surface-500">
                        Update your sprint progress for manager visibility.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={task.workStatus || 'not_started'}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 cursor-pointer shadow-xs ${
                          task.workStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 focus:ring-emerald-500/40'
                            : task.workStatus === 'in_progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 focus:ring-blue-500/40'
                            : task.workStatus === 'blocked'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 focus:ring-rose-500/40'
                            : 'bg-white text-surface-800 border-surface-300 dark:bg-surface-900 dark:text-surface-200 dark:border-surface-700 focus:ring-surface-500/40'
                        }`}
                      >
                        <option value="not_started">⚪ Not Started</option>
                        <option value="in_progress">🔵 In Progress</option>
                        <option value="blocked">🔴 Blocked</option>
                        <option value="completed">🟢 Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Flag Blocker / Request Clarification Section */}
                  <div className="pt-2 border-t border-surface-100 dark:border-surface-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-surface-700 dark:text-surface-300">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                      <span>Flag Blocker / Request Clarification</span>
                    </div>

                    {/* Existing Saved Notes List */}
                    {notesList.length > 0 && (
                      <div className="space-y-2">
                        {notesList.map((n, idx) => {
                          const noteText = typeof n === 'string' ? n : n.text;
                          const noteTime = n?.createdAt
                            ? new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : null;

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 text-xs flex items-start gap-2.5"
                            >
                              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-[11px] text-surface-400 mb-0.5">
                                  <span className="font-semibold text-surface-700 dark:text-surface-300">
                                    {n?.authorName || 'Note'}
                                  </span>
                                  {noteTime && <span>{noteTime}</span>}
                                </div>
                                <p className="text-surface-800 dark:text-surface-200 leading-relaxed">
                                  {noteText}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Note Input Field + Save Note Button */}
                    <div className="flex flex-col sm:flex-row gap-2">
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
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveNote(task._id);
                          }
                        }}
                        placeholder="Need API keys, architectural input, or unblocking assistance? Add a note here..."
                        className="flex-1 px-3.5 py-2 rounded-xl text-xs font-normal border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(task._id)}
                        disabled={!(noteInputs[task._id] || '').trim()}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-surface-800 hover:bg-surface-700 active:bg-surface-900 dark:bg-surface-700 dark:hover:bg-surface-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

