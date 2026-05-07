import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, MemoryStick, Thermometer, Clock } from 'lucide-react';
import { useSocketEvent } from '../hooks/useSocket';

function GaugeBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, color, max, unit }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className={color} />
          <span className="text-xs text-subtle font-mono">{label}</span>
        </div>
        <span className={`text-sm font-bold font-mono ${color}`}>
          {value !== null && value !== undefined ? `${value}${unit}` : '—'}
        </span>
      </div>
      {max && <GaugeBar value={value || 0} max={max} color={
        value > 85 ? 'bg-danger' : value > 60 ? 'bg-warning' : 'bg-success'
      } />}
      {subValue && <p className="text-[10px] text-muted font-mono">{subValue}</p>}
    </div>
  );
}

export default function SystemMetrics() {
  const [metrics, setMetrics] = useState(null);

  useSocketEvent('metrics:update', (data) => setMetrics(data));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest font-mono">
          VM Metrics
        </h2>
        {metrics?.uptime && (
          <span className="text-[10px] text-muted font-mono flex items-center gap-1">
            <Clock size={10} />
            {metrics.uptime}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <MetricCard
          icon={Cpu}
          label="CPU Usage"
          value={metrics?.cpu !== undefined ? Math.round(metrics.cpu) : null}
          max={100}
          unit="%"
          color="text-blue-400"
        />
        <MetricCard
          icon={MemoryStick}
          label="RAM Usage"
          value={metrics?.mem?.percent}
          max={100}
          unit="%"
          subValue={metrics?.mem ? `${metrics.mem.used} / ${metrics.mem.total} MB` : null}
          color="text-purple-400"
        />
        <MetricCard
          icon={Thermometer}
          label="CPU Temp"
          value={metrics?.temp !== null && metrics?.temp !== undefined ? metrics.temp.toFixed(1) : null}
          unit="°C"
          color={metrics?.temp > 75 ? 'text-danger' : metrics?.temp > 60 ? 'text-warning' : 'text-green-400'}
        />
      </div>

      {!metrics && (
        <p className="text-xs text-muted font-mono text-center py-2">Waiting for VM data...</p>
      )}
    </motion.div>
  );
}
