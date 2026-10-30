import React, { useState } from 'react';
import {
  GraduationCap,
  Bookmark,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Tag,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  Play,
  RotateCcw,
  BookOpen,
  Filter,
} from 'lucide-react';
import StudentTaskModal from '../components/StudentTaskModal';

function formatTaskDate(dateStr) {
  if (!dateStr) return 'No deadline';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function StudentWorkspaceView({
  subView = 'tasks', // 'tasks' | 'completed'
  tasks = [],
  onUpdateTasks = () => {},
  suggestions = [],
  onUpdateSuggestions = () => {},
  meetings = [],
  onOpenEvidence = () => {},
  onSelectMeeting = () => {},
}) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress'

  // Filter tasks based on subView
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  const displayedActiveTasks = activeTasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Handlers for personal tasks
  const handleSaveTask = (taskData) => {
    const existingIndex = tasks.findIndex((t) => t._id === taskData._id);
    if (existingIndex >= 0) {
      // Edit existing
      const updated = [...tasks];
      updated[existingIndex] = taskData;
      onUpdateTasks(updated);
    } else {
      // Add new
      onUpdateTasks([taskData, ...tasks]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    onUpdateTasks(tasks.filter((t) => t._id !== taskId));
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updated = tasks.map((t) =>
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    onUpdateTasks(updated);
  };

  // AI Suggestion Handlers
  const handleAcceptSuggestion = (sug) => {
    const newTask = {
      _id: `st_sug_${Date.now()}`,
      title: sug.title,
      description: sug.description,
      priority: sug.suggestedPriority || 'medium',
      status: 'pending',
      deadline: sug.suggestedDeadline || '2026-11-06',
      meetingId: sug.meetingId || null,
      meetingTitle: sug.meetingTitle || null,
      createdAt: new Date().toISOString(),
    };

    onUpdateTasks([newTask, ...tasks]);
    onUpdateSuggestions(suggestions.filter((s) => s._id !== sug._id));
  };

  const handleEditAndAcceptSuggestion = (sug) => {
    setEditingTask({
      title: sug.title,
      description: sug.description,
      priority: sug.suggestedPriority || 'medium',
      status: 'pending',
      deadline: sug.suggestedDeadline || '2026-11-06',
      meetingId: sug.meetingId || '',
    });
    // Remove suggestion
    onUpdateSuggestions(suggestions.filter((s) => s._id !== sug._id));
    setIsTaskModalOpen(true);
  };

  const handleDismissSuggestion = (sugId) => {
    onUpdateSuggestions(suggestions.filter((s) => s._id !== sugId));
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Medium Priority
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3 text-blue-500" />
            In Progress
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
            <Clock className="w-3 h-3 text-surface-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Student Workspace
            </span>
            <span className="text-xs text-surface-400">• Personal Study & Tasks</span>
          </div>
          <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white">
            {subView === 'tasks' ? 'My Personal Study Tasks' : 'Completed Personal Deliverables'}
          </h2>
          <p className="text-xs text-surface-500 mt-1 max-w-2xl">
            {subView === 'tasks'
              ? 'Independent student task stream. Create tasks, accept AI study suggestions, track progress, and associate items with meeting notes.'
              : 'Archive of finished study topics and research milestones.'}
          </p>
        </div>

        {subView === 'tasks' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Personal Task</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. AI-EXTRACTED STUDY SUGGESTIONS (Shown in My Tasks) */}
      {subView === 'tasks' && suggestions.length > 0 && (
        <section className="p-6 rounded-3xl bg-gradient-to-r from-violet-500/10 via-brand-500/10 to-indigo-500/10 border border-violet-500/30 dark:border-violet-500/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white">
                    AI-Extracted Study Suggestions
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white">
                    {suggestions.length} Suggested
                  </span>
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Extracted from engineering meetings you attended. Review and accept them into your personal task list.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {suggestions.map((sug) => (
              <div
                key={sug._id}
                className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-violet-200 dark:border-violet-800/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getPriorityBadge(sug.suggestedPriority)}
                    {sug.sourceSegmentId && (
                      <span className="font-mono text-[10px] text-surface-400">
                        {sug.sourceSegmentId}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-surface-900 dark:text-white line-clamp-2">
                    {sug.title}
                  </h4>

                  <p className="mt-1 text-[11px] text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
                    {sug.description}
                  </p>

                  {sug.meetingTitle && (
                    <div className="mt-2 text-[10px] text-surface-400 truncate">
                      From: <span className="font-semibold">{sug.meetingTitle}</span>
                    </div>
                  )}
                </div>

                {/* Suggestion Actions: Accept, Edit & Accept, Dismiss */}
                <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAcceptSuggestion(sug)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1 transition-colors"
                      title="Add to my tasks"
                    >
                      <Check className="w-3 h-3" />
                      <span>Accept</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditAndAcceptSuggestion(sug)}
                      className="px-2 py-1 text-xs font-medium rounded-lg bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors"
                      title="Edit before accepting"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDismissSuggestion(sug._id)}
                    className="p-1 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Dismiss suggestion"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ACTIVE TASKS SUB-VIEW */}
      {subView === 'tasks' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Filter Status:
              </span>
              {['all', 'pending', 'in_progress'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <span className="text-xs text-surface-400">
              Showing {displayedActiveTasks.length} personal tasks
            </span>
          </div>

          {displayedActiveTasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8 space-y-3">
              <Bookmark className="w-10 h-10 text-violet-400 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-surface-900 dark:text-white">
                No active personal tasks
              </h3>
              <p className="text-xs text-surface-500 max-w-md mx-auto">
                Create a study task or accept AI-extracted suggestions to track your engineering learning goals.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white"
              >
                Create Personal Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedActiveTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-5 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-violet-300 dark:hover:border-violet-800 transition-colors"
                >
                  <div>
                    {/* Top row: Priority, Status & Deadline */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px] text-surface-400">
                        <Calendar className="w-3 h-3 text-surface-400" />
                        <span>{formatTaskDate(task.deadline)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white">
                      {task.title}
                    </h4>

                    {/* Description */}
                    {task.description && (
                      <p className="mt-1 text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Associated Meeting Tag */}
                    {task.meetingTitle && (
                      <div className="mt-2.5">
                        <span
                          onClick={() => task.meetingId && onSelectMeeting(task.meetingId)}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors cursor-pointer"
                          title="Click to view meeting details"
                        >
                          <BookOpen className="w-3 h-3 text-brand-500" />
                          <span className="truncate max-w-[240px]">{task.meetingTitle}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Status Quick Transition + Edit/Delete */}
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-2">
                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5">
                      {task.status !== 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(task._id, 'in_progress')}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Start</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStatusChange(task._id, 'completed')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Complete</span>
                      </button>
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. COMPLETED TASKS SUB-VIEW */}
      {subView === 'completed' && (
        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-surface-900 dark:text-white">
                No completed personal tasks yet
              </h3>
              <p className="text-xs text-surface-500">
                Tasks marked as completed will be archived here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Completed
                      </span>
                      {getPriorityBadge(task.priority)}
                      {task.meetingTitle && (
                        <span className="text-[11px] text-surface-400 truncate max-w-[220px]">
                          • {task.meetingTitle}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white line-through opacity-80">
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(task._id, 'in_progress')}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      <StudentTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialData={editingTask}
        meetings={meetings}
      />

    </div>
  );
}

