import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { useSocketEvent } from '../hooks/useSocket';

// Parse security-related META and log lines
function parseSecurity(line) {
  // Gitleaks
  if (line.includes('[META] SECRET_SCAN=PASSED'))
    return { type: 'secret', status: 'passed', message: 'No hardcoded secrets found in repository' };
  if (line.includes('[META] SECRET_SCAN=FAILED'))
    return { type: 'secret', status: 'failed', message: 'Hardcoded secrets detected in repository!' };

  // Dependency audit
  if (line.includes('[META] DEPENDENCY_SCAN=PASSED'))
    return { type: 'dependency', status: 'passed', message: 'Dependency audit completed' };
  if (line.includes('[META] VULN_CRITICAL=')) {
    const val = line.split('VULN_CRITICAL=')[1]?.trim();
    return { type: 'dependency', status: parseInt(val) > 0 ? 'warning' : 'info', message: `Critical vulnerabilities: ${val}`, key: 'VULN_CRITICAL', value: val };
  }
  if (line.includes('[META] VULN_HIGH=')) {
    const val = line.split('VULN_HIGH=')[1]?.trim();
    return { type: 'dependency', status: parseInt(val) > 0 ? 'warning' : 'info', message: `High vulnerabilities: ${val}`, key: 'VULN_HIGH', value: val };
  }

  // Trivy image scan
  if (line.includes('[META] IMAGE_SCAN=PASSED'))
    return { type: 'image', status: 'passed', message: 'Docker image scan completed' };
  if (line.includes('[META] IMAGE_CRITICAL_CVE=')) {
    const val = line.split('IMAGE_CRITICAL_CVE=')[1]?.trim();
    return { type: 'image', status: parseInt(val) > 0 ? 'failed' : 'passed', message: `Critical CVEs in image: ${val}`, key: 'IMAGE_CRITICAL_CVE', value: val };
  }

  // Raw warning lines from scanners
  if (line.includes('WARNING:') && (line.includes('secret') || line.includes('Secret') || line.includes('CVE') || line.includes('vulnerabilit')))
    return { type: 'raw', status: 'warning', message: line.replace(/^\[.*?\]\s*/, '') };

  return null;
}

const STATUS_CONFIG = {
  passed:  { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', label: 'PASSED' },
  failed:  { icon: XCircle,      color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/20',  label: 'FAILED' },
  warning: { icon: AlertTriangle,color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'WARNING' },
  info:    { icon: Shield,       color: 'text-accent',  bg: 'bg-accent/10',  border: 'border-accent/20',  label: 'INFO' },
  running: { icon: Shield,       color: 'text-accent',  bg: 'bg-accent/10',  border: 'border-accent/20',  label: 'SCANNING' },
};

const SCAN_LABELS = {
  secret:     { label: 'Secret Scan',      tool: 'Gitleaks',   icon: Lock },
  dependency: { label: 'Dependency Audit', tool: 'npm/pip audit', icon: ShieldAlert },
  image:      { label: 'Image Scan',       tool: 'Trivy',      icon: Shield },
};

function ScanSection({ type, events }) {
  const [expanded, setExpanded] = useState(true);
  const cfg = SCAN_LABELS[type];
  const Icon = cfg.icon;

  // Determine overall status for this scan type
  const hasFailure = events.some(e => e.status === 'failed');
  const hasWarning = events.some(e => e.status === 'warning');
  const hasPassed  = events.some(e => e.status === 'passed');
  const overallStatus = hasFailure ? 'failed' : hasWarning ? 'warning' : hasPassed ? 'passed' : 'running';
  const sCfg = STATUS_CONFIG[overallStatus];
  const StatusIcon = sCfg.icon;

  return (
    <div className={`rounded-lg border ${sCfg.border} ${sCfg.bg} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className={sCfg.color} />
          <span className="text-xs font-mono font-semibold text-text">{cfg.label}</span>
          <span className="text-[10px] font-mono text-muted">via {cfg.tool}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold ${sCfg.color} px-1.5 py-0.5 rounded border ${sCfg.border}`}>
            {sCfg.label}
          </span>
          {expanded ? <ChevronUp size={12} className="text-muted" /> : <ChevronDown size={12} className="text-muted" />}
        </div>
      </button>

      {/* Events list */}
      <AnimatePresence>
        {expanded && events.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5"
          >
            {events.map((evt, i) => {
              const ec = STATUS_CONFIG[evt.status] || STATUS_CONFIG.info;
              const EIcon = ec.icon;
              return (
                <div key={i} className="flex items-start gap-2 px-3 py-1.5 border-b border-white/5 last:border-0">
                  <EIcon size={11} className={`${ec.color} mt-0.5 shrink-0`} />
                  <span className={`text-[11px] font-mono ${ec.color} leading-relaxed`}>
                    {evt.message}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SecurityPanel({ logs }) {
  const [securityEvents, setSecurityEvents] = useState({
    secret: [],
    dependency: [],
    image: [],
    raw: [],
  });

  // Parse incoming logs for security events
  useSocketEvent('log:new', ({ line }) => {
    const parsed = parseSecurity(line);
    if (!parsed) return;
    setSecurityEvents(prev => ({
      ...prev,
      [parsed.type]: [...prev[parsed.type], parsed],
    }));
  });

  // Also parse from existing logs prop on mount
  React.useEffect(() => {
    if (!logs?.length) return;
    const grouped = { secret: [], dependency: [], image: [], raw: [] };
    logs.forEach(({ line }) => {
      const parsed = parseSecurity(line);
      if (parsed) grouped[parsed.type].push(parsed);
    });
    setSecurityEvents(grouped);
  }, []);

  const totalIssues =
    securityEvents.secret.filter(e => e.status === 'failed' || e.status === 'warning').length +
    securityEvents.dependency.filter(e => e.status === 'failed' || e.status === 'warning').length +
    securityEvents.image.filter(e => e.status === 'failed' || e.status === 'warning').length;

  const hasAnyData =
    securityEvents.secret.length > 0 ||
    securityEvents.dependency.length > 0 ||
    securityEvents.image.length > 0;

  const overallSafe = totalIssues === 0 && hasAnyData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {overallSafe
            ? <ShieldCheck size={15} className="text-success" />
            : totalIssues > 0
              ? <ShieldX size={15} className="text-danger" />
              : <Shield size={15} className="text-accent" />
          }
          <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest font-mono">
            Security Scanner
          </h2>
        </div>

        {hasAnyData && (
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${
            overallSafe
              ? 'text-success bg-success/10 border-success/20'
              : totalIssues > 0
                ? 'text-danger bg-danger/10 border-danger/20'
                : 'text-accent bg-accent/10 border-accent/20'
          }`}>
            {overallSafe ? '✅ ALL CLEAR' : `⚠️ ${totalIssues} ISSUE${totalIssues > 1 ? 'S' : ''}`}
          </span>
        )}
      </div>

      {/* Scan sections */}
      <div className="space-y-2">
        {!hasAnyData ? (
          <div className="text-center py-6">
            <Shield size={28} className="text-muted mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted font-mono">Security scans will appear here during deployment</p>
          </div>
        ) : (
          <>
            {securityEvents.secret.length > 0 && (
              <ScanSection type="secret" events={securityEvents.secret} />
            )}
            {securityEvents.dependency.length > 0 && (
              <ScanSection type="dependency" events={securityEvents.dependency} />
            )}
            {securityEvents.image.length > 0 && (
              <ScanSection type="image" events={securityEvents.image} />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}