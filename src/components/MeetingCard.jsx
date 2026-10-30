import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  HelpCircle,
  FileText,
} from 'lucide-react';

/**
 * Format date string to readable format e.g. "Oct 29, 2026"
 */
function formatDate(dateStr) {
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

export default function MeetingCard({
  meeting,
  onSelectMeeting = () => {},
  isActive = false,
}) {
  if (!meeting) return null;

  const taskCount = meeting.tasks?.length || 0;
  const decisionCount = meeting.decisions?.length || 0;
  const questionCount = meeting.openQuestions?.length || 0;
  const isCompleted = meeting.status === 'completed';

  return (
    <div
      onClick={() => onSelectMeeting(meeting._id)}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer p-5 sm:p-6 flex flex-col justify-between ${
        isActive
          ? 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-500 ring-2 ring-brand-500/30 shadow-md'
          : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Header: Date, Duration & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-surface-400" />
              {formatDate(meeting.startedAt)}
            </span>
            {meeting.duration && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-surface-400" />
                  {meeting.duration}
                </span>
              </>
            )}
          </div>

          {/* Processing Status */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-500 animate-pulse" />
            )}
            <span className="capitalize">{meeting.status || 'completed'}</span>
          </span>
        </div>

        {/* Meeting Title */}
        <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {meeting.title}
        </h3>

        {/* Short AI Summary */}
        <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-2 min-h-[40px]">
          {meeting.aiSummary || 'Automated meeting intelligence extraction active.'}
        </p>

        {/* Participants Row */}
        {meeting.participants && meeting.participants.length > 0 && (
          <div className="mt-3.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Attendees:
            </span>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {meeting.participants.slice(0, 4).map((p, idx) => (
                <div
                  key={idx}
                  title={`${p.name} (${p.role})`}
                  className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 border-2 border-white dark:border-surface-900 flex items-center justify-center text-[10px] font-bold text-surface-700 dark:text-surface-300 ring-1 ring-surface-200/50"
                >
                  {p.avatar || p.name.charAt(0)}
                </div>
              ))}
              {meeting.participants.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-700 border-2 border-white dark:border-surface-900 flex items-center justify-center text-[9px] font-bold text-surface-600 dark:text-surface-300">
                  +{meeting.participants.length - 4}
                </div>
              )}
            </div>
            <span className="text-[11px] text-surface-500 truncate max-w-[150px]">
              {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer: Metrics & CTA */}
      <div className="mt-5 pt-3.5 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-2">
        {/* Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-medium"
            title={`${taskCount} extracted tasks`}
          >
            <CheckSquare className="w-3 h-3 text-brand-500" />
            <span>{taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}</span>
          </span>

          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-medium"
            title={`${decisionCount} confirmed decisions`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>{decisionCount} {decisionCount === 1 ? 'Decision' : 'Decisions'}</span>
          </span>

          {questionCount > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-medium"
              title={`${questionCount} unresolved questions`}
            >
              <HelpCircle className="w-3 h-3 text-amber-500" />
              <span>{questionCount} {questionCount === 1 ? 'Question' : 'Questions'}</span>
            </span>
          )}
        </div>

        {/* View Details Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectMeeting(meeting._id);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-500 transition-colors flex-shrink-0"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

