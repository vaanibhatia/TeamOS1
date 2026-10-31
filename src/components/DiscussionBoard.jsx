import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Tag,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Check,
  Search,
  User,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { mockUsers } from '../api/mockData';

export const INITIAL_DISCUSSIONS = [
  {
    id: 'disc_001',
    title: 'AWS S3 IAM Policy Missing for Audio Worker Streaming Pipeline',
    category: 'Blocker',
    author: {
      name: 'Rahul Sharma',
      email: 'rahul@syncora.local',
      role: 'employee',
      title: 'Senior Frontend Engineer',
      avatar: 'RS',
      color: 'from-emerald-600 to-teal-500',
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'open', // 'open' | 'resolved'
    message:
      'The audio streaming WebSocket endpoint is returning 502 Bad Gateway during meeting uploads because syncora-worker-role lacks s3:PutObject permissions. We need DevOps to grant this so live audio chunks can persist without dropping speech frames.',
    replies: [
      {
        id: 'rep_001_1',
        author: {
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@syncora.ai',
          role: 'manager',
          title: 'Engineering Lead',
          avatar: 'SJ',
          color: 'from-indigo-600 to-blue-500',
        },
        createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        message:
          'Checking the Terraform IAM definition now. I will attach s3:PutObject and s3:GetObject to the syncora-worker-role and deploy to staging in the next 30 minutes.',
      },
    ],
  },
  {
    id: 'disc_002',
    title: 'WebSocket Handshake: Ticket-based Auth vs SameSite Cookie Headers',
    category: 'API Spec',
    author: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@syncora.ai',
      role: 'manager',
      title: 'Engineering Lead',
      avatar: 'SJ',
      color: 'from-indigo-600 to-blue-500',
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'open',
    message:
      'Standard browser WebSocket constructor does not allow custom Authorization headers. Should we implement a short-lived ticket exchange endpoint `/api/v1/ws/ticket` or rely purely on SameSite=Strict secure cookies?',
    replies: [
      {
        id: 'rep_002_1',
        author: {
          name: 'Alex Rivera',
          email: 'developer@syncora.io',
          role: 'developer',
          title: 'Tech Lead & System Architect',
          avatar: 'AR',
          color: 'from-cyan-600 to-blue-500',
        },
        createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        message:
          'A single-use 60-second ticket exchange via `/api/v1/ws/ticket` is much safer. It prevents leaking persistent cookies or credentials across third-party extensions.',
      },
      {
        id: 'rep_002_2',
        author: {
          name: 'Rahul Sharma',
          email: 'rahul@syncora.local',
          role: 'employee',
          title: 'Senior Frontend Engineer',
          avatar: 'RS',
          color: 'from-emerald-600 to-teal-500',
        },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        message:
          'Agreed! The React client can request the ticket right before calling `new WebSocket()`. Will implement that on the frontend side.',
      },
    ],
  },
  {
    id: 'disc_003',
    title: 'Redis Cache Invalidation Strategy for Multi-User Task Updates',
    category: 'Architecture',
    author: {
      name: 'Priya Patel',
      email: 'priya@syncora.local',
      role: 'employee',
      title: 'Backend Systems Engineer',
      avatar: 'PP',
      color: 'from-amber-600 to-orange-500',
    },
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    status: 'resolved',
    message:
      'When a manager approves a task or an employee marks a task in-progress, we should broadcast an invalidation event on the `syncora:tasks:invalidations` Redis channel to purge stale gateway cache entries.',
    replies: [
      {
        id: 'rep_003_1',
        author: {
          name: 'Alex Chen',
          email: 'student@syncora.io',
          role: 'student',
          title: 'Software Engineering Intern / Observer',
          avatar: 'AC',
          color: 'from-violet-600 to-purple-500',
        },
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        message:
          'Studied this pattern from seg_103 in the Architecture sync. The pub/sub invalidation pattern prevents race conditions across multi-replica nodes.',
      },
    ],
  },
];

// Helper to format relative time
function formatRelativeTime(dateString) {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

// Category badge styles
const CATEGORY_STYLES = {
  Architecture: {
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  },
  'API Spec': {
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
  Blocker: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  General: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
};

export default function DiscussionBoard({
  currentRole = 'manager',
  currentUser: passedUser = null,
}) {
  const currentUser = passedUser || mockUsers[currentRole] || mockUsers.manager;

  // Load threads from localStorage or initial fallback
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('syncora_discussions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse syncora_discussions from localStorage', e);
    }
    return INITIAL_DISCUSSIONS;
  });

  // State for new discussion modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Architecture');
  const [newMessage, setNewMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'open' | 'resolved'

  // Expanded replies state
  const [expandedThreadIds, setExpandedThreadIds] = useState(() => {
    // Expand first thread by default
    return new Set(['disc_001']);
  });

  // Quick reply input states: { [threadId]: string }
  const [replyInputs, setReplyInputs] = useState({});

  // Sync to localStorage and broadcast change whenever threads update
  const persistThreads = (updatedThreads) => {
    setThreads(updatedThreads);
    try {
      localStorage.setItem('syncora_discussions', JSON.stringify(updatedThreads));
      window.dispatchEvent(
        new CustomEvent('syncora_discussions_updated', {
          detail: updatedThreads,
        })
      );
    } catch (e) {
      console.error('Failed to persist discussions', e);
    }
  };

  // Toggle thread expansion
  const toggleExpand = (id) => {
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle Open / Resolved status
  const handleToggleStatus = (threadId) => {
    const updated = threads.map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          status: t.status === 'open' ? 'resolved' : 'open',
        };
      }
      return t;
    });
    persistThreads(updated);
  };

  // Submit New Discussion
  const handleCreateDiscussion = (e) => {
    e?.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter a thread title.');
      return;
    }
    if (!newMessage.trim()) {
      setFormError('Please enter a message.');
      return;
    }

    const newThread = {
      id: `disc_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: {
        name: currentUser.name || `${currentRole} User`,
        email: currentUser.email || `${currentRole}@syncora.io`,
        role: currentRole,
        title: currentUser.title || 'Team Contributor',
        avatar: currentUser.avatar || currentRole.slice(0, 2).toUpperCase(),
        color: currentUser.color || 'from-indigo-600 to-violet-600',
      },
      createdAt: new Date().toISOString(),
      status: 'open',
      message: newMessage.trim(),
      replies: [],
    };

    const updated = [newThread, ...threads];
    persistThreads(updated);

    // Expand the newly created thread
    setExpandedThreadIds((prev) => new Set([...prev, newThread.id]));

    // Reset & close modal
    setNewTitle('');
    setNewMessage('');
    setNewCategory('Architecture');
    setFormError('');
    setIsModalOpen(false);
  };

  // Send a reply
  const handleSendReply = (threadId) => {
    const text = (replyInputs[threadId] || '').trim();
    if (!text) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      author: {
        name: currentUser.name || `${currentRole} User`,
        email: currentUser.email || `${currentRole}@syncora.io`,
        role: currentRole,
        title: currentUser.title || 'Team Contributor',
        avatar: currentUser.avatar || currentRole.slice(0, 2).toUpperCase(),
        color: currentUser.color || 'from-indigo-600 to-violet-600',
      },
      createdAt: new Date().toISOString(),
      message: text,
    };

    const updated = threads.map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: [...(t.replies || []), newReply],
        };
      }
      return t;
    });

    persistThreads(updated);

    // Clear reply input for this thread
    setReplyInputs((prev) => ({ ...prev, [threadId]: '' }));

    // Ensure thread is expanded
    setExpandedThreadIds((prev) => new Set([...prev, threadId]));
  };

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // Category filter
      if (categoryFilter !== 'All' && t.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && t.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesMessage = t.message.toLowerCase().includes(q);
        const matchesAuthor = t.author?.name?.toLowerCase().includes(q);
        const matchesCategory = t.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMessage && !matchesAuthor && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [threads, categoryFilter, statusFilter, searchQuery]);

  const openCount = threads.filter((t) => t.status === 'open').length;
  const resolvedCount = threads.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                  Team Discussions & Clarifications
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {openCount} Open
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Discuss architectural trade-offs, clarify API specifications, and resolve technical blockers collaboratively.
              </p>
            </div>
          </div>
        </div>

        {/* Action: + New Discussion Button */}
        <button
          type="button"
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions by topic, keyword, or author..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {['All', 'Architecture', 'API Spec', 'Blocker', 'General'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-xs'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            All ({threads.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('open')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'open'
                ? 'bg-white dark:bg-surface-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-white dark:bg-surface-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* 3. THREAD FEED */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <MessageSquare className="w-10 h-10 mx-auto text-surface-400 mb-3" />
            <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
              No discussions found
            </h3>
            <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'Be the first to start a discussion or clarify an architectural requirement!'}
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:bg-brand-500 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Discussion</span>
            </button>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isExpanded = expandedThreadIds.has(thread.id);
            const repliesCount = thread.replies ? thread.replies.length : 0;
            const catStyle = CATEGORY_STYLES[thread.category] || CATEGORY_STYLES.General;
            const isOpen = thread.status === 'open';

            return (
              <div
                key={thread.id}
                className="rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs hover:border-surface-300 dark:hover:border-surface-700 transition-all overflow-hidden"
              >
                {/* Thread Card Header & Body */}
                <div className="p-5 sm:p-6 space-y-3">
                  
                  {/* Top Meta Bar */}
                  <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                          thread.author?.color || 'from-indigo-600 to-violet-600'
                        } text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0`}
                      >
                        {thread.author?.avatar || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-surface-900 dark:text-white">
                            {thread.author?.name || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-surface-400">
                            {thread.author?.email}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 capitalize">
                            {thread.author?.role || 'team'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-surface-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(thread.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Category & Status Pill Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${catStyle.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                        <span>{thread.category}</span>
                      </span>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(thread.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                          isOpen
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        }`}
                        title="Click to toggle Open / Resolved"
                      >
                        {isOpen ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Open</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Resolved</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Thread Title */}
                  <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white leading-snug">
                    {thread.title}
                  </h3>

                  {/* Thread Message Body */}
                  <p className="text-xs sm:text-sm text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
                    {thread.message}
                  </p>

                  {/* Footer Bar: Expand Replies toggle */}
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleExpand(thread.id)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer group"
                    >
                      <MessageCircle className="w-4 h-4 text-surface-400 group-hover:text-brand-500" />
                      <span>
                        {repliesCount} {repliesCount === 1 ? 'Reply' : 'Replies'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isExpanded) toggleExpand(thread.id);
                      }}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                    >
                      Reply to thread
                    </button>
                  </div>
                </div>

                {/* 4. EXPANDABLE REPLIES DRAWER */}
                {isExpanded && (
                  <div className="bg-surface-50 dark:bg-surface-950/60 border-t border-surface-200 dark:border-surface-800 p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
                    
                    {/* List of Replies */}
                    {repliesCount === 0 ? (
                      <p className="text-xs text-surface-500 italic py-2">
                        No replies yet. Be the first to add your perspective!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {thread.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-3.5 rounded-xl bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800/80 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${
                                    reply.author?.color || 'from-indigo-600 to-violet-600'
                                  } text-white font-bold text-[10px] flex items-center justify-center`}
                                >
                                  {reply.author?.avatar || 'U'}
                                </div>
                                <span className="text-xs font-bold text-surface-900 dark:text-white">
                                  {reply.author?.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-100 dark:bg-surface-800 text-surface-500 capitalize">
                                  {reply.author?.role}
                                </span>
                              </div>
                              <span className="text-[10px] text-surface-400">
                                {formatRelativeTime(reply.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap pl-8">
                              {reply.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyInputs[thread.id] || ''}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({
                              ...prev,
                              [thread.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(thread.id);
                            }
                          }}
                          placeholder={`Reply as ${currentUser.name || 'User'}...`}
                          className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(thread.id)}
                          disabled={!(replyInputs[thread.id] || '').trim()}
                          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer flex-shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. NEW DISCUSSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-900 dark:text-white">
                    Start a New Discussion
                  </h3>
                  <p className="text-[11px] text-surface-500">
                    Post a clarification or technical question to the team.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Thread Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g. Rate limiter threshold on /api/v1/stream"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Category Tag *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Architecture', 'API Spec', 'Blocker', 'General'].map((cat) => {
                    const isSelected = newCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border-brand-500 shadow-xs'
                            : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-surface-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Discussion Content *
                </label>
                <textarea
                  rows={4}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Describe the context, technical dilemma, or question for team members..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              {/* Posting As info */}
              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-700/60 flex items-center justify-between text-xs text-surface-500">
                <span className="text-[11px]">Publishing as:</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">
                  {currentUser.name} ({currentRole})
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

