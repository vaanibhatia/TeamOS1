import React, { useState } from 'react';
import {
  GraduationCap,
  FileCode,
  HelpCircle,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';

export default function StudentView({
  meetingData,
  onOpenEvidence = () => {},
}) {
  if (!meetingData) {
    return (
      <div className="p-8 text-center text-surface-500">
        No meeting data available.
      </div>
    );
  }

  // 3. Interactive local checklist state
  const [checklist, setChecklist] = useState([
    {
      id: 'item_1',
      text: 'Analyze pure JavaScript architecture rationale (seg_002)',
      completed: true,
    },
    {
      id: 'item_2',
      text: 'Review Docker compose multi-service orchestration requirements (seg_003)',
      completed: false,
    },
    {
      id: 'item_3',
      text: 'Examine authentication flow & login delivery timeline (seg_001)',
      completed: false,
    },
    {
      id: 'item_4',
      text: 'Compare Syncora Technical Contract v1.0 data schemas with database model',
      completed: false,
    },
  ]);

  const [newChecklistText, setNewChecklistText] = useState('');

  // Checklist handlers
  const handleToggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddChecklistItem = () => {
    const text = newChecklistText.trim();
    if (!text) return;

    setChecklist((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        text,
        completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent =
    checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. HIGH-LEVEL MEETING SUMMARY CARD */}
      <section className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-surface-100 dark:border-surface-800">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  Student & Observer Study Hall
                </span>
                <span className="text-xs text-surface-400 font-mono">
                  {meetingData._id}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {meetingData.status || 'completed'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
                {meetingData.title}
              </h1>

              <p className="mt-1.5 text-xs sm:text-sm text-surface-500 dark:text-surface-400 max-w-3xl leading-relaxed">
                A learning workspace designed for engineering students, interns, and onboarding team members to inspect real-world architecture debates, understand trade-offs, and track self-study objectives.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="px-4 py-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-center min-w-[90px]">
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                  Segments
                </div>
                <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {meetingData.transcriptSegments?.length || 0}
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 text-center min-w-[90px]">
                <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase">
                  Decisions
                </div>
                <div className="text-xl font-bold text-brand-700 dark:text-brand-300">
                  {meetingData.decisions?.length || 0}
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center min-w-[90px]">
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                  Questions
                </div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                  {meetingData.openQuestions?.length || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-surface-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-surface-400" />
              <span>Oct 29, 2026 • Sprint 1 Milestone</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-surface-400" />
              <span>Technical Contract v1.0 Reference</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONFIRMED DECISIONS & OPEN QUESTIONS (WITH EVIDENCE TRIGGERS) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Decisions List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <FileCode className="w-5 h-5" />
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Confirmed Decisions ({meetingData.decisions?.length || 0})
              </h2>
            </div>
            <span className="text-[11px] text-surface-400">
              High Confidence
            </span>
          </div>

          <div className="space-y-3">
            {meetingData.decisions?.map((dec) => (
              <div
                key={dec._id}
                className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-800/40 hover:border-brand-400 dark:hover:border-brand-600 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-surface-400 uppercase">
                      {dec._id}
                    </span>
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white leading-snug">
                      {dec.title}
                    </h3>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    <Sparkles className="w-3 h-3 text-brand-500" />
                    {Math.round((dec.confidence || 1) * 100)}% Confidence
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-200/60 dark:border-surface-700/60 text-xs">
                  <div className="flex items-center gap-1.5 text-surface-400">
                    <span>Evidence Segments:</span>
                    <span className="font-mono font-medium text-surface-600 dark:text-surface-300">
                      {dec.evidenceSegmentIds?.join(', ')}
                    </span>
                  </div>

                  {/* Evidence Trigger Button */}
                  <button
                    type="button"
                    onClick={() => onOpenEvidence(dec.evidenceSegmentIds)}
                    className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>Inspect Context</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Questions List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <HelpCircle className="w-5 h-5" />
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Open Architectural Questions ({meetingData.openQuestions?.length || 0})
              </h2>
            </div>
            <span className="text-[11px] text-surface-400">
              Awaiting Resolution
            </span>
          </div>

          <div className="space-y-3">
            {meetingData.openQuestions?.map((q) => (
              <div
                key={q._id}
                className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-800/40 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-surface-400 uppercase">
                      {q._id}
                    </span>
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white leading-snug">
                      {q.question}
                    </h3>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {Math.round((q.confidence || 1) * 100)}% Confidence
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-200/60 dark:border-surface-700/60 text-xs">
                  <div className="flex items-center gap-1.5 text-surface-400">
                    <span>Evidence Segments:</span>
                    <span className="font-mono font-medium text-surface-600 dark:text-surface-300">
                      {q.evidenceSegmentIds?.join(', ')}
                    </span>
                  </div>

                  {/* Evidence Trigger Button */}
                  <button
                    type="button"
                    onClick={() => onOpenEvidence(q.evidenceSegmentIds)}
                    className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>Inspect Context</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LOCAL CHECKLIST */}
      <section className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                Personal Study & Exploration Checklist
              </h2>
              <p className="text-xs text-surface-500">
                Keep track of concepts, technical documentation, and questions you want to research.
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 self-end sm:self-auto min-w-[200px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-surface-500">
              {completedCount}/{checklist.length}
            </span>
          </div>
        </div>

        {/* Input to Add Custom To-Do Item */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddChecklistItem();
              }
            }}
            placeholder="Add a new topic, code repo link, or self-study question..."
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-normal border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="button"
            onClick={handleAddChecklistItem}
            disabled={!newChecklistText.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2 pt-1">
          {checklist.length === 0 ? (
            <div className="py-6 text-center text-xs text-surface-400 italic">
              No checklist items. Add one using the input above!
            </div>
          ) : (
            checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  item.completed
                    ? 'bg-surface-50/50 dark:bg-surface-800/20 border-surface-200/60 dark:border-surface-800/60'
                    : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                  onClick={() => handleToggleChecklist(item.id)}
                >
                  <button
                    type="button"
                    aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors border ${
                      item.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-surface-300 dark:border-surface-600 hover:border-indigo-500'
                    }`}
                  >
                    {item.completed && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>

                  <span
                    className={`text-xs sm:text-sm font-medium transition-colors ${
                      item.completed
                        ? 'line-through text-surface-400 dark:text-surface-500'
                        : 'text-surface-800 dark:text-surface-200'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteChecklistItem(item.id)}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. RAW MEETING TRANSCRIPT TIMELINE */}
      <section className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2 text-surface-700 dark:text-surface-300">
            <Clock className="w-4 h-4 text-brand-500" />
            <h2 className="text-base font-bold text-surface-900 dark:text-white">
              Raw Meeting Transcript Stream ({meetingData.transcriptSegments?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-surface-400">
            Click segment to inspect evidence
          </span>
        </div>

        <div className="space-y-2.5">
          {meetingData.transcriptSegments?.map((seg) => (
            <div
              key={seg.segmentId}
              onClick={() => onOpenEvidence([seg.segmentId])}
              className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-800/40 hover:border-amber-400/80 dark:hover:border-amber-500/80 flex items-start gap-3 text-xs cursor-pointer transition-all group"
              title="Click to view in Evidence Drawer"
            >
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-200/70 dark:bg-surface-800 text-surface-600 dark:text-surface-400 flex-shrink-0">
                {seg.startTime} - {seg.endTime}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-surface-800 dark:text-surface-200">
                    {seg.speakerId} ({seg.segmentId})
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Open Drawer <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-surface-600 dark:text-surface-300 italic leading-relaxed">
                  "{seg.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

