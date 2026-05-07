
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Loader2, Circle, ChevronRight,
  ShieldCheck, ShieldAlert, Package, Rocket, GitBranch, Settings2
} from 'lucide-react';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  security: {
    // label: 'Security',
    // icon: ShieldCheck,
    // badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    // connector: 'bg-yellow-500',
  },
  build: {
    // label: 'Build',
    // icon: Package,
    // badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    // connector: 'bg-blue-500',
  },
  deploy: {
    // label: 'Deploy',
    // icon: Rocket,
    // badge: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    // connector: 'bg-purple-500',
  },
  source: {
    // label: 'Source',
    // icon: GitBranch,
    // badge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    // connector: 'bg-cyan-500',
  },
  system: {
    // label: 'System',
    // icon: Settings2,
    // badge: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
    // connector: 'bg-gray-500',
  },
};

// ─── Stage state styles ───────────────────────────────────────────────────────
const STAGE_RING = {
  idle:    'text-gray-500 border-gray-700 bg-transparent',
  active:  'text-cyan-400 border-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.3)]',
  success: 'text-emerald-400 border-emerald-400 bg-emerald-400/10',
  failed:  'text-red-400 border-red-400 bg-red-400/10',
};

const STAGE_LABEL = {
  idle:    'text-gray-500',
  active:  'text-cyan-400 font-semibold',
  success: 'text-emerald-400',
  failed:  'text-red-400',
};

const STAGE_ICON = {
  idle:    Circle,
  active:  Loader2,
  success: CheckCircle2,
  failed:  XCircle,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.system;
  return (
    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${config.badge}`}>
      {config.label}
    </span>
  );
}

function StageNode({ name, state, index, category }) {
  const Icon  = STAGE_ICON[state]  || Circle;
  const ring  = STAGE_RING[state]  || STAGE_RING.idle;
  const label = STAGE_LABEL[state] || STAGE_LABEL.idle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex flex-col items-center gap-1 min-w-[76px]"
    >
      {/* Category badge above node */}
      <CategoryBadge category={category} />

      {/* Circle icon */}
      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${ring}`}>
        <Icon size={15} className={state === 'active' ? 'animate-spin' : ''} />
      </div>

      {/* Stage name */}
      <span className={`text-[9.5px] font-mono text-center leading-tight max-w-[72px] transition-colors ${label}`}>
        {name}
      </span>
    </motion.div>
  );
}

function Connector({ fromState, toCategory }) {
  // Color connector based on destination category when active/success
  const catConfig = CATEGORY_CONFIG[toCategory] || CATEGORY_CONFIG.system;
  const activeColor = fromState === 'success' ? catConfig.connector : 'bg-cyan-400';

  return (
    <div className="flex-1 flex items-center" style={{ minWidth: '12px' }}>
      <div className="w-full h-[2px] bg-gray-800 relative overflow-hidden rounded-full">
        <AnimatePresence>
          {fromState !== 'idle' && (
            <motion.div
              key={fromState}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`absolute left-0 top-0 h-full ${activeColor}`}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Security summary bar ─────────────────────────────────────────────────────
const SECURITY_STAGES = ['Secret Scan', 'Dependency Audit', 'Image Scan (Trivy)'];

function SecuritySummary({ stages }) {
  const results = SECURITY_STAGES.map((s) => ({ name: s, state: stages[s] || 'idle' }));
  const allPassed = results.every((r) => r.state === 'success');
  const anyFailed = results.some((r) => r.state === 'failed');
  const anyActive = results.some((r) => r.state === 'active');

  const summaryColor = allPassed
    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400'
    : anyFailed
    ? 'border-red-500/40 bg-red-500/5 text-red-400'
    : anyActive
    ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-400'
    : 'border-gray-700 bg-transparent text-gray-500';

  const Icon = anyFailed ? ShieldAlert : ShieldCheck;
  const label = allPassed ? 'All Security Checks Passed' : anyFailed ? 'Security Check Failed' : anyActive ? 'Running Security Checks...' : 'Security Checks Pending';

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all duration-500 ${summaryColor}`}>
      <Icon size={13} className={anyActive ? 'animate-pulse' : ''} />
      <span>{label}</span>
      <div className="ml-auto flex gap-2">
        {results.map((r) => {
          const dot =
            r.state === 'success' ? 'bg-emerald-400' :
            r.state === 'failed'  ? 'bg-red-400' :
            r.state === 'active'  ? 'bg-yellow-400 animate-pulse' :
            'bg-gray-600';
          return (
            <div key={r.name} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="text-[9px] text-gray-400">{r.name.replace('Image Scan (Trivy)', 'Trivy')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PipelineViewer({
  stages,
  activeStage,
  progress,
  PIPELINE_STAGES,
  STAGE_CATEGORIES,
  status,
}) {
  const successCount = Object.values(stages).filter((s) => s === 'success').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest font-mono">
          Pipeline
        </h2>
        <div className="flex items-center gap-3">
          {activeStage && (
            <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
              <ChevronRight size={12} />
              {activeStage}
            </span>
          )}
          <span className="text-xs font-mono text-gray-500">
            {successCount}/{PIPELINE_STAGES.length} stages
          </span>
          <span className={`text-xs font-mono font-bold ${
            status === 'success' ? 'text-emerald-400' :
            status === 'failed'  ? 'text-red-400' :
            status === 'running' ? 'text-cyan-400' : 'text-gray-500'
          }`}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            status === 'success' ? 'bg-emerald-400' :
            status === 'failed'  ? 'bg-red-400' : 'bg-cyan-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Security summary bar — only shown once any security stage has started */}
      {(stages['Secret Scan'] !== 'idle' ||
        stages['Dependency Audit'] !== 'idle' ||
        stages['Image Scan (Trivy)'] !== 'idle') && (
        <SecuritySummary stages={stages} />
      )}

      {/* Stage nodes row — horizontally scrollable */}
      <div className="flex items-start gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
        {PIPELINE_STAGES.map((stage, i) => (
          <React.Fragment key={stage}>
            <StageNode
              name={stage}
              state={stages[stage] || 'idle'}
              index={i}
              category={STAGE_CATEGORIES?.[stage] || 'system'}
            />
            {i < PIPELINE_STAGES.length - 1 && (
              <Connector
                fromState={stages[stage] || 'idle'}
                toCategory={STAGE_CATEGORIES?.[PIPELINE_STAGES[i + 1]] || 'system'}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-800">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}