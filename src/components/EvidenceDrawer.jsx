import React, { useEffect, useRef } from 'react';
import { X, Clock, User, Sparkles, FileText, Check } from 'lucide-react';

/**
 * Format timestamp into [mm:ss] format.
 * Handles "00:01:15" -> "[01:15]", "01:15" -> "[01:15]", or raw string.
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

export default function EvidenceDrawer({
  isOpen = false,
  onClose = () => { },
  transcripts = [],
  highlightSegmentIds = [],
}) {
  const drawerRef = useRef(null);
  const highlightedRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-scroll to first highlighted segment when opened
  useEffect(() => {
    if (isOpen && highlightedRef.current) {
      const timeout = setTimeout(() => {
        highlightedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, highlightSegmentIds]);

  if (!isOpen) return null;

  // Sort transcripts by startTime
  const sortedTranscripts = [...(transcripts || [])].sort((a, b) => {
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  // Calculate matched count
  const matchedCount = (transcripts || []).filter((s) =>
    highlightSegmentIds?.includes(s.segmentId)
  ).length;

  let firstMatchAssigned = false;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="evidence-drawer-title">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-lg bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50/70 dark:bg-surface-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="evidence-drawer-title"
                    className="text-base font-bold text-surface-900 dark:text-white"
                  >
                    Transcript Evidence
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {matchedCount} {matchedCount === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                  Supporting context and speech segments from meeting recording
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              aria-label="Close evidence panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader info bar */}
          <div className="px-6 py-2.5 bg-surface-100/60 dark:bg-surface-800/30 border-b border-surface-200/60 dark:border-surface-800/60 flex items-center justify-between text-xs text-surface-500">
            <span>
              Highlighted IDs:{' '}
              {highlightSegmentIds && highlightSegmentIds.length > 0 ? (
                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                  {highlightSegmentIds.join(', ')}
                </span>
              ) : (
                <span className="italic">None</span>
              )}
            </span>
            <span>Total Segments: {sortedTranscripts.length}</span>
          </div>

          {/* Body: Scrollable list of segments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {sortedTranscripts.length === 0 ? (
              <div className="text-center py-12 text-surface-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No transcript segments available</p>
              </div>
            ) : (
              sortedTranscripts.map((segment) => {
                const isHighlighted = highlightSegmentIds?.includes(segment.segmentId);
                const isFirstMatch = isHighlighted && !firstMatchAssigned;
                if (isFirstMatch) {
                  firstMatchAssigned = true;
                }

                return (
                  <div
                    key={segment.segmentId}
                    ref={isFirstMatch ? highlightedRef : null}
                    id={`evidence-seg-${segment.segmentId}`}
                    className={`p-4 rounded-xl transition-all duration-200 ${isHighlighted
                        ? 'bg-amber-500/10 border-l-4 border-amber-500 border-t border-r border-b border-amber-500/30 dark:border-amber-500/40 shadow-sm ring-1 ring-amber-500/20'
                        : 'bg-surface-50/70 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800/80 hover:border-surface-300 dark:hover:border-surface-700'
                      }`}
                  >
                    {/* Item meta header: [mm:ss], speakerId, and badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-200/80 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                          <Clock className="w-3 h-3 text-surface-400" />
                          {formatTimestamp(segment.startTime)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 dark:text-surface-300">
                          <User className="w-3 h-3 text-surface-400" />
                          {segment.speakerId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-surface-400">
                          {segment.segmentId}
                        </span>
                        {isHighlighted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500 text-surface-950 dark:text-surface-900 shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            Evidence
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Speech text */}
                    <p
                      className={`text-sm leading-relaxed ${isHighlighted
                          ? 'font-bold text-surface-900 dark:text-amber-100'
                          : 'font-normal text-surface-700 dark:text-surface-300'
                        }`}
                    >
                      "{segment.text}"
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900 flex items-center justify-between">
            <span className="text-xs text-surface-400">
              Technical Contract v1.0
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

