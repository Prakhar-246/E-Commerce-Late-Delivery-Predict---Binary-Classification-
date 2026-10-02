import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../api/client';

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcome, setOutcome] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({
        search,
        outcome,
        sort,
        limit: 50,
      });
      setHistory(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [outcome, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = [
      'Prediction ID', 'Date', 'Source City', 'Destination City', 'Category',
      'Weight (kg)', 'Order Value', 'Distance (km)', 'Promised Hours',
      'Vehicle', 'Rating', 'Risk Score', 'Prediction', 'Label', 'Risk Band'
    ];

    const rows = history.map((r) => [
      r.id,
      r.created_at,
      r.source_city,
      r.destination_city,
      r.product_category,
      r.product_weight_kg,
      r.order_value,
      r.distance_km,
      r.promised_delivery_hours,
      r.vehicle_type,
      r.rating,
      r.risk_score,
      r.prediction,
      r.label,
      r.risk_band,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `deliveryai_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all persisted prediction history?')) {
      try {
        await api.clearHistory();
        fetchHistory();
      } catch (err) {
        alert('Failed to clear history: ' + (err.detail || err.message));
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Log</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Prediction history</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Persisted model requests with live search, filters, sorting, export, and shareable reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs font-medium text-emerald-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span><strong>Live history</strong> — records are loaded from the DeliveryAI prediction store.</span>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prediction ID, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs focus:outline-hidden"
          >
            <option value="all">All outcomes</option>
            <option value="late">Late Delivery</option>
            <option value="on-time">On-Time Delivery</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs focus:outline-hidden"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest_risk">Highest risk</option>
            <option value="lowest_risk">Lowest risk</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Prediction ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Order Value</th>
                <th className="py-3.5 px-4">Distance</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Prediction</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && history.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Loading prediction history...</span>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No persisted predictions yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Once the connected model saves a result, it will appear here for filtering and sharing.
                    </p>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 capitalize">{item.source_city}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className="font-semibold text-slate-800 capitalize">{item.destination_city}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      ₹{item.order_value?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.distance_km} km
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${item.risk_score >= 0.20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {(item.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        item.prediction === 1 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.label || (item.prediction === 1 ? 'Late Delivery' : 'On-Time')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-500 font-medium">{item.status || 'Completed'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3.5 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {history.length} of {total} persisted predictions
          </span>
          <div className="flex items-center gap-2">
            <button disabled className="p-1 rounded-md border border-slate-200 opacity-50 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">Page 1 of 1</span>
            <button disabled className="p-1 rounded-md border border-slate-200 opacity-50 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prediction Details</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedRecord.id}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase">Route</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedRecord.source_city} → {selectedRecord.destination_city}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase">Outcome</span>
                <span className={`font-bold ${selectedRecord.prediction === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedRecord.label} ({(selectedRecord.risk_score * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase">Distance & SLA</span>
                <span className="font-semibold text-slate-800">
                  {selectedRecord.distance_km} km / {selectedRecord.promised_delivery_hours}h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase">Product</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedRecord.product_category} ({selectedRecord.product_weight_kg} kg)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase">Vehicle & Partner</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedRecord.vehicle_type} (Rating: {selectedRecord.rating})
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase">Warehouse</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedRecord.warehouse_type}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
