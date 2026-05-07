import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Github, Tag, Loader2 } from 'lucide-react';

export default function DeployForm({ onDeploy, deploying }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!repoUrl.trim()) return setError('GitHub Repo URL is required');
    if (!appName.trim()) return setError('App Name is required');
    if (!/^https?:\/\/.+/.test(repoUrl.trim())) return setError('Enter a valid URL starting with http(s)://');
    if (!/^[a-zA-Z0-9_-]+$/.test(appName.trim())) return setError('App name: letters, numbers, - and _ only');
    setError('');
    onDeploy(repoUrl.trim(), appName.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <h2 className="text-sm font-semibold text-subtle uppercase tracking-widest mb-4 font-mono">
        New Deployment
      </h2>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={deploying}
            className="w-full bg-base border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text placeholder-muted font-mono focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
          />
        </div>

        <div className="w-full lg:w-52 relative">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="my-app"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            disabled={deploying}
            className="w-full bg-base border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text placeholder-muted font-mono focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={deploying}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors whitespace-nowrap"
        >
          {deploying ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Send size={14} />
              Deploy
            </>
          )}
        </motion.button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400 font-mono">{error}</p>
      )}
    </motion.div>
  );
}
