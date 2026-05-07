import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { fetchHistory } from '../services/api';
import { useSocketEvent } from '../hooks/useSocket';

const STATUS_ICON = {
  success: <CheckCircle2 size={12} className="text-success" />,
  failed: <XCircle size={12} className="text-danger" />,
  running: <Loader2 size={12} className="text-accent animate-spin" />,
  queued: <Loader2 size={12} className="text-warning" />,
};

export default function DeployHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory()
      .then((r) => setHistory(r.data.history || []))
      .catch(() => {});
  }, []);

  // Refresh history on new deploys by listening to status events
  useSocketEvent('deploy:status', () => {
    fetchHistory()
      .then((r) => setHistory(r.data.history || []))
      .catch(() => {});
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <History size={13} className="text-accent" />
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest font-mono">
          Deployment History
        </h2>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto terminal-scroll">
        {history.length === 0 ? (
          <p className="text-xs text-muted font-mono text-center py-4">No deployments yet</p>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="bg-base/60 border border-border/50 rounded-lg px-3 py-2 flex items-center gap-3"
            >
              <div className="shrink-0">{STATUS_ICON[entry.status] || STATUS_ICON.queued}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text font-semibold truncate">
                    {entry.appName}
                  </span>
                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                    entry.status === 'success' ? 'bg-success/10 text-success' :
                    entry.status === 'failed' ? 'bg-danger/10 text-danger' :
                    'bg-accent/10 text-accent'
                  }`}>
                    {entry.status}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted truncate">{entry.repoUrl}</p>
                {entry.url && (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-accent flex items-center gap-0.5 hover:underline"
                  >
                    {entry.url}
                    <ExternalLink size={9} />
                  </a>
                )}
              </div>
              <span className="text-[10px] font-mono text-muted shrink-0 text-right">
                {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
