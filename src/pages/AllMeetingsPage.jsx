import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import MeetingCard from '../components/MeetingCard';

export default function AllMeetingsPage({
  meetings = [],
  onSelectMeeting = () => {},
  onBackToHome = () => {},
  initialSearchQuery = '',
}) {
  const [search, setSearch] = useState(initialSearchQuery);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'completed' | 'processing'

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(search.toLowerCase()) ||
        meeting.aiSummary?.toLowerCase().includes(search.toLowerCase()) ||
        meeting.topicsDiscussed?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ? true : meeting.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [meetings, search, filterStatus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">
              All Meetings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {filteredMeetings.length} Available
            </span>
          </div>
          <p className="mt-1 text-xs text-surface-500">
            Browse full archive of synthesized engineering sessions with verified speech evidence.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['all', 'completed', 'processing'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === status
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title, topic, or summary..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      {/* Grid of Meeting Cards */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8">
          <Calendar className="w-10 h-10 text-surface-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
            No meetings found
          </h3>
          <p className="text-xs text-surface-500 mt-1">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              onSelectMeeting={onSelectMeeting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

