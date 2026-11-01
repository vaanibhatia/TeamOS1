import React, { createContext, useContext, useState, useEffect } from 'react';
import { analyzeZipArchive, createSampleProjectZip } from '../utils/codeAnalyzer';

// =============================================================================
// GROUNDED DEFAULT ANALYSIS DATA (Fallback / Demo Dataset)
// =============================================================================
export const DEMO_ANALYSIS_DATA = {
  projectName: 'Syncora Core Monorepo v1.0',
  description: 'AI-powered meeting intelligence and real-time audio pipeline platform.',
  repositoryUrl: 'https://github.com/syncora/syncora-platform',
  fileStats: {
    fileName: 'syncora-monorepo-v1.0.zip',
    fileSizeFormatted: '34.2 MB',
    totalFiles: 218,
    totalLinesOfCode: 42890,
  },
  languages: [
    { name: 'JavaScript / JSX', percentage: 48, color: 'bg-amber-400', files: 104 },
    { name: 'Node.js / Express', percentage: 28, color: 'bg-emerald-500', files: 56 },
    { name: 'Python / PyTorch', percentage: 14, color: 'bg-blue-500', files: 32 },
    { name: 'SQL / PostgreSQL', percentage: 10, color: 'bg-indigo-500', files: 26 },
  ],
  frameworks: [
    { name: 'React 18', type: 'Frontend SPA', status: 'Core' },
    { name: 'Vite 5', type: 'Build Tool', status: 'Core' },
    { name: 'Tailwind CSS', type: 'Styling System', status: 'Core' },
    { name: 'Express.js', type: 'API Gateway', status: 'Core' },
    { name: 'PostgreSQL 15', type: 'Relational DB', status: 'Core' },
    { name: 'Redis 7', type: 'Cache & PubSub', status: 'Integration' },
    { name: 'Faster-Whisper', type: 'Speech Model', status: 'Worker' },
  ],
  modules: [
    {
      id: 'mod-frontend',
      name: 'Client Web Application',
      path: 'dashboard/src',
      type: 'frontend',
      entryPoint: 'dashboard/src/main.jsx',
      tech: 'React 18 • Vite • Tailwind',
      componentsCount: 38,
      status: 'healthy',
      description: 'Single-page client dashboard with waveform audio synchronization, interactive triage, and evidence drawers.',
    },
    {
      id: 'mod-gateway',
      name: 'API Gateway & Rate Limiter',
      path: 'backend/api-gateway',
      type: 'backend',
      entryPoint: 'backend/api-gateway/server.js',
      tech: 'Node.js • Express • RateLimiter',
      routesCount: 18,
      status: 'healthy',
      description: 'Reverse proxy and token-bucket rate limiting middleware guarding downstream services against unauthenticated surges.',
    },
    {
      id: 'mod-auth',
      name: 'Authentication & Session Service',
      path: 'backend/auth-service',
      type: 'backend',
      entryPoint: 'backend/auth-service/index.js',
      tech: 'Node.js • JWT • HttpOnly Cookies',
      routesCount: 6,
      status: 'healthy',
      description: 'Issues role-based credentials, verifies session tokens, and manages SameSite=Strict cookies.',
    },
    {
      id: 'mod-whisper',
      name: 'Audio Ingestion & Whisper Worker',
      path: 'worker/whisper-pipeline',
      type: 'worker',
      entryPoint: 'worker/whisper-pipeline/worker.py',
      tech: 'Python 3.11 • Faster-Whisper • WebSockets',
      workersCount: 2,
      status: 'blocked',
      blockerReason: 'Missing S3 IAM write permissions for speech buffer chunks (502 Bad Gateway).',
      description: 'Consumes live binary speech frames via WebSockets and dispatches transcription tasks to GPU inference.',
    },
    {
      id: 'mod-database',
      name: 'PostgreSQL Schema & Migrations',
      path: 'database/schema',
      type: 'database',
      entryPoint: 'database/schema/001_initial_schema.sql',
      tech: 'PostgreSQL 15 • Compound Indexes',
      tablesCount: 9,
      status: 'healthy',
      description: 'Persistent relational datastore with compound indexes on meeting_id, approval_status, and assignee_id.',
    },
  ],
  apiRoutes: [
    { method: 'GET', path: '/api/v1/meetings', handler: 'meetingsController.list', auth: 'Bearer' },
    { method: 'GET', path: '/api/v1/meetings/:id', handler: 'meetingsController.getById', auth: 'Bearer' },
    { method: 'POST', path: '/api/v1/tasks', handler: 'tasksController.create', auth: 'Bearer (Manager)' },
    { method: 'PATCH', path: '/api/v1/tasks/:id/status', handler: 'tasksController.updateStatus', auth: 'Bearer' },
    { method: 'POST', path: '/api/v1/auth/login', handler: 'authController.login', auth: 'Public' },
    { method: 'POST', path: '/api/v1/auth/refresh', handler: 'authController.refresh', auth: 'HttpOnly Cookie' },
    { method: 'WS', path: 'wss://stream.syncora.io/audio', handler: 'audioStreamWorker.handle', auth: 'Ticket Token' },
  ],
  techStack: [
    'React 18',
    'Node.js / Express',
    'PostgreSQL 15',
    'Prisma ORM',
    'Redis 7',
    'Faster-Whisper',
    'Tailwind CSS',
  ],
  database: {
    type: 'PostgreSQL 15',
    file: 'database/schema/001_initial_schema.sql',
    models: ['Meeting', 'Task', 'Decision', 'TranscriptChunk', 'User', 'AuditLog'],
    tables: ['meetings', 'tasks', 'decisions', 'transcript_chunks', 'users', 'audit_logs'],
  },
  nodes: [],
  fileTree: [
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'dashboard/src/main.jsx', path: 'dashboard/src/main.jsx', type: 'file' },
    { name: 'dashboard/src/App.jsx', path: 'dashboard/src/App.jsx', type: 'file' },
    { name: 'backend/api-gateway/server.js', path: 'backend/api-gateway/server.js', type: 'file' },
    { name: 'backend/auth-service/index.js', path: 'backend/auth-service/index.js', type: 'file' },
    { name: 'database/schema/001_initial_schema.sql', path: 'database/schema/001_initial_schema.sql', type: 'file' },
    { name: 'worker/whisper-pipeline/worker.py', path: 'worker/whisper-pipeline/worker.py', type: 'file' },
  ],
  keySnippets: [
    {
      path: 'package.json',
      fileName: 'package.json',
      snippet: '{\n  "name": "syncora-monorepo",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.3.1",\n    "express": "^4.19.2",\n    "@prisma/client": "^5.14.0",\n    "redis": "^4.6.13",\n    "jsonwebtoken": "^9.0.2"\n  }\n}',
    },
    {
      path: 'backend/api-gateway/server.js',
      fileName: 'server.js',
      snippet: 'const express = require("express");\nconst app = express();\napp.use("/api/v1/meetings", meetingsRouter);\napp.use("/api/v1/tasks", tasksRouter);\napp.use("/api/v1/auth", authRouter);\napp.listen(5000);',
    },
    {
      path: 'backend/auth-service/index.js',
      fileName: 'index.js',
      snippet: 'const jwt = require("jsonwebtoken");\nrouter.post("/login", async (req, res) => {\n  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);\n  res.cookie("token", token, { httpOnly: true, sameSite: "strict", secure: true });\n  return res.json({ success: true, user });\n});',
    },
    {
      path: 'database/schema/001_initial_schema.sql',
      fileName: '001_initial_schema.sql',
      snippet: 'CREATE TABLE meetings (\n  id UUID PRIMARY KEY,\n  title VARCHAR(255),\n  created_at TIMESTAMP\n);\nCREATE TABLE tasks (\n  id UUID PRIMARY KEY,\n  meeting_id UUID REFERENCES meetings(id),\n  assignee_id VARCHAR(100),\n  approval_status VARCHAR(50)\n);',
    },
    {
      path: 'dashboard/src/main.jsx',
      fileName: 'main.jsx',
      snippet: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App.jsx";\nReactDOM.createRoot(document.getElementById("root")).render(<App />);',
    },
  ],
  securityExclusions: {
    status: 'passed',
    secretsFound: 0,
    excludedPatterns: ['.env*', 'node_modules/', 'dist/', '.git/', '*.pem', '*.key', 'coverage/'],
    executionSafety: 'Verified: Static analysis only. Zero sandboxed code executed.',
  },
};

export const sampleArchitectureData = DEMO_ANALYSIS_DATA;

export const ANALYSIS_STAGES = [
  { index: 1, label: 'Reading project files...', durationMs: 380, targetPercent: 15 },
  { index: 2, label: 'Identifying languages and frameworks...', durationMs: 400, targetPercent: 35 },
  { index: 3, label: 'Parsing folder hierarchy...', durationMs: 420, targetPercent: 55 },
  { index: 4, label: 'Mapping component dependencies...', durationMs: 440, targetPercent: 75 },
  { index: 5, label: 'Tracing API and data flows...', durationMs: 440, targetPercent: 90 },
  { index: 6, label: 'Preparing architecture documentation...', durationMs: 420, targetPercent: 100 },
];

const ArchitectureContext = createContext(null);

export function ArchitectureProvider({ children }) {
  // 1. Uploaded File Metadata & raw File instance
  const [projectFile, setProjectFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);

  // 2. Project Metadata Form inputs
  const [projectName, setProjectName] = useState('Syncora Core Monorepo v1.0');
  const [projectDescription, setProjectDescription] = useState(
    'AI-powered meeting intelligence and real-time audio pipeline platform.'
  );
  const [githubUrl, setGithubUrl] = useState('https://github.com/syncora/syncora-platform');

  // 3. Analysis State: Always default to 'idle' when entering page
  const [analysisState, setAnalysisState] = useState('idle');

  // 4. Analysis Progress: { stageIndex, currentStage, percent }
  const [analysisProgress, setAnalysisProgress] = useState({
    stageIndex: 1,
    currentStage: ANALYSIS_STAGES[0].label,
    percent: 0,
  });

  // 5. Selected Node / Entity (for cross-page inspector sync)
  const [selectedEntity, setSelectedEntity] = useState(null);

  // 6. Structured Results Data (real analyzer payload, restores from storage if present)
  const [analysisData, setAnalysisData] = useState(() => {
    try {
      const saved = localStorage.getItem('syncora_arch_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  // Persist analysis data changes (without forcing state away from 'idle' on fresh entry)
  useEffect(() => {
    try {
      if (analysisState === 'completed' && analysisData) {
        localStorage.setItem('syncora_arch_data', JSON.stringify(analysisData));
      }
    } catch (e) {
      console.error('Failed to sync architecture data to localStorage', e);
    }
  }, [analysisState, analysisData]);

  // Load Pre-populated Demo Project archive
  const loadDemoProject = () => {
    const demoMeta = {
      name: 'syncora-core-platform.zip',
      size: 43829,
      formattedSize: '42.8 KB',
      type: 'application/zip',
      lastModified: Date.now(),
    };
    setProjectFile(demoMeta);
    setRawFile(null); // will generate real in-memory sample project on analyze
    setProjectName('Syncora Core Platform');
    setProjectDescription('Collaborative task triage and meeting intelligence platform.');
    setGithubUrl('https://github.com/syncora/syncora-platform');
  };

  // Start Real In-Browser Code Analysis
  const startAnalysis = async ({ name, description, github, file, fileBlob } = {}) => {
    try {
      const activeName = name || projectName || '';
      const activeDesc = description || projectDescription || '';
      const activeGithub = github || githubUrl || '';
      if (name) setProjectName(name);
      if (description) setProjectDescription(description);
      if (github) setGithubUrl(github);
      if (file) setProjectFile(file);

      const targetFile = fileBlob || rawFile || file?.rawFile;

      setAnalysisState('analyzing');
      setAnalysisProgress({
        stageIndex: 1,
        currentStage: 'Unpacking project ZIP archive with JSZip...',
        percent: 15,
      });

      let zipSource;
      let finalFileName = file?.name || projectFile?.name || 'project-source.zip';
      let finalFileSize = file?.formattedSize || projectFile?.formattedSize || '0 B';

      if (targetFile) {
        zipSource = targetFile;
      } else {
        // Generate real in-memory sample project ZIP and analyze it
        setAnalysisProgress({
          stageIndex: 1,
          currentStage: 'Generating sample project archive in memory...',
          percent: 20,
        });
        zipSource = await createSampleProjectZip();
        finalFileName = 'syncora-core-platform.zip';
        finalFileSize = '42.8 KB';
        setProjectFile({
          name: finalFileName,
          size: 43829,
          formattedSize: finalFileSize,
          type: 'application/zip',
          lastModified: Date.now(),
        });
      }

      // Run real in-browser code analyzer
      const realResults = await analyzeZipArchive(
        zipSource,
        {
          name: activeName || 'Analyzed Project',
          description: activeDesc || '',
          github: activeGithub || '',
          fileName: finalFileName,
          fileSizeFormatted: finalFileSize,
        },
        (stageIndex, currentStage, percent) => {
          setAnalysisProgress({ stageIndex, currentStage, percent });
        }
      );

      // Short pacing delay so the user clearly sees final stage completion
      await new Promise((r) => setTimeout(r, 250));

      setAnalysisData(realResults);
      setAnalysisState('completed');
    } catch (startErr) {
      console.error('Error during real code analysis:', startErr);
      setAnalysisState('error');
    }
  };

  // Reset to Upload State
  const resetAnalysis = () => {
    setAnalysisState('idle');
    setProjectFile(null);
    setRawFile(null);
    setAnalysisProgress({
      stageIndex: 1,
      currentStage: ANALYSIS_STAGES[0].label,
      percent: 0,
    });
    setSelectedEntity(null);
    try {
      localStorage.removeItem('syncora_arch_state');
    } catch {}
  };

  const value = {
    projectFile,
    setProjectFile,
    rawFile,
    setRawFile,
    projectName,
    setProjectName,
    projectDescription,
    setProjectDescription,
    githubUrl,
    setGithubUrl,
    analysisState,
    setAnalysisState,
    analysisProgress,
    selectedEntity,
    setSelectedEntity,
    analysisData,
    setAnalysisData,
    startAnalysis,
    resetAnalysis,
    loadDemoProject,
    sampleArchitectureData,
  };

  return (
    <ArchitectureContext.Provider value={value}>
      {children}
    </ArchitectureContext.Provider>
  );
}

export function useArchitecture() {
  const context = useContext(ArchitectureContext);
  if (!context) {
    throw new Error('useArchitecture must be used within an ArchitectureProvider');
  }
  return context;
}

