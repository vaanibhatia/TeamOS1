import React, { useState } from 'react';
import {
  X,
  Plus,
  User,
  Calendar,
  FileText,
  GitCommit,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { mockEmployees, mockMeetings } from '../api/mockData';

export default function AddTaskModal({
  isOpen = false,
  onClose = () => {},
  onAddTask = () => {},
  existingTasks = [],
  employees = mockEmployees,
  meetings = mockMeetings,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(employees[0]?._id || 'usr_001');
  const [deadline, setDeadline] = useState('2026-11-10');
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetings[0]?._id || 'meet_001');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const newTask = {
      _id: `task_manual_${Date.now()}`,
      meetingId: selectedMeetingId,
      approvalStatus: 'approved', // Directly approved by the manager
      type: 'manual_assignment',
      title: title.trim(),
      description: description.trim(),
      suggestedOwnerSpeakerId: null,
      suggestedOwnerName: employees.find((e) => e._id === assigneeId)?.name || 'Assigned Member',
      suggestedDeadlineText: deadline,
      approvedDeadlineAt: deadline ? new Date(`${deadline}T18:00:00.000Z`).toISOString() : null,
      assigneeId: assigneeId || null,
      workStatus: 'not_started',
      uncertaintyFlags: [],
      evidenceSegmentIds: [],
      dependencies: selectedDependencies,
      blockerDetails: null,
      deadlineChangeRequests: [],
      notes: [],
    };

    onAddTask(newTask);
    onClose();
  };

  const toggleDependency = (taskId) => {
    setSelectedDependencies((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900 dark:text-white">
                  Create & Assign Task
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Direct manager assignment — commits to employee official workspace
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Build API rate limiter middleware"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                Description & Technical Scope
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify the technical expectations, deliverables, and acceptance criteria..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            {/* Assignee & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Assign Employee *
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
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
                  Approved Deadline *
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>

            {/* Prerequisite Dependencies */}
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                Prerequisite Task Dependencies (Optional)
              </label>
              <div className="max-h-32 overflow-y-auto p-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 space-y-1">
                {existingTasks.filter((t) => t.approvalStatus === 'approved').length === 0 ? (
                  <span className="text-[11px] text-surface-400 italic">No approved tasks available yet</span>
                ) : (
                  existingTasks
                    .filter((t) => t.approvalStatus === 'approved')
                    .map((t) => {
                      const isChecked = selectedDependencies.includes(t._id);
                      return (
                        <div
                          key={t._id}
                          onClick={() => toggleDependency(t._id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold'
                              : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300'
                          }`}
                        >
                          <span className="truncate max-w-[340px]">
                            {t.title} <span className="font-mono text-[10px] text-surface-400">({t._id})</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                          />
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Create & Assign Task</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

