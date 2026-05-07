import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, Loader2,
  ExternalLink, Layers, Globe, Hash
} from 'lucide-react';

const STATUS_CONFIG = {
  idle: { label: 'Idle', color: 'text-muted', Icon: Clock },
  queued: { label: 'Queued', color: 'text-warning', Icon: Clock },
  running: { label: 'Running', color: 'text-accent', Icon: Loader2 },
  success: { label: 'Success', color: 'text-success', Icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-danger', Icon: XCircle },
};

function MetaRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
      <Icon size={12} className="text-muted shrink-0" />
      <span className="text-xs text-subtle font-mono w-20 shrink-0">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline font-mono flex items-center gap-1 truncate"
        >
          {value}
          <ExternalLink size={10} />
        </a>
      ) : (
        <span className="text-xs text-text font-mono truncate">{value || '—'}</span>
      )}
    </div>
  );
}

export default function DeployStatusCard({ status, activeStage, progress, meta, buildNumber }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const { Icon, label, color } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5"
    >
      <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest font-mono mb-4">
        Deploy Status
      </h2>

      <div className="flex items-center gap-3 mb-4">
        <div className={`${color}`}>
          <Icon
            size={28}
            className={status === 'running' ? 'animate-spin' : ''}
          />
        </div>
        <div>
          <p className={`text-lg font-bold font-display ${color}`}>{label}</p>
          {activeStage && (
            <p className="text-xs text-subtle font-mono">{activeStage}</p>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className={`text-2xl font-bold font-mono ${color}`}>{progress}%</p>
          <p className="text-xs text-muted font-mono">progress</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            status === 'success' ? 'bg-success' :
            status === 'failed' ? 'bg-danger' : 'bg-accent'
          }`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="space-y-0">
        {buildNumber && (
          <MetaRow icon={Hash} label="Build" value={`#${buildNumber}`} />
        )}
        <MetaRow icon={Layers} label="Stack" value={meta.STACK} />
        <MetaRow icon={Globe} label="Port" value={meta.PORT} />
        {meta.URL && (
          <MetaRow icon={ExternalLink} label="URL" value={meta.URL} href={meta.URL} />
        )}
      </div>

      <AnimatePresence>
        {status === 'success' && meta.URL && (
          <motion.a
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            href={meta.URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-semibold hover:bg-success/20 transition-colors"
          >
            <ExternalLink size={14} />
            Open Deployed App
          </motion.a>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
