import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Circle } from 'lucide-react';
import { useSocketEvent } from '../hooks/useSocket';

export default function ContainersPanel() {
  const [containers, setContainers] = useState([]);
  const [ts, setTs] = useState(null);

  useSocketEvent('containers:update', ({ containers: c, timestamp }) => {
    setContainers(c || []);
    setTs(timestamp);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Container size={13} className="text-accent" />
          <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest font-mono">
            Docker Containers
          </h2>
        </div>
        <span className="text-[10px] text-muted font-mono">
          {containers.length} running
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto terminal-scroll">
        <AnimatePresence>
          {containers.length === 0 ? (
            <p className="text-xs text-muted font-mono text-center py-4">No running containers</p>
          ) : (
            containers.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-base/60 border border-border/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Circle size={7} className="text-success fill-success shrink-0" />
                    <span className="text-xs font-mono text-text truncate font-semibold">{c.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded shrink-0">
                    running
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted truncate">{c.image}</p>
                <div className="flex items-center gap-3 mt-1">
                  {c.ports && (
                    <span className="text-[10px] font-mono text-accent">{c.ports}</span>
                  )}
                  {c.runningFor && (
                    <span className="text-[10px] font-mono text-muted">{c.runningFor}</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
