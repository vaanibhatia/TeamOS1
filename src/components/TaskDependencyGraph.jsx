import React, { useState, useMemo } from 'react';
import {
  GitCommit,
  ArrowRight,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Maximize2,
  Filter,
  Layers,
  FileText,
  Lock,
} from 'lucide-react';

/**
 * Format ISO date string
 */
function formatDate(dateStr) {
  if (!dateStr) return 'No deadline';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function TaskDependencyGraph({
  tasks = [],
  currentRole = 'manager',
  activeEmployeeId = 'usr_001',
  employees = [],
  onOpenEvidence = () => {},
  onSelectTask = () => {},
}) {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active_only' | 'blocked_only'

  // Map employee lookups
  const employeeMap = useMemo(() => {
    return (employees || []).reduce((acc, emp) => {
      acc[emp._id] = emp;
      return acc;
    }, {});
  }, [employees]);

  // Determine which tasks are in scope
  const relevantTasks = useMemo(() => {
    if (currentRole === 'manager') {
      if (filterMode === 'active_only') {
        return tasks.filter((t) => t.workStatus === 'in_progress' || t.workStatus === 'blocked');
      }
      if (filterMode === 'blocked_only') {
        return tasks.filter((t) => t.workStatus === 'blocked');
      }
      return tasks;
    }

    // Employee role: only include tasks assigned to the employee + their immediate upstream/downstream dependencies
    const assignedTaskIds = new Set(
      tasks.filter((t) => t.assigneeId === activeEmployeeId && t.approvalStatus === 'approved').map((t) => t._id)
    );

    const relevantIds = new Set(assignedTaskIds);

    // Add immediate upstream prerequisites (dependencies of assigned tasks)
    tasks.forEach((t) => {
      if (assignedTaskIds.has(t._id)) {
        (t.dependencies || []).forEach((depId) => relevantIds.add(depId));
      }
    });

    // Add downstream tasks (tasks that depend on assigned tasks)
    tasks.forEach((t) => {
      const dependsOnAssigned = (t.dependencies || []).some((depId) => assignedTaskIds.has(depId));
      if (dependsOnAssigned) {
        relevantIds.add(t._id);
      }
    });

    return tasks.filter((t) => relevantIds.has(t._id));
  }, [tasks, currentRole, activeEmployeeId, filterMode]);

  // Map task lookup
  const taskMap = useMemo(() => {
    return tasks.reduce((acc, t) => {
      acc[t._id] = t;
      return acc;
    }, {});
  }, [tasks]);

  // Compute topological levels (DAG layout)
  const { levels, nodePositions, edges } = useMemo(() => {
    const taskIds = relevantTasks.map((t) => t._id);
    const taskIdSet = new Set(taskIds);

    // Compute depth for each task based on dependencies
    const depthMap = {};

    function getDepth(id, visited = new Set()) {
      if (depthMap[id] !== undefined) return depthMap[id];
      if (visited.has(id)) return 0; // Prevent cycle
      visited.add(id);

      const task = taskMap[id];
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        depthMap[id] = 0;
        return 0;
      }

      let maxDepDepth = 0;
      for (const depId of task.dependencies) {
        if (taskIdSet.has(depId)) {
          maxDepDepth = Math.max(maxDepDepth, getDepth(depId, new Set(visited)) + 1);
        }
      }
      depthMap[id] = maxDepDepth;
      return maxDepDepth;
    }

    taskIds.forEach((id) => getDepth(id));

    // Group into levels
    const levelGroups = [];
    taskIds.forEach((id) => {
      const d = depthMap[id] || 0;
      if (!levelGroups[d]) levelGroups[d] = [];
      levelGroups[d].push(id);
    });

    // Compute coordinates for rendering
    // Node dimensions
    const nodeWidth = 260;
    const nodeHeight = 110;
    const colSpacing = 340;
    const rowSpacing = 140;
    const startX = 40;
    const startY = 40;

    const positions = {};
    const levelColumns = levelGroups.filter(Boolean);

    levelColumns.forEach((group, colIdx) => {
      const totalColHeight = group.length * rowSpacing;
      group.forEach((id, rowIdx) => {
        positions[id] = {
          x: startX + colIdx * colSpacing,
          y: startY + rowIdx * rowSpacing,
          width: nodeWidth,
          height: nodeHeight,
        };
      });
    });

    // Compute valid edges
    const computedEdges = [];
    relevantTasks.forEach((targetTask) => {
      (targetTask.dependencies || []).forEach((sourceId) => {
        if (positions[sourceId] && positions[targetTask._id]) {
          computedEdges.push({
            id: `${sourceId}->${targetTask._id}`,
            sourceId,
            targetId: targetTask._id,
            sourcePos: positions[sourceId],
            targetPos: positions[targetTask._id],
          });
        }
      });
    });

    return {
      levels: levelColumns,
      nodePositions: positions,
      edges: computedEdges,
    };
  }, [relevantTasks, taskMap]);

  // Overall canvas dimensions
  const canvasWidth = Math.max(860, (levels.length || 1) * 360 + 80);
  const maxNodesInCol = Math.max(1, ...levels.map((l) => l.length));
  const canvasHeight = Math.max(480, maxNodesInCol * 150 + 80);

  const selectedTask = selectedTaskId ? taskMap[selectedTaskId] : null;

  // Status badge helper
  const getStatusBadge = (task) => {
    if (task.approvalStatus === 'pending') {
      return {
        label: 'Pending Approval',
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
        borderClass: 'border-amber-400 dark:border-amber-500',
      };
    }
    if (task.workStatus === 'completed') {
      return {
        label: 'Completed',
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500',
        borderClass: 'border-emerald-400 dark:border-emerald-500',
      };
    }
    if (task.workStatus === 'in_progress') {
      return {
        label: 'In Progress',
        badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500',
        borderClass: 'border-blue-400 dark:border-blue-500',
      };
    }
    if (task.workStatus === 'blocked') {
      return {
        label: 'Blocked',
        badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dotClass: 'bg-rose-500',
        borderClass: 'border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/20',
      };
    }
    return {
      label: 'Not Started',
      badgeClass: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300 border-surface-200 dark:border-surface-700',
      dotClass: 'bg-surface-400',
      borderClass: 'border-surface-200 dark:border-surface-700',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
              <GitCommit className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              {currentRole === 'manager'
                ? 'Team-Wide Task Dependency Graph'
                : 'My Task Dependency Stream'}
            </h2>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {currentRole === 'manager'
              ? 'Complete organizational dependency model. Directed arrows illustrate required prerequisites between deliverables.'
              : `Showing deliverables assigned to you and their upstream/downstream technical dependencies.`}
          </p>
        </div>

        {/* Manager Filter Controls */}
        {currentRole === 'manager' && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('active_only')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'active_only'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              Active Only
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('blocked_only')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'blocked_only'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              Blocked Only
            </button>
          </div>
        )}

        {/* Employee Active Persona Indicator */}
        {currentRole === 'employee' && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-surface-700 dark:text-surface-300">
              Perspective: {employeeMap[activeEmployeeId]?.name || 'Current Employee'}
            </span>
          </div>
        )}
      </div>

      {/* Main Graph Visualization Area */}
      <div className="relative rounded-3xl bg-surface-50/70 dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 overflow-hidden shadow-inner">
        {/* Graph Legend & Status Summary */}
        <div className="p-3.5 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xs border-b border-surface-200 dark:border-surface-800 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Status Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-surface-600 dark:text-surface-300">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-surface-600 dark:text-surface-300">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-surface-600 dark:text-surface-300">Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-400" />
              <span className="text-surface-600 dark:text-surface-300">Not Started</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-surface-600 dark:text-surface-300">Pending Suggestion</span>
            </div>
          </div>

          <div className="text-[11px] text-surface-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Click any node to view full deliverables & blocker details</span>
          </div>
        </div>

        {/* Scrollable Diagram Canvas */}
        <div className="overflow-x-auto overflow-y-auto p-4 sm:p-6" style={{ minHeight: '520px' }}>
          <div
            className="relative"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          >
            {/* SVG Connecting Edges with Arrowheads */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={canvasWidth}
              height={canvasHeight}
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="dependency-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                </marker>
                <marker
                  id="dependency-arrow-blocked"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                </marker>
              </defs>

              {edges.map((edge) => {
                const source = edge.sourcePos;
                const target = edge.targetPos;

                // Anchor points
                const x1 = source.x + source.width;
                const y1 = source.y + source.height / 2;
                const x2 = target.x;
                const y2 = target.y + target.height / 2;

                // Cubic bezier control points
                const dx = (x2 - x1) * 0.5;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const targetTask = taskMap[edge.targetId];
                const isBlocked = targetTask?.workStatus === 'blocked';
                const isSelected = selectedTaskId === edge.sourceId || selectedTaskId === edge.targetId;

                return (
                  <g key={edge.id}>
                    {/* Shadow outline */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isSelected ? '#6366f1' : isBlocked ? '#f43f5e' : '#94a3b8'}
                      strokeWidth={isSelected ? 3 : 2}
                      strokeDasharray={isSelected ? 'none' : '4 4'}
                      opacity={isSelected ? 1 : 0.65}
                      markerEnd={isBlocked ? 'url(#dependency-arrow-blocked)' : 'url(#dependency-arrow)'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Task Nodes (HTML Absolute positioning) */}
            {relevantTasks.map((task) => {
              const pos = nodePositions[task._id];
              if (!pos) return null;

              const status = getStatusBadge(task);
              const isSelected = selectedTaskId === task._id;
              const isAssignedToActiveEmployee = task.assigneeId === activeEmployeeId;
              const assignee = employeeMap[task.assigneeId];
              const depCount = task.dependencies?.length || 0;

              return (
                <div
                  key={task._id}
                  onClick={() => {
                    setSelectedTaskId(task._id);
                    onSelectTask(task);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${pos.width}px`,
                    minHeight: `${pos.height}px`,
                  }}
                  className={`p-3.5 rounded-2xl bg-white dark:bg-surface-900 border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs select-none ${
                    status.borderClass
                  } ${
                    isSelected
                      ? 'ring-3 ring-brand-500 shadow-xl scale-[1.02] z-20'
                      : 'hover:shadow-md hover:border-brand-400 z-10'
                  } ${
                    currentRole === 'employee' && isAssignedToActiveEmployee
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40'
                      : ''
                  }`}
                >
                  <div>
                    {/* Node Header: Status Badge & ID */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                        <span>{status.label}</span>
                      </span>

                      <span className="font-mono text-[9px] text-surface-400">
                        {task._id}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h4 className="text-xs font-bold text-surface-900 dark:text-white line-clamp-2 leading-tight">
                      {task.title}
                    </h4>
                  </div>

                  {/* Node Footer: Assignee & Deadline */}
                  <div className="mt-2.5 pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-[10px] text-surface-500">
                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                      {assignee ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-[8px] flex-shrink-0">
                            {assignee.avatar || assignee.name.charAt(0)}
                          </div>
                          <span className="truncate font-medium text-surface-700 dark:text-surface-300">
                            {assignee.name.split(' ')[0]}
                          </span>
                        </>
                      ) : (
                        <span className="italic text-surface-400">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[10px] text-surface-500">
                      <Clock className="w-2.5 h-2.5 text-surface-400" />
                      <span>{formatDate(task.approvedDeadlineAt || task.suggestedDeadlineText)}</span>
                    </div>
                  </div>

                  {/* Dependency badge indicator */}
                  {depCount > 0 && (
                    <div className="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full bg-brand-600 text-white font-mono text-[9px] font-bold shadow-xs">
                      {depCount} {depCount === 1 ? 'dep' : 'deps'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Task Inspector Drawer / Card */}
      {selectedTask && (
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-md space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                {selectedTask._id}
              </span>
              <h3 className="text-base font-bold text-surface-900 dark:text-white">
                {selectedTask.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {selectedTask.evidenceSegmentIds && selectedTask.evidenceSegmentIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenEvidence(selectedTask.evidenceSegmentIds)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inspect Evidence</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="px-3 py-1 text-xs text-surface-400 hover:text-surface-600 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            {selectedTask.description}
          </p>

          {/* Blocker alert if present */}
          {selectedTask.blockerDetails && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Active Blocker Reported</span>
              </div>
              <p className="text-xs text-rose-900/90 dark:text-rose-200 leading-relaxed">
                {selectedTask.blockerDetails.reason}
              </p>
            </div>
          )}

          {/* Dependencies breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-800">
              <span className="font-bold text-surface-700 dark:text-surface-300 block mb-1">
                Prerequisites (Depends On):
              </span>
              {selectedTask.dependencies && selectedTask.dependencies.length > 0 ? (
                <ul className="space-y-1 text-surface-600 dark:text-surface-400">
                  {selectedTask.dependencies.map((depId) => {
                    const depTask = taskMap[depId];
                    return (
                      <li key={depId} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-brand-500" />
                        <span className="font-mono text-[11px] font-semibold">{depId}</span>:
                        <span className="truncate">{depTask ? depTask.title : 'Task ' + depId}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="text-surface-400 italic">No prerequisite dependencies (root task)</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-800">
              <span className="font-bold text-surface-700 dark:text-surface-300 block mb-1">
                Downstream Dependents (Blocks):
              </span>
              {(() => {
                const blocking = tasks.filter((t) => (t.dependencies || []).includes(selectedTask._id));
                if (blocking.length === 0) {
                  return <span className="text-surface-400 italic">No downstream tasks waiting on this deliverable</span>;
                }
                return (
                  <ul className="space-y-1 text-surface-600 dark:text-surface-400">
                    {blocking.map((b) => (
                      <li key={b._id} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-brand-500" />
                        <span className="font-mono text-[11px] font-semibold">{b._id}</span>:
                        <span className="truncate">{b.title}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

