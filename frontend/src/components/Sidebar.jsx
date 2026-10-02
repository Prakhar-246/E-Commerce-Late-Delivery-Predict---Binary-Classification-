import React from 'react';
import { 
  LayoutGrid, 
  Cpu, 
  History, 
  BarChart2, 
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isLive = true }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'predict', label: 'Predict Delivery', icon: Cpu, badge: 'NEW' },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'about', label: 'About Model', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-screen flex flex-col shrink-0 select-none z-20">
      {/* Brand Logo */}
      <div className="p-6 pb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">DeliveryAI</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">AI Operations</p>
        </div>
      </div>

      {/* Workspace Status Pill */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-medium text-slate-700">Model workspace</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-100/70 rounded-md">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        v1.0 • HistGradientBoosting (0.20)
      </div>
    </aside>
  );
}
