import React, { useState, useRef } from 'react';
import {
  FolderGit2,
  UploadCloud,
  FileArchive,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCode2,
  Layers,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Github,
  Trash2,
  RefreshCw,
  FolderTree,
  Terminal,
  Database,
  Cpu,
  Code2,
  Info,
  Check,
  Loader2,
} from 'lucide-react';
import { useArchitecture, ANALYSIS_STAGES } from '../context/ArchitectureContext';
import ProjectArchitectureResults from '../components/ProjectArchitectureResults';

// Helper to format file bytes to KB/MB
function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Lightweight Error Boundary to protect component tree from upload / parsing crashes
class ArchitectureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ArchitectureErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-surface-900 border border-rose-200 dark:border-rose-900/60 shadow-lg text-center space-y-5 max-w-lg mx-auto my-8 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">
              Archive Parsing Error
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
              Failed to parse archive. Please ensure it is a valid .zip file under 50MB.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProjectArchitectureView({ onNavigate = () => {} }) {
  const {
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
    analysisData,
    startAnalysis,
    resetAnalysis,
    loadDemoProject,
  } = useArchitecture();

  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Validate and store selected file safely without synchronous FileReader binary reading
  const handleProcessFile = (file) => {
    try {
      setErrorMessage('');
      if (!file) return;

      // Validate: file name ends with .zip or .tar.gz (or MIME type matches application/zip, application/x-zip-compressed)
      const fileName = (file.name || '').toLowerCase();
      const fileType = (file.type || '').toLowerCase();

      const isZip =
        fileName.endsWith('.zip') ||
        fileName.endsWith('.tar.gz') ||
        fileName.endsWith('.tgz') ||
        fileType === 'application/zip' ||
        fileType === 'application/x-zip-compressed' ||
        fileType === 'application/x-gzip' ||
        fileType === 'application/gzip' ||
        fileType.includes('zip') ||
        fileType.includes('tar') ||
        fileType.includes('compressed');

      if (!isZip) {
        setErrorMessage('Please upload a valid project archive (.zip or .tar.gz).');
        return;
      }

      // Check size limit: max 50MB (50 * 1024 * 1024 bytes)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setErrorMessage(`Archive exceeds the 50MB limit (${formatBytes(file.size)}). Please reduce archive size.`);
        return;
      }

      // Store file metadata and keep raw file reference for JSZip in-browser extraction
      const meta = {
        name: file.name || 'project-source.zip',
        size: file.size || 0,
        formattedSize: formatBytes(file.size),
        type: file.type || 'application/zip',
        lastModified: file.lastModified || Date.now(),
        rawFile: file,
      };

      setRawFile(file);
      setProjectFile(meta);
      setErrorMessage('');

      // Auto-populate project name if default or empty
      const cleanName = (file.name || '').replace(/\.(zip|tar\.gz|tgz)$/i, '').replace(/[-_]/g, ' ');
      if (cleanName && (!projectName || projectName === 'Syncora Core Monorepo v1.0')) {
        const titleCased = cleanName
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        if (titleCased) {
          setProjectName(titleCased);
        }
      }
    } catch (err) {
      console.error('File upload validation failed:', err);
      setErrorMessage('Failed to parse archive. Please ensure it is a valid .zip file under 50MB.');
    }
  };

  // Direct bypass to explore sample codebase (generates real in-memory project zip and analyzes it)
  const handleExploreSample = (e) => {
    e?.stopPropagation?.();
    setErrorMessage('');
    loadDemoProject();
    startAnalysis({
      name: 'Syncora Core Platform',
      description: 'Collaborative task triage and meeting intelligence platform.',
      github: 'https://github.com/syncora/syncora-platform',
      file: {
        name: 'syncora-core-platform.zip',
        size: 43829,
        formattedSize: '42.8 KB',
        type: 'application/zip',
      },
      fileBlob: null,
    });
  };

  // Drag & drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    try {
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleProcessFile(e.dataTransfer.files[0]);
      }
    } catch (err) {
      console.error('Error handling file drop:', err);
      setErrorMessage('Failed to parse archive. Please ensure it is a valid .zip file under 50MB.');
    }
  };

  const handleManualUpload = (e) => {
    try {
      if (e.target?.files && e.target.files[0]) {
        handleProcessFile(e.target.files[0]);
      }
    } catch (err) {
      console.error('Error handling manual file selection:', err);
      setErrorMessage('Failed to parse archive. Please ensure it is a valid .zip file under 50MB.');
    }
  };

  // Start analysis trigger with real in-browser code analyzer
  const handleStartAnalysis = (e) => {
    e?.preventDefault();
    try {
      if (!projectFile) {
        setErrorMessage('Please upload a project archive (.zip or .tar.gz) or load demo data.');
        return;
      }

      const finalProjectName =
        (projectName && projectName.trim()) ||
        (projectFile?.name ? projectFile.name.replace(/\.(zip|tar\.gz|tgz)$/i, '') : 'My Project');

      setErrorMessage('');
      startAnalysis({
        name: finalProjectName,
        description: (projectDescription || '').trim(),
        github: (githubUrl || '').trim(),
        file: projectFile,
        fileBlob: rawFile || projectFile?.rawFile,
      });
    } catch (err) {
      console.error('Failed to trigger project analysis:', err);
      setErrorMessage('Failed to parse archive. Please ensure it is a valid .zip file under 50MB.');
    }
  };

  return (
    <ArchitectureErrorBoundary onReset={resetAnalysis}>
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* 1. HEADER SECTION (WHEN NOT COMPLETED) */}
        {analysisState !== 'completed' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                      Project Architecture
                    </h1>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        analysisState === 'error'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : analysisState === 'analyzing'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800 animate-pulse'
                          : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 border-surface-200 dark:border-surface-700'
                      }`}
                    >
                      {analysisState === 'error'
                        ? 'Parsing Failed'
                        : analysisState === 'analyzing'
                        ? 'Inspection In Progress'
                        : 'Ready for Upload'}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    Understand how your project is built, how its components connect, and where everything fits.
                  </p>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExploreSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Explore Sample Codebase</span>
              </button>
            </div>
          </div>
        )}

        {/* ERROR STATE: CLEAN PARSING ALERT & RESET */}
        {analysisState === 'error' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-surface-900 border border-rose-200 dark:border-rose-900/60 shadow-lg text-center space-y-5 max-w-lg mx-auto my-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                Archive Parsing Error
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
                {errorMessage || 'Failed to parse archive. Please ensure it is a valid .zip file under 50MB.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                resetAnalysis();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

      {/* 2. MULTI-STAGE PROGRESS STATE (WHEN ANALYZING) */}
      {analysisState === 'analyzing' && (
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl p-6 sm:p-8 space-y-7 animate-in zoom-in-95 duration-200">
          
          {/* Progress Header Gauge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-100 dark:border-surface-800">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deep Codebase Inspection Running</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white">
                Analysing "{projectName}"
              </h2>
              <p className="text-xs text-surface-500">
                Extracting directory hierarchy, AST entry points, microservice dependencies, and data flow.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                  {analysisProgress.percent}%
                </div>
                <span className="text-[10px] text-surface-400">
                  Stage {analysisProgress.stageIndex} of {ANALYSIS_STAGES.length}
                </span>
              </div>
            </div>
          </div>

          {/* Smooth Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-md"
                style={{ width: `${analysisProgress.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-surface-400 font-mono">
              <span className="truncate max-w-[80%] font-semibold text-surface-700 dark:text-surface-300">
                {analysisProgress.currentStage}
              </span>
              <span>{analysisProgress.percent}%</span>
            </div>
          </div>

          {/* 6 Sequenced Stage Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {ANALYSIS_STAGES.map((stage) => {
              const isPast = analysisProgress.stageIndex > stage.index;
              const isCurrent = analysisProgress.stageIndex === stage.index;
              const isFuture = analysisProgress.stageIndex < stage.index;

              return (
                <div
                  key={stage.index}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-400/20'
                      : isPast
                      ? 'bg-surface-50 dark:bg-surface-850 border-surface-200 dark:border-surface-800 opacity-90'
                      : 'bg-white/60 dark:bg-surface-900/40 border-surface-200/60 dark:border-surface-800/40 opacity-50'
                  }`}
                >
                  <div className="pt-0.5">
                    {isPast ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-500 flex items-center justify-center text-[10px] font-mono">
                        {stage.index}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400">
                        Step 0{stage.index}
                      </span>
                      {isPast && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Complete
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 font-medium leading-snug ${
                        isCurrent
                          ? 'text-indigo-950 dark:text-indigo-200 font-bold'
                          : isPast
                          ? 'text-surface-700 dark:text-surface-300'
                          : 'text-surface-400'
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Console Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-inner">
            <Terminal className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-500">ast-inspect:</span>
            <span className="truncate text-slate-300">
              {analysisProgress.percent < 25 && 'Reading project files and unpacking directory layout...'}
              {analysisProgress.percent >= 25 && analysisProgress.percent < 45 && 'Identifying languages, frameworks (React, Node.js, PostgreSQL, Prisma)...'}
              {analysisProgress.percent >= 45 && analysisProgress.percent < 65 && 'Parsing folder hierarchy and microservice entry points...'}
              {analysisProgress.percent >= 65 && analysisProgress.percent < 85 && 'Mapping component dependencies and caller-callee relationships...'}
              {analysisProgress.percent >= 85 && analysisProgress.percent < 100 && 'Tracing REST APIs, WebSockets, and data flow pipelines...'}
              {analysisProgress.percent >= 100 && 'Preparing architecture documentation and interactive topology canvas...'}
            </span>
          </div>
        </div>
      )}

      {/* 3. UPLOAD & FORM SECTION (ALWAYS VISIBLE WHEN IDLE OR NO COMPLETED DATA) */}
      {(analysisState === 'idle' || !analysisData || (analysisState !== 'analyzing' && analysisState !== 'completed')) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Drag and Drop Upload Area & Metadata Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* DRAG AND DROP ZONE */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer relative overflow-hidden group ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 scale-[1.01]'
                  : projectFile
                  ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/15 dark:bg-emerald-950/10'
                  : 'border-surface-300 dark:border-surface-700 hover:border-indigo-400 bg-white dark:bg-surface-900 shadow-xs'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.tar.gz,.tgz,application/zip,application/x-zip-compressed,application/x-gzip"
                onChange={handleManualUpload}
                className="hidden"
              />

              {!projectFile ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">
                      Drag and drop your project ZIP archive here, or click to browse
                    </h3>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                      Upload your project codebase archive to inspect its full architecture and dependencies.
                    </p>
                  </div>

                  {/* Primary File Browse Trigger Button */}
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Project ZIP</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-surface-400 pt-1">
                    <span>Supports .zip up to 50MB</span>
                    <span>•</span>
                    <span>No dependencies required</span>
                  </div>

                  {/* Secondary One-Click Sample Codebase Link */}
                  <div className="pt-2 border-t border-surface-100 dark:border-surface-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExploreSample(e);
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Or explore with sample codebase →</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* FILE PREVIEW CARD */
                <div
                  className="p-5 rounded-2xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 max-w-lg mx-auto shadow-sm text-left flex items-center justify-between gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex-shrink-0">
                      <FileArchive className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-surface-900 dark:text-white truncate">
                          {projectFile.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Ready
                        </span>
                      </div>
                      <div className="text-xs text-surface-400 font-mono mt-0.5">
                        {projectFile.formattedSize} • Compressed Archive
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectFile(null)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PROJECT METADATA FORM */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-surface-900 dark:text-white pb-1 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <span>Project Metadata & Context</span>
                <span className="text-[11px] font-normal text-surface-400">Customises architectural diagrams</span>
              </h3>

              {/* Project Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Project / Solution Name <span className="font-normal text-surface-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Syncora Core Monorepo v1.0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Solution Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Summarize the core purpose, modules, and target deployment..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Optional GitHub URL */}
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  GitHub Repository Link (Optional)
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/organization/repo"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* PRIMARY ACTION CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={!projectFile}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    projectFile
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer'
                      : 'bg-surface-200 dark:bg-surface-800 text-surface-400 dark:text-surface-500 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyse My Project</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {!projectFile && (
                  <p className="text-[11px] text-surface-400 text-center mt-2 font-medium">
                    Please upload or select a ZIP archive above to begin analysis.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: "Before Analysis" Inspection Checklist Card & Security Callout */}
          <div className="space-y-6">
            
            {/* INSPECTION CHECKLIST CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-surface-100 dark:border-surface-800">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white">
                    Inspection Checklist
                  </h3>
                  <p className="text-[11px] text-surface-500">
                    What Syncora extracts during analysis
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Folders & Directory Layout',
                    desc: 'Maps monolithic, monorepo, and microservice directories.',
                    icon: FolderTree,
                  },
                  {
                    title: 'Languages & Frameworks',
                    desc: 'Detects frontend SPAs, backend APIs, workers, and engines.',
                    icon: Code2,
                  },
                  {
                    title: 'Application Entry Points',
                    desc: 'Identifies main bootstrapping scripts and daemon listeners.',
                    icon: Terminal,
                  },
                  {
                    title: 'Component Dependencies',
                    desc: 'Builds parent-child trees and inter-service call graphs.',
                    icon: Layers,
                  },
                  {
                    title: 'API Routes & Contracts',
                    desc: 'Extracts REST endpoints, WebSocket channels, and payloads.',
                    icon: Cpu,
                  },
                  {
                    title: 'Database Integrations',
                    desc: 'Maps schemas, foreign keys, models, and cache invalidation.',
                    icon: Database,
                  },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 mt-0.5">
                        <ItemIcon className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div>
                        <span className="font-bold text-surface-800 dark:text-surface-200">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-surface-500 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECURITY & ISOLATION NOTE */}
            <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Execution Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Code is never executed; secrets, build folders (<span className="font-mono">node_modules</span>, <span className="font-mono">dist</span>), and <span className="font-mono">.env</span> files are strictly excluded before analysis begins.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 4. COMPLETED STATE: FULL ARCHITECTURE RESULTS WORKSPACE */}
      {analysisState === 'completed' && analysisData && (
        <ProjectArchitectureResults onNavigate={onNavigate} />
      )}

      </div>
    </ArchitectureErrorBoundary>
  );
}

