import React, { useState, useMemo } from 'react';
import {
  FileCode2,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Terminal,
  ExternalLink,
  Code2,
  Database,
  Network,
  Lock,
  Workflow,
  Boxes,
  Copy,
  Check,
  Search,
  Filter,
  ArrowUpRight,
  Activity,
  Gauge,
  ShieldCheck,
  GitBranch,
  Zap,
  BarChart3,
  Clock,
  ChevronRight,
  CheckCircle,
  FileCheck,
  Server,
  Cloud,
} from 'lucide-react';
import { useArchitecture } from '../context/ArchitectureContext';

export default function SolutionView({ onNavigate = () => {} }) {
  const { analysisData, setSelectedEntity } = useArchitecture();

  // Filter state for findings: 'all' | 'detected' | 'inferred' | 'suggested'
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract real analyzed data properties (NO fallback to SwasthQueue or hardcoded mock datasets)
  const findings = useMemo(() => {
    return Array.isArray(analysisData?.findings) ? analysisData.findings : [];
  }, [analysisData]);

  const modules = useMemo(() => {
    return Array.isArray(analysisData?.nodes) ? analysisData.nodes : [];
  }, [analysisData]);

  const systemAudits = useMemo(() => {
    return Array.isArray(analysisData?.systemAudits) ? analysisData.systemAudits : [];
  }, [analysisData]);

  const apiRoutes = useMemo(() => {
    return Array.isArray(analysisData?.apiRoutes) ? analysisData.apiRoutes : [];
  }, [analysisData]);

  const database = analysisData?.database || null;
  const techStack = analysisData?.techStack || [];

  // Counts for classification tabs
  const detectedCount = findings.filter((f) => f.type === 'detected').length;
  const inferredCount = findings.filter((f) => f.type === 'inferred').length;
  const suggestedCount = findings.filter((f) => f.type === 'suggested').length;

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesQuery =
        !searchQuery.trim() ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.citation && item.citation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.module && item.module.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [findings, filterType, searchQuery]);

  // Copy code snippet helper
  const handleCopyCode = (id, snippet) => {
    navigator.clipboard?.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Cross-Navigation Handler to Architecture Diagram
  const handleJumpToNode = (nodeId, moduleName) => {
    const targetNode = {
      id: nodeId,
      label: moduleName,
    };
    setSelectedEntity(targetNode);
    onNavigate('project-architecture');
  };

  // If no analysisData is present, display clean empty state prompting upload
  if (!analysisData || findings.length === 0) {
    return (
      <div className="p-8 sm:p-14 text-center rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-5 max-w-lg mx-auto shadow-xs my-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto shadow-sm">
          <FileCode2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">
            No Codebase Analyzed Yet
          </h2>
          <p className="text-xs text-surface-500 leading-relaxed">
            Upload a project ZIP archive in the <strong>Project Architecture</strong> analyzer to generate the real in-browser technical solution blueprint, code citations, and decoupling roadmap.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => onNavigate('project-architecture')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>Go to Project Architecture</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & WORKSPACE CONTEXT */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-xs">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                  Solution Blueprint & Technical Narrative
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Real Code Analysis
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {analysisData.projectName}
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Comprehensive technical architecture synthesis, code evidence citations, system audits, and actionable decoupling blueprints.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('project-architecture')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Architecture Diagram</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dev-graph')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Dependency Graph</span>
          </button>
        </div>
      </div>

      {/* 2. REAL EXTRACTED SPECIFICATION PILLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Manifest */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-surface-400 font-bold block">
            Target Package
          </span>
          <div className="text-sm font-bold text-surface-900 dark:text-white truncate">
            {analysisData.projectName}
          </div>
          <span className="text-[11px] text-surface-500 font-mono block">
            {analysisData.fileStats?.totalFiles || 0} files • {analysisData.fileStats?.totalLinesOfCode || 0} lines
          </span>
        </div>

        {/* Framework Stacks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-surface-400 font-bold block">
            Detected Frameworks
          </span>
          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">
            {techStack.length > 0 ? techStack.slice(0, 3).join(', ') : 'Vanilla / Scripts'}
          </div>
          <span className="text-[11px] text-surface-500 font-mono block">
            {techStack.length > 3 ? `+${techStack.length - 3} additional libraries` : 'Core toolchain'}
          </span>
        </div>

        {/* Database Layer */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-surface-400 font-bold block">
            Database Schema
          </span>
          <div className="text-sm font-bold text-surface-900 dark:text-white truncate">
            {database ? `${database.type}` : 'No database schema found'}
          </div>
          <span className="text-[11px] text-surface-500 font-mono block">
            {database && database.models?.length
              ? `${database.models.length} models (${database.models.slice(0, 2).join(', ')}${database.models.length > 2 ? '...' : ''})`
              : 'Zero database models declared'}
          </span>
        </div>

        {/* API Surface */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-surface-400 font-bold block">
            API Endpoints
          </span>
          <div className="text-sm font-bold text-surface-900 dark:text-white truncate">
            {apiRoutes.length > 0 ? `${apiRoutes.length} endpoints declared` : 'No backend routes detected'}
          </div>
          <span className="text-[11px] text-surface-500 font-mono block">
            {apiRoutes.length > 0 ? 'REST / Controller endpoints' : 'Client-only / Static archive'}
          </span>
        </div>
      </div>

      {/* 3. ARCHITECTURE NARRATIVE: PROBLEM STATEMENT & SOFTWARE SOLUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Inferred Problem Statement */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Architectural Diagnosis
              </span>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Inferred Problem Statement & Challenges
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
            <p>
              Analysis of <strong className="text-surface-900 dark:text-white">{analysisData.projectName}</strong> reveals a{' '}
              {modules.length > 1 ? 'multi-tier system layout' : 'focused single-tier project'}.{' '}
              {apiRoutes.length > 0
                ? `The application orchestrates ${apiRoutes.length} HTTP API endpoints across its routing controllers. Ensuring consistent error handling, rate limiting, and response serialization between client views and server handlers is the core architectural challenge.`
                : 'No backend API routes were detected. The project operates primarily as a client-side bundle or static utility suite, requiring efficient bundle tree-shaking and client state management.'}
            </p>
            {database && (
              <p>
                Persistent entities are modeled in <span className="font-mono text-indigo-600 dark:text-indigo-400">{database.file}</span> ({database.models?.length || 0} models detected). Relational foreign keys and compound query patterns require indexed access paths to prevent sequential table scans as dataset size expands.
              </p>
            )}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Primary Architectural Focus:</span>
              </span>
              <p className="text-[11px] leading-snug">
                {modules.length > 2
                  ? 'Maintain clear contract decoupling between frontend views, API gateway controllers, and underlying database models.'
                  : 'Establish automated test suites, containerization, and structured environment variable templates for production parity.'}
              </p>
            </div>
          </div>
        </div>

        {/* Software Solution Architecture Overview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Target Architecture
              </span>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Software Solution Topology Overview
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
            <p>
              The code analyzer detected {modules.length} primary architectural {modules.length === 1 ? 'tier' : 'tiers'}:
            </p>
            <ul className="space-y-2 text-xs">
              {modules.map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>{m.label}:</strong> {m.responsibility} ({m.tech})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* 4. MODULE RESPONSIBILITIES & TECHNOLOGY SELECTION RATIONALE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-surface-900 dark:text-white">
              Subsystems & Technology Selection Rationale
            </h2>
            <p className="text-xs text-surface-500">
              Click any module card to inspect its position in the Interactive Architecture Canvas.
            </p>
          </div>
          <span className="text-xs font-mono text-surface-400">
            {modules.length} Architectural Subsystems Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const ModIcon = mod.icon || Boxes;
            return (
              <div
                key={mod.id}
                onClick={() => handleJumpToNode(mod.id, mod.label)}
                className="group p-5 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        <ModIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-surface-400 uppercase tracking-wider block">
                          {mod.category || 'Subsystem'}
                        </span>
                        <h3 className="text-sm font-bold text-surface-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {mod.label}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200/60 dark:border-surface-700/60 truncate">
                    {mod.tech}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                        Responsibility:
                      </span>
                      <p className="text-surface-600 dark:text-surface-300 text-[11px] leading-relaxed mt-0.5">
                        {mod.responsibility}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-100 dark:border-surface-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-surface-400 truncate max-w-[170px]">
                    {mod.files?.[0]?.name || 'module entry'}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RIGOROUS FINDINGS WITH EXACT FILE EVIDENCE CITATIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-6">
        
        {/* Header & Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Architectural Findings & Code Evidence
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-bold">
                {filteredFindings.length} Insights
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Classified by [Detected] code citations, [Inferred] architectural topology, and [Suggested] improvements.
            </p>
          </div>

          {/* Classification Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-xs font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              All Findings ({findings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('detected')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterType === 'detected'
                  ? 'bg-white dark:bg-surface-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>[Detected] ({detectedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('inferred')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterType === 'inferred'
                  ? 'bg-white dark:bg-surface-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>[Inferred] ({inferredCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('suggested')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterType === 'suggested'
                  ? 'bg-white dark:bg-surface-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>[Suggested] ({suggestedCount})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter findings by file path (e.g. routes/auth.js), subsystem, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const isDetected = finding.type === 'detected';
            const isInferred = finding.type === 'inferred';
            const isSuggested = finding.type === 'suggested';

            return (
              <div
                key={finding.id}
                className="p-5 rounded-2xl bg-surface-50/70 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/70 space-y-3.5 transition-all hover:border-surface-300 dark:hover:border-surface-600"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Classification Tag */}
                    {isDetected && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>[Detected] Code Evidence</span>
                      </span>
                    )}
                    {isInferred && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5 shadow-2xs">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>[Inferred] Architectural Pattern</span>
                      </span>
                    )}
                    {isSuggested && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>[Suggested] Recommendation</span>
                      </span>
                    )}

                    {/* Exact File Citation */}
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-indigo-500" />
                      <span>{finding.citation}</span>
                    </span>
                  </div>

                  {/* Cross Jump to Module */}
                  <button
                    type="button"
                    onClick={() => handleJumpToNode(finding.nodeId, finding.module)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-auto sm:ml-0"
                  >
                    <span>Inspect in Architecture</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Finding Title & Summary */}
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white leading-snug">
                    {finding.title}
                  </h3>
                  <p className="text-xs text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                    {finding.summary}
                  </p>
                </div>

                {/* Code Snippet Block */}
                {finding.codeSnippet && (
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
                      <span>{finding.citation}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(finding.id, finding.codeSnippet)}
                        className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === finding.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 overflow-x-auto text-slate-300 font-mono text-[11px] leading-relaxed">
                      <code>{finding.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Impact Statement */}
                {finding.impact && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span><strong>Assessment:</strong> {finding.impact}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* 6. SYSTEM AUDIT CARDS */}
      {systemAudits.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-surface-900 dark:text-white">
              System Audits & Static Code Quality
            </h2>
            <p className="text-xs text-surface-500">
              Evaluations generated from real dependency scans, repository directory layouts, and configuration files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {systemAudits.map((audit) => {
              return (
                <div
                  key={audit.id}
                  className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Header & Grade Badge */}
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {audit.grade}
                        </div>
                        <span className="text-[10px] font-mono text-surface-400 font-bold">
                          {audit.score} / 100 Score
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-surface-900 dark:text-white">
                        {audit.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {audit.status}
                      </span>
                    </div>

                    {/* Verified Strengths */}
                    {audit.strengths && audit.strengths.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                          Verified Strengths:
                        </span>
                        <ul className="space-y-1">
                          {audit.strengths.map((str, i) => (
                            <li key={i} className="text-[11px] text-surface-600 dark:text-surface-300 flex items-start gap-1.5 leading-snug">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bottlenecks */}
                    {audit.bottlenecks && audit.bottlenecks.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          Identified Gaps:
                        </span>
                        <ul className="space-y-1">
                          {audit.bottlenecks.map((bot, i) => (
                            <li key={i} className="text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5 leading-snug">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>{bot}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommendation */}
                  {audit.recommendation && (
                    <div className="pt-3 border-t border-surface-100 dark:border-surface-800 text-[11px] text-surface-500 dark:text-surface-400 space-y-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                        Actionable Remediation:
                      </span>
                      <p className="leading-relaxed">
                        {audit.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
