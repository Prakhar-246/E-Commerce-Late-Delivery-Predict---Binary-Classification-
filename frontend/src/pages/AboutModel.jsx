import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function AboutModel() {
  const [showCategorical, setShowCategorical] = useState(true);
  const [showNumerical, setShowNumerical] = useState(true);

  const categoricalFeatures = [
    'source_city', 'destination_city', 'product_category',
    'customer_type', 'vehicle_type', 'partner_city',
    'warehouse_type', 'day_of_week', 'month'
  ];

  const numericalFeatures = [
    'product_weight_kg', 'order_value', 'distance_km',
    'promised_delivery_hours', 'partner_experience_years',
    'rating', 'completed_deliveries', 'capacity_units',
    'staff_count', 'operating_hours', 'is_weekend', 'order_hour'
  ];

  const pipelineSteps = [
    { num: 1, label: 'Raw Delivery Data' },
    { num: 2, label: 'Data Cleaning' },
    { num: 3, label: 'Feature Engineering' },
    { num: 4, label: 'Train/Test Split' },
    { num: 5, label: 'Categorical Encoding' },
    { num: 6, label: 'HistGradientBoost', active: true },
    { num: 7, label: 'Probability Prediction' },
    { num: 8, label: 'Threshold = 0.20' },
    { num: 9, label: 'Delivery Risk Prediction' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Card</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">About the model</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            The context behind DeliveryAI's delivery risk workflow.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span>MODEL DOCUMENTATION</span>
        </div>
      </div>

      {/* Top Hero Banner (Deep Indigo/Purple matching Screenshot 5) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#313f8c] via-[#3a4ba3] to-[#4558b8] p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-md bg-white/15 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
              Binary Classification
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">HistGradientBoostingClassifier</h2>
            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              Built to detect late-delivery risk from order, route, customer, partner and warehouse information.
            </p>
          </div>

          {/* Right Threshold Highlight */}
          <div className="border-l-0 lg:border-l lg:border-white/20 lg:pl-8 flex flex-col justify-center">
            <span className="text-[11px] font-medium text-indigo-200 block">Final operating threshold</span>
            <div className="text-4xl lg:text-5xl font-extrabold text-white mt-0.5 tracking-tight">0.20</div>
            <span className="text-[11px] text-indigo-200/80 mt-1 block">
              Late when predicted probability ≥ threshold
            </span>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>
      </div>

      {/* 4 Evaluation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Accuracy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">45.23%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Accuracy</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
              Test Evaluation
            </span>
          </div>
        </div>

        {/* Metric 2: Precision */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">32.21%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Precision</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
              Test Evaluation
            </span>
          </div>
        </div>

        {/* Metric 3: Recall */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">86.64%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Recall</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
              Test Evaluation
            </span>
          </div>
        </div>

        {/* Metric 4: F1 Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">46.96%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">F1 score</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
              Test Evaluation
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Architecture + Feature Contract */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Architecture Pipeline Flow (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Architecture</span>
            <h3 className="text-lg font-bold text-slate-900">From data to decision</h3>
            <p className="text-xs text-slate-400 mb-8">The planned prediction flow.</p>

            {/* Stepper Flow */}
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center min-w-[650px] relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0"></div>

                {pipelineSteps.map((step) => (
                  <div key={step.num} className="flex-1 flex flex-col items-center relative z-10 text-center px-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-transform ${
                      step.active
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md scale-110'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {step.num}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 mt-2 max-w-[70px] leading-tight">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <span>Production inference utilizes the serialized scikit-learn pipeline directly.</span>
            <span className="font-semibold text-slate-700">Pipeline Version: 1.6</span>
          </div>
        </div>

        {/* Feature Contract (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feature Contract</span>
            <h3 className="text-lg font-bold text-slate-900">21 model features</h3>
            <p className="text-xs text-slate-400 mb-4">Exact names reserved for the prediction API.</p>

            {/* Accordion 1: Categorical */}
            <div className="mb-4">
              <button
                onClick={() => setShowCategorical(!showCategorical)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 py-1.5 border-b border-slate-100"
              >
                <span>Categorical features ({categoricalFeatures.length})</span>
                {showCategorical ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {showCategorical && (
                <div className="flex flex-wrap gap-1.5 pt-2.5">
                  {categoricalFeatures.map((f) => (
                    <span key={f} className="px-2 py-1 rounded-md bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-mono text-[10px]">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 2: Numerical */}
            <div>
              <button
                onClick={() => setShowNumerical(!showNumerical)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 py-1.5 border-b border-slate-100"
              >
                <span>Numerical features ({numericalFeatures.length})</span>
                {showNumerical ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {showNumerical && (
                <div className="flex flex-wrap gap-1.5 pt-2.5 max-h-40 overflow-y-auto">
                  {numericalFeatures.map((f) => (
                    <span key={f} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[10px]">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100">
            All 21 features validated against Pydantic schema on every request.
          </div>
        </div>
      </div>

      {/* Risk Bands & Operating Threshold Documentation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decision Logic</span>
            <h3 className="text-base font-bold text-slate-900">Operating Decision Threshold vs. Application Risk Bands</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
            Binary Classification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-emerald-800">Low Risk</span>
              <span className="font-mono font-bold text-emerald-700">&lt; 0.20</span>
            </div>
            <p className="text-slate-600 leading-snug">
              <strong>Model Prediction: On-Time (0).</strong> Probability is below the 0.20 operating threshold.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-800">Moderate Risk</span>
              <span className="font-mono font-bold text-amber-700">0.20 – 0.39</span>
            </div>
            <p className="text-slate-600 leading-snug">
              <strong>Model Prediction: Late Delivery (1).</strong> Exceeds the 0.20 threshold with moderate confidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-rose-800">High Risk</span>
              <span className="font-mono font-bold text-rose-700">≥ 0.40</span>
            </div>
            <p className="text-slate-600 leading-snug">
              <strong>Model Prediction: Late Delivery (1).</strong> Exceeds the application-defined high-risk display threshold.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
          <strong>Important Clarification:</strong> The underlying ML model (<code className="font-mono text-slate-700">HistGradientBoostingClassifier</code>) was trained strictly as a <strong>binary classifier</strong> on target <code className="font-mono text-slate-700">late_delivery</code> (0 = On-Time, 1 = Late). The <strong>0.20</strong> threshold is the model's saved operating decision boundary. The <strong>0.40</strong> boundary is an application-defined visualization tier for operational triage; the ML model itself was not trained with three classes.
        </div>
      </div>

      {/* Bottom Info / Metrics Interpretation Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#fffcf0] border border-amber-200/70 flex items-start gap-3 text-xs text-amber-950/80">
        <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-900 block">How to read these metrics</span>
          <p className="leading-relaxed">
            Accuracy is not the primary metric because the dataset contains approximately 72% on-time and 28% late deliveries. Recall and F1 are particularly important for the late-delivery detection objective. Metrics describe the current test evaluation, not guaranteed future production performance. The 0.20 threshold was deliberately selected to emphasize catching late deliveries early, resulting in acceptable trade-offs with false positives.
          </p>
        </div>
      </div>

      {/* Author & Project Ownership Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-lg text-white shadow-md shadow-indigo-500/30 shrink-0 ring-2 ring-indigo-400/30">
            PS
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight">Prakhar Sharma</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 tracking-wide uppercase">
                Creator & ML Engineer
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              End-to-end architect of the DeliveryAI system: synthetic data modeling, categorical pipelines with OneHotEncoding, HistGradientBoostingClassifier training, precision-recall threshold optimization, asynchronous FastAPI backend, and React SaaS telemetry interface.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Machine Learning Pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>FastAPI REST Service</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>React + Tailwind UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
