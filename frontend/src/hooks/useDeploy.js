

import { useState, useCallback, useRef } from 'react';
import { triggerDeploy } from '../services/api';
import { useSocketEvent } from './useSocket';

// ─── ALL stages in exact order they appear in the Jenkinsfile ────────────────
// Grouped by category for UI rendering (used in PipelineViewer)
export const PIPELINE_STAGES = [
  'Init',
  'Input Repo',
  'Allocate Safe Port',
  'Clone Repo',
  'Secret Scan',          // ← security stage
  'Detect Stack',
  'Dependency Audit',     // ← security stage
  'Create Dockerfile',
  'Build Image',
  'Image Scan (Trivy)',   // ← security stage
  'Push to DockerHub',
  'Stop Old Container',
  'Run Container',
  'Verify',
];

// ─── Stage category map — used by PipelineViewer for badge coloring ──────────
export const STAGE_CATEGORIES = {
  'Init':               'system',
  'Input Repo':         'system',
  'Allocate Safe Port': 'system',
  'Clone Repo':         'source',
  'Secret Scan':        'security',
  'Detect Stack':       'source',
  'Dependency Audit':   'security',
  'Create Dockerfile':  'build',
  'Build Image':        'build',
  'Image Scan (Trivy)': 'security',
  'Push to DockerHub':  'deploy',
  'Stop Old Container': 'deploy',
  'Run Container':      'deploy',
  'Verify':             'deploy',
};

const initialStageMap = () =>
  Object.fromEntries(PIPELINE_STAGES.map((s) => [s, 'idle']));

export function useDeploy() {
  const [deployId, setDeployId]       = useState(null);
  const [status, setStatus]           = useState('idle'); // idle | queued | running | success | failed
  const [stages, setStages]           = useState(initialStageMap());
  const [activeStage, setActiveStage] = useState(null);
  const [logs, setLogs]               = useState([]);
  const [meta, setMeta]               = useState({});
  const [progress, setProgress]       = useState(0);
  const [deploying, setDeploying]     = useState(false);
  const [buildNumber, setBuildNumber] = useState(null);
  const currentDeployId               = useRef(null);

  const deploy = useCallback(async (repoUrl, appName) => {
    // Reset all state for fresh deploy
    setLogs([]);
    setStages(initialStageMap());
    setActiveStage(null);
    setMeta({});
    setProgress(0);
    setStatus('queued');
    setDeploying(true);
    setBuildNumber(null);

    try {
      const res = await triggerDeploy(repoUrl, appName);
      const id = res.data.deployId;
      setDeployId(id);
      currentDeployId.current = id;
    } catch (err) {
      setStatus('failed');
      setDeploying(false);
      setLogs((prev) => [
        ...prev,
        { line: `[ERROR] ${err.message}`, timestamp: new Date().toISOString() },
      ]);
    }
  }, []);

  // ── pipeline:update → stage_start / stage_success / stage_failed ───────────
  useSocketEvent('pipeline:update', useCallback((data) => {
    if (data.deployId !== currentDeployId.current) return;

    setStages((prev) => {
      const updated = { ...prev };

      if (data.event === 'stage_start') {
        // Mark as active — only if stage is known
        if (updated[data.stage] !== undefined) {
          updated[data.stage] = 'active';
        }
        setActiveStage(data.stage);
      }

      if (data.event === 'stage_success') {
        if (updated[data.stage] !== undefined) {
          updated[data.stage] = 'success';
        }
        // Recalculate progress based on known stages only
        const successCount = Object.values(updated).filter((v) => v === 'success').length;
        setProgress(Math.round((successCount / PIPELINE_STAGES.length) * 100));
      }

      if (data.event === 'stage_failed') {
        if (updated[data.stage] !== undefined) {
          updated[data.stage] = 'failed';
        }
      }

      return updated;
    });
  }, []));

  // ── log:new ────────────────────────────────────────────────────────────────
  useSocketEvent('log:new', useCallback((data) => {
    if (data.deployId !== currentDeployId.current) return;
    setLogs((prev) => [...prev, { line: data.line, timestamp: data.timestamp }]);
  }, []));

  // ── deploy:meta ────────────────────────────────────────────────────────────
  useSocketEvent('deploy:meta', useCallback((data) => {
    if (data.deployId !== currentDeployId.current) return;
    setMeta((prev) => ({ ...prev, [data.key]: data.value }));
  }, []));

  // ── deploy:status ──────────────────────────────────────────────────────────
  useSocketEvent('deploy:status', useCallback((data) => {
    if (data.deployId !== currentDeployId.current) return;
    if (data.buildNumber) setBuildNumber(data.buildNumber);

    if (data.status === 'success') {
      setStatus('success');
      setProgress(100);
      setActiveStage(null);
      setDeploying(false);
    } else if (data.status === 'failed') {
      setStatus('failed');
      setDeploying(false);
    } else if (data.status === 'running') {
      setStatus('running');
    } else if (data.status === 'queued') {
      setStatus('queued');
    }
  }, []));

  return {
    deploy,
    deployId,
    status,
    stages,
    activeStage,
    logs,
    meta,
    progress,
    deploying,
    buildNumber,
    PIPELINE_STAGES,
    STAGE_CATEGORIES,
  };
}