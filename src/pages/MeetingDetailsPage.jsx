import React, { useState, useRef } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  CheckSquare,
  AlertTriangle,
  ExternalLink,
  Tag,
  FileText,
  Bookmark,
  ChevronRight,
  User,
  Quote,
  Check,
} from 'lucide-react';

/**
 * Format date string e.g. "Oct 29, 2026 • 10:00 UTC"
 */
function formatMeetingDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format timestamp into [mm:ss] format
 */
function formatTimestamp(timeStr) {
  if (!timeStr) return '[00:00]';
  const parts = String(timeStr).trim().split(':');
  if (parts.length === 3) {
    return `[${parts[1]}:${parts[2]}]`;
  }
  if (parts.length === 2) {
    return `[${parts[0]}:${parts[1]}]`;
  }
  return `[${timeStr}]`;
}

export default function MeetingDetailsPage({
  meeting,
  onBack = () => {},
  onOpenEvidence = () => {},
}) {
  const [highlightedSegmentIds, setHighlightedSegmentIds] = useState([]);
  const [lastViewedSourceId, setLastViewedSourceId] = useState(null);
  const transcriptRef = useRef(null);

  if (!meeting) {
    return (
      <div className="p-8 text-center text-surface-500 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
        <p className="text-sm font-semibold">No meeting selected.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  /**
   * Jump to and highlight the relevant transcript segment
   */
  const handleViewSource = (segmentIds = [], sourceLabel = '') => {
    setHighlightedSegmentIds(segmentIds);
    setLastViewedSourceId(sourceLabel);

    // 1. Open the slide-over evidence drawer
    onOpenEvidence(segmentIds);

    // 2. Smoothly scroll to the on-page segment element
    if (segmentIds.length > 0) {
      const targetElement = document.getElementById(`onpage-seg-${segmentIds[0]}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const isCompleted = meeting.status === 'completed';

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* 1. Header Navigation & Meeting Title */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Back Link */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 mb-4 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Meetings</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="capitalize">{meeting.status || 'completed'}</span>
              </span>

              <span className="text-xs text-surface-400 font-mono">
                ID: {meeting._id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              {meeting.title}
            </h1>

            {/* Meta row: Date, duration, participants */}
            <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400 flex-wrap pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-surface-400" />
                <span>{formatMeetingDate(meeting.startedAt)}</span>
              </div>
              {meeting.duration && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-surface-400" />
                    <span>{meeting.duration}</span>
                  </div>
                </>
              )}
              {meeting.participants && meeting.participants.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-surface-400" />
                    <span>{meeting.participants.map((p) => p.name).join(', ')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Evidence Drawer Trigger Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleViewSource(meeting.transcriptSegments?.map((s) => s.segmentId) || [], 'Full Meeting')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-surface-950 flex items-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-surface-950" />
              <span>Open Evidence Drawer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Meeting Overview & AI Summary */}
      <section className="bg-white dark:bg-surface-900 rounded-3xl p-6 sm:p-7 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-surface-900 dark:text-white">
              Meeting Overview & AI Summary
            </h2>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
            Synthesized by Syncora Intelligence
          </span>
        </div>

        <p className="text-sm sm:text-base text-surface-700 dark:text-surface-300 leading-relaxed font-normal">
          {meeting.aiSummary}
        </p>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-800 text-center">
            <div className="text-[11px] text-surface-500 font-medium">Extracted Tasks</div>
            <div className="text-lg font-bold text-brand-600 dark:text-brand-400">
              {meeting.tasks?.length || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-800 text-center">
            <div className="text-[11px] text-surface-500 font-medium">Confirmed Decisions</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {meeting.decisions?.length || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-800 text-center">
            <div className="text-[11px] text-surface-500 font-medium">Unresolved Questions</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {meeting.openQuestions?.length || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-800 text-center">
            <div className="text-[11px] text-surface-500 font-medium">Transcript Segments</div>
            <div className="text-lg font-bold text-surface-800 dark:text-surface-200">
              {meeting.transcriptSegments?.length || 0}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Topics Discussed & Key Takeaways */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topics Discussed */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-100 dark:border-surface-800">
            <Tag className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
              Topics Discussed ({meeting.topicsDiscussed?.length || 0})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {meeting.topicsDiscussed && meeting.topicsDiscussed.length > 0 ? (
              meeting.topicsDiscussed.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 border border-surface-200/60 dark:border-surface-700/60"
                >
                  #{topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-surface-400 italic">No topics cataloged</span>
            )}
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-100 dark:border-surface-800">
            <Bookmark className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
              Key Takeaways ({meeting.keyTakeaways?.length || 0})
            </h3>
          </div>
          <ul className="space-y-2.5">
            {meeting.keyTakeaways && meeting.keyTakeaways.length > 0 ? (
              meeting.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-surface-700 dark:text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{takeaway}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-surface-400 italic">No key takeaways recorded</li>
            )}
          </ul>
        </div>
      </section>

      {/* 4. Confirmed Decisions & Unresolved Questions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Confirmed Decisions */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
                Confirmed Decisions ({meeting.decisions?.length || 0})
              </h3>
            </div>
            <span className="text-[11px] text-surface-400 font-medium">Verifiable Speech</span>
          </div>

          <div className="space-y-3">
            {meeting.decisions && meeting.decisions.length > 0 ? (
              meeting.decisions.map((decision) => (
                <div
                  key={decision._id}
                  className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/80 dark:border-surface-700/60 space-y-2.5 hover:border-emerald-400/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white">
                      {decision.title}
                    </h4>
                    {decision.confidence && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                        {Math.round(decision.confidence * 100)}% Match
                      </span>
                    )}
                  </div>

                  {decision.description && (
                    <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                      {decision.description}
                    </p>
                  )}

                  {/* View Source Trigger */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-surface-400">
                      Segment: {decision.evidenceSegmentIds?.join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleViewSource(decision.evidenceSegmentIds, decision.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-surface-400 italic py-4">
                No confirmed decisions extracted.
              </div>
            )}
          </div>
        </div>

        {/* Unresolved Questions */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
                Unresolved Questions ({meeting.openQuestions?.length || 0})
              </h3>
            </div>
            <span className="text-[11px] text-surface-400 font-medium">Requires Clarification</span>
          </div>

          <div className="space-y-3">
            {meeting.openQuestions && meeting.openQuestions.length > 0 ? (
              meeting.openQuestions.map((q) => (
                <div
                  key={q._id}
                  className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/80 dark:border-surface-700/60 space-y-2.5 hover:border-amber-400/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-surface-900 dark:text-white">
                      {q.question}
                    </h4>
                    {q.confidence && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex-shrink-0">
                        {Math.round(q.confidence * 100)}% Match
                      </span>
                    )}
                  </div>

                  {q.context && (
                    <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                      {q.context}
                    </p>
                  )}

                  {/* View Source Trigger */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-surface-400">
                      Segment: {q.evidenceSegmentIds?.join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleViewSource(q.evidenceSegmentIds, q.question)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-surface-400 italic py-4">
                No unresolved questions detected.
              </div>
            )}
          </div>
        </div>

      </section>

      {/* 5. Extracted Tasks & Uncertainties */}
      <section className="bg-white dark:bg-surface-900 rounded-3xl p-6 sm:p-7 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand-500" />
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Extracted Tasks & Uncertainties ({meeting.tasks?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-surface-400">
            Never invent speakers, deadlines or transcript evidence
          </span>
        </div>

        <div className="space-y-4">
          {meeting.tasks && meeting.tasks.length > 0 ? (
            meeting.tasks.map((task) => {
              const isPending = task.approvalStatus === 'pending';
              const hasUncertainties = task.uncertaintyFlags && task.uncertaintyFlags.length > 0;

              return (
                <div
                  key={task._id}
                  className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/60 space-y-3.5 hover:border-brand-400/60 transition-colors"
                >
                  {/* Task Header: Title + Type & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-surface-900 dark:text-white">
                        {task.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {task.type || 'commitment'}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {isPending ? (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      )}
                      <span className="capitalize">{task.approvalStatus}</span>
                    </span>
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Task Details Bar: Speaker, Suggested Deadline, Assignee */}
                  <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400 flex-wrap">
                    {task.suggestedOwnerName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-surface-400" />
                        <span>Owner: <strong className="text-surface-800 dark:text-surface-200">{task.suggestedOwnerName}</strong></span>
                        {task.suggestedOwnerSpeakerId && (
                          <span className="font-mono text-[10px] text-surface-400">({task.suggestedOwnerSpeakerId})</span>
                        )}
                      </div>
                    )}

                    {task.suggestedDeadlineText && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-surface-400" />
                        <span>Deadline: <strong className="text-surface-800 dark:text-surface-200">{task.suggestedDeadlineText}</strong></span>
                      </div>
                    )}

                    {task.workStatus && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-surface-400" />
                        <span>Work Status: <strong className="capitalize text-surface-800 dark:text-surface-200">{task.workStatus.replace('_', ' ')}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Uncertainty Flags Banner */}
                  {hasUncertainties && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Uncertainty Flags Detected ({task.uncertaintyFlags.length})</span>
                      </div>
                      <ul className="space-y-1 pl-5 list-disc text-xs text-amber-900/80 dark:text-amber-200/90">
                        {task.uncertaintyFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* View Source Trigger */}
                  <div className="pt-2 flex items-center justify-between border-t border-surface-200/60 dark:border-surface-700/60">
                    <span className="text-[11px] font-mono text-surface-400">
                      Evidence Segments: {task.evidenceSegmentIds?.join(', ') || 'N/A'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleViewSource(task.evidenceSegmentIds, task.title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-surface-400 italic py-4">
              No tasks extracted from this meeting.
            </div>
          )}
        </div>
      </section>

      {/* 6. Timestamped Transcript with Speaker Labels */}
      <section
        ref={transcriptRef}
        className="bg-white dark:bg-surface-900 rounded-3xl p-6 sm:p-7 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Timestamped Transcript with Speaker Labels ({meeting.transcriptSegments?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-surface-400">
            Click segment or use "View Source" above to focus
          </span>
        </div>

        {lastViewedSourceId && (
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <span>
              Focusing on evidence for: <strong>{lastViewedSourceId}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setHighlightedSegmentIds([]);
                setLastViewedSourceId(null);
              }}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Clear Focus
            </button>
          </div>
        )}

        <div className="space-y-3">
          {meeting.transcriptSegments && meeting.transcriptSegments.length > 0 ? (
            meeting.transcriptSegments.map((segment) => {
              const isHighlighted = highlightedSegmentIds.includes(segment.segmentId);

              return (
                <div
                  key={segment.segmentId}
                  id={`onpage-seg-${segment.segmentId}`}
                  onClick={() => handleViewSource([segment.segmentId], `Segment ${segment.segmentId}`)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isHighlighted
                      ? 'bg-amber-500/15 border-l-4 border-amber-500 border-t border-r border-b border-amber-500/40 ring-2 ring-amber-500/30 shadow-md'
                      : 'bg-surface-50/80 dark:bg-surface-800/40 border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-200/80 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                        {formatTimestamp(segment.startTime)} - {formatTimestamp(segment.endTime)}
                      </span>
                      <span className="text-xs font-bold text-surface-800 dark:text-surface-200">
                        {segment.speakerId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-surface-400">
                        {segment.segmentId}
                      </span>
                      {isHighlighted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-surface-950 shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          Verified Evidence
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isHighlighted
                        ? 'font-bold text-surface-900 dark:text-amber-100'
                        : 'text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    "{segment.text}"
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-surface-400 italic py-4">
              No transcript segments found for this meeting.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

