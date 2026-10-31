import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarRange,
  Clock,
  GitCommitHorizontal,
  Calendar,
  Filter,
  Plus,
  Search,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Diamond,
  Play,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  User,
  Flag,
  Sparkles,
  Link2,
  Edit2,
  Info,
} from 'lucide-react';
import { mockUsers } from '../api/mockData';

// =============================================================================
// DEFAULT TIMELINE DATA & GROUNDED TASKS
// =============================================================================

export const PROJECTS_LIST = [
  { id: 'p1', name: 'Sprint 14 Architecture & Pipeline', badge: 'Active Sprint' },
  { id: 'p2', name: 'SwasthQueue v2', badge: 'Next Release' },
  { id: 'p3', name: 'AquaSentry Core', badge: 'Research' },
];

export const INITIAL_TIMELINE_TASKS = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'PostgreSQL Database Schema & Migration',
    subsystem: 'database/schema',
    branch: 'feat/pg-tasks-compound-index',
    assignee: {
      name: 'Priya Patel',
      email: 'priya@syncora.local',
      avatar: 'PP',
      color: 'from-amber-600 to-orange-500',
    },
    startDate: '2026-10-20',
    endDate: '2026-10-25',
    status: 'completed', // completed | in_progress | blocked | overdue
    priority: 'P1',
    isCriticalPath: false,
    progress: 100,
    dependencies: [],
    evidenceSegmentId: 'seg_101',
    timestamp: '04:15',
    speaker: 'Priya Patel',
    quote: 'Compound indexes on (meeting_id, approval_status, assignee_id) added to satisfy the 100ms API SLA.',
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'API Gateway Token-Bucket Rate Limiter',
    subsystem: 'backend/api-gateway',
    branch: 'feat/gateway-rate-limiter',
    assignee: {
      name: 'Priya Patel',
      email: 'priya@syncora.local',
      avatar: 'PP',
      color: 'from-amber-600 to-orange-500',
    },
    startDate: '2026-10-23',
    endDate: '2026-10-28',
    status: 'completed',
    priority: 'P1',
    isCriticalPath: false,
    progress: 100,
    dependencies: ['t1'],
    evidenceSegmentId: 'seg_103',
    timestamp: '14:20',
    speaker: 'Priya Patel',
    quote: 'Redis sliding-window rate limiter deployed. Caps incoming audio websocket bursts at 60 req/min.',
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'HttpOnly Cookie Auth & JWT Refresh Flow',
    subsystem: 'backend/auth',
    branch: 'fix/http-only-cookie-auth',
    assignee: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@syncora.ai',
      avatar: 'SJ',
      color: 'from-indigo-600 to-blue-500',
    },
    startDate: '2026-10-26',
    endDate: '2026-11-02',
    status: 'in_progress',
    priority: 'P0',
    isCriticalPath: true,
    progress: 75,
    dependencies: ['t2'],
    evidenceSegmentId: 'seg_102',
    timestamp: '08:20',
    speaker: 'Sarah Jenkins',
    quote: 'Transitioning all JWT refresh tokens to SameSite=Strict secure HTTP-only cookies to eliminate XSS surface.',
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'Live Speech Audio Ingestion WebSocket Stream',
    subsystem: 'worker/whisper',
    branch: 'feat/live-audio-websocket-stream',
    assignee: {
      name: 'Rahul Sharma',
      email: 'rahul@syncora.local',
      avatar: 'RS',
      color: 'from-emerald-600 to-teal-500',
    },
    startDate: '2026-10-28',
    endDate: '2026-11-05',
    status: 'blocked',
    priority: 'P0',
    isCriticalPath: true,
    progress: 40,
    blockerReason: 'Blocked by missing S3 IAM policy for live speech buffer uploads (502 Bad Gateway).',
    dependencies: ['t3'],
    evidenceSegmentId: 'seg_204',
    timestamp: '22:15',
    speaker: 'Rahul Sharma',
    quote: 'Audio streaming WebSocket endpoint returning 502 Bad Gateway because S3 bucket write credentials are missing in worker role.',
  },
  {
    id: 't5',
    projectId: 'p1',
    title: 'Whisper Speech-to-Text Model Transcribe Pipeline',
    subsystem: 'worker/whisper',
    branch: 'feat/whisper-tensorrt-opt',
    assignee: {
      name: 'Alex Rivera',
      email: 'developer@syncora.io',
      avatar: 'AR',
      color: 'from-cyan-600 to-blue-500',
    },
    startDate: '2026-11-02',
    endDate: '2026-11-09',
    status: 'blocked',
    priority: 'P1',
    isCriticalPath: false,
    progress: 15,
    blockerReason: 'Awaiting audio worker WebSocket stream stabilization and GPU cluster VRAM quota.',
    dependencies: ['t4'],
    evidenceSegmentId: 'seg_301',
    timestamp: '11:50',
    speaker: 'Alex Rivera',
    quote: 'Whisper TensorRT optimization benchmarked; awaiting persistent audio stream buffer to initiate GPU batch processing.',
  },
  {
    id: 't6',
    projectId: 'p1',
    title: 'Real-time Evidence Drawer Waveform Scrubber',
    subsystem: 'frontend/waveform',
    branch: 'feat/waveform-audio-scrubber',
    assignee: {
      name: 'Rahul Sharma',
      email: 'rahul@syncora.local',
      avatar: 'RS',
      color: 'from-emerald-600 to-teal-500',
    },
    startDate: '2026-11-04',
    endDate: '2026-11-12',
    status: 'in_progress',
    priority: 'P2',
    isCriticalPath: false,
    progress: 30,
    dependencies: ['t4'],
    evidenceSegmentId: 'seg_001',
    timestamp: '02:45',
    speaker: 'Sarah Jenkins',
    quote: 'User should click any spoken quote and jump straight into the exact audio second inside the responsive drawer.',
  },
  {
    id: 't7',
    projectId: 'p1',
    title: 'Multi-Region Read Replica & Failover Latency Spec',
    subsystem: 'devops/database',
    branch: 'docs/read-replica-failover-dr',
    assignee: {
      name: 'Alex Rivera',
      email: 'developer@syncora.io',
      avatar: 'AR',
      color: 'from-cyan-600 to-blue-500',
    },
    startDate: '2026-10-30',
    endDate: '2026-11-14',
    status: 'in_progress',
    priority: 'P1',
    isCriticalPath: false,
    progress: 50,
    dependencies: ['t1'],
    evidenceSegmentId: 'seg_302',
    timestamp: '19:10',
    speaker: 'Alex Rivera',
    quote: 'Cross-region PostgreSQL replication latency needs bounded consistency checks to avoid task approval race conditions.',
  },
];

export const INITIAL_MILESTONES = [
  {
    id: 'm1',
    projectId: 'p1',
    title: 'Security & Gateway Hardening',
    targetDate: '2026-10-28',
    status: 'completed', // completed | at_risk | upcoming
    modules: ['database/schema', 'backend/api-gateway'],
    description: 'PostgreSQL schema verified with compound indexes and API gateway rate limiting active.',
    linkedTaskIds: ['t1', 't2'],
  },
  {
    id: 'm2',
    projectId: 'p1',
    title: 'Audio Pipeline & Speech Buffer Ingestion',
    targetDate: '2026-11-05',
    status: 'at_risk',
    modules: ['backend/auth', 'worker/whisper'],
    description: 'WebSocket handshake secured with HttpOnly cookies and live speech chunks uploaded to S3.',
    linkedTaskIds: ['t3', 't4'],
  },
  {
    id: 'm3',
    projectId: 'p1',
    title: 'End-to-End Transcription & Evidence Sync',
    targetDate: '2026-11-15',
    status: 'upcoming',
    modules: ['worker/whisper', 'frontend/waveform', 'devops/database'],
    description: 'Complete pipeline verified from audio stream to Whisper transcript generation with real-time waveform sync.',
    linkedTaskIds: ['t5', 't6', 't7'],
  },
];

// Timeline Display Window: Oct 19, 2026 - Nov 16, 2026 (28 days)
const WINDOW_START_STR = '2026-10-19';
const WINDOW_END_STR = '2026-11-16';
const TODAY_STR = '2026-10-31';

function parseDate(str) {
  const parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function getDaysDiff(d1, d2) {
  const ms = d2.getTime() - d1.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function ProjectTimeline({
  currentRole = 'manager',
  currentUser: passedUser = null,
  onOpenEvidence = () => {},
  onSelectMeeting = () => {},
}) {
  const currentUser = passedUser || mockUsers[currentRole] || mockUsers.manager;

  // Selected Project
  const [selectedProjectId, setSelectedProjectId] = useState('p1');
  const selectedProject = PROJECTS_LIST.find((p) => p.id === selectedProjectId) || PROJECTS_LIST[0];

  // View Mode: 'gantt' | 'milestones'
  const [viewMode, setViewMode] = useState('gantt');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Tasks & Milestones with LocalStorage Persistence
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('syncora_timeline_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load timeline tasks', e);
    }
    return INITIAL_TIMELINE_TASKS;
  });

  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem('syncora_timeline_milestones');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load timeline milestones', e);
    }
    return INITIAL_MILESTONES;
  });

  // Save to localStorage
  const persistTasks = (newTasks) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('syncora_timeline_tasks', JSON.stringify(newTasks));
    } catch (e) {
      console.error('Failed to save timeline tasks', e);
    }
  };

  const persistMilestones = (newMilestones) => {
    setMilestones(newMilestones);
    try {
      localStorage.setItem('syncora_timeline_milestones', JSON.stringify(newMilestones));
    } catch (e) {
      console.error('Failed to save timeline milestones', e);
    }
  };

  // Drawer details state
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Editable Date state inside Task Drawer
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isCopiedBranch, setIsCopiedBranch] = useState(false);

  // Add Milestone Modal State
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mTargetDate, setMTargetDate] = useState('2026-11-10');
  const [mDescription, setMDescription] = useState('');
  const [mAssociatedModules, setMAssociatedModules] = useState('worker/whisper, frontend/waveform');
  const [mError, setMError] = useState('');

  // Sync drawer edit dates when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setEditStartDate(selectedTask.startDate);
      setEditEndDate(selectedTask.endDate);
      setSelectedMilestone(null);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (selectedMilestone) {
      setSelectedTask(null);
    }
  }, [selectedMilestone]);

  // Handle Date Save in Task Drawer
  const handleSaveDates = () => {
    if (!selectedTask || !editStartDate || !editEndDate) return;
    if (new Date(editEndDate) < new Date(editStartDate)) return;

    const updated = tasks.map((t) =>
      t.id === selectedTask.id
        ? { ...t, startDate: editStartDate, endDate: editEndDate }
        : t
    );
    persistTasks(updated);
    setSelectedTask((prev) => ({
      ...prev,
      startDate: editStartDate,
      endDate: editEndDate,
    }));
  };

  // Copy branch
  const handleCopyBranch = (branch) => {
    navigator.clipboard?.writeText(branch);
    setIsCopiedBranch(true);
    setTimeout(() => setIsCopiedBranch(false), 2000);
  };

  // Handle Add Milestone Submission
  const handleCreateMilestone = (e) => {
    e?.preventDefault();
    if (!mTitle.trim()) {
      setMError('Please enter a milestone title.');
      return;
    }
    if (!mTargetDate) {
      setMError('Please select a target deadline.');
      return;
    }

    const newM = {
      id: `m_${Date.now()}`,
      projectId: selectedProjectId,
      title: mTitle.trim(),
      targetDate: mTargetDate,
      status: 'upcoming',
      modules: mAssociatedModules
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description: mDescription.trim() || 'Key sprint delivery checkpoint.',
      linkedTaskIds: [],
    };

    const updated = [...milestones, newM];
    persistMilestones(updated);

    setMTitle('');
    setMDescription('');
    setMError('');
    setIsAddMilestoneOpen(false);
  };

  // Window bounds
  const windowStart = useMemo(() => parseDate(WINDOW_START_STR), []);
  const windowEnd = useMemo(() => parseDate(WINDOW_END_STR), []);
  const totalDays = useMemo(() => getDaysDiff(windowStart, windowEnd), [windowStart, windowEnd]);

  // Days array for header
  const daysArray = useMemo(() => {
    const list = [];
    const current = new Date(windowStart);
    for (let i = 0; i <= totalDays; i++) {
      list.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return list;
  }, [windowStart, totalDays]);

  // Calculate Today position percentage
  const todayPositionPercent = useMemo(() => {
    const today = parseDate(TODAY_STR);
    const diff = getDaysDiff(windowStart, today);
    return Math.max(0, Math.min(100, (diff / totalDays) * 100));
  }, [windowStart, totalDays]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.projectId !== selectedProjectId) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (assigneeFilter !== 'all' && t.assignee.name !== assigneeFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, selectedProjectId, statusFilter, assigneeFilter, priorityFilter]);

  // Assignees list for filter
  const assigneesList = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => set.add(t.assignee.name));
    return Array.from(set);
  }, [tasks]);

  // Helper to compute task bar position & width
  const getTaskBarCoords = (task) => {
    const start = parseDate(task.startDate);
    const end = parseDate(task.endDate);

    const startDiff = getDaysDiff(windowStart, start);
    const duration = getDaysDiff(start, end) + 1;

    const leftPercent = (startDiff / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(2.5, widthPercent)}%`,
    };
  };

  // Helper to compute milestone position
  const getMilestonePosition = (targetDateStr) => {
    const target = parseDate(targetDateStr);
    const diff = getDaysDiff(windowStart, target);
    return `${Math.max(0, Math.min(98, (diff / totalDays) * 100))}%`;
  };

  // Status Styling Helpers (Refined Light Mode Palette)
  const getTaskStatusStyle = (status, isCriticalPath) => {
    let base = '';
    switch (status) {
      case 'completed':
        base = 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80 shadow-xs';
        break;
      case 'in_progress':
        base = 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100/80 shadow-xs';
        break;
      case 'blocked':
        base = 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/80 shadow-xs';
        break;
      case 'overdue':
        base = 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100/80 shadow-xs';
        break;
      default:
        base = 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100 shadow-xs';
    }

    if (isCriticalPath) {
      return `${base} border-2 border-rose-500 ring-2 ring-rose-500/10 shadow-sm shadow-rose-500/10`;
    }
    return `${base} border`;
  };

  const getMilestoneStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'at_risk':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. MAIN WORKSPACE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                  Timeline
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Sprint 14 Active
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Visual roadmap of deliverables, milestones, and critical-path dependencies.
              </p>
            </div>
          </div>
        </div>

        {/* Action: + Add Milestone CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setMError('');
              setIsAddMilestoneOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* 2. TOP TOOLBAR ROW: Controls & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        
        {/* Left: Project Selector + View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Dropdown */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              aria-label="Select Project"
              className="pl-3 pr-8 py-2 rounded-xl text-xs font-bold bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {PROJECTS_LIST.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.badge})
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher Toggle: Gantt vs Milestones Only */}
          <div className="flex items-center p-1 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'gantt'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-xs font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <GitCommitHorizontal className="w-3.5 h-3.5" />
              <span>Timeline (Gantt)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('milestones')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'milestones'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-xs font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <Diamond className="w-3.5 h-3.5" />
              <span>Milestones Only</span>
            </button>
          </div>
        </div>

        {/* Right: Date Navigation & Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Navigation */}
          <div className="flex items-center gap-1.5 bg-surface-50 dark:bg-surface-800 px-2 py-1 rounded-xl border border-surface-200 dark:border-surface-700 text-xs">
            <button
              type="button"
              aria-label="Previous Month"
              className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-surface-700 dark:text-surface-200 px-1">
              Oct – Nov 2026
            </span>
            <button
              type="button"
              aria-label="Next Month"
              className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jump to Today Button */}
          <button
            type="button"
            onClick={() => {
              // Scroll to today marker if available
              const el = document.getElementById('today-marker-line');
              el?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }}
            className="px-2.5 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Jump to Today
          </button>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="px-2.5 py-1.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked / At Risk</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Filter Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by Priority"
            className="px-2.5 py-1.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="P0">P0 Critical Path</option>
            <option value="P1">P1 High</option>
            <option value="P2">P2 Medium</option>
          </select>

          {/* Filter Assignee */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            aria-label="Filter by Assignee"
            className="px-2.5 py-1.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Assignees</option>
            {assigneesList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. DESKTOP VIEW: THREADLINE-INSPIRED TIMELINE GANTT (LIGHT MODE) */}
      {viewMode === 'gantt' && (
        <div className="hidden md:block rounded-3xl bg-white border border-slate-200 shadow-xl p-6 relative overflow-hidden">
          
          {/* Top Milestones Diamond Track */}
          <div className="relative z-10 mb-4 pb-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Milestone Tracks
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rotate-45 inline-block shadow-2xs" />
                <span className="text-[11px] text-slate-600 font-medium">Completed</span>
                <span className="w-2.5 h-2.5 bg-amber-500 rotate-45 inline-block ml-2 shadow-2xs" />
                <span className="text-[11px] text-slate-600 font-medium">At Risk</span>
                <span className="w-2.5 h-2.5 bg-indigo-600 rotate-45 inline-block ml-2 shadow-2xs" />
                <span className="text-[11px] text-slate-600 font-medium">Upcoming</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold">P0 Red Outline = Critical-Path Dependency</span>
            </div>
          </div>

          {/* Gantt Container with Horizontal Scroll */}
          <div className="relative z-10 overflow-x-auto min-w-full">
            <div className="min-w-[940px]">
              
              {/* Header: Dates & Weeks */}
              <div className="flex border-b border-slate-200 bg-slate-100/70 rounded-t-xl py-2">
                {/* Left Task Column label */}
                <div className="w-72 flex-shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-600 pl-3 border-r border-slate-200">
                  Deliverable & Owner
                </div>

                {/* Date Grid Header */}
                <div className="flex-1 relative flex text-[10px] font-mono text-slate-600">
                  {daysArray.map((day, idx) => {
                    const isToday = day.toISOString().startsWith(TODAY_STR);
                    const dayNum = day.getDate();
                    const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'narrow' });
                    const isMonday = day.getDay() === 1;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                    return (
                      <div
                        key={idx}
                        className={`flex-1 text-center border-l border-slate-200/60 relative py-1 ${
                          isToday
                            ? 'bg-blue-100/80 text-blue-800 font-bold'
                            : isWeekend
                            ? 'bg-slate-200/40 text-slate-500'
                            : ''
                        }`}
                      >
                        <div className="text-[9px] text-slate-500">{dayOfWeek}</div>
                        <div className={`mt-0.5 ${isMonday ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                          {dayNum}
                        </div>
                      </div>
                    );
                  })}

                  {/* Milestones Flag Markers on Header Track */}
                  {milestones.map((m) => {
                    const leftPos = getMilestonePosition(m.targetDate);
                    const colorClass =
                      m.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : m.status === 'at_risk'
                        ? 'bg-amber-500 text-white'
                        : 'bg-indigo-600 text-white';

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMilestone(m)}
                        style={{ left: leftPos }}
                        className="absolute -top-3 -translate-x-1/2 z-30 cursor-pointer group"
                        title={`${m.title} (${m.targetDate})`}
                      >
                        <div
                          className={`w-5 h-5 rotate-45 rounded-xs flex items-center justify-center shadow-md transition-transform group-hover:scale-125 ${colorClass}`}
                        >
                          <Diamond className="w-3 h-3 -rotate-45" />
                        </div>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-white border border-slate-200 text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-lg z-40">
                          {m.title} • {m.targetDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task Rows */}
              <div className="divide-y divide-slate-100 relative bg-white">
                
                {/* PROMINENT "TODAY" VERTICAL BLUE DASHED LINE */}
                <div
                  id="today-marker-line"
                  style={{ left: `calc(18rem + (100% - 18rem) * ${todayPositionPercent / 100})` }}
                  className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
                >
                  <div className="px-2 py-0.5 rounded shadow-sm bg-blue-600 text-white text-[10px] font-mono font-bold tracking-tight">
                    TODAY (OCT 31)
                  </div>
                  <div className="w-[2px] flex-1 border-r-2 border-dashed border-blue-500 shadow-xs" />
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-medium">
                    No deliverables match the selected filters.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const coords = getTaskBarCoords(task);
                    const statusClass = getTaskStatusStyle(task.status, task.isCriticalPath);
                    const isSelected = selectedTask?.id === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center py-2.5 transition-colors group ${
                          isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Left Task Column: Title, Subsystem, Assignee */}
                        <div
                          onClick={() => setSelectedTask(task)}
                          className="w-72 flex-shrink-0 pr-4 pl-3 py-1 flex items-center justify-between cursor-pointer border-r border-slate-200"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${task.assignee.color} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs`}
                              title={task.assignee.name}
                            >
                              {task.assignee.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                {task.title}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="font-mono text-slate-500 text-xs">{task.subsystem}</span>
                                {task.priority === 'P0' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                    P0 Critical
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Gantt Canvas Column */}
                        <div className="flex-1 relative h-9 flex items-center">
                          {/* Background Grid Lines */}
                          <div className="absolute inset-0 flex pointer-events-none">
                            {daysArray.map((day, i) => {
                              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                              return (
                                <div
                                  key={i}
                                  className={`flex-1 border-l border-slate-100 h-full ${
                                    isWeekend ? 'bg-slate-50/50' : ''
                                  }`}
                                />
                              );
                            })}
                          </div>

                          {/* Task Bar */}
                          <div
                            onClick={() => setSelectedTask(task)}
                            style={{ left: coords.left, width: coords.width }}
                            className={`absolute h-7 rounded-xl px-2.5 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:scale-[1.01] z-10 ${statusClass} ${
                              isSelected ? 'ring-2 ring-indigo-500' : ''
                            }`}
                            title={`${task.title} (${task.startDate} to ${task.endDate})`}
                          >
                            {/* Inner Progress Bar */}
                            <div
                              className="absolute left-0 top-0 bottom-0 rounded-l-xl bg-slate-900/5 pointer-events-none"
                              style={{ width: `${task.progress}%` }}
                            />

                            {/* Bar Label */}
                            <div className="flex items-center gap-1.5 truncate relative z-10">
                              {task.status === 'completed' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              )}
                              {task.status === 'blocked' && (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-pulse" />
                              )}
                              <span className="text-[11px] font-bold truncate">
                                {task.title}
                              </span>
                            </div>

                            {/* Progress badge */}
                            <span className="text-[10px] font-mono font-semibold opacity-75 pl-2 hidden lg:inline relative z-10">
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW MODE: MILESTONES ONLY */}
      {viewMode === 'milestones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {milestones.map((m) => {
              const isSelected = selectedMilestone?.id === m.id;
              const linkedTasksList = tasks.filter((t) => m.linkedTaskIds.includes(t.id));
              const completedLinked = linkedTasksList.filter((t) => t.status === 'completed').length;
              const percent =
                linkedTasksList.length > 0
                  ? Math.round((completedLinked / linkedTasksList.length) * 100)
                  : 0;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMilestone(m)}
                  className={`p-6 rounded-3xl bg-white dark:bg-surface-900 border transition-all cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-surface-200 dark:border-surface-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getMilestoneStatusBadge(
                        m.status
                      )}`}
                    >
                      {m.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-surface-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Target: {m.targetDate}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-surface-900 dark:text-white leading-snug">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Modules Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {m.modules.map((mod) => (
                      <span
                        key={mod}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>

                  {/* Linked Tasks Progress */}
                  <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-surface-600 dark:text-surface-400">
                        Deliverables Completion
                      </span>
                      <span className="font-bold text-surface-900 dark:text-white font-mono">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. RESPONSIVE FALLBACK: CHRONOLOGICAL FEED (Shown on Mobile < 768px) */}
      <div className="block md:hidden space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
            Chronological Deliverables & Milestones
          </span>
          <span className="text-[11px] font-mono text-indigo-500">Mobile Timeline Feed</span>
        </div>

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-surface-400">
                {task.startDate} → {task.endDate}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  task.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : task.status === 'blocked'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {task.status.toUpperCase()}
              </span>
            </div>

            <h4 className="text-sm font-bold text-surface-900 dark:text-white leading-snug">
              {task.title}
            </h4>

            <div className="flex items-center justify-between text-xs text-surface-500 pt-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-md bg-gradient-to-tr ${task.assignee.color} text-white font-bold text-[9px] flex items-center justify-center`}
                >
                  {task.assignee.avatar}
                </div>
                <span>{task.assignee.name}</span>
              </div>
              <span className="font-mono text-[10px]">{task.subsystem}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 6. TASK DETAIL DRAWER (Side Modal on Click) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md h-full bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-7 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    {selectedTask.subsystem}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedTask.priority === 'P0'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                    }`}
                  >
                    {selectedTask.priority}
                  </span>
                  {selectedTask.isCriticalPath && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Critical Path
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white leading-snug">
                  {selectedTask.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                aria-label="Close Drawer"
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assignee Card */}
            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${selectedTask.assignee.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}
                >
                  {selectedTask.assignee.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-surface-900 dark:text-white">
                    {selectedTask.assignee.name}
                  </div>
                  <div className="text-[11px] text-surface-400">{selectedTask.assignee.email}</div>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {selectedTask.progress}% done
              </span>
            </div>

            {/* Blocker Alert if Blocked */}
            {selectedTask.blockerReason && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Critical Blocker Flagged</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                  {selectedTask.blockerReason}
                </p>
              </div>
            )}

            {/* EDITABLE DATES SECTION */}
            <div className="space-y-3 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                  Schedule & Dates
                </span>
                <span className="text-[10px] text-surface-400">Live Gantt Update</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-surface-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 font-mono text-surface-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-surface-500 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 font-mono text-surface-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDates}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Save Schedule Adjustments
              </button>
            </div>

            {/* Git Branch / PR */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                Linked Git Branch
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 font-mono text-xs">
                <div className="flex items-center gap-2 truncate text-indigo-600 dark:text-indigo-400">
                  <GitBranch className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{selectedTask.branch}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyBranch(selectedTask.branch)}
                  className="p-1 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
                  title="Copy Branch"
                >
                  {isCopiedBranch ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Grounded Meeting Evidence */}
            {selectedTask.evidenceSegmentId && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">
                    Spoken Meeting Evidence
                  </span>
                  <span className="font-mono text-[10px] text-indigo-500">
                    {selectedTask.speaker} • {selectedTask.timestamp}
                  </span>
                </div>
                <p className="text-xs italic text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  "{selectedTask.quote}"
                </p>
                <button
                  type="button"
                  onClick={() => onOpenEvidence([selectedTask.evidenceSegmentId])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
                >
                  <Play className="w-3 h-3 fill-indigo-600 dark:fill-indigo-400" />
                  <span>▶ Jump to {selectedTask.timestamp} in Audio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. MILESTONE DETAIL DRAWER (Side Modal on Click) */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md h-full bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-7 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getMilestoneStatusBadge(
                    selectedMilestone.status
                  )}`}
                >
                  {selectedMilestone.status.replace('_', ' ').toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white leading-snug pt-1">
                  {selectedMilestone.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                aria-label="Close Milestone Drawer"
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Date & Countdown */}
            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-surface-500">Target Hard Deadline</span>
                <div className="text-base font-extrabold text-surface-900 dark:text-white font-mono mt-0.5">
                  {selectedMilestone.targetDate}
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Sprint 14 Track
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                Milestone Scope
              </span>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                {selectedMilestone.description}
              </p>
            </div>

            {/* Associated Modules */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                Associated Modules
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedMilestone.modules.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Linked Deliverables List */}
            <div className="space-y-2 pt-2 border-t border-surface-100 dark:border-surface-800">
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                Linked Deliverables
              </span>
              <div className="space-y-2">
                {tasks
                  .filter((t) => selectedMilestone.linkedTaskIds.includes(t.id))
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/60 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-surface-900 dark:text-white truncate">
                          {task.title}
                        </div>
                        <div className="text-[10px] font-mono text-surface-500">
                          {task.startDate} to {task.endDate}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-300'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. ADD MILESTONE MODAL */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Diamond className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-900 dark:text-white">
                    Add Sprint Milestone
                  </h3>
                  <p className="text-[11px] text-surface-500">
                    Define a critical delivery checkpoint or hard deadline.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMilestoneOpen(false)}
                aria-label="Close Modal"
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {mError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{mError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  placeholder="e.g. Phase 1 Security Audit Sign-off"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                    Target Deadline *
                  </label>
                  <input
                    type="date"
                    value={mTargetDate}
                    onChange={(e) => setMTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                    Associated Project
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedProject.name}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface-100 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Associated Modules (comma separated)
                </label>
                <input
                  type="text"
                  value={mAssociatedModules}
                  onChange={(e) => setMAssociatedModules(e.target.value)}
                  placeholder="worker/whisper, backend/auth"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                  placeholder="Explain the technical deliverable criteria for this milestone..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

