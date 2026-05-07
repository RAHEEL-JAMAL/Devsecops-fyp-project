import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, GitBranch, Container, Wifi, WifiOff } from 'lucide-react';
import { fetchHealth } from '../services/api';
import { useSocketEvent } from '../hooks/useSocket';
import { useSocket } from '../hooks/useSocket';

function StatusDot({ active, label, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        {active && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? 'bg-green-400' : 'bg-red-500'}`} />
      </div>
      <Icon size={12} className={active ? 'text-green-400' : 'text-red-400'} />
      <span className={`text-xs font-mono ${active ? 'text-green-400' : 'text-red-400'}`}>{label}</span>
    </div>
  );
}

export default function Header() {
  const { connected } = useSocket();
  const [health, setHealth] = useState({ backend: false, vm: false, jenkins: false, docker: false });

  useEffect(() => {
    fetchHealth().then((r) => setHealth(r.data)).catch(() => {});
  }, []);

  useSocketEvent('health:update', (data) => setHealth(data));

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-xl"
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <GitBranch size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text font-display tracking-tight">
                FYP Cloud Dashboard
              </h1>
              <p className="text-xs text-subtle">Deployment Automation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <StatusDot active={connected} label="Backend" icon={connected ? Wifi : WifiOff} />
          <StatusDot active={health.vm} label="VM" icon={Server} />
          <StatusDot active={health.jenkins} label="Jenkins" icon={Cpu} />
          <StatusDot active={health.docker} label="Docker" icon={Container} />
        </div>
      </div>
    </motion.header>
  );
}
