import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trash2, Search } from 'lucide-react';

function colorize(line) {
  if (line.includes('[STAGE_START]')) return 'text-blue-400 font-semibold';
  if (line.includes('[STAGE_SUCCESS]')) return 'text-green-900 font-semibold';
  if (line.includes('[DEPLOY_SUCCESS]')) return 'text-green-300 font-bold';
  if (line.includes('[DEPLOY_FAILED]')) return 'text-red-400 font-bold';
  if (line.includes('[META]')) return 'text-yellow-400';
  if (line.includes('[ERROR]') || line.toLowerCase().includes('error')) return 'text-red-400';
  if (line.includes('[INFO]')) return 'text-cyan-400';
  if (line.startsWith('+ ')) return 'text-purple-400';
  return 'text-gray-300';
}

export default function LogTerminal({ logs }) {
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
   if (autoScroll && containerRef.current) {
  containerRef.current.scrollTop = containerRef.current.scrollHeight;
}
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const filtered = search
    ? logs.filter((l) => l.line.toLowerCase().includes(search.toLowerCase()))
    : logs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card flex flex-col"
      style={{ height: '380px' }}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-accent" />
          <span className="text-xs font-mono text-subtle uppercase tracking-widest">Console Output</span>
          <span className="text-xs font-mono text-muted">({logs.length} lines)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-base border border-border rounded pl-6 pr-2 py-1 text-xs font-mono text-text placeholder-muted focus:outline-none focus:border-accent w-28"
            />
          </div>
          <button
            onClick={() => { /* clear not possible since logs come from parent */ setSearch(''); }}
            className="text-muted hover:text-text transition-colors"
            title="Clear search"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto terminal-bg terminal-scroll px-4 py-3 font-mono text-xs leading-5 relative z-10"
      >
        {filtered.length === 0 ? (
          <p className="text-muted italic">Waiting for logs...</p>
        ) : (
          filtered.map((entry, i) => (
            <div key={i} className={`flex gap-2 ${colorize(entry.line)}`}>
              <span className="text-gray-600 shrink-0 select-none w-20 text-right">
                {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
              </span>
              <span className="break-all">{entry.line}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {!autoScroll && (
        <div className="border-t border-border px-4 py-1.5 text-center">
          <button
            onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
            className="text-xs font-mono text-accent hover:underline"
          >
            ↓ Scroll to bottom
          </button>
        </div>
      )}
    </motion.div>
  );
}
