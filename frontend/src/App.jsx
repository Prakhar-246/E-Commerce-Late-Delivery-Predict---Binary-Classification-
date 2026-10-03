import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ServerColdStartOverlay from './components/ServerColdStartOverlay';
import Dashboard from './pages/Dashboard';
import PredictDelivery from './pages/PredictDelivery';
import PredictionHistory from './pages/PredictionHistory';
import Analytics from './pages/Analytics';
import AboutModel from './pages/AboutModel';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict'); // Default to predict tab for instant ML testing
  const [backendConnected, setBackendConnected] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  const checkBackend = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      const isOk = health.status === 'ok' && health.model_loaded;
      setBackendConnected(isOk);
      return isOk;
    } catch {
      setBackendConnected(false);
      return false;
    }
  }, []);

  // Poll backend health: rapidly every 2.5s while cold, then every 30s once live
  useEffect(() => {
    let isMounted = true;
    let timer;

    async function poll() {
      const connected = await checkBackend();
      if (!isMounted) return;

      const delay = connected ? 30000 : 2500;
      timer = setTimeout(poll, delay);
    }

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [checkBackend]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={backendConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activeTab={activeTab}
          isConnected={backendConnected}
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
        />

        <main className="flex-1 pb-16">
          {/* Fullscreen / Floating Cold Start Warmup Modal */}
          <ServerColdStartOverlay
            isConnected={backendConnected}
            onRetry={checkBackend}
          />

          {activeTab === 'dashboard' && (
            <Dashboard setActiveTab={setActiveTab} />
          )}

          {activeTab === 'predict' && (
            <PredictDelivery
              isBackendReady={backendConnected}
              onPredictionSuccess={() => {
                // optionally show a toast or keep user on predict result
              }}
            />
          )}

          {activeTab === 'history' && (
            <PredictionHistory />
          )}

          {activeTab === 'analytics' && (
            <Analytics setActiveTab={setActiveTab} />
          )}

          {activeTab === 'about' && (
            <AboutModel />
          )}
        </main>
      </div>
    </div>
  );
}
