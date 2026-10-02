import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  MapPin, 
  User, 
  Truck, 
  Warehouse, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Gauge, 
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { api } from '../api/client';

// Approximate road distances (km) between Indian cities for auto-calculation
const CITY_DISTANCES = {
  ahmedabad: { ahmedabad: 25, bengaluru: 1500, chennai: 1750, delhi: 930, hyderabad: 1220, indore: 390, jaipur: 670, kolkata: 1950, mumbai: 530, pune: 660 },
  bengaluru: { ahmedabad: 1500, bengaluru: 25, chennai: 350, delhi: 2160, hyderabad: 570, indore: 1400, jaipur: 2000, kolkata: 1870, mumbai: 980, pune: 840 },
  chennai: { ahmedabad: 1750, bengaluru: 350, chennai: 25, delhi: 2200, hyderabad: 630, indore: 1520, jaipur: 2100, kolkata: 1660, mumbai: 1330, pune: 1180 },
  delhi: { ahmedabad: 930, bengaluru: 2160, chennai: 2200, delhi: 25, hyderabad: 1570, indore: 820, jaipur: 280, kolkata: 1500, mumbai: 1420, pune: 1440 },
  hyderabad: { ahmedabad: 1220, bengaluru: 570, chennai: 630, delhi: 1570, hyderabad: 25, indore: 860, jaipur: 1480, kolkata: 1490, mumbai: 710, pune: 560 },
  indore: { ahmedabad: 390, bengaluru: 1400, chennai: 1520, delhi: 820, hyderabad: 860, indore: 25, jaipur: 590, kolkata: 1540, mumbai: 580, pune: 600 },
  jaipur: { ahmedabad: 670, bengaluru: 2000, chennai: 2100, delhi: 280, hyderabad: 1480, indore: 590, jaipur: 25, kolkata: 1520, mumbai: 1150, pune: 1280 },
  kolkata: { ahmedabad: 1950, bengaluru: 1870, chennai: 1660, delhi: 1500, hyderabad: 1490, indore: 1540, jaipur: 1520, kolkata: 25, mumbai: 1960, pune: 1850 },
  mumbai: { ahmedabad: 530, bengaluru: 980, chennai: 1330, delhi: 1420, hyderabad: 710, indore: 580, jaipur: 1150, kolkata: 1960, mumbai: 25, pune: 150 },
  pune: { ahmedabad: 660, bengaluru: 840, chennai: 1180, delhi: 1440, hyderabad: 560, indore: 600, jaipur: 1280, kolkata: 1850, mumbai: 150, pune: 25 }
};

const INITIAL_FORM = {
  // Order & Route (7)
  source_city: 'mumbai',
  destination_city: 'delhi',
  product_category: 'electronics',
  product_weight_kg: 3.5,
  order_value: 4500,
  distance_km: 1420,
  promised_delivery_hours: 36,

  // Customer (1)
  customer_type: 'regular',

  // Delivery Partner (5)
  partner_experience_years: 4.0,
  rating: 4.6,
  completed_deliveries: 320,
  vehicle_type: 'truck',
  partner_city: 'mumbai',

  // Warehouse (4)
  warehouse_type: 'fulfillment center',
  capacity_units: 45000,
  staff_count: 80,
  operating_hours: 24,

  // Time (4)
  day_of_week: 3, // Thursday
  month: 7, // July
  is_weekend: 0,
  order_hour: 14,
};

// 4 Tested Presets providing clearly distinct predictions
const PRESETS = [
  {
    id: 'local_express',
    title: 'Local Same-City Express',
    badge: 'On-Time (Low Risk ~15%)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Intra-city bike courier, light parcel, generous 24h window.',
    data: {
      source_city: 'mumbai',
      destination_city: 'mumbai',
      product_category: 'books',
      product_weight_kg: 0.5,
      order_value: 450,
      distance_km: 25,
      promised_delivery_hours: 24,
      customer_type: 'premium',
      partner_experience_years: 6.0,
      vehicle_type: 'bike',
      rating: 4.9,
      completed_deliveries: 850,
      partner_city: 'mumbai',
      warehouse_type: 'fulfillment center',
      capacity_units: 50000,
      staff_count: 100,
      operating_hours: 24,
      day_of_week: 2,
      month: 5,
      is_weekend: 0,
      order_hour: 10
    }
  },
  {
    id: 'regional_fast',
    title: 'Regional Courier Transit',
    badge: 'On-Time (Low Risk ~15%)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Mumbai to Pune corridor (150 km) with dedicated van delivery.',
    data: {
      source_city: 'mumbai',
      destination_city: 'pune',
      product_category: 'clothing',
      product_weight_kg: 1.5,
      order_value: 1800,
      distance_km: 150,
      promised_delivery_hours: 18,
      customer_type: 'regular',
      partner_experience_years: 5.0,
      vehicle_type: 'van',
      rating: 4.8,
      completed_deliveries: 420,
      partner_city: 'mumbai',
      warehouse_type: 'fulfillment center',
      capacity_units: 45000,
      staff_count: 80,
      operating_hours: 24,
      day_of_week: 1,
      month: 6,
      is_weekend: 0,
      order_hour: 11
    }
  },
  {
    id: 'standard_transit',
    title: 'Standard Inter-State Delivery',
    badge: 'Moderate Risk (~34%)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Mumbai to Delhi trunk route (1,420 km) in a 36-hour window.',
    data: {
      source_city: 'mumbai',
      destination_city: 'delhi',
      product_category: 'electronics',
      product_weight_kg: 3.5,
      order_value: 4500,
      distance_km: 1420,
      promised_delivery_hours: 36,
      customer_type: 'regular',
      partner_experience_years: 4.0,
      rating: 4.6,
      completed_deliveries: 320,
      vehicle_type: 'truck',
      partner_city: 'mumbai',
      warehouse_type: 'fulfillment center',
      capacity_units: 45000,
      staff_count: 80,
      operating_hours: 24,
      day_of_week: 3,
      month: 7,
      is_weekend: 0,
      order_hour: 14
    }
  },
  {
    id: 'overloaded_urgent',
    title: 'Overloaded Urgent Freight',
    badge: 'Late Delivery (High Risk ~52%)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Chennai to Delhi (2,200 km) with tight 12h SLA & heavy 45kg load.',
    data: {
      source_city: 'chennai',
      destination_city: 'delhi',
      product_category: 'furniture',
      product_weight_kg: 45.0,
      order_value: 25000,
      distance_km: 2200,
      promised_delivery_hours: 12,
      customer_type: 'new',
      partner_experience_years: 0.5,
      vehicle_type: 'truck',
      rating: 2.3,
      completed_deliveries: 15,
      partner_city: 'chennai',
      warehouse_type: 'sorting hub',
      capacity_units: 10000,
      staff_count: 15,
      operating_hours: 8,
      day_of_week: 5,
      month: 11,
      is_weekend: 1,
      order_hour: 22
    }
  }
];

const CITIES = [
  { value: 'ahmedabad', label: 'Ahmedabad' },
  { value: 'bengaluru', label: 'Bengaluru' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'indore', label: 'Indore' },
  { value: 'jaipur', label: 'Jaipur' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'pune', label: 'Pune' },
];

const CATEGORIES = [
  { value: 'beauty', label: 'Beauty' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'home appliances', label: 'Home Appliances' },
  { value: 'sports', label: 'Sports' },
];

const CUSTOMER_TYPES = [
  { value: 'regular', label: 'Regular Customer' },
  { value: 'premium', label: 'Premium Member' },
  { value: 'new', label: 'New Customer' },
];

const VEHICLE_TYPES = [
  { value: 'bike', label: 'Two-Wheeler / Bike' },
  { value: 'ev', label: 'Electric Vehicle (EV)' },
  { value: 'van', label: 'Light Commercial Van' },
  { value: 'truck', label: 'Heavy Cargo Truck' },
];

const WAREHOUSE_TYPES = [
  { value: 'fulfillment center', label: 'Fulfillment Center' },
  { value: 'distribution center', label: 'Distribution Center' },
  { value: 'sorting hub', label: 'Sorting Hub' },
];

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function PredictDelivery({ onPredictionSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ loaded: false, status: 'checking' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState('standard_transit');

  useEffect(() => {
    async function checkStatus() {
      try {
        const health = await api.checkHealth();
        setBackendHealth({ loaded: health.model_loaded, status: 'connected' });
      } catch (e) {
        setBackendHealth({ loaded: false, status: 'unavailable' });
      }
    }
    checkStatus();
  }, []);

  const handleChange = (field, value) => {
    setActivePreset(null);
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate distance when source or destination city changes
      if (field === 'source_city' || field === 'destination_city') {
        const src = field === 'source_city' ? value : prev.source_city;
        const dst = field === 'destination_city' ? value : prev.destination_city;
        if (CITY_DISTANCES[src] && CITY_DISTANCES[src][dst]) {
          updated.distance_km = CITY_DISTANCES[src][dst];
        }
        if (field === 'source_city') {
          updated.partner_city = value; // Keep partner base city synced
        }
      }

      // Auto-suggest vehicle type if weight changes significantly
      if (field === 'product_weight_kg') {
        const w = parseFloat(value) || 0;
        if (w > 20 && prev.vehicle_type === 'bike') {
          updated.vehicle_type = 'truck';
        } else if (w <= 3 && prev.vehicle_type === 'truck') {
          updated.vehicle_type = 'bike';
        }
      }

      return updated;
    });
  };

  const handleApplyPreset = async (preset) => {
    setActivePreset(preset.id);
    setFormData(preset.data);
    setError(null);
    // Auto-predict on preset selection for instant feedback
    await executePrediction(preset.data);
  };

  const handleUseCurrentTime = () => {
    const now = new Date();
    // JavaScript day: 0=Sun, 1=Mon, ..., 6=Sat -> Model expects: 0=Mon, ..., 6=Sun
    const jsDay = now.getDay();
    const modelDay = (jsDay + 6) % 7;
    const modelMonth = now.getMonth() + 1;
    const isWeekend = modelDay >= 5 ? 1 : 0;
    const hour = now.getHours();

    setFormData((prev) => ({
      ...prev,
      day_of_week: modelDay,
      month: modelMonth,
      is_weekend: isWeekend,
      order_hour: hour,
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setError(null);
    setActivePreset(null);
  };

  const executePrediction = async (dataToPredict) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...dataToPredict,
        product_weight_kg: parseFloat(dataToPredict.product_weight_kg),
        order_value: parseFloat(dataToPredict.order_value),
        distance_km: parseFloat(dataToPredict.distance_km),
        promised_delivery_hours: parseFloat(dataToPredict.promised_delivery_hours),
        partner_experience_years: parseFloat(dataToPredict.partner_experience_years),
        rating: parseFloat(dataToPredict.rating),
        completed_deliveries: parseInt(dataToPredict.completed_deliveries, 10),
        capacity_units: parseInt(dataToPredict.capacity_units, 10),
        staff_count: parseInt(dataToPredict.staff_count, 10),
        operating_hours: parseInt(dataToPredict.operating_hours, 10),
        day_of_week: parseInt(dataToPredict.day_of_week, 10),
        month: parseInt(dataToPredict.month, 10),
        is_weekend: parseInt(dataToPredict.is_weekend, 10),
        order_hour: parseInt(dataToPredict.order_hour, 10),
      };

      const res = await api.predict(payload);
      setResult(res);
      if (onPredictionSuccess) onPredictionSuccess();
    } catch (err) {
      console.error('Prediction request error:', err);
      setError(err.detail || 'Prediction service error. Ensure Python backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executePrediction(formData);
  };

  // Real-time speed pace calculation
  const speedPace = (formData.distance_km / Math.max(formData.promised_delivery_hours, 0.5)).toFixed(1);
  const isPaceFeasible = speedPace < 45;
  const isPaceAggressive = speedPace >= 45 && speedPace < 75;
  const isPaceExtreme = speedPace >= 75;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Delivery Risk Prediction Engine
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Threshold: 0.20
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Assess Delivery Delay Risk
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Trained Machine Learning model evaluating 21 route, partner, order, and warehouse signals.
          </p>
        </div>

        {/* Backend Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            backendHealth.status === 'connected'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              backendHealth.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}></span>
            <span>{backendHealth.status === 'connected' ? 'ML Model: Online' : 'Connecting to API...'}</span>
          </div>
        </div>
      </div>

      {/* Quick Scenario Presets Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Quick Test Scenarios (1-Click Model Run)
            </span>
          </div>
          <span className="text-[11px] text-slate-300">
            Click any scenario to instantly test different outcomes:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white/20 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white truncate">{p.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <div className="mb-1.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Prediction Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Card 1: Core Order & Route (Essential) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Route & Transit Window</h3>
                  <p className="text-[11px] text-slate-400">Distance is automatically estimated between cities</p>
                </div>
              </div>
              <MapPin className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origin City *</label>
                <select
                  value={formData.source_city}
                  onChange={(e) => handleChange('source_city', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                  required
                >
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination City *</label>
                <select
                  value={formData.destination_city}
                  onChange={(e) => handleChange('destination_city', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                  required
                >
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Distance (km) *</label>
                  <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                    Auto-computed
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max="5000"
                  value={formData.distance_km}
                  onChange={(e) => handleChange('distance_km', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Promised Delivery SLA *</label>
                  <span className="text-[10px] text-slate-400">Committed Transit Hours</span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max="240"
                  value={formData.promised_delivery_hours}
                  onChange={(e) => handleChange('promised_delivery_hours', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800 font-semibold"
                  required
                />
              </div>

              {/* Transit Feasibility Live Indicator */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-700">Required Pace: </span>
                    <span className="text-xs font-extrabold text-slate-900">{speedPace} km/h avg</span>
                  </div>
                </div>
                <div>
                  {isPaceFeasible && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Feasible Window (Low Pace Strain)
                    </span>
                  )}
                  {isPaceAggressive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Tight Transit Pace (Elevated Delay Risk)
                    </span>
                  )}
                  {isPaceExtreme && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Extreme Window (Very High Delay Risk)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Package & Customer (Essential) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Package & Customer Profile</h3>
                  <p className="text-[11px] text-slate-400">Order classification and parcel physical weight</p>
                </div>
              </div>
              <User className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Category *</label>
                <select
                  value={formData.product_category}
                  onChange={(e) => handleChange('product_category', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Weight (kg) *</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max="100"
                  value={formData.product_weight_kg}
                  onChange={(e) => handleChange('product_weight_kg', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Value (₹) *</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={formData.order_value}
                  onChange={(e) => handleChange('order_value', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Customer Classification *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CUSTOMER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleChange('customer_type', t.value)}
                      className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                        formData.customer_type === t.value
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Advanced Section: Partner & Warehouse & Time */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center font-bold text-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Advanced Logistics & Operational Signals
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {showAdvanced ? 'Click to hide advanced partner & warehouse parameters' : 'Pre-populated with smart defaults. Click to customize.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {showAdvanced ? 'Collapse' : 'Show 10 Advanced Inputs'}
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
            </button>

            {showAdvanced && (
              <div className="p-5 sm:p-6 space-y-5 border-t border-slate-100 bg-white">
                {/* Partner Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Delivery Partner Signals</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Vehicle Type</label>
                      <select
                        value={formData.vehicle_type}
                        onChange={(e) => handleChange('vehicle_type', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        {VEHICLE_TYPES.map((v) => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Experience (years)</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="40"
                        value={formData.partner_experience_years}
                        onChange={(e) => handleChange('partner_experience_years', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Driver Rating (1.0-5.0)</label>
                      <input
                        type="number"
                        step="any"
                        min="1.0"
                        max="5.0"
                        value={formData.rating}
                        onChange={(e) => handleChange('rating', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Warehouse Details */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Warehouse Hub Signals</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Warehouse Facility</label>
                      <select
                        value={formData.warehouse_type}
                        onChange={(e) => handleChange('warehouse_type', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        {WAREHOUSE_TYPES.map((w) => (
                          <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Staff Count</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.staff_count}
                        onChange={(e) => handleChange('staff_count', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Daily Operating Hours</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={formData.operating_hours}
                        onChange={(e) => handleChange('operating_hours', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Time & Schedule */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Temporal & Schedule Signals</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleUseCurrentTime}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Sync Current Date & Time
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                      <select
                        value={formData.day_of_week}
                        onChange={(e) => {
                          const d = parseInt(e.target.value, 10);
                          handleChange('day_of_week', d);
                          handleChange('is_weekend', d >= 5 ? 1 : 0);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        {DAYS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Month</label>
                      <select
                        value={formData.month}
                        onChange={(e) => handleChange('month', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Weekend Status</label>
                      <select
                        value={formData.is_weekend}
                        onChange={(e) => handleChange('is_weekend', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <option value={0}>Weekday (Mon-Fri)</option>
                        <option value={1}>Weekend (Sat-Sun)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Order Placement Hour</label>
                      <select
                        value={formData.order_hour}
                        onChange={(e) => handleChange('order_hour', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold"
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all hover:gap-3"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running ML Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Run Delivery Prediction</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right 1 Col: Live Prediction Results & Diagnosis */}
        <div className="space-y-5">
          {/* Result Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Prediction Output
              </h3>
              {result && (
                <span className="text-[10px] font-mono text-slate-400">{result.prediction_id}</span>
              )}
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <p className="text-sm font-bold text-slate-700">Evaluating 21 Model Signals...</p>
                <p className="text-xs text-slate-400">Comparing calculated probability against 0.20 threshold</p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Ready to Predict</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Click a quick preset above or hit "Run Delivery Prediction" to see the trained ML model in action.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Connection or Inference Error</span>
                </div>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => executePrediction(formData)}
                  className="mt-2 text-[11px] font-bold text-rose-700 underline"
                >
                  Retry request
                </button>
              </div>
            )}

            {!loading && result && (
              <div className="mt-4 space-y-5">
                {/* Result Hero Banner */}
                <div className={`p-4 rounded-2xl border text-center transition-all ${
                  result.prediction === 1
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {result.prediction === 1 ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    <span className="text-base font-black tracking-tight">
                      {result.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black">
                      {(result.risk_score * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">delay risk</span>
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 border border-slate-200 shadow-2xs">
                    <span>Classification:</span>
                    <span className={result.prediction === 1 ? 'text-rose-700' : 'text-emerald-700'}>
                      {result.risk_band}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[11px] font-normal text-slate-500">Threshold: {(result.threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Plain-English Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Model Assessment:</p>
                  <p>{result.explanation}</p>
                </div>

                {/* Top Factor Breakdown */}
                {result.factors && result.factors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Influencing Factors
                    </span>
                    <div className="space-y-2">
                      {result.factors.map((f, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-white text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div>
                            <span className="font-bold text-slate-800 block text-[11px]">{f.name}</span>
                            <span className="text-[11px] text-slate-500">{f.detail}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            f.importance === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {f.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
