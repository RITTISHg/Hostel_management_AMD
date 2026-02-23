import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Loader2, Zap, Clock } from 'lucide-react';
import { getAnomalies, type AnomalyResponse, type AnomalyItem } from '../services/mlApi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';
import StatNumber from '../components/ui/StatNumber';

export default function AnomaliesPage() {
    const [data, setData] = useState<AnomalyResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnomalies('all', 72).then((d) => {
            setData(d);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm text-gray-500">Scanning for anomalies...</p>
            </div>
        );
    }

    if (!data) return null;

    const severityColors: Record<string, string> = {
        high: '#EF4444',
        medium: '#F59E0B',
        low: '#10B981',
    };

    // Chart: anomalies by hour
    const hourBuckets = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: data.anomalies.filter((a) => a.hour === i).length,
        waste: data.anomalies.filter((a) => a.hour === i).reduce((s, a) => s + a.estimatedWaste, 0),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-7 h-7 text-rag-red" />
                    Anomaly Detection
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Isolation Forest analysis of the last 72 hours
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 animate-slide-up border-l-4 border-brand-500">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Data Points</p>
                    <StatNumber value={data.totalDataPoints} className="text-2xl text-gray-900 dark:text-white" />
                </div>
                <div className="glass-card p-4 animate-slide-up border-l-4 border-rag-red" style={{ animationDelay: '80ms' }}>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Anomalies Found</p>
                    <StatNumber value={data.anomalyCount} className="text-2xl text-rag-red" />
                    <p className="text-[10px] text-gray-400 mt-0.5">{data.anomalyRate}% of all data</p>
                </div>
                <div className="glass-card p-4 animate-slide-up border-l-4 border-rag-amber" style={{ animationDelay: '160ms' }}>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Est. Waste</p>
                    <StatNumber value={data.summary.totalEstimatedWaste} prefix="₹" className="text-2xl text-rag-amber" />
                </div>
                <div className="glass-card p-4 animate-slide-up border-l-4 border-rag-green" style={{ animationDelay: '240ms' }}>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Severity Breakdown</p>
                    <div className="flex gap-3 mt-1">
                        <span className="text-xs font-bold text-rag-red">🔴 {data.summary.highCount}</span>
                        <span className="text-xs font-bold text-rag-amber">🟡 {data.summary.mediumCount}</span>
                        <span className="text-xs font-bold text-rag-green">🟢 {data.summary.lowCount}</span>
                    </div>
                </div>
            </div>

            {/* Anomaly Distribution Chart */}
            <div className="glass-card p-5 animate-slide-up">
                <h3 className="section-title mb-1">Anomaly Distribution by Hour</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">When do anomalies happen most?</p>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourBuckets} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                                tickFormatter={(h) => `${String(h).padStart(2, '0')}`} />
                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#F1F5F9', fontSize: 11 }}
                                formatter={(v: number, name: string) => [v, name === 'count' ? 'Anomalies' : '₹ Waste']} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {hourBuckets.map((entry, index) => (
                                    <Cell key={index} fill={entry.count > 0 ? '#EF4444' : '#374151'} opacity={entry.count > 0 ? 0.8 : 0.2} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Anomaly List */}
            <div className="space-y-3">
                <h3 className="section-title">Detected Anomalies</h3>
                {data.anomalies.map((a, i) => (
                    <AnomalyCard key={i} anomaly={a} index={i} />
                ))}
            </div>
        </div>
    );
}

function AnomalyCard({ anomaly, index }: { anomaly: AnomalyItem; index: number }) {
    const severityBorder = {
        high: 'border-rag-red',
        medium: 'border-rag-amber',
        low: 'border-rag-green',
    };

    return (
        <div className={`glass-card p-4 animate-slide-up border-l-4 ${severityBorder[anomaly.severity]}`}
            style={{ animationDelay: `${index * 60}ms` }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${anomaly.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                            anomaly.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                'bg-green-100 dark:bg-green-900/30'
                        }`}>
                        <AlertTriangle className={`w-4 h-4 ${anomaly.severity === 'high' ? 'text-rag-red' :
                                anomaly.severity === 'medium' ? 'text-rag-amber' :
                                    'text-rag-green'
                            }`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{anomaly.zone}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{String(anomaly.hour).padStart(2, '0')}:00</span>
                            <span className={`badge badge-${anomaly.severity}`}>{anomaly.severity}</span>
                            <span>{anomaly.type === 'spike' ? '📈' : '📉'} {anomaly.type}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Actual</p>
                        <p className="text-sm font-bold font-mono text-gray-800 dark:text-gray-200">{anomaly.actual.toFixed(1)} kWh</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Expected</p>
                        <p className="text-sm font-mono text-gray-500">{anomaly.expected.toFixed(1)} kWh</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Deviation</p>
                        <p className={`text-sm font-bold font-mono ${anomaly.deviation > 0 ? 'text-rag-red' : 'text-rag-green'}`}>
                            {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(0)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Waste</p>
                        <p className="text-sm font-bold font-mono text-rag-amber">₹{anomaly.estimatedWaste.toFixed(0)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
