import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export default function Topbar({ activeTab, isConnected = true, isPreviewMode, setIsPreviewMode }) {
  const titles = {
    dashboard: 'Dashboard',
    predict: 'Predict Delivery',
    history: 'Prediction History',
    analytics: 'Analytics',
    about: 'About Model',
  };

  const currentTitle = titles[activeTab] || 'Dashboard';

  return (
    <header className="px-8 py-5 border-b border-slate-200/70 bg-white/70 backdrop-blur-xs sticky top-0 z-10 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400">
          Workspace / <span className="text-slate-600 font-semibold">{currentTitle}</span>
        </p>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{currentTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Preview Workspace Pill */}
        <button
          onClick={() => setIsPreviewMode && setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isPreviewMode
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle preview reference benchmark mode"
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
          <span>Preview workspace</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider ring-2 ring-slate-100 shadow-xs">
          AL
        </div>
      </div>
    </header>
  );
}
