import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import PredictDelivery from './pages/PredictDelivery';
import PredictionHistory from './pages/PredictionHistory';
import Analytics from './pages/Analytics';
import AboutModel from './pages/AboutModel';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendConnected, setBackendConnected] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  // Poll backend health once on load and every 20 seconds
  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      try {
        const health = await api.checkHealth();
        if (isMounted) {
          setBackendConnected(health.status === 'ok' && health.model_loaded);
        }
      } catch {
        if (isMounted) {
          setBackendConnected(false);
        }
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
          {activeTab === 'dashboard' && (
            <Dashboard setActiveTab={setActiveTab} />
          )}

          {activeTab === 'predict' && (
            <PredictDelivery
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
