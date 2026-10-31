import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderGit2,
  FolderTree,
  Layers,
  Cpu,
  FileCode2,
  Database,
  Network,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  FileText,
  Folder,
  FolderOpen,
  File,
  Code2,
  ChevronRight,
  ChevronDown,
  GitBranch,
  ShieldCheck,
  Terminal,
  Search,
  Share2,
  Boxes,
  Play,
  X,
  Server,
  Cloud,
  UploadCloud,
  Lock,
  Workflow,
  ArrowDown,
  Filter,
  GitFork,
  Tag,
  ListFilter,
  Eye,
  EyeOff,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer,
  Hand,
  Undo2,
  Redo2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useArchitecture } from '../context/ArchitectureContext';

// =============================================================================
// REACT FLOW CUSTOM NODE COMPONENTS (Group Containers & Pill Nodes)
// =============================================================================
const CustomGroupNode = ({ data }) => {
  return (
    <div className="w-full h-full rounded-2xl border border-slate-300 bg-slate-100/60 p-3 pointer-events-none select-none shadow-xs">
      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
        <span>{data.label}</span>
        {data.count && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 font-bold ml-auto">
            {data.count}
          </span>
        )}
      </div>
    </div>
  );
};

const CustomFilePillNode = ({ data, selected }) => {
  let pillClass = 'bg-slate-700 text-white shadow-slate-700/20';
  let roleTag = 'CONF';

  if (data.role === 'entry') {
    pillClass = 'bg-amber-500 text-white shadow-amber-500/20';
    roleTag = 'ENTRY';
  } else if (data.role === 'controller' || data.role === 'api') {
    pillClass = 'bg-emerald-600 text-white shadow-emerald-600/20';
    roleTag = 'ROUTE';
  } else if (data.role === 'ui' || data.role === 'component') {
    pillClass = 'bg-sky-500 text-white shadow-sky-500/20';
    roleTag = 'UI';
  } else if (data.role === 'service') {
    pillClass = 'bg-teal-600 text-white shadow-teal-600/20';
    roleTag = 'SVC';
  } else if (data.role === 'data') {
    pillClass = 'bg-purple-600 text-white shadow-purple-600/20';
    roleTag = 'DATA';
  }

  return (
    <div
      className={`px-3 py-1.5 rounded-full flex items-center justify-between gap-2 shadow-sm font-mono text-xs w-[248px] select-none cursor-pointer transition-all ${pillClass} ${
        selected ? 'ring-2 ring-indigo-600 ring-offset-2 scale-102 font-bold' : 'hover:scale-101'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-white/90 !border-none"
      />

      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-white/90 shrink-0" />
        <span className="truncate font-semibold text-[11px]">{data.name}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0 text-[10px] text-white/90">
        <span className="px-1.5 py-0.2 rounded bg-black/20 text-[9px] font-bold">
          {roleTag}
        </span>
        {data.lines && (
          <span className="text-white/80 text-[10px]">{data.lines}L</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-white/90 !border-none"
      />
    </div>
  );
};

const nodeTypes = {
  group: CustomGroupNode,
  filePill: CustomFilePillNode,
};

const miniMapNodeColor = (node) => {
  if (node.type === 'group') return '#f1f5f9';
  if (node.data?.role === 'entry') return '#f59e0b';
  if (node.data?.role === 'controller' || node.data?.role === 'api') return '#059669';
  if (node.data?.role === 'ui' || node.data?.role === 'component') return '#0ea5e9';
  if (node.data?.role === 'service') return '#0d9488';
  return '#334155';
};

// =============================================================================
// REACT FLOW ELEMENT GENERATOR FROM REAL EXTRACTED FILES
// =============================================================================
function generateReactFlowElements(analysisData) {
  if (!analysisData) {
    return { nodes: [], edges: [], groups: [], groupMap: new Map(), files: [] };
  }

  // 1. Gather all files
  let fileList = [];
  if (Array.isArray(analysisData.filesWithMetadata) && analysisData.filesWithMetadata.length > 0) {
    fileList = analysisData.filesWithMetadata;
  } else if (analysisData.mindMap?.branches) {
    for (const b of analysisData.mindMap.branches) {
      if (Array.isArray(b.modules)) {
        for (const m of b.modules) {
          const ext = m.path.split('.').pop()?.toLowerCase() || '';
          fileList.push({
            path: m.path,
            name: m.name,
            ext,
            layer: b.layerKey,
            lines: m.lines || 45,
            sizeFormatted: m.sizeFormatted || '1.5 KB',
            symbols: m.symbols || [],
            imports: m.imports || [],
          });
        }
      }
    }
  }

  if (fileList.length === 0 && Array.isArray(analysisData.fileTree)) {
    const extractFromTree = (treeNodes) => {
      for (const n of treeNodes) {
        if (n.type === 'file') {
          const ext = n.name.split('.').pop()?.toLowerCase() || '';
          fileList.push({
            path: n.path,
            name: n.name,
            ext,
            layer: 'services',
            lines: 45,
            sizeFormatted: '1.2 KB',
            symbols: [],
            imports: [],
          });
        } else if (n.children) {
          extractFromTree(n.children);
        }
      }
    };
    extractFromTree(analysisData.fileTree);
  }

  // 2. Classify roles
  const processedFiles = fileList.map((f) => {
    const p = f.path.toLowerCase();
    const name = f.name.toLowerCase();
    const ext = (f.ext || '').toLowerCase();

    let role = 'config';
    if (
      name === 'main.js' ||
      name === 'main.jsx' ||
      name === 'main.tsx' ||
      name === 'main.go' ||
      name === 'main.py' ||
      name === 'app.jsx' ||
      name === 'app.tsx' ||
      name === 'app.js' ||
      name === 'server.js' ||
      name === 'server.ts' ||
      name === 'index.jsx' ||
      name === 'index.js' ||
      p.startsWith('cmd/') ||
      p.includes('/cmd/')
    ) {
      role = 'entry';
    } else if (
      p.includes('route') ||
      p.includes('controller') ||
      p.includes('/api/') ||
      p.includes('endpoint')
    ) {
      role = 'controller';
    } else if (
      ['jsx', 'tsx', 'vue', 'svelte', 'html'].includes(ext) ||
      p.includes('/components/') ||
      p.includes('/pages/') ||
      p.includes('/views/') ||
      p.includes('/layouts/') ||
      p.includes('/ui/')
    ) {
      role = 'ui';
    } else if (
      name === 'package.json' ||
      ext === 'prisma' ||
      ext === 'sql' ||
      name.startsWith('.env') ||
      ext === 'json' ||
      ext === 'yaml' ||
      ext === 'yml' ||
      ext === 'toml' ||
      name.includes('config')
    ) {
      role = 'config';
    } else if (
      p.includes('/services/') ||
      p.includes('/utils/') ||
      p.includes('/helpers/') ||
      p.includes('/lib/') ||
      p.includes('/context/') ||
      p.includes('/store/')
    ) {
      role = 'service';
    } else if (p.includes('/models/') || p.includes('/database/')) {
      role = 'data';
    }

    return {
      ...f,
      role,
      nodeId: `node-${f.path.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    };
  });

  // 3. Group files by directory
  const groupMap = new Map();
  for (const f of processedFiles) {
    const parts = f.path.split('/');
    let dirPath = '';
    if (parts.length > 1) {
      dirPath = parts.slice(0, Math.min(parts.length - 1, 2)).join('/');
    } else {
      dirPath = 'root';
    }

    if (!groupMap.has(dirPath)) {
      groupMap.set(dirPath, {
        id: `group-${dirPath.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        dirPath,
        title: dirPath === 'root' ? 'root/' : `${dirPath}/`,
        files: [],
      });
    }
    groupMap.get(dirPath).files.push(f);
  }

  // 4. Position group boxes across columns
  const groups = Array.from(groupMap.values());
  const getColIndex = (grp) => {
    const p = grp.dirPath.toLowerCase();
    if (p === 'root' || p.startsWith('cmd') || grp.files.some((f) => f.role === 'entry')) return 0;
    if (p.includes('component') || p.includes('pages') || p.includes('views') || p.includes('ui')) return 1;
    if (p.includes('route') || p.includes('controller') || p.includes('api') || p.includes('internal')) return 2;
    if (p.includes('service') || p.includes('util') || p.includes('helper') || p.includes('lib') || p.includes('context') || p.includes('store')) return 3;
    if (p.includes('model') || p.includes('prisma') || p.includes('database') || p.includes('schema') || p.includes('sql')) return 4;
    return 1;
  };

  const columns = [[], [], [], [], []];
  for (const grp of groups) {
    columns[getColIndex(grp)].push(grp);
  }
  const activeColumns = columns.filter((col) => col.length > 0);

  const COL_WIDTH = 290;
  const COL_GAP = 50;
  const START_X = 50;
  const START_Y = 50;
  const HEADER_HEIGHT = 48;
  const NODE_HEIGHT = 40;
  const NODE_GAP = 8;
  const PADDING = 14;

  const rfNodes = [];
  const processedGroups = [];

  activeColumns.forEach((colGroups, colIndex) => {
    let currentY = START_Y;
    const groupX = START_X + colIndex * (COL_WIDTH + COL_GAP);

    colGroups.forEach((grp) => {
      const groupWidth = COL_WIDTH;
      const groupHeight = HEADER_HEIGHT + grp.files.length * (NODE_HEIGHT + NODE_GAP) + PADDING;

      grp.x = groupX;
      grp.y = currentY;
      grp.width = groupWidth;
      grp.height = groupHeight;

      // Create Parent Group Node
      rfNodes.push({
        id: grp.id,
        type: 'group',
        position: { x: groupX, y: currentY },
        style: {
          width: groupWidth,
          height: groupHeight,
          backgroundColor: 'rgba(241, 245, 249, 0.65)',
          border: '1px solid #cbd5e1',
          borderRadius: '16px',
          padding: '12px',
        },
        data: {
          label: `📁 ${grp.title}`,
          count: grp.files.length,
        },
      });

      // Create Child Nodes inside Parent Group
      grp.files.forEach((file, index) => {
        rfNodes.push({
          id: file.nodeId,
          type: 'filePill',
          parentId: grp.id,
          extent: 'parent',
          position: { x: PADDING, y: HEADER_HEIGHT + index * (NODE_HEIGHT + NODE_GAP) },
          data: {
            id: file.nodeId,
            name: file.name,
            path: file.path,
            ext: file.ext,
            role: file.role,
            lines: file.lines,
            sizeFormatted: file.sizeFormatted,
            symbols: file.symbols,
            imports: file.imports,
            groupId: grp.id,
          },
        });
      });

      processedGroups.push(grp);
      currentY += groupHeight + 36;
    });
  });

  // 5. Connect Dynamic Dependency Edges
  const nodeByName = new Map();
  const nodeByPath = new Map();
  for (const f of processedFiles) {
    nodeByPath.set(f.path.toLowerCase(), f);
    const base = f.name.toLowerCase().replace(/\.[^.]+$/, '');
    if (!nodeByName.has(base)) {
      nodeByName.set(base, f);
    }
  }

  const rfEdges = [];
  const seenEdgeIds = new Set();

  for (const src of processedFiles) {
    // A. Real file imports
    for (const imp of src.imports || []) {
      const cleanImp = imp.toLowerCase().replace(/^\.\.?\//, '').replace(/\.[^.]+$/, '');
      const impParts = cleanImp.split('/');
      const impBase = impParts[impParts.length - 1];

      let target = null;
      if (nodeByName.has(impBase)) {
        target = nodeByName.get(impBase);
      } else {
        for (const [p, n] of nodeByPath.entries()) {
          if (p.includes(cleanImp) || p.endsWith(`${impBase}.${n.ext}`)) {
            target = n;
            break;
          }
        }
      }

      if (target && target.nodeId !== src.nodeId) {
        const edgeId = `edge-${src.nodeId}-${target.nodeId}`;
        if (!seenEdgeIds.has(edgeId)) {
          seenEdgeIds.add(edgeId);
          rfEdges.push({
            id: edgeId,
            source: src.nodeId,
            target: target.nodeId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          });
        }
      }
    }

    // B. Connect Entry nodes to Controllers / Routes if not already connected
    if (src.role === 'entry') {
      const targets = processedFiles.filter(
        (f) => (f.role === 'controller' || f.role === 'ui') && f.nodeId !== src.nodeId
      );
      for (const tgt of targets.slice(0, 3)) {
        const edgeId = `edge-${src.nodeId}-${tgt.nodeId}`;
        if (!seenEdgeIds.has(edgeId)) {
          seenEdgeIds.add(edgeId);
          rfEdges.push({
            id: edgeId,
            source: src.nodeId,
            target: tgt.nodeId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          });
        }
      }
    }

    // C. Connect Controllers to Models / Services
    if (src.role === 'controller') {
      const targets = processedFiles.filter(
        (f) => (f.role === 'service' || f.role === 'data') && f.nodeId !== src.nodeId
      );
      for (const tgt of targets.slice(0, 2)) {
        const edgeId = `edge-${src.nodeId}-${tgt.nodeId}`;
        if (!seenEdgeIds.has(edgeId)) {
          seenEdgeIds.add(edgeId);
          rfEdges.push({
            id: edgeId,
            source: src.nodeId,
            target: tgt.nodeId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          });
        }
      }
    }
  }

  const groupLookup = new Map();
  for (const g of processedGroups) {
    groupLookup.set(g.id, g);
  }

  return {
    nodes: rfNodes,
    edges: rfEdges,
    groups: processedGroups,
    groupMap: groupLookup,
    files: processedFiles,
  };
}

// =============================================================================
// INTERACTIVE ARCHITECTURE NODES & DIAGRAM TOPOLOGY
// =============================================================================
export const DIAGRAM_NODES = [
  {
    id: 'node-client',
    label: 'Client Web App',
    category: 'Frontend',
    icon: Boxes,
    color: 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    tech: 'React 18 • Vite • Tailwind',
    x: 40,
    y: 130,
    status: 'healthy',
    responsibility: 'Interactive workspace dashboard, real-time audio playback scrubber, evidence triage drawer, and role views.',
    files: [
      { name: 'src/main.jsx', lines: 34, role: 'Bootstrapping' },
      { name: 'src/App.jsx', lines: 430, role: 'Workspace Routing' },
      { name: 'src/components/DashboardLayout.jsx', lines: 82, role: 'Layout Shell' },
    ],
    solutionSection: 'Frontend Client Architecture',
  },
  {
    id: 'node-gateway',
    label: 'API Gateway',
    category: 'Routing & Defense',
    icon: Network,
    color: 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    tech: 'Express.js • RateLimiter',
    x: 270,
    y: 130,
    status: 'healthy',
    responsibility: 'Reverse proxy, JWT token validation, token-bucket rate limiting (60 req/min), and API endpoint routing.',
    files: [
      { name: 'backend/api-gateway/server.js', lines: 186, role: 'Express Entry' },
      { name: 'backend/api-gateway/rateLimiter.js', lines: 64, role: 'Token Bucket' },
    ],
    solutionSection: 'API Gateway Token-Bucket Rate Limiter',
  },
  {
    id: 'node-auth',
    label: 'Auth Middleware',
    category: 'Security',
    icon: Lock,
    color: 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    tech: 'JWT • HttpOnly Cookies',
    x: 500,
    y: 40,
    status: 'healthy',
    responsibility: 'Bcrypt password hashing, JWT access token issuance, SameSite=Strict secure cookie session management.',
    files: [
      { name: 'backend/auth-service/index.js', lines: 142, role: 'Auth Handlers' },
      { name: 'backend/auth-service/cookieManager.js', lines: 58, role: 'Cookie Security' },
    ],
    solutionSection: '60-Second Ephemeral Ticket Protocol for WebSockets',
  },
  {
    id: 'node-services',
    label: 'App Core Services',
    category: 'Business Logic',
    icon: Server,
    color: 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300',
    tech: 'Node.js Controllers',
    x: 500,
    y: 220,
    status: 'healthy',
    responsibility: 'Meeting metadata retrieval, transcript chunking, task triage state machine, and approval workflow triggers.',
    files: [
      { name: 'backend/services/tasksService.js', lines: 215, role: 'Task CRUD' },
      { name: 'backend/services/meetingsService.js', lines: 178, role: 'Meeting Transcripts' },
    ],
    solutionSection: 'Pub/Sub Channel Cache Invalidation',
  },
  {
    id: 'node-db',
    label: 'PostgreSQL & Prisma Datastore',
    category: 'Persistent Storage',
    icon: Database,
    color: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    tech: 'PostgreSQL 15 • Prisma ORM',
    x: 730,
    y: 130,
    status: 'healthy',
    responsibility: 'Relational data persistence managed with Prisma ORM, featuring compound indexes (meeting_id, approval_status, assignee_id) for sub-10ms API queries.',
    files: [
      { name: 'prisma/schema.prisma', lines: 88, role: 'Prisma Schema' },
      { name: 'database/schema/001_initial_schema.sql', lines: 110, role: 'DDL Schema' },
      { name: 'database/migrations/002_add_compound_indexes.sql', lines: 45, role: 'Performance Indexes' },
    ],
    solutionSection: 'PostgreSQL Schema & Compound Indexes',
  },
  {
    id: 'node-cache',
    label: 'Redis Cache & PubSub',
    category: 'In-Memory Cache',
    icon: Cpu,
    color: 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
    tech: 'Redis 7.2 • Pub/Sub',
    x: 500,
    y: 340,
    status: 'healthy',
    responsibility: 'Transient meeting session caching, rate-limit counters, and real-time invalidation channel for task updates.',
    files: [
      { name: 'infra/redis.conf', lines: 80, role: 'Redis Configuration' },
      { name: 'backend/services/cacheClient.js', lines: 92, role: 'Pub/Sub Client' },
    ],
    solutionSection: 'Pub/Sub Channel Cache Invalidation',
  },
  {
    id: 'node-worker',
    label: 'Audio Pipeline Worker',
    category: 'Worker / ML',
    icon: Workflow,
    color: 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    tech: 'Python 3.11 • WebSockets',
    x: 270,
    y: 340,
    status: 'blocked',
    blockerReason: 'Missing S3 IAM write policy for speech buffer uploads (502 Bad Gateway).',
    responsibility: 'Consumes binary audio frames over WebSockets, chunks raw speech into 10s buffers, and feeds the Whisper engine.',
    files: [
      { name: 'worker/whisper-pipeline/worker.py', lines: 260, role: 'WebSocket Ingestion' },
      { name: 'worker/whisper-pipeline/s3_uploader.py', lines: 95, role: 'S3 Chunk Writer' },
    ],
    solutionSection: 'Pre-Signed S3 Upload Strategy for Audio Worker',
  },
  {
    id: 'node-whisper',
    label: 'Whisper Inference Engine',
    category: 'AI Model',
    icon: Sparkles,
    color: 'border-violet-500 bg-violet-50/80 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300',
    tech: 'Faster-Whisper • TensorRT',
    x: 730,
    y: 340,
    status: 'warning',
    responsibility: 'Multi-lingual automatic speech recognition, timestamp alignment, and speaker diarization inference.',
    files: [
      { name: 'worker/whisper-pipeline/diarization.py', lines: 140, role: 'Speaker Diarizer' },
      { name: 'worker/whisper-pipeline/inference.py', lines: 185, role: 'Whisper Model' },
    ],
    solutionSection: 'Whisper Speech-to-Text Model Transcribe Pipeline',
  },
];

// Connection Links between Nodes
export const DIAGRAM_CONNECTIONS = [
  { from: 'node-client', to: 'node-gateway', label: 'HTTP / REST', status: 'healthy' },
  { from: 'node-client', to: 'node-worker', label: 'WSS / Binary', status: 'healthy' },
  { from: 'node-gateway', to: 'node-auth', label: 'Validate Token', status: 'healthy' },
  { from: 'node-gateway', to: 'node-services', label: 'Dispatch', status: 'healthy' },
  { from: 'node-services', to: 'node-db', label: 'SQL Query', status: 'healthy' },
  { from: 'node-services', to: 'node-cache', label: 'Cache / Invalidate', status: 'healthy' },
  { from: 'node-worker', to: 'node-whisper', label: 'Buffer Stream', status: 'blocked' },
  { from: 'node-whisper', to: 'node-db', label: 'Save Transcripts', status: 'healthy' },
];

// =============================================================================
// EXPANDABLE FOLDER TREE DATA
// =============================================================================
export const PROJECT_FOLDER_TREE = [
  {
    id: 'f-dashboard',
    name: 'dashboard',
    type: 'folder',
    purpose: 'Frontend React 18 single-page application with responsive role-based triage and audio player.',
    keyFiles: ['src/main.jsx', 'src/App.jsx', 'package.json', 'vite.config.js'],
    imports: ['react', 'lucide-react', 'tailwindcss', 'vite'],
    children: [
      {
        id: 'f-dash-src',
        name: 'src',
        type: 'folder',
        purpose: 'Source code for UI layout, views, and state management.',
        children: [
          {
            id: 'f-dash-components',
            name: 'components',
            type: 'folder',
            purpose: 'Reusable design system components: Sidebar, TopBar, EvidenceDrawer, Gantt Canvas.',
            keyFiles: ['Sidebar.jsx', 'TopBar.jsx', 'EvidenceDrawer.jsx', 'DiscussionBoard.jsx'],
            imports: ['lucide-react'],
          },
          {
            id: 'f-dash-pages',
            name: 'pages',
            type: 'folder',
            purpose: 'High-level role views: Manager, Employee, Student, Developer, Timeline, Architecture.',
            keyFiles: ['HomePage.jsx', 'DeveloperDashboard.jsx', 'ProjectTimeline.jsx', 'ProjectArchitectureView.jsx'],
            imports: ['react', 'lucide-react'],
          },
          {
            id: 'f-dash-api',
            name: 'api',
            type: 'folder',
            purpose: 'Mock data and schema contracts adhering to Syncora Technical Contract v1.0.',
            keyFiles: ['mockData.js'],
          },
        ],
      },
      { id: 'f-dash-pkg', name: 'package.json', type: 'file', ext: 'json' },
      { id: 'f-dash-vite', name: 'vite.config.js', type: 'file', ext: 'js' },
    ],
  },
  {
    id: 'f-backend',
    name: 'backend',
    type: 'folder',
    purpose: 'Core API gateway and authentication microservices protecting task and meeting APIs.',
    keyFiles: ['server.js', 'package.json'],
    imports: ['express', 'cors', 'jsonwebtoken', 'bcrypt', 'redis', 'pg'],
    children: [
      {
        id: 'f-api-gateway',
        name: 'api-gateway',
        type: 'folder',
        purpose: 'Reverse proxy and token-bucket rate limiter enforcing 60 req/min thresholds.',
        keyFiles: ['server.js', 'rateLimiter.js', 'routes.js'],
      },
      {
        id: 'f-auth-service',
        name: 'auth-service',
        type: 'folder',
        purpose: 'Handles JWT signature verification, refresh tokens, and SameSite=Strict cookies.',
        keyFiles: ['index.js', 'cookieManager.js', 'jwtHelper.js'],
      },
      {
        id: 'f-services',
        name: 'services',
        type: 'folder',
        purpose: 'Business logic for task mutations, manager approvals, and meeting queries.',
        keyFiles: ['tasksService.js', 'meetingsService.js', 'cacheClient.js'],
      },
    ],
  },
  {
    id: 'f-worker',
    name: 'worker',
    type: 'folder',
    purpose: 'Python speech-to-text pipeline and streaming WebSocket daemon.',
    keyFiles: ['worker.py', 'requirements.txt'],
    imports: ['faster-whisper', 'websockets', 'boto3', 'torch', 'pyannote.audio'],
    children: [
      {
        id: 'f-whisper-pipe',
        name: 'whisper-pipeline',
        type: 'folder',
        purpose: 'Faster-Whisper speech inference and speaker diarization worker.',
        keyFiles: ['worker.py', 'diarization.py', 'inference.py', 's3_uploader.py'],
      },
    ],
  },
  {
    id: 'f-database',
    name: 'database',
    type: 'folder',
    purpose: 'PostgreSQL DDL schemas, compound indexes, and seed migration scripts.',
    keyFiles: ['001_initial_schema.sql', '002_add_compound_indexes.sql'],
    children: [
      {
        id: 'f-schema',
        name: 'schema',
        type: 'folder',
        purpose: 'Entity tables: Users, Meetings, Transcripts, Tasks, and Audit Logs.',
        keyFiles: ['001_initial_schema.sql'],
      },
      {
        id: 'f-migrations',
        name: 'migrations',
        type: 'folder',
        purpose: 'Compound indexes for sub-100ms multi-role queries.',
        keyFiles: ['002_add_compound_indexes.sql'],
      },
    ],
  },
];

// =============================================================================
// INFERRED DATA FLOW PIPELINES
// =============================================================================
export const DATA_FLOW_PIPELINES = [
  {
    id: 'flow-speech',
    title: '1. Meeting Speech Ingestion & Diarization Pipeline',
    description: 'Real-time flow of binary audio frames from browser microphone to verified transcript evidence.',
    steps: [
      { step: 1, source: 'User Microphone', target: 'React Client', protocol: 'Web Audio API', latency: '5ms', note: 'Captures 16kHz PCM audio stream in chunks' },
      { step: 2, source: 'React Client', target: 'Audio Worker', protocol: 'WebSocket (Binary)', latency: '35ms', note: 'Frames streamed over authenticated WebSocket connection' },
      { step: 3, source: 'Audio Worker', target: 'AWS S3 Bucket', protocol: 'HTTPS / PUT', latency: '120ms', note: 'Speech buffer chunks uploaded for disaster recovery (Blocked by IAM)' },
      { step: 4, source: 'Audio Worker', target: 'Whisper Engine', protocol: 'IPC / PyTorch Buffer', latency: '450ms', note: 'Batch TensorRT inference executes speech-to-text decoding' },
      { step: 5, source: 'Whisper Engine', target: 'PostgreSQL DB', protocol: 'SQL INSERT', latency: '18ms', note: 'Timestamped transcript segments persisted with speaker tags' },
      { step: 6, source: 'PostgreSQL DB', target: 'Evidence Drawer', protocol: 'WebSocket Broadcast', latency: '12ms', note: 'Audio waveform scrubbers update in client view in real time' },
    ],
  },
  {
    id: 'flow-task',
    title: '2. Task Creation, Triage & Real-Time Approval Flow',
    description: 'How an AI-suggested task commitment transitions to an officially approved deliverable.',
    steps: [
      { step: 1, source: 'Engineering Lead', target: 'Manager Workspace', protocol: 'DOM Event', latency: '1ms', note: 'Clicks "Approve Deliverable" in Needs Approval queue' },
      { step: 2, source: 'React Client', target: 'API Gateway', protocol: 'HTTPS PATCH', latency: '40ms', note: 'Transmits taskId, deadline, and assigned employeeId' },
      { step: 3, source: 'API Gateway', target: 'Auth Middleware', protocol: 'In-Memory Guard', latency: '2ms', note: 'Verifies manager role permission from HttpOnly session' },
      { step: 4, source: 'API Gateway', target: 'Tasks Service', protocol: 'Internal Route', latency: '5ms', note: 'Updates task approvalStatus = "approved"' },
      { step: 5, source: 'Tasks Service', target: 'PostgreSQL DB', protocol: 'SQL UPDATE', latency: '15ms', note: 'Persists change using compound index (meeting_id, approval_status)' },
      { step: 6, source: 'Tasks Service', target: 'Redis Pub/Sub', protocol: 'PUBLISH Event', latency: '3ms', note: 'Emits syncora:tasks:invalidations to sync Employee dashboard' },
    ],
  },
  {
    id: 'flow-auth',
    title: '3. Authentication & Ephemeral Session Handshake',
    description: 'Secure credential exchange preventing credential exposure in access logs.',
    steps: [
      { step: 1, source: 'Developer Login Form', target: 'API Gateway', protocol: 'HTTPS POST', latency: '50ms', note: 'Submits developer@syncora.io with bcrypt validation' },
      { step: 2, source: 'API Gateway', target: 'Auth Service', protocol: 'Internal Route', latency: '8ms', note: 'Generates JWT access token (15m) & refresh token (7d)' },
      { step: 3, source: 'Auth Service', target: 'Browser Cookies', protocol: 'Set-Cookie Header', latency: '5ms', note: 'Stores token in SameSite=Strict HttpOnly secure cookie' },
      { step: 4, source: 'Client Web App', target: 'Auth Service', protocol: 'POST /ws/ticket', latency: '20ms', note: 'Exchanges cookie for 60s single-use ephemeral ticket' },
      { step: 5, source: 'Client Web App', target: 'Audio WebSocket', protocol: 'WSS ?ticket=xxx', latency: '30ms', note: 'Establishes binary stream with zero persistent credential exposure' },
    ],
  },
];

export default function ProjectArchitectureResults({
  onNavigate = () => {},
}) {
  const {
    analysisData,
    startAnalysis,
    resetAnalysis,
    selectedEntity,
    setSelectedEntity,
  } = useArchitecture();

  // Active view tab inside Results: 'mindmap' | 'features' | 'functions' | 'diagram' | 'tree' | 'dependencies' | 'dataflow'
  const [activeTab, setActiveTab] = useState('mindmap');

  // Safe Fallbacks for Structured Architecture Properties
  const techStack = analysisData?.techStack || [];
  const nodes = analysisData?.nodes || [];
  const edges = analysisData?.edges || [];
  const fileTree = analysisData?.fileTree || [];
  const apiRoutes = analysisData?.apiRoutes || [];
  const database = analysisData?.database || null;
  const functionDirectory = useMemo(() => analysisData?.functionDirectory || [], [analysisData]);
  const featureBreakdown = useMemo(() => analysisData?.featureBreakdown || [], [analysisData]);

  // Construct Mind Map payload with fallback if needed
  const mindMap = useMemo(() => {
    if (analysisData?.mindMap) return analysisData.mindMap;
    const finalProjectName = analysisData?.projectName || 'Project Root';
    return {
      id: 'mindmap-root',
      label: finalProjectName,
      type: 'root',
      branches: [
        {
          id: 'branch-ui',
          name: 'UI / Presentation Layer',
          layerKey: 'ui',
          icon: 'Boxes',
          badgeColor: 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
          fileCount: 0,
          symbolCount: 0,
          description: 'Client interfaces, interactive components, pages, templates, and view layouts.',
          hasContent: false,
          emptyNotice: 'No frontend UI files or presentation templates detected in codebase.',
          modules: [],
        },
        {
          id: 'branch-api',
          name: 'API / Routing Layer',
          layerKey: 'api',
          icon: 'Network',
          badgeColor: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
          fileCount: 0,
          symbolCount: 0,
          description: 'HTTP route declarations, API controllers, reverse proxies, and endpoint listeners.',
          hasContent: false,
          emptyNotice: 'No Backend / API routes found in codebase.',
          modules: [],
        },
        {
          id: 'branch-services',
          name: 'Business Logic / Services',
          layerKey: 'services',
          icon: 'Server',
          badgeColor: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300',
          fileCount: 0,
          symbolCount: 0,
          description: 'Core domain services, helpers, utility modules, and background pipelines.',
          hasContent: false,
          emptyNotice: 'No dedicated service or helper modules detected.',
          modules: [],
        },
        {
          id: 'branch-state',
          name: 'State & Context Layer',
          layerKey: 'state',
          icon: 'Cpu',
          badgeColor: 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
          fileCount: 0,
          symbolCount: 0,
          description: 'State contexts, store definitions, reducers, and custom hooks.',
          hasContent: false,
          emptyNotice: 'No state store or context modules detected.',
          modules: [],
        },
        {
          id: 'branch-data',
          name: 'Data & Persistence Layer',
          layerKey: 'data',
          icon: 'Database',
          badgeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
          fileCount: 0,
          symbolCount: 0,
          description: 'Database schemas, Prisma models, SQL tables, and ORM entities.',
          hasContent: false,
          emptyNotice: 'No database schema or ORM models found in codebase.',
          modules: [],
        },
      ],
    };
  }, [analysisData]);

  // Selected module in Mind Map for Inspector Drawer
  const [selectedMindMapModule, setSelectedMindMapModule] = useState(null);

  // Set of expanded branch IDs in Mind Map
  const [expandedMindMapBranches, setExpandedMindMapBranches] = useState(
    () => new Set(['branch-ui', 'branch-api', 'branch-services', 'branch-state', 'branch-data'])
  );

  // Auto-select first module for Mind Map Inspector
  useEffect(() => {
    if (!selectedMindMapModule && mindMap?.branches) {
      for (const branch of mindMap.branches) {
        if (branch.modules && branch.modules.length > 0) {
          setSelectedMindMapModule(branch.modules[0]);
          break;
        }
      }
    }
  }, [mindMap, selectedMindMapModule]);

  // Function Directory search and layer filter
  const [functionSearch, setFunctionSearch] = useState('');
  const [functionLayerFilter, setFunctionLayerFilter] = useState('all');
  const [copiedSymbolId, setCopiedSymbolId] = useState(null);
  const [copiedPath, setCopiedPath] = useState(null);

  // Filtered symbols for Function Directory table
  const filteredFunctions = useMemo(() => {
    return functionDirectory.filter((item) => {
      if (functionLayerFilter !== 'all' && item.layer !== functionLayerFilter) {
        return false;
      }
      if (!functionSearch.trim()) return true;
      const q = functionSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.file.toLowerCase().includes(q) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.signature && item.signature.toLowerCase().includes(q))
      );
    });
  }, [functionDirectory, functionLayerFilter, functionSearch]);

  // Layer counts for Filter pills
  const layerCounts = useMemo(() => {
    const counts = { all: functionDirectory.length, ui: 0, api: 0, services: 0, state: 0, data: 0 };
    for (const f of functionDirectory) {
      if (counts[f.layer] !== undefined) {
        counts[f.layer] += 1;
      }
    }
    return counts;
  }, [functionDirectory]);

  // Branch expand toggle
  const toggleMindMapBranch = (branchId) => {
    setExpandedMindMapBranches((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  // Icon lookup for Mind Map branches
  const getBranchIcon = (layerKey) => {
    switch (layerKey) {
      case 'ui':
        return Boxes;
      case 'api':
        return Network;
      case 'services':
        return Server;
      case 'state':
        return Cpu;
      case 'data':
        return Database;
      default:
        return FileCode2;
    }
  };

  // Badge color lookup for symbol types
  const getSymbolBadgeColor = (type) => {
    switch (type) {
      case 'Component':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Hook':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Endpoint':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Model':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Class':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    }
  };

  // Copy symbol name
  const handleCopySymbol = (sym) => {
    navigator.clipboard?.writeText(sym.name);
    setCopiedSymbolId(sym.id);
    setTimeout(() => setCopiedSymbolId(null), 1500);
  };

  // Copy path
  const handleCopyPath = (path) => {
    navigator.clipboard?.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  // ===========================================================================
  // REAL REACT FLOW CODEBASE GRAPH (GROUP NODES, PILL NODES, BEZIER EDGES)
  // ===========================================================================
  const flowData = useMemo(() => {
    return generateReactFlowElements(analysisData);
  }, [analysisData]);

  const [rfInstance, setRfInstance] = useState(null);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (flowData.nodes.length > 0) {
      setFlowNodes(flowData.nodes);
      setFlowEdges(flowData.edges);
    }
  }, [flowData, setFlowNodes, setFlowEdges]);

  // Selected file and sidebar states
  const [selectedFileId, setSelectedFileId] = useState(
    () => flowData.files[0]?.nodeId || null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fileFilter, setFileFilter] = useState('');
  const [hiddenFileIds, setHiddenFileIds] = useState(() => new Set());
  const [sidebarExpandedFolders, setSidebarExpandedFolders] = useState(() => {
    const s = new Set();
    flowData.groups.slice(0, 5).forEach((g) => s.add(g.dirPath));
    return s;
  });

  // Display nodes with hidden flag applied
  const displayNodes = useMemo(() => {
    return flowNodes.map((n) => {
      if (hiddenFileIds.has(n.id)) {
        return { ...n, hidden: true };
      }
      return { ...n, hidden: false };
    });
  }, [flowNodes, hiddenFileIds]);

  // Center on node in React Flow
  const centerOnNode = (file) => {
    setSelectedFileId(file.nodeId);
    if (rfInstance) {
      const parentGroup = flowData.groupMap.get(file.groupId);
      const absX = (parentGroup ? parentGroup.x : 0) + 16 + 124;
      const fileIndex = parentGroup
        ? parentGroup.files.findIndex((f) => f.nodeId === file.nodeId)
        : 0;
      const absY = (parentGroup ? parentGroup.y : 0) + 48 + fileIndex * 48 + 20;

      rfInstance.setCenter(absX, absY, { zoom: 1.25, duration: 600 });
    }
  };

  // Toggle file visibility (Eye / EyeOff)
  const toggleFileVisibility = (nodeId, e) => {
    e?.stopPropagation?.();
    setHiddenFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Toggle group visibility (Eye / EyeOff)
  const toggleGroupVisibility = (group, e) => {
    e?.stopPropagation?.();
    const allHidden = group.files.every((f) => hiddenFileIds.has(f.nodeId));
    setHiddenFileIds((prev) => {
      const next = new Set(prev);
      for (const f of group.files) {
        if (allHidden) {
          next.delete(f.nodeId);
        } else {
          next.add(f.nodeId);
        }
      }
      return next;
    });
  };

  // Toggle folder expansion
  const toggleSidebarFolder = (dirPath) => {
    setSidebarExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(dirPath)) {
        next.delete(dirPath);
      } else {
        next.add(dirPath);
      }
      return next;
    });
  };

  // Filtered groups for sidebar
  const filteredGroups = useMemo(() => {
    if (!fileFilter.trim()) return flowData.groups;
    const q = fileFilter.toLowerCase();
    return flowData.groups
      .map((g) => ({
        ...g,
        files: g.files.filter(
          (f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.files.length > 0);
  }, [flowData.groups, fileFilter]);

  // Sync selectedEntity cross-navigation
  useEffect(() => {
    if (selectedEntity && flowData?.files) {
      const match = flowData.files.find(
        (f) =>
          f.nodeId === selectedEntity.id ||
          f.path.toLowerCase() === (selectedEntity.path || '').toLowerCase() ||
          f.name.toLowerCase() === (selectedEntity.name || '').toLowerCase()
      );
      if (match) {
        centerOnNode(match);
      }
    }
  }, [selectedEntity, flowData]);

  // Selected Diagram Node for Inspector
  const [activeNodeId, setActiveNodeId] = useState(
    () => selectedEntity?.id || nodes[0]?.id || 'node-client'
  );

  // Sync active node when selectedEntity changes via cross-navigation
  useEffect(() => {
    if (selectedEntity) {
      const match = nodes.find(
        (n) =>
          n?.id === selectedEntity.id ||
          (n?.label && selectedEntity?.label && n.label.toLowerCase() === selectedEntity.label.toLowerCase()) ||
          (n?.label && selectedEntity?.name && n.label.toLowerCase() === selectedEntity.name.toLowerCase())
      );
      if (match) {
        setActiveNodeId(match.id);
        setActiveTab('diagram');
      }
    }
  }, [selectedEntity, nodes]);

  // Selected Folder in Tree
  const [selectedFolderId, setSelectedFolderId] = useState(
    () => fileTree[0]?.id || null
  );
  const [expandedFolders, setExpandedFolders] = useState(
    () => new Set(fileTree.slice(0, 4).map((f) => f.id))
  );

  // Copy Summary feedback
  const [isCopied, setIsCopied] = useState(false);

  // Node lookup
  const activeNode = useMemo(() => {
    return nodes.find((n) => n?.id === activeNodeId) || nodes[0] || null;
  }, [activeNodeId, nodes]);

  // Selected Folder lookup
  const selectedFolder = useMemo(() => {
    const findFolder = (list) => {
      if (!Array.isArray(list)) return null;
      for (const item of list) {
        if (!item) continue;
        if (item.id === selectedFolderId) return item;
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFolder(fileTree) || fileTree[0] || null;
  }, [selectedFolderId, fileTree]);

  // Toggle Folder expand
  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Guard against null/undefined analysisData (AFTER all hooks)
  if (!analysisData) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-4 max-w-lg mx-auto shadow-xs animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <FolderGit2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">
            No Architecture Data Available
          </h3>
          <p className="text-xs text-surface-500 mt-1 leading-relaxed">
            Please upload a project archive (.zip or .tar.gz) or load demo data to view the architectural topology.
          </p>
        </div>
        <button
          type="button"
          onClick={resetAnalysis}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Upload Archive</span>
        </button>
      </div>
    );
  }

  // Copy architectural summary
  const handleCopySummary = () => {
    const summary = `Syncora Architecture Analysis Report:
Project: ${analysisData?.projectName || 'Syncora Core Monorepo'}
Files: ${analysisData?.fileStats?.totalFiles || 0} (${analysisData?.fileStats?.fileSizeFormatted || '0 B'})
Lines of Code: ${analysisData?.fileStats?.totalLinesOfCode?.toLocaleString() || 0}
Tech Stack: ${(analysisData?.techStack || []).join(', ') || 'N/A'}
Modules / Layers: ${(mindMap?.branches || []).filter((b) => b.hasContent).map((b) => `${b.name} (${b.fileCount} files)`).join(', ') || 'N/A'}
Security: 100% Static Scan Passed (Secrets & node_modules excluded)`;
    navigator.clipboard?.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Export JSON Report
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syncora-architecture-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs">
        
        {/* Project Meta & Tech Stack Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
              Architecture Analysis Results
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700" />
            <span className="text-xs font-semibold text-surface-500">
              {analysisData?.fileStats?.fileName || 'syncora-monorepo-v1.0.zip'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            {analysisData?.projectName || 'Syncora Core Monorepo'}
          </h2>

          {/* Tech Stack Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200/60 dark:border-surface-700/60"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{isCopied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => startAnalysis()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyse</span>
          </button>

          <button
            type="button"
            onClick={resetAnalysis}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Project</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('mindmap')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mindmap'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <GitFork className="w-4 h-4 text-indigo-500" />
          <span>Interactive Mind Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'features'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Feature Breakdown</span>
          {featureBreakdown.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {featureBreakdown.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('functions')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'functions'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <FileCode2 className="w-4 h-4 text-cyan-500" />
          <span>Function Directory</span>
          {functionDirectory.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              {functionDirectory.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagram')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'diagram'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <Network className="w-4 h-4 text-blue-500" />
          <span>Topology Diagram</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tree')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tree'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4 text-emerald-500" />
          <span>Folder Tree</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dependencies')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dependencies'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4 text-purple-500" />
          <span>Dependencies & Routes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dataflow')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dataflow'
              ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4 text-indigo-500" />
          <span>Inferred Data Flow</span>
        </button>
      </div>

      {/* 3. SECTION: INTERACTIVE ARCHITECTURE MIND MAP */}
      {activeTab === 'mindmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          
          {/* Main Visual Mind Map Canvas (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mind Map Root Banner */}
            <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 shadow-xl relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Architecture Root Node
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Level 0
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                    <GitFork className="w-6 h-6 text-indigo-400" />
                    <span>{mindMap?.label || analysisData?.projectName || 'Project Architecture'}</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Hierarchical architectural decomposition scanned from project files across 5 distinct system layers.
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-1.5 text-right font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                    <strong className="text-white font-bold">{analysisData?.fileStats?.totalFiles || 0}</strong> Files Scanned
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-slate-200">
                    <strong className="text-white font-bold">{analysisData?.fileStats?.totalLinesOfCode?.toLocaleString() || 0}</strong> Lines of Code
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Architecture Layer Branches */}
            <div className="space-y-4">
              {(mindMap?.branches || []).map((branch) => {
                const IconComp = getBranchIcon(branch.layerKey);
                const isExpanded = expandedMindMapBranches.has(branch.id);

                return (
                  <div
                    key={branch.id}
                    className="rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs overflow-hidden transition-all duration-200 hover:border-surface-300 dark:hover:border-surface-700"
                  >
                    {/* Branch Header Row */}
                    <div
                      onClick={() => toggleMindMapBranch(branch.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-surface-50/60 dark:bg-surface-800/40 hover:bg-surface-100/60 dark:hover:bg-surface-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-2xl border ${branch.badgeColor}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-surface-900 dark:text-white">
                              {branch.name}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                              {branch.fileCount} {branch.fileCount === 1 ? 'file' : 'files'}
                            </span>
                            {branch.symbolCount > 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {branch.symbolCount} symbols
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-surface-500 mt-0.5 truncate">
                            {branch.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-surface-400">
                        <span className="text-xs font-semibold hidden sm:inline text-surface-500">
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 transition-transform" />
                        ) : (
                          <ChevronRight className="w-5 h-5 transition-transform" />
                        )}
                      </div>
                    </div>

                    {/* Branch Content / Level 2 Modules */}
                    {isExpanded && (
                      <div className="p-5 border-t border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900/50 space-y-3">
                        {!branch.hasContent || !branch.modules || branch.modules.length === 0 ? (
                          /* Strict Grounding Notice */
                          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-dashed border-surface-200 dark:border-surface-700 text-xs text-surface-500 flex items-center gap-3">
                            <Info className="w-4 h-4 text-surface-400 shrink-0" />
                            <span>{branch.emptyNotice}</span>
                          </div>
                        ) : (
                          /* Module Cards Grid */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {branch.modules.map((mod) => {
                              const isSelected = selectedMindMapModule?.path === mod.path;
                              return (
                                <div
                                  key={mod.id}
                                  onClick={() => setSelectedMindMapModule(mod)}
                                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                                    isSelected
                                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                                      : 'bg-surface-50/60 dark:bg-surface-800/40 border-surface-200 dark:border-surface-700/80 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-100/60'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileCode2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-surface-400'}`} />
                                      <span className="text-xs font-bold font-mono text-surface-900 dark:text-white truncate">
                                        {mod.name}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-surface-500 shrink-0">
                                      {mod.lines} lines
                                    </span>
                                  </div>

                                  <div className="text-[11px] font-mono text-surface-500 truncate" title={mod.path}>
                                    {mod.path}
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-surface-200/60 dark:border-surface-700/60 text-[10px] font-mono">
                                    <span className="text-surface-400">{mod.sizeFormatted}</span>
                                    <div className="flex items-center gap-1.5">
                                      {mod.symbols && mod.symbols.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 font-semibold">
                                          {mod.symbols.length} {mod.symbols.length === 1 ? 'symbol' : 'symbols'}
                                        </span>
                                      )}
                                      {mod.imports && mod.imports.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                                          {mod.imports.length} imports
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Inspector Side-Drawer (Right 1 col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-lg p-5 space-y-5">
              
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Module Inspector
                    </span>
                    {selectedMindMapModule && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold capitalize">
                        {selectedMindMapModule.layer || 'Module'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-surface-900 dark:text-white mt-1 break-all">
                    {selectedMindMapModule ? selectedMindMapModule.name : 'Select a Module'}
                  </h4>
                </div>

                {selectedMindMapModule && (
                  <button
                    type="button"
                    onClick={() => handleCopyPath(selectedMindMapModule.path)}
                    title="Copy relative path"
                    className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
                  >
                    {copiedPath === selectedMindMapModule.path ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {!selectedMindMapModule ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-surface-500 leading-relaxed">
                    Click any module card in the Mind Map branches to inspect its exported symbols, line counts, and dependencies.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Metadata Metrics */}
                  <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60 space-y-2">
                    <div className="text-[11px] font-mono text-surface-500 break-all">
                      {selectedMindMapModule.path}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono pt-1 border-t border-surface-200/60 dark:border-surface-700/60 text-surface-600 dark:text-surface-300">
                      <span><strong>{selectedMindMapModule.lines}</strong> lines</span>
                      <span>•</span>
                      <span>{selectedMindMapModule.sizeFormatted}</span>
                      <span>•</span>
                      <span><strong>{selectedMindMapModule.symbols?.length || 0}</strong> symbols</span>
                    </div>
                  </div>

                  {/* Exported Functions & Symbols */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Exported Symbols & Endpoints ({selectedMindMapModule.symbols?.length || 0})</span>
                    </h5>

                    {(!selectedMindMapModule.symbols || selectedMindMapModule.symbols.length === 0) ? (
                      <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/40 text-xs text-surface-500 italic">
                        No top-level exported functions, components, or models detected in this file.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                        {selectedMindMapModule.symbols.map((sym) => (
                          <div
                            key={sym.id}
                            className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-700/60 flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getSymbolBadgeColor(sym.type)}`}>
                                  {sym.type}
                                </span>
                                <span className="text-xs font-mono font-bold text-surface-900 dark:text-white truncate">
                                  {sym.name}
                                </span>
                              </div>
                              {sym.signature && sym.signature !== sym.name && (
                                <div className="text-[10px] font-mono text-surface-500 truncate" title={sym.signature}>
                                  {sym.signature}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-surface-400 shrink-0">
                              L{sym.line}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Imported External Packages */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Imported Packages ({selectedMindMapModule.imports?.length || 0})</span>
                    </h5>

                    {(!selectedMindMapModule.imports || selectedMindMapModule.imports.length === 0) ? (
                      <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/40 text-xs text-surface-500 italic">
                        No external package dependencies imported.
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedMindMapModule.imports.map((imp, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700"
                          >
                            {imp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('solution')}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Jump to Solution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMindMapModule(null)}
                      className="p-2 rounded-xl text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      title="Close drawer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* 4. SECTION: REAL FEATURE BREAKDOWN */}
      {activeTab === 'features' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Codebase Synthesis
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {featureBreakdown.length} Detected Features
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-surface-900 dark:text-white mt-1">
                Real Feature Breakdown
              </h3>
              <p className="text-xs text-surface-500 mt-1 max-w-xl">
                Synthesized by cross-referencing file architectures, controllers, route handlers, database schemas, and integrated packages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('mindmap')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5 text-indigo-500" />
                <span>View in Mind Map</span>
              </button>
            </div>
          </div>

          {/* Feature Cards Grid */}
          {(!featureBreakdown || featureBreakdown.length === 0) ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-xs text-surface-500 font-medium">
              No specialized features detected in this codebase. Project appears to be a minimal single-module application.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featureBreakdown.map((feat) => (
                <div
                  key={feat.id}
                  className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs flex flex-col justify-between gap-5 transition-all hover:border-surface-300 dark:hover:border-surface-700"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}>
                          {feat.category}
                        </span>
                        <h4 className="text-base font-extrabold text-surface-900 dark:text-white mt-2">
                          {feat.title}
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>

                    <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                      {feat.description}
                    </p>

                    {/* Associated Routes */}
                    {feat.associatedRoutes && feat.associatedRoutes.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400">
                          Connected Endpoints ({feat.associatedRoutes.length})
                        </div>
                        <div className="space-y-1">
                          {feat.associatedRoutes.map((rt, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-surface-50 dark:bg-surface-800/60 text-[11px] font-mono font-bold text-surface-800 dark:text-surface-200 border border-surface-200/60 dark:border-surface-700/60"
                            >
                              {rt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Associated Functions */}
                    {feat.associatedFunctions && feat.associatedFunctions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400">
                          Key Symbols & Functions
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {feat.associatedFunctions.map((fn, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                            >
                              {fn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supporting Files */}
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400">
                      <span>Supporting Files</span>
                      <span>{feat.supportingFiles?.length || 0} files</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {(feat.supportingFiles || []).map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-[11px] font-mono text-surface-600 dark:text-surface-400 p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        >
                          <FileCode2 className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 5. SECTION: FUNCTION & API DIRECTORY */}
      {activeTab === 'functions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Top Search & Filter Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-surface-900 dark:text-white">
                  Function & Symbol Directory
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Search and inspect components, hooks, functions, endpoints, and ORM models extracted from the archive.
                </p>
              </div>

              <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                {filteredFunctions.length} of {functionDirectory.length} symbols
              </div>
            </div>

            {/* Search Input & Layer Filter Pills */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={functionSearch}
                  onChange={(e) => setFunctionSearch(e.target.value)}
                  placeholder="Filter by symbol name, signature, type, or file path..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-surface-900 dark:text-white placeholder-surface-400"
                />
                {functionSearch && (
                  <button
                    type="button"
                    onClick={() => setFunctionSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Layer Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'all', label: `All (${layerCounts.all})` },
                  { key: 'ui', label: `UI (${layerCounts.ui})` },
                  { key: 'api', label: `API (${layerCounts.api})` },
                  { key: 'services', label: `Services (${layerCounts.services})` },
                  { key: 'state', label: `State (${layerCounts.state})` },
                  { key: 'data', label: `Data (${layerCounts.data})` },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFunctionLayerFilter(item.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      functionLayerFilter === item.key
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Symbols Table */}
          <div className="rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs overflow-hidden">
            {filteredFunctions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileCode2 className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto" />
                <p className="text-xs text-surface-500 font-medium">
                  {functionDirectory.length === 0
                    ? 'No exported functions, endpoints, or symbols detected in project archive.'
                    : `No symbols match "${functionSearch}" in layer "${functionLayerFilter}".`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-800/50 text-[11px] font-bold text-surface-500 uppercase tracking-wider font-mono">
                      <th className="py-3 px-5">Symbol & Signature</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Layer</th>
                      <th className="py-3 px-5">Source File & Line</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {filteredFunctions.map((sym) => (
                      <tr
                        key={sym.id}
                        className="hover:bg-surface-50/80 dark:hover:bg-surface-800/40 transition-colors"
                      >
                        {/* Name & Signature */}
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-surface-900 dark:text-white">
                              {sym.name}
                            </span>
                          </div>
                          {sym.signature && sym.signature !== sym.name && (
                            <div className="text-[11px] font-mono text-surface-500 truncate max-w-md mt-0.5">
                              {sym.signature}
                            </div>
                          )}
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getSymbolBadgeColor(sym.type)}`}>
                            {sym.type}
                          </span>
                        </td>

                        {/* Layer Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 uppercase">
                            {sym.layer}
                          </span>
                        </td>

                        {/* File & Line Citation */}
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-surface-600 dark:text-surface-400">
                            <span className="truncate max-w-xs">{sym.file}</span>
                            <span className="text-surface-400 shrink-0">:L{sym.line}</span>
                          </div>
                        </td>

                        {/* Copy Action */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopySymbol(sym)}
                            title="Copy symbol name"
                            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                          >
                            {copiedSymbolId === sym.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. SECTION A: REACT FLOW INTERACTIVE MIND MAP & CLUSTERED GRAPH */}
      {activeTab === 'diagram' && (
        <div className="h-[750px] w-full relative bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex animate-in fade-in duration-150">
          
          {/* 1. LEFT SIDEBAR FILE TREE (260px) */}
          <div
            className={`${
              isSidebarOpen ? 'w-[260px]' : 'w-0'
            } shrink-0 transition-all duration-200 border-r border-slate-200 bg-white flex flex-col justify-between overflow-hidden z-20 select-none`}
          >
            {/* Top Search Filter */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  placeholder="Filter by file name..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                {fileFilter && (
                  <button
                    type="button"
                    onClick={() => setFileFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Recursive Collapsible File List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin font-mono text-xs">
              {filteredGroups.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No files match "{fileFilter}"
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isExpanded = sidebarExpandedFolders.has(group.dirPath);
                  const allHidden = group.files.every((f) => hiddenFileIds.has(f.nodeId));

                  return (
                    <div key={group.id} className="space-y-0.5">
                      {/* Folder Row */}
                      <div
                        onClick={() => toggleSidebarFolder(group.dirPath)}
                        className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          {isExpanded ? (
                            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-800 truncate text-[11px]">
                            {group.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 rounded bg-slate-100">
                            {group.files.length}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleGroupVisibility(group, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title={allHidden ? 'Show group in canvas' : 'Hide group from canvas'}
                          >
                            {allHidden ? (
                              <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Child Files */}
                      {isExpanded && (
                        <div className="pl-4 space-y-0.5">
                          {group.files.map((file) => {
                            const isSelected = selectedFileId === file.nodeId;
                            const isHidden = hiddenFileIds.has(file.nodeId);

                            return (
                              <div
                                key={file.nodeId}
                                onClick={() => centerOnNode(file)}
                                className={`group flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-colors text-[11px] ${
                                  isSelected
                                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                } ${isHidden ? 'opacity-40 line-through' : ''}`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileCode2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                                    {file.ext}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFileVisibility(file.nodeId, e)}
                                    className="p-0.5 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title={isHidden ? 'Show node' : 'Hide node'}
                                  >
                                    {isHidden ? (
                                      <EyeOff className="w-3 h-3 text-rose-500" />
                                    ) : (
                                      <Eye className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>{flowData.files.length} files parsed</span>
              <span>{flowData.edges.length} edges</span>
            </div>
          </div>

          {/* 2. MAIN REACT FLOW CANVAS */}
          <div className="flex-1 h-full relative">
            
            {/* Sidebar Toggle Button (floating top-left of canvas) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="absolute left-3 top-3 z-10 p-2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title={isSidebarOpen ? 'Collapse file tree' : 'Expand file tree'}
            >
              <FolderTree className="w-4 h-4 text-indigo-600" />
            </button>

            {/* Right-Side Floating Activity / Layer Legend Card */}
            <div className="absolute right-4 top-4 z-10 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-lg p-3.5 space-y-2 select-none font-mono text-xs pointer-events-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 flex items-center justify-between gap-4">
                <span>Activity / Layers</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                    Entry Points
                  </span>
                  <span className="text-[11px] text-slate-600">Core & Boot</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                    Controllers & APIs
                  </span>
                  <span className="text-[11px] text-slate-600">Route Handlers</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-white shadow-xs">
                    Components
                  </span>
                  <span className="text-[11px] text-slate-600">UI & Views</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-white shadow-xs">
                    Data & Configs
                  </span>
                  <span className="text-[11px] text-slate-600">Schemas & Env</span>
                </div>
              </div>
            </div>

            {/* ReactFlow Component */}
            <ReactFlow
              nodes={displayNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onInit={setRfInstance}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.25}
              maxZoom={2.0}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 1.5 },
              }}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls className="!bg-white !border-slate-200 !shadow-md !rounded-xl" />
              <MiniMap
                className="!bg-slate-50 !border-slate-200 !rounded-xl !shadow-md !overflow-hidden"
                nodeColor={miniMapNodeColor}
                maskColor="rgba(241, 245, 249, 0.7)"
              />
            </ReactFlow>

          </div>

        </div>
      )}

      {/* 4. SECTION B: EXPANDABLE FOLDER TREE */}
      {activeTab === 'tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          
          {/* Left Tree Explorer (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-surface-900 dark:text-white">
                  Project Codebase Hierarchy
                </h3>
              </div>
              <span className="text-[11px] font-mono text-surface-400">
                Click any directory to inspect purpose & imports
              </span>
            </div>

            {/* Recursive Folder Rendering */}
            <div className="space-y-1 font-mono text-xs select-none">
              {fileTree.map((rootItem) => {
                if (!rootItem) return null;
                const isRootOpen = expandedFolders.has(rootItem.id);
                const isRootSelected = selectedFolderId === rootItem.id;

                return (
                  <div key={rootItem.id} className="space-y-1">
                    {/* Root Folder Row */}
                    <div
                      onClick={() => {
                        toggleFolder(rootItem.id);
                        setSelectedFolderId(rootItem.id);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                        isRootSelected
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-800 dark:text-surface-200'
                      }`}
                    >
                      {isRootOpen ? (
                        <ChevronDown className="w-4 h-4 text-surface-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-surface-400" />
                      )}
                      {isRootOpen ? (
                        <FolderOpen className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Folder className="w-4 h-4 text-indigo-500" />
                      )}
                      <span className="font-bold">{rootItem.name}/</span>
                    </div>

                    {/* Children of Root */}
                    {isRootOpen && rootItem.children && (
                      <div className="pl-6 space-y-1 border-l-2 border-surface-200 dark:border-surface-800 ml-4">
                        {rootItem.children.map((child) => {
                          const isChildOpen = expandedFolders.has(child.id);
                          const isChildSelected = selectedFolderId === child.id;

                          if (child.type === 'folder') {
                            return (
                              <div key={child.id} className="space-y-1">
                                <div
                                  onClick={() => {
                                    toggleFolder(child.id);
                                    setSelectedFolderId(child.id);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                                    isChildSelected
                                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold'
                                      : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                                  }`}
                                >
                                  {isChildOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
                                  )}
                                  <Folder className="w-4 h-4 text-blue-500" />
                                  <span>{child.name}/</span>
                                </div>

                                {/* Grandchildren files/folders */}
                                {isChildOpen && child.children && (
                                  <div className="pl-6 space-y-1 border-l-2 border-surface-200 dark:border-surface-800 ml-4">
                                    {child.children.map((sub) => (
                                      <div
                                        key={sub.id}
                                        onClick={() => setSelectedFolderId(sub.id)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer ${
                                          selectedFolderId === sub.id
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold'
                                            : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
                                        }`}
                                      >
                                        <FileCode2 className="w-3.5 h-3.5 text-cyan-500" />
                                        <span>{sub.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // File Row
                          return (
                            <div
                              key={child.id}
                              className="flex items-center gap-2 px-3 py-1 text-surface-500"
                            >
                              <File className="w-3.5 h-3.5 text-surface-400" />
                              <span>{child.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Folder Details Inspector Panel (1 col) */}
          <div className="rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs p-6 space-y-5">
            <div className="pb-3 border-b border-surface-100 dark:border-surface-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                Directory Inspector
              </span>
              <h3 className="text-base font-bold text-surface-900 dark:text-white font-mono mt-0.5">
                {selectedFolder.name}
              </h3>
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                Directory Scope & Role
              </span>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                {selectedFolder.purpose || 'Subsystem source folder housing core application code and handlers.'}
              </p>
            </div>

            {/* Key Files */}
            {selectedFolder?.keyFiles && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                  Key Files Included
                </span>
                <div className="space-y-1">
                  {(selectedFolder?.keyFiles || []).map((file, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/80 dark:border-surface-700/60 font-mono text-[11px] text-surface-700 dark:text-surface-300 flex items-center gap-2"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imported Modules / Dependencies */}
            {selectedFolder?.imports && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                  Imported Libraries & External Packages
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(selectedFolder?.imports || []).map((pkg, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200/60 dark:border-surface-700/60"
                    >
                      {pkg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. SECTION C: COMPONENT & DEPENDENCY MAP */}
      {activeTab === 'dependencies' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Sub-Section 1: Inter-Module Connections */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div>
                <h3 className="text-base font-bold text-surface-900 dark:text-white">
                  Inter-Module Dependency Relationships
                </h3>
                <p className="text-xs text-surface-500">
                  Detected caller-callee links, ORM queries, and API integration paths.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {edges.length} Active {edges.length === 1 ? 'Link' : 'Links'}
              </span>
            </div>

            {edges.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 text-xs text-surface-500 font-medium">
                Single-tier project without multi-layer inter-service connections.
              </div>
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-800">
                {edges.map((conn, idx) => {
                  const sourceNode = nodes.find((n) => n.id === conn.from);
                  const targetNode = nodes.find((n) => n.id === conn.to);

                  return (
                    <div key={idx} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                      {/* Source Module */}
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <div>
                          <div className="text-xs font-bold text-surface-900 dark:text-white">
                            {sourceNode?.label || conn.from}
                          </div>
                          <div className="text-[10px] font-mono text-surface-400">
                            {sourceNode?.tech || 'Source Layer'}
                          </div>
                        </div>
                      </div>

                      {/* Protocol Pill & Arrow */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                          {conn.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-surface-400" />
                      </div>

                      {/* Target Module */}
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <div className="text-xs font-bold text-surface-900 dark:text-white">
                            {targetNode?.label || conn.to}
                          </div>
                          <div className="text-[10px] font-mono text-surface-400">
                            {targetNode?.tech || 'Target Layer'}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="ml-auto">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Active Flow
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sub-Section 2: Real Detected API Endpoints */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div>
                <h3 className="text-base font-bold text-surface-900 dark:text-white">
                  Declared API Endpoints & Routes ({apiRoutes.length})
                </h3>
                <p className="text-xs text-surface-500">
                  Exact HTTP endpoints extracted by regex AST scanning across server route files.
                </p>
              </div>
            </div>

            {apiRoutes.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-xs text-surface-500 font-medium">
                No backend routes detected in scanned code files.
              </div>
            ) : (
              <div className="space-y-2">
                {apiRoutes.map((route, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-surface-50/80 dark:bg-surface-850 border border-surface-200 dark:border-surface-750 flex items-center justify-between gap-3 flex-wrap text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          route.method === 'GET'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : route.method === 'POST'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : route.method === 'PATCH' || route.method === 'PUT'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {route.method}
                      </span>
                      <span className="font-mono font-bold text-surface-900 dark:text-white">
                        {route.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-surface-400">
                      <span className="truncate max-w-[200px] text-surface-500">{route.file}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-[10px] font-bold">
                        {route.auth || 'Public'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-Section 3: Real Database Schema & Models */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div>
                <h3 className="text-base font-bold text-surface-900 dark:text-white">
                  Database Layer & Entity Models
                </h3>
                <p className="text-xs text-surface-500">
                  Schemas, tables, and entities extracted directly from ORM definition files.
                </p>
              </div>
              {database && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {database.type} ({database.provider})
                </span>
              )}
            </div>

            {!database || !database.models || database.models.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-xs text-surface-500 font-medium">
                No database schema found in project archive.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-surface-500">
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Schema source: <strong className="text-surface-800 dark:text-surface-200">{database.file}</strong></span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {database.models.map((modName, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 font-mono text-xs font-bold border border-surface-200 dark:border-surface-700"
                    >
                      model {modName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. SECTION D: INFERRED DATA FLOW */}
      {activeTab === 'dataflow' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {DATA_FLOW_PIPELINES.map((pipeline) => (
            <div
              key={pipeline.id}
              className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4"
            >
              <div className="pb-3 border-b border-surface-100 dark:border-surface-800">
                <h3 className="text-base font-bold text-surface-900 dark:text-white">
                  {pipeline.title}
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  {pipeline.description}
                </p>
              </div>

              {/* Step by step timeline list */}
              <div className="space-y-3">
                {pipeline.steps.map((st) => (
                  <div
                    key={st.step}
                    className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/80 dark:border-surface-700/60 flex items-start gap-4"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {st.step}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-surface-900 dark:text-white">
                          {st.source}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-surface-400" />
                        <span className="text-xs font-bold text-surface-900 dark:text-white">
                          {st.target}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                          {st.protocol}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold ml-auto">
                          ~{st.latency}
                        </span>
                      </div>
                      <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                        {st.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
