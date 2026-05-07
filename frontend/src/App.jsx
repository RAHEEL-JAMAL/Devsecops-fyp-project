import React from 'react';
import { motion } from 'framer-motion';

import Header from './components/Header';
import DeployForm from './components/DeployForm';
import PipelineViewer from './components/PipelineViewer';
import LogTerminal from './components/LogTerminal';
import DeployStatusCard from './components/DeployStatusCard';
import SystemMetrics from './components/SystemMetrics';
import ContainersPanel from './components/ContainersPanel';
import DeployHistory from './components/DeployHistory';
import SecurityPanel from './components/SecurityPanel';

import { useDeploy } from './hooks/useDeploy';

export default function App() {
  const {
    deploy,
    status,
    stages,
    activeStage,
    logs,
    meta,
    progress,
    deploying,
    buildNumber,
    PIPELINE_STAGES,
  } = useDeploy();

  return (
    <div className="min-h-screen bg-base text-text font-display">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-4">

          {/* Deploy Form */}
          <DeployForm onDeploy={deploy} deploying={deploying} />

          {/* Pipeline Viewer */}
          <PipelineViewer
            stages={stages}
            activeStage={activeStage}
            progress={progress}
            PIPELINE_STAGES={PIPELINE_STAGES}
            status={status}
          />

          {/* Main grid: logs left, status + metrics right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Terminal (2/3 width) */}
            <div className="lg:col-span-2">
              <LogTerminal logs={logs} />
            </div>

            {/* Right: Status + Metrics (1/3 width) */}
            <div className="space-y-4">
              <DeployStatusCard
                status={status}
                activeStage={activeStage}
                progress={progress}
                meta={meta}
                buildNumber={buildNumber}
              />
              <SystemMetrics />
            </div>
          </div>

          {/* Security Panel - full width */}
          <SecurityPanel logs={logs} />

          {/* Bottom: Containers + History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContainersPanel />
            <DeployHistory />
          </div>

        </main>
      </div>
    </div>
  );
}