import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Server,
  Database,
  Network,
  GitBranch,
  GitPullRequest,
  Terminal,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Play,
  Layers,
  ArrowRight,
  ShieldAlert,
  Code2,
  Filter,
  Maximize2,
  Share2,
  Boxes,
} from 'lucide-react';

// =============================================================================
// ARCHITECTURE MODULES & DEPENDENCIES
// =============================================================================
export const ARCHITECTURE_MODULES = [
  {
    id: 'client-web-app',
    label: 'Client Web App',
    subsystem: 'frontend/dashboard',
    tech: 'React 18 • Vite • Tailwind',
    status: 'healthy',
    x: 60,
    y: 120,
    endpoints: ['/api/meetings', '/api/tasks', 'wss://live.syncora.io'],
    summary: 'Single-page React client with real-time waveform sync, interactive workspace triage, and responsive evidence drawer.',
    evidenceSegmentId: 'seg_001',
    timestamp: '02:45',
    speaker: 'Sarah Jenkins (Lead)',
    quote: "Approved. Let's make pure JavaScript our standardized runtime stack across all modules to eliminate compilation overhead.",
    dependencies: ['api-gateway', 'audio-worker'],
  },
  {
    id: 'api-gateway',
    label: 'API Gateway',
    subsystem: 'backend/api-gateway',
    tech: 'Node.js • Express • RateLimiter',
    status: 'healthy',
    x: 290,
    y: 120,
    endpoints: ['/api/v1/*', 'RATE_LIMIT: 60req/min'],
    summary: 'Reverse proxy and token-bucket rate limiting middleware guarding downstream services against unauthenticated surges.',
    evidenceSegmentId: 'seg_103',
    timestamp: '15:30',
    speaker: 'Priya Patel (Backend)',
    quote: "I can wrap up the Redis-backed rate limiting middleware on the gateway by Wednesday afternoon.",
    dependencies: ['auth-service', 'postgresql', 'redis-cache'],
  },
  {
    id: 'auth-service',
    label: 'Auth Service',
    subsystem: 'backend/auth',
    tech: 'Node.js • JWT • HTTP-only Cookies',
    status: 'healthy',
    x: 520,
    y: 50,
    endpoints: ['POST /auth/login', 'POST /auth/refresh', 'GET /auth/verify'],
    summary: 'Manages user credentials and executes 7-day token refresh rotation worker with Redis session revocation cache.',
    evidenceSegmentId: 'seg_101',
    timestamp: '03:10',
    speaker: 'Priya Patel (Backend)',
    quote: "We should store the JWT refresh tokens in HTTP-only cookies to prevent client script extraction.",
    dependencies: ['redis-cache'],
  },
  {
    id: 'redis-cache',
    label: 'Redis Cache Cluster',
    subsystem: 'infra/redis',
    tech: 'Redis 7 • In-Memory Store',
    status: 'healthy',
    x: 750,
    y: 50,
    endpoints: ['PORT 6379', 'TTL: 604800s (7d)'],
    summary: 'Distributed memory store for gateway token buckets, revoked token blacklist, and meeting query invalidation caches.',
    evidenceSegmentId: 'seg_103_1',
    timestamp: '08:30',
    speaker: 'Priya Patel (Backend)',
    quote: "Redis TTL keys working smoothly for token expiration in local container setup.",
    dependencies: [],
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL Database',
    subsystem: 'db/migrations',
    tech: 'Postgres 16 • Compound Indexes',
    status: 'healthy',
    x: 520,
    y: 200,
    endpoints: ['PORT 5432', 'INDEX: (meeting_id, approval_status)'],
    summary: 'Primary relational datastore with compound index on (meetingId, approvalStatus) reducing triage query latency from 180ms to 8ms.',
    evidenceSegmentId: 'seg_301',
    timestamp: '04:12',
    speaker: 'Priya Patel (Backend)',
    quote: "Adding a compound index on meeting ID and approval status brought task lookup times under 10 milliseconds.",
    dependencies: [],
  },
  {
    id: 'audio-worker',
    label: 'Audio Stream Worker',
    subsystem: 'worker/audio-stream',
    tech: 'Go • WebSockets • FFmpeg',
    status: 'blocked',
    statusReason: 'Blocked: Missing S3 IAM policy for live speech chunks',
    x: 290,
    y: 280,
    endpoints: ['wss://stream.syncora.io', 'BUFFER: 10s chunks'],
    summary: 'Ingests raw browser audio over binary WebSockets and chunks audio into 10-second WAV payloads for inference.',
    evidenceSegmentId: 'seg_204',
    timestamp: '22:15',
    speaker: 'Rahul Sharma (Frontend)',
    quote: "Audio streaming WebSocket endpoint returning 502 Bad Gateway because S3 bucket write credentials haven't been provisioned by DevOps.",
    dependencies: ['whisper-engine'],
  },
  {
    id: 'whisper-engine',
    label: 'Whisper AI Engine',
    subsystem: 'worker/whisper',
    tech: 'Python • Faster-Whisper • CUDA',
    status: 'bottleneck',
    statusReason: 'Bottleneck: GPU VRAM quota during concurrent meetings',
    x: 520,
    y: 330,
    endpoints: ['POST /v1/transcribe', 'CUDA: g4dn.xlarge'],
    summary: 'Deep learning transcription pipeline performing speech-to-text, timestamp generation, and speaker diarization.',
    evidenceSegmentId: 'seg_104',
    timestamp: '18:40',
    speaker: 'Sarah Jenkins (Lead)',
    quote: "GPU replica allocation might struggle during simultaneous multi-team sprint calls unless we configure node group autoscaling.",
    dependencies: [],
  },
];

// Connection lines between modules with status annotations
export const SERVICE_CONNECTIONS = [
  { from: 'client-web-app', to: 'api-gateway', label: 'HTTPS REST', status: 'healthy' },
  { from: 'client-web-app', to: 'audio-worker', label: 'Binary WSS', status: 'warning', note: '502 Gateway Errors' },
  { from: 'api-gateway', to: 'auth-service', label: 'Auth Validation', status: 'healthy' },
  { from: 'api-gateway', to: 'postgresql', label: 'SQL Task Queries', status: 'healthy' },
  { from: 'auth-service', to: 'redis-cache', label: 'Token Blacklist', status: 'healthy' },
  { from: 'api-gateway', to: 'redis-cache', label: 'Rate Limiting', status: 'healthy' },
  { from: 'audio-worker', to: 'whisper-engine', label: 'Audio Chunks (WAV)', status: 'blocked', note: 'Blocked by S3 IAM Policy' },
];

// =============================================================================
// ENGINEERING CODE TASK BOARD (KANBAN)
// =============================================================================
export const CODE_TASKS = [
  {
    id: 'task-dev-1',
    title: 'Write compound index migration on tasks collection',
    subsystem: 'db/migrations',
    branch: 'feat/pg-tasks-compound-index',
    priority: 'P1',
    est: '4h',
    column: 'ready',
    assignee: 'Priya Patel',
    evidenceSegmentId: 'seg_301',
    timestamp: '04:12',
    speaker: 'Priya Patel',
    description: 'Create compound index in migration script on (meetingId, approvalStatus) to accelerate task triage queries.',
  },
  {
    id: 'task-dev-2',
    title: 'Setup Docker Compose service mesh for API Gateway & Auth',
    subsystem: 'infra/docker',
    branch: 'chore/compose-service-mesh',
    priority: 'P2',
    est: '1d',
    column: 'ready',
    assignee: 'Unassigned',
    evidenceSegmentId: 'seg_003',
    timestamp: '22:00',
    speaker: 'Sarah Jenkins',
    description: 'Configure bridge network, port bindings, and environment variables across frontend, gateway, and Postgres services.',
  },
  {
    id: 'task-dev-3',
    title: 'Implement Redis token bucket rate limiter middleware',
    subsystem: 'backend/api-gateway',
    branch: 'feat/gateway-rate-limiter',
    priority: 'P0',
    est: '6h',
    column: 'in_progress',
    assignee: 'Priya Patel',
    evidenceSegmentId: 'seg_103',
    timestamp: '15:30',
    speaker: 'Priya Patel',
    description: 'Build Redis-backed rate limiting middleware on API Gateway throttling unauthenticated requests to 60 req/min.',
  },
  {
    id: 'task-dev-4',
    title: 'Build smooth scrolling & amber evidence highlight in UI',
    subsystem: 'frontend/dashboard',
    branch: 'feat/evidence-drawer-highlight',
    priority: 'P1',
    est: '1d',
    column: 'in_progress',
    assignee: 'Rahul Sharma',
    evidenceSegmentId: 'seg_201',
    timestamp: '16:00',
    speaker: 'Rahul Sharma',
    description: 'Add React refs and scrollIntoView logic with amber left border and subtle backdrop highlight on matched speech segments.',
  },
  {
    id: 'task-dev-5',
    title: 'Standardize session transport on HTTP-only SameSite cookies',
    subsystem: 'frontend/auth',
    branch: 'fix/http-only-cookie-auth',
    priority: 'P0',
    est: 'Completed',
    prUrl: '#142',
    column: 'pr_review',
    assignee: 'Sarah Jenkins',
    evidenceSegmentId: 'seg_102',
    timestamp: '08:20',
    speaker: 'Sarah Jenkins',
    description: 'Transition JWT refresh tokens and session tokens to SameSite=Strict secure HTTP-only cookies across all microservices.',
  },
  {
    id: 'task-dev-6',
    title: 'Deploy live streaming WebSocket endpoint for Whisper pipeline',
    subsystem: 'worker/whisper',
    branch: 'feat/live-audio-websocket-stream',
    priority: 'P0',
    est: 'Blocked',
    blockerReason: 'Blocked by missing S3 IAM policy for live speech buffer uploads',
    column: 'blocked',
    assignee: 'Rahul Sharma',
    evidenceSegmentId: 'seg_204',
    timestamp: '22:15',
    speaker: 'Rahul Sharma',
    description: 'Consumes binary audio frames and feeds 10s chunks to Whisper engine; halted due to S3 403 Forbidden credential error.',
  },
];

// =============================================================================
// TECHNICAL BLOCKER & AMBIGUITY RADAR
// =============================================================================
export const RADAR_ITEMS = [
  {
    id: 'radar-1',
    type: 'dependency_lock',
    title: 'AWS S3 IAM Policy Missing for Audio Persistence Worker',
    category: 'Infrastructure Dependency',
    severity: 'P0 Critical',
    impact: 'Halts live meeting transcription and speech chunk uploads (502 Bad Gateway).',
    speaker: 'Rahul Sharma (Frontend/Worker)',
    timestamp: '22:15',
    evidenceSegmentId: 'seg_204',
    quote: "Audio streaming WebSocket endpoint returning 502 Bad Gateway because S3 bucket write credentials haven't been provisioned by DevOps.",
    actionRequired: 'DevOps team must attach s3:PutObject and s3:GetObject policy to syncora-worker-role.',
    status: 'active',
  },
  {
    id: 'radar-2',
    type: 'unresolved_spec',
    title: 'WebSocket Auth Handshake: Bearer Query Param vs Cookie Headers',
    category: 'API Specification Ambiguity',
    severity: 'P1 High',
    impact: 'Browser WebSocket API cannot send custom Authorization headers during handshake.',
    speaker: 'Sarah Jenkins (Lead)',
    timestamp: '18:40',
    evidenceSegmentId: 'seg_104',
    quote: 'Do we pass temporary signed tokens in the socket query URL or rely on cross-origin cookie credentials for live transcription?',
    actionRequired: 'Backend lead to ratify RFC #108 specifying ephemeral signed tickets generated via REST prior to socket dial.',
    status: 'active',
  },
  {
    id: 'radar-3',
    type: 'dependency_lock',
    title: 'GPU VRAM Allocation Limit on Whisper Worker Cluster',
    category: 'Resource Quota Bottleneck',
    severity: 'P1 High',
    impact: 'Concurrent transcripts exceeding 4 parallel calls queue up with >15s latency.',
    speaker: 'Sarah Jenkins (Lead)',
    timestamp: '29:05',
    evidenceSegmentId: 'seg_104',
    quote: 'GPU replica allocation might struggle during simultaneous multi-team sprint calls unless we scale CUDA worker pods.',
    actionRequired: 'Request AWS g4dn.xlarge node group autoscaling configuration with min=2, max=6 pods.',
    status: 'active',
  },
  {
    id: 'radar-4',
    type: 'unresolved_spec',
    title: 'Database Read-Replica Failover Policy during Peak Meeting Hours',
    category: 'Database Architecture',
    severity: 'P2 Medium',
    impact: 'Read replica replication lag could return stale task approval states.',
    speaker: 'Priya Patel (Backend)',
    timestamp: '14:20',
    evidenceSegmentId: 'seg_302',
    quote: 'If we scale read replicas for meeting transcript queries, we need cache invalidation keys to trigger immediately upon manager approval.',
    actionRequired: 'Implement Redis pub/sub invalidation channel for task mutators.',
    status: 'resolved',
  },
];

export default function DeveloperDashboard({
  onOpenEvidence = () => {},
  onSelectMeeting = () => {},
  subView = 'home',
}) {
  const [selectedModuleId, setSelectedModuleId] = useState('audio-worker');
  const [radarFilter, setRadarFilter] = useState('all'); // 'all' | 'dependency_lock' | 'unresolved_spec'
  const [copiedBranch, setCopiedBranch] = useState(null);
  const [exportedTaskId, setExportedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (subView === 'dev-graph') return 'graph';
    if (subView === 'dev-kanban') return 'board';
    if (subView === 'dev-blockers') return 'radar';
    return 'all';
  });

  React.useEffect(() => {
    if (subView === 'dev-graph') setActiveTab('graph');
    else if (subView === 'dev-kanban') setActiveTab('board');
    else if (subView === 'dev-blockers') setActiveTab('radar');
    else if (subView === 'home' || subView === 'developer-dashboard') setActiveTab('all');
  }, [subView]);

  const selectedModule = useMemo(() => {
    return ARCHITECTURE_MODULES.find((m) => m.id === selectedModuleId) || ARCHITECTURE_MODULES[0];
  }, [selectedModuleId]);

  const filteredRadarItems = useMemo(() => {
    if (radarFilter === 'all') return RADAR_ITEMS;
    return RADAR_ITEMS.filter((item) => item.type === radarFilter);
  }, [radarFilter]);

  const handleCopyBranch = (branch) => {
    navigator.clipboard?.writeText(branch);
    setCopiedBranch(branch);
    setTimeout(() => setCopiedBranch(null), 2000);
  };

  const handleExportTask = (taskId) => {
    setExportedTaskId(taskId);
    setTimeout(() => setExportedTaskId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TOP METRIC RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Active Modules
            </div>
            <div className="text-2xl font-extrabold text-surface-900 dark:text-white mt-0.5">
              6 Modules
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              4 microservices • 2 workers
            </span>
          </div>
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Critical Path Blockers
            </div>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              2 Blockers
            </div>
            <span className="text-[10px] text-rose-500 font-semibold">
              S3 IAM Policy • GPU Quota
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Grounded Decisions
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              4 Decisions
            </div>
            <span className="text-[10px] text-surface-500 font-semibold">
              100% audio verified
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Active Branches
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              5 In Flight
            </div>
            <span className="text-[10px] text-indigo-500 font-semibold">
              1 PR in review (#142)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <GitBranch className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Section Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-brand-400 border border-slate-800 shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white">
                Developer & Architecture Dashboard
              </h1>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Grounded engineering topology, sprint code deliverables, and technical blocker monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            All Views
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Dependency Graph
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Code Sprint Board
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Blocker Radar
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. INTERACTIVE PROJECT & SERVICE DEPENDENCY GRAPH */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'graph') && (
        <section aria-label="Architecture Dependency Graph" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Project & Architecture Dependency Graph
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Interactive SVG Topology
              </span>
            </div>
            <span className="text-xs text-surface-400 hidden sm:inline">
              Click any node to inspect endpoints & timestamped audio evidence
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SVG Canvas (Left 2 cols) - Light Mode */}
            <div className="lg:col-span-2 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm p-5 relative overflow-hidden min-h-[440px] flex flex-col justify-between">
              
              {/* Graph Grid Pattern */}
              <div
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Status Header Legend inside Canvas */}
              <div className="relative z-10 flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-4 flex-wrap font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/30" />
                    <span className="text-slate-700">Healthy Service</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/30" />
                    <span className="text-slate-700">Warning / Degraded</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-xs shadow-rose-500/30" />
                    <span className="text-slate-700">Critical Path Blocker</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  Select node to view speech quote
                </span>
              </div>

              {/* Interactive Vector Graph */}
              <div className="relative z-10 my-auto py-4 overflow-x-auto">
                <svg
                  viewBox="0 0 920 420"
                  className="w-full h-auto min-w-[760px] max-h-[380px]"
                >
                  <defs>
                    {/* Normal marker */}
                    <marker
                      id="arrow-healthy"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366F1" />
                    </marker>

                    {/* Blocked marker */}
                    <marker
                      id="arrow-blocked"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#F43F5E" />
                    </marker>

                    {/* Warning marker */}
                    <marker
                      id="arrow-warning"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#F59E0B" />
                    </marker>
                  </defs>

                  {/* Connection Paths */}
                  {/* Client Web App -> API Gateway */}
                  <path
                    d="M 190 145 L 290 145"
                    stroke="#6366F1"
                    strokeWidth="2.5"
                    strokeDasharray="5,5"
                    fill="none"
                    markerEnd="url(#arrow-healthy)"
                  />
                  <text x="240" y="135" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                    HTTPS REST
                  </text>

                  {/* Client Web App -> Audio Worker (Warning) */}
                  <path
                    d="M 140 185 C 140 260, 200 305, 290 305"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    fill="none"
                    markerEnd="url(#arrow-warning)"
                  />
                  <text x="210" y="270" fill="#D97706" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    WSS (502 Gateway Lag)
                  </text>

                  {/* API Gateway -> Auth Service */}
                  <path
                    d="M 430 130 C 470 110, 480 80, 520 75"
                    stroke="#6366F1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrow-healthy)"
                  />

                  {/* API Gateway -> PostgreSQL */}
                  <path
                    d="M 430 160 C 470 180, 480 215, 520 220"
                    stroke="#6366F1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrow-healthy)"
                  />
                  <text x="475" y="195" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                    SQL Queries
                  </text>

                  {/* Auth Service -> Redis Cache */}
                  <path
                    d="M 670 75 L 750 75"
                    stroke="#6366F1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrow-healthy)"
                  />
                  <text x="710" y="65" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                    Session TTL
                  </text>

                  {/* Audio Worker -> Whisper Engine (BLOCKED by S3 IAM Policy) */}
                  <path
                    d="M 430 310 C 470 315, 480 345, 520 350"
                    stroke="#F43F5E"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    fill="none"
                    markerEnd="url(#arrow-blocked)"
                  />
                  {/* Blocker Pill on Connection */}
                  <g transform="translate(475, 315)">
                    <rect x="-75" y="-12" width="150" height="22" rx="11" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#BE123C" fontSize="9.5" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                      ⚠ Blocked: S3 IAM Policy
                    </text>
                  </g>

                  {/* Render Module Node Boxes - Light Mode */}
                  {ARCHITECTURE_MODULES.map((mod) => {
                    const isSelected = mod.id === selectedModuleId;
                    const isBlocked = mod.status === 'blocked';
                    const isWarning = mod.status === 'bottleneck';

                    let strokeColor = '#E2E8F0';
                    let bgColor = '#FFFFFF';

                    if (isSelected) {
                      strokeColor = '#4F46E5';
                    } else if (isBlocked) {
                      strokeColor = '#F43F5E';
                    } else if (isWarning) {
                      strokeColor = '#F59E0B';
                    }

                    return (
                      <g
                        key={mod.id}
                        transform={`translate(${mod.x}, ${mod.y})`}
                        onClick={() => setSelectedModuleId(mod.id)}
                        className="cursor-pointer group"
                      >
                        {/* Selected Glow Ring */}
                        {isSelected && (
                          <rect
                            x="-4"
                            y="-4"
                            width="148"
                            height="73"
                            rx="18"
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="2.5"
                            strokeOpacity="0.7"
                            filter="drop-shadow(0 4px 12px rgba(79, 70, 229, 0.25))"
                          />
                        )}

                        {/* Node Card Background */}
                        <rect
                          x="0"
                          y="0"
                          width="140"
                          height="65"
                          rx="14"
                          fill={bgColor}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          className="transition-all"
                          filter={isSelected ? 'none' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04))'}
                        />

                        {/* Status Indicator Dot */}
                        <circle
                          cx="18"
                          cy="20"
                          r="4.5"
                          fill={
                            isBlocked
                              ? '#F43F5E'
                              : isWarning
                              ? '#F59E0B'
                              : '#10B981'
                          }
                          className={isBlocked ? 'animate-pulse' : ''}
                        />

                        {/* Node Label */}
                        <text
                          x="30"
                          y="24"
                          fill="#0F172A"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {mod.label}
                        </text>

                        {/* Tech Tag */}
                        <text
                          x="18"
                          y="42"
                          fill="#475569"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {mod.tech}
                        </text>

                        {/* Subsystem path */}
                        <text
                          x="18"
                          y="55"
                          fill="#64748B"
                          fontSize="8.5"
                          fontFamily="monospace"
                        >
                          {mod.subsystem}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bottom Canvas Notice */}
              <div className="relative z-10 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px]">
                  Showing 7 live topology nodes • Directed arrows indicate dependency flow
                </span>
                <span className="text-[11px] text-brand-600 font-semibold">
                  Active Selected: {selectedModule.label}
                </span>
              </div>
            </div>

            {/* Selected Node Inspector Drawer (Right 1 col) */}
            <div className="rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-md p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                        {selectedModule.subsystem}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          selectedModule.status === 'blocked'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : selectedModule.status === 'bottleneck'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {selectedModule.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                      {selectedModule.label}
                    </h3>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <Server className="w-5 h-5" />
                  </div>
                </div>

                {/* Tech & Endpoints */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                    Stack & Endpoints
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60 space-y-1 font-mono text-xs">
                    <div className="text-surface-900 dark:text-surface-100 font-semibold">
                      {selectedModule.tech}
                    </div>
                    {selectedModule.endpoints.map((ep, idx) => (
                      <div key={idx} className="text-surface-500 dark:text-surface-400 truncate">
                        • {ep}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Summary */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                    Architecture Rationale
                  </div>
                  <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                    {selectedModule.summary}
                  </p>
                </div>

                {/* Blocked Alert Banner if applicable */}
                {selectedModule.statusReason && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Infrastructure Blocker Active</span>
                    </div>
                    <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                      {selectedModule.statusReason}
                    </p>
                  </div>
                )}

                {/* Direct Spoken Audio Evidence */}
                <div className="space-y-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-surface-400">
                    <span>Meeting Discussion Evidence</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      {selectedModule.timestamp}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-300">
                      <span>{selectedModule.speaker}</span>
                      <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                        {selectedModule.evidenceSegmentId}
                      </span>
                    </div>
                    <p className="text-xs text-surface-800 dark:text-surface-200 italic leading-relaxed">
                      "{selectedModule.quote}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onOpenEvidence([selectedModule.evidenceSegmentId])}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Jump to Spoken Audio Context</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 3. CODE TASK BOARD (ENGINEERING SPRINT / KANBAN) */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'board') && (
        <section aria-label="Engineering Code Task Board" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Engineering Code Task Board (Sprint Deliverables)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Git Branch Automation
              </span>
            </div>
            <span className="text-xs text-surface-400 hidden sm:inline">
              Categorized by implementation phase with 1-click export to issue trackers
            </span>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Column 1: Ready for Dev */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-100 dark:bg-surface-800/80 border border-surface-200/80 dark:border-surface-700/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-surface-800 dark:text-surface-200">
                    Ready for Dev
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 shadow-xs">
                  {CODE_TASKS.filter((t) => t.column === 'ready').length}
                </span>
              </div>

              <div className="space-y-3">
                {CODE_TASKS.filter((t) => t.column === 'ready').map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    copiedBranch={copiedBranch}
                    exportedTaskId={exportedTaskId}
                    onCopyBranch={handleCopyBranch}
                    onExportTask={handleExportTask}
                    onOpenEvidence={onOpenEvidence}
                  />
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    In Progress
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-surface-800 text-blue-600 dark:text-blue-300 shadow-xs">
                  {CODE_TASKS.filter((t) => t.column === 'in_progress').length}
                </span>
              </div>

              <div className="space-y-3">
                {CODE_TASKS.filter((t) => t.column === 'in_progress').map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    copiedBranch={copiedBranch}
                    exportedTaskId={exportedTaskId}
                    onCopyBranch={handleCopyBranch}
                    onExportTask={handleExportTask}
                    onOpenEvidence={onOpenEvidence}
                  />
                ))}
              </div>
            </div>

            {/* Column 3: PR Review */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    PR Review
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-surface-800 text-indigo-600 dark:text-indigo-300 shadow-xs">
                  {CODE_TASKS.filter((t) => t.column === 'pr_review').length}
                </span>
              </div>

              <div className="space-y-3">
                {CODE_TASKS.filter((t) => t.column === 'pr_review').map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    copiedBranch={copiedBranch}
                    exportedTaskId={exportedTaskId}
                    onCopyBranch={handleCopyBranch}
                    onExportTask={handleExportTask}
                    onOpenEvidence={onOpenEvidence}
                  />
                ))}
              </div>
            </div>

            {/* Column 4: Blocked */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    Blocked
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-surface-800 text-rose-600 dark:text-rose-300 shadow-xs">
                  {CODE_TASKS.filter((t) => t.column === 'blocked').length}
                </span>
              </div>

              <div className="space-y-3">
                {CODE_TASKS.filter((t) => t.column === 'blocked').map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    copiedBranch={copiedBranch}
                    exportedTaskId={exportedTaskId}
                    onCopyBranch={handleCopyBranch}
                    onExportTask={handleExportTask}
                    onOpenEvidence={onOpenEvidence}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 4. TECHNICAL BLOCKER & AMBIGUITY RADAR */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'radar') && (
        <section aria-label="Technical Blocker and Ambiguity Radar" className="space-y-4 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                Technical Blocker & Ambiguity Radar
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Spoken Evidence Citations
              </span>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRadarFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  radarFilter === 'all'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-xs'
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                All ({RADAR_ITEMS.length})
              </button>
              <button
                type="button"
                onClick={() => setRadarFilter('dependency_lock')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  radarFilter === 'dependency_lock'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                Dependency Lock
              </button>
              <button
                type="button"
                onClick={() => setRadarFilter('unresolved_spec')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  radarFilter === 'unresolved_spec'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                Unresolved Spec
              </button>
            </div>
          </div>

          {/* Radar Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRadarItems.map((item) => {
              const isDepLock = item.type === 'dependency_lock';
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-surface-900 border transition-all space-y-4 shadow-sm ${
                    isDepLock
                      ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                      : 'border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-500/20'
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isDepLock
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isDepLock ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>{isDepLock ? 'Dependency Lock' : 'Unresolved Spec'}</span>
                      </span>

                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                        {item.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        item.severity.includes('P0')
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  {/* Title & Impact */}
                  <div>
                    <h3 className="text-base font-bold text-surface-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                      <strong>Impact:</strong> {item.impact}
                    </p>
                  </div>

                  {/* Direct Spoken Audio Citation */}
                  <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-surface-700 dark:text-surface-300">
                      <span>{item.speaker}</span>
                      <button
                        type="button"
                        onClick={() => onOpenEvidence([item.evidenceSegmentId])}
                        className="font-mono text-[11px] text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-brand-500" />
                        <span>▶ {item.timestamp} - Audio Evidence</span>
                      </button>
                    </div>
                    <p className="text-xs text-surface-600 dark:text-surface-300 italic leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Action Required Footer */}
                  <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs gap-3">
                    <span className="text-surface-500 dark:text-surface-400 text-[11px]">
                      <strong>Action:</strong> {item.actionRequired}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenEvidence([item.evidenceSegmentId])}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      Inspect Audio
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: KANBAN TASK CARD
// =============================================================================
function TaskCard({
  task,
  copiedBranch,
  exportedTaskId,
  onCopyBranch,
  onExportTask,
  onOpenEvidence,
}) {
  const isCopied = copiedBranch === task.branch;
  const isExported = exportedTaskId === task.id;

  const priorityStyles = {
    P0: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    P1: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    P2: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs hover:border-brand-400 dark:hover:border-brand-500 transition-all space-y-3">
      {/* Subsystem & Priority Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-semibold truncate max-w-[140px]">
          {task.subsystem}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              priorityStyles[task.priority] || priorityStyles.P1
            }`}
          >
            {task.priority}
          </span>
          <span className="font-mono text-[10px] text-surface-400">
            {task.est}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-surface-900 dark:text-white leading-snug">
        {task.title}
      </h4>

      {/* Auto-Suggested Git Branch Name */}
      <div className="flex items-center justify-between gap-1 p-1.5 rounded-xl bg-surface-50 dark:bg-surface-800/80 border border-surface-200/80 dark:border-surface-700/80 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 truncate text-surface-700 dark:text-surface-300">
          <GitBranch className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="truncate">{task.branch}</span>
        </div>

        <button
          type="button"
          onClick={() => onCopyBranch(task.branch)}
          className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors flex-shrink-0 cursor-pointer"
          title="Copy branch name"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Blocker details if present */}
      {task.blockerReason && (
        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[11px] text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 leading-tight">
          ⚠ {task.blockerReason}
        </div>
      )}

      {/* Footer: Assignee & Action Buttons */}
      <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs gap-2">
        <span className="text-[10px] text-surface-400 truncate">
          {task.assignee}
        </span>

        <div className="flex items-center gap-1.5">
          {task.evidenceSegmentId && (
            <button
              type="button"
              onClick={() => onOpenEvidence([task.evidenceSegmentId])}
              className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              title="Inspect discussion audio"
            >
              Audio
            </button>
          )}

          <button
            type="button"
            onClick={() => onExportTask(task.id)}
            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            title="Export to GitHub Issue / Linear"
          >
            {isExported ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

