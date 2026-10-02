import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  X,
  Zap,
  ChevronDown,
  Inbox,
  Layers,
  MapPin,
  Calendar,
  Truck
} from 'lucide-react';
import { api } from '../api/client';

export default function Dashboard({ setActiveTab }) {
  const [showBanner, setShowBanner] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.warn('Analytics endpoint unavailable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const hasData = analytics && analytics.has_data && analytics.total_predictions > 0;
  const totalPreds = hasData ? analytics.total_predictions : 0;
  const onTimePreds = hasData ? analytics.on_time_count : 0;
  const latePreds = hasData ? analytics.late_risk_count : 0;
  const lateRate = hasData ? `${analytics.late_risk_rate}%` : '0.0%';

  // Daily performance from real backend
  const dailyData = hasData && analytics.daily_performance ? analytics.daily_performance : [];
  const maxDayVal = dailyData.length > 0 
    ? Math.max(...dailyData.map(d => Math.max(d.on_time || 0, d.late_risk || 0)), 5) 
    : 10;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-indigo-50/20 to-white border border-slate-200/80 p-8 lg:p-10 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Delivery Intelligence
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Predict delivery delays <br />
              <span className="text-indigo-600">before they happen.</span>
            </h1>
            <p className="text-slate-500 text-sm lg:text-base leading-relaxed">
              Analyze route, partner and warehouse signals to identify deliveries at risk of being late using trained machine learning.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('predict')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all hover:gap-3 cursor-pointer"
              >
                <span>Start a prediction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                <span>Explore the model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Core Radar Graphic with factual model information */}
          <div className="relative w-72 h-72 flex items-center justify-center shrink-0">
            {/* Concentric circles */}
            <div className="absolute inset-0 rounded-full border border-indigo-100/80"></div>
            <div className="absolute inset-6 rounded-full border border-indigo-100/70 border-dashed animate-spin" style={{ animationDuration: '40s' }}></div>
            <div className="absolute inset-14 rounded-full border border-indigo-200/50"></div>
            <div className="absolute inset-20 rounded-full bg-indigo-50/40 animate-pulse"></div>

            {/* Satellite tag 1: Model Status */}
            <div className="absolute top-4 left-0 bg-white border border-slate-200 shadow-sm rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-700">
              <span className="text-[9px] text-slate-400 block font-bold">MODEL</span>
              <span className="text-indigo-600 font-bold">ACTIVE</span>
            </div>

            {/* Satellite tag 2: Operating Threshold */}
            <div className="absolute top-2 right-4 bg-white border border-slate-200 shadow-sm rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-700">
              <span className="text-[9px] text-slate-400 block font-bold">THRESHOLD</span>
              <span className="text-slate-800 font-bold">0.20</span>
            </div>

            {/* Satellite tag 3: Features */}
            <div className="absolute bottom-4 right-2 bg-white border border-slate-200 shadow-sm rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-700">
              <span className="text-[9px] text-slate-400 block font-bold">INPUTS</span>
              <span className="text-emerald-600 font-bold">21 SIGNALS</span>
            </div>

            {/* Central glowing Core */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 shadow-lg shadow-indigo-300 flex flex-col items-center justify-center text-white z-10 ring-4 ring-indigo-100">
              <Zap className="w-6 h-6 fill-white" />
              <span className="text-[9px] font-extrabold tracking-wider mt-0.5">AI CORE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      {showBanner && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-xs text-indigo-900/80">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {hasData ? (
                <>
                  <strong>Live Workspace</strong> — metrics below are aggregated in real-time from your active prediction database.
                </>
              ) : (
                <>
                  <strong>Workspace Ready</strong> — no predictions recorded yet. Run a delivery assessment in the Predict Delivery tab to see live analytics.
                </>
              )}
            </span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-indigo-100/60 rounded-md text-indigo-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 KPI Cards - Strictly Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Predictions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{totalPreds.toLocaleString()}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {hasData ? 'Recorded in database' : 'No predictions yet'}
            </p>
          </div>
        </div>

        {/* Card 2: On-Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Time Predictions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{onTimePreds.toLocaleString()}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {hasData ? `${((onTimePreds / totalPreds) * 100).toFixed(1)}% of total` : 'No predictions yet'}
            </p>
          </div>
        </div>

        {/* Card 3: Late-Risk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late-Risk Predictions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{latePreds.toLocaleString()}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {hasData ? 'Flagged by 0.20 threshold' : 'No predictions yet'}
            </p>
          </div>
        </div>

        {/* Card 4: Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Risk Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{lateRate}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {hasData ? 'Based on actual submissions' : 'No predictions yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Lower Section: Real Weekly Chart + Factual Model Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Snapshot Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weekly Snapshot</span>
              <h3 className="text-lg font-bold text-slate-900">Prediction overview</h3>
              <p className="text-xs text-slate-400">Volume by outcome and scheduled day of week</p>
            </div>
            {hasData && (
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">On-time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600">Late-risk</span>
                </div>
              </div>
            )}
          </div>

          {!hasData ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-1">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No predictions yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Make your first delivery risk prediction in the Predict Delivery tab to see weekly volume and outcome analytics here.
              </p>
            </div>
          ) : (
            <div className="relative w-full h-56 pt-2">
              {/* Bars by Day of Week */}
              <div className="h-44 flex items-end justify-between px-6 border-b border-slate-100">
                {dailyData.map((d, i) => {
                  const onTimeH = Math.min(100, Math.round(((d.on_time || 0) / maxDayVal) * 100));
                  const lateH = Math.min(100, Math.round(((d.late_risk || 0) / maxDayVal) * 100));
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1.5 h-36">
                        <div
                          style={{ height: `${Math.max(onTimeH, 4)}%` }}
                          className="w-4 bg-emerald-500 rounded-t-sm transition-all"
                          title={`${d.day}: ${d.on_time || 0} On-time`}
                        ></div>
                        <div
                          style={{ height: `${Math.max(lateH, 4)}%` }}
                          className="w-4 bg-amber-500 rounded-t-sm transition-all"
                          title={`${d.day}: ${d.late_risk || 0} Late-risk`}
                        ></div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Factual Model Signals (1 col) - No Fake Percentages */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Features</span>
            <h3 className="text-lg font-bold text-slate-900">Key model signals</h3>
            <p className="text-xs text-slate-400 mb-5">Primary input dimensions evaluated by the ML pipeline</p>

            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Route & Distance</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Evaluates transit distance (km) against committed customer timeline (promised delivery hours).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Partner & Vehicle</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Evaluates driver experience years, service rating, historical completed deliveries, and vehicle class.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Warehouse Operations</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Considers facility type (fulfillment, distribution, hub), daily operating hours, and active staff count.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">Temporal Profile</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Incorporates dispatch hour (0–23), day of week, month, and weekend status.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic pt-4 mt-2 border-t border-slate-100">
            These are model input features and should not be interpreted as causal factors.
          </p>
        </div>
      </div>
    </div>
  );
}
