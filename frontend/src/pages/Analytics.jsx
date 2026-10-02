import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Inbox,
  BarChart3,
  PieChart,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

export default function Analytics({ setActiveTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const hasData = analytics && analytics.has_data && analytics.total_predictions > 0;
  const daysData = hasData && analytics.daily_performance ? analytics.daily_performance : [];
  const maxDayVal = daysData.length > 0 
    ? Math.max(...daysData.map(d => Math.max(d.on_time || 0, d.late_risk || 0)), 5) 
    : 10;

  const cityData = hasData && analytics.predictions_by_city ? analytics.predictions_by_city : [];
  const maxCityCount = cityData.length > 0 ? Math.max(...cityData.map(c => c.count), 1) : 1;

  // Real risk distributions
  const lowPct = hasData && analytics.risk_distribution?.low_pct !== undefined ? analytics.risk_distribution.low_pct : 0.0;
  const modPct = hasData && analytics.risk_distribution?.moderate_pct !== undefined ? analytics.risk_distribution.moderate_pct : 0.0;
  const highPct = hasData && analytics.risk_distribution?.high_pct !== undefined ? analytics.risk_distribution.high_pct : 0.0;
  const lateRateText = hasData ? `${analytics.late_risk_rate}%` : '0.0%';

  // Dynamic SVG circle stroke-dasharray (circumference ~ 238.76 for r=38)
  const C = 238.76;
  const lowDash = (lowPct / 100) * C;
  const modDash = (modPct / 100) * C;
  const highDash = (highPct / 100) * C;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Performance Lens</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Analytics</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {hasData 
              ? 'Aggregated delivery risk patterns across recorded prediction history.'
              : 'Understand delivery risk patterns once predictions are recorded.'
            }
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900/80">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          {hasData ? (
            <>
              <strong>Active Data Store</strong> — displaying live analytics calculated from {analytics.total_predictions} real model prediction{analytics.total_predictions > 1 ? 's' : ''}.
            </>
          ) : (
            <>
              <strong>No predictions yet.</strong> Make predictions in the Predict Delivery tab to generate real-time analytics.
            </>
          )}
        </span>
      </div>

      {/* Top 2 Cards Grid: Outcome Mix + Risk Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcome Mix (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outcome Mix</span>
              <h3 className="text-lg font-bold text-slate-900">Delivery performance</h3>
              <p className="text-xs text-slate-400">Predictions by day and outcome</p>
            </div>
            {hasData && (
              <div className="flex items-center gap-3 text-xs font-medium">
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
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-1">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No predictions yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Make predictions to generate outcome mix analytics.
              </p>
            </div>
          ) : (
            <div className="relative h-56 w-full pt-2">
              <div className="h-44 flex items-end justify-between px-6 border-b border-slate-100">
                {daysData.map((item, idx) => {
                  const onTimeH = Math.min(100, Math.round(((item.on_time || 0) / maxDayVal) * 100));
                  const lateH = Math.min(100, Math.round(((item.late_risk || 0) / maxDayVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1.5 h-36">
                        <div
                          style={{ height: `${Math.max(onTimeH, 4)}%` }}
                          className="w-5 bg-emerald-600 rounded-t-sm transition-all"
                          title={`${item.day} On-time: ${item.on_time || 0}`}
                        ></div>
                        <div
                          style={{ height: `${Math.max(lateH, 4)}%` }}
                          className="w-5 bg-amber-500 rounded-t-sm transition-all"
                          title={`${item.day} Late-risk: ${item.late_risk || 0}`}
                        ></div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Risk Profile Donut (1 col) - Real Percentages */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Profile</span>
            <h3 className="text-lg font-bold text-slate-900">Risk distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Calculated from actual prediction scores</p>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Base background circle */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />

              {hasData ? (
                <>
                  {/* Low Risk Segment (Green) */}
                  {lowDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={`${lowDash} ${C - lowDash}`}
                      strokeDashoffset="0"
                    />
                  )}
                  {/* Moderate Segment (Amber) */}
                  {modDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="12"
                      strokeDasharray={`${modDash} ${C - modDash}`}
                      strokeDashoffset={`${-lowDash}`}
                    />
                  )}
                  {/* High Risk Segment (Rose) */}
                  {highDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="12"
                      strokeDasharray={`${highDash} ${C - highDash}`}
                      strokeDashoffset={`${-(lowDash + modDash)}`}
                    />
                  )}
                </>
              ) : null}
            </svg>

            {/* Center Callout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900">{lateRateText}</span>
              <span className="text-[10px] font-semibold text-slate-400">
                {hasData ? 'late-risk rate' : 'no data'}
              </span>
            </div>
          </div>

          {/* Donut Legend with Real Counts */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Low risk (&lt; 0.20)</span>
              </div>
              <span className="font-bold text-slate-800">
                {hasData ? `${lowPct}% (${analytics.risk_distribution?.low || 0})` : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 font-medium">Moderate (0.20–0.40)</span>
              </div>
              <span className="font-bold text-slate-800">
                {hasData ? `${modPct}% (${analytics.risk_distribution?.moderate || 0})` : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600 font-medium">High risk (≥ 0.40)</span>
              </div>
              <span className="font-bold text-slate-800">
                {hasData ? `${highPct}% (${analytics.risk_distribution?.high || 0})` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards Grid: Route View + Observation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route View (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs min-h-[260px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Route View</span>
            <h3 className="text-lg font-bold text-slate-900">Predictions by city</h3>
            <p className="text-xs text-slate-400 mb-6">Volume by destination city</p>

            {!hasData || cityData.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">No route predictions yet</h4>
                <p className="text-[11px] text-slate-400">
                  Assess deliveries to see route volume by destination city.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cityData.map((item, idx) => {
                  const pct = Math.min(100, Math.round((item.count / maxCityCount) * 100));
                  return (
                    <div key={idx} className="flex items-center gap-4 text-xs">
                      <span className="w-24 font-semibold text-slate-700">{item.city}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right text-slate-500 font-medium">
                        {item.count} run{item.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Factual Observation Card (Deep Indigo) */}
        <div className="bg-[#293885] rounded-2xl p-7 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Model Insights</span>
            </div>
            <h3 className="text-xl font-bold leading-snug">Transit Feasibility Signals</h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              Model evaluated via HistGradientBoosting with operating threshold 0.20. Distance and promised delivery hours are primary input signals for transit feasibility. These are model input features and should not be interpreted as causal factors.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() => setActiveTab && setActiveTab('about')}
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-200 transition-colors cursor-pointer"
            >
              <span>View model documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
