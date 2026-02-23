import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Brain, TrendingUp, TrendingDown, Minus, Loader2, Cpu } from 'lucide-react';
import StatNumber from '../components/ui/StatNumber';
import { getForecast, type ForecastResponse, type ForecastPoint } from '../services/mlApi';

export default function ForecastPage() {
    const [data, setData] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [zone, setZone] = useState('campus');
    const [hours, setHours] = useState(48);
    const [resource, setResource] = useState<'energy' | 'water'>('energy');

    useEffect(() => {
        setLoading(true);
        getForecast(zone, hours, resource).then((d) => {
            setData(d);
            setLoading(false);
        });
    }, [zone, hours, resource]);

    const trendIcon = data?.trend === 'increasing'
        ? <TrendingUp className="w-5 h-5 text-rag-red" />
        : data?.trend === 'decreasing'
            ? <TrendingDown className="w-5 h-5 text-rag-green" />
            : <Minus className="w-5 h-5 text-gray-400" />;

    const trendColor = data?.trend === 'increasing' ? 'text-rag-red' : data?.trend === 'decreasing' ? 'text-rag-green' : 'text-gray-500';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-7 h-7 text-brand-500" />
                        ML Forecast
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        AI-powered consumption predictions using Ridge Regression
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-2 flex-wrap">
                    <select value={resource} onChange={(e) => setResource(e.target.value as 'energy' | 'water')}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-surface-dark-hover text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-brand-400">
                        <option value="energy">⚡ Energy</option>
                        <option value="water">💧 Water</option>
                    </select>
                    <select value={hours} onChange={(e) => setHours(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-surface-dark-hover text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-brand-400">
                        <option value={24}>24 Hours</option>
                        <option value={48}>48 Hours</option>
                        <option value={72}>72 Hours</option>
                    </select>
                    <select value={zone} onChange={(e) => setZone(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-surface-dark-hover text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-brand-400">
                        <option value="campus">🏫 Entire Campus</option>
                        <option value="Hostel A - Floor 1">Hostel A-F1</option>
                        <option value="Lab - Computer Sci">Lab-CS</option>
                        <option value="Main Building">Main Building</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="glass-card p-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                    <p className="text-sm text-gray-500">Running ML model...</p>
                </div>
            ) : data ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-4 animate-slide-up">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Model</p>
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-brand-500" />
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.modelType}</span>
                            </div>
                        </div>
                        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '80ms' }}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Trend</p>
                            <div className="flex items-center gap-2">
                                {trendIcon}
                                <span className={`text-sm font-bold capitalize ${trendColor}`}>
                                    {data.trend} ({data.trendPercent > 0 ? '+' : ''}{data.trendPercent}%)
                                </span>
                            </div>
                        </div>
                        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '160ms' }}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-brand-500 to-rag-green rounded-full transition-all" style={{ width: `${data.confidence * 100}%` }} />
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{(data.confidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '240ms' }}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Forecast Window</p>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.hoursAhead}h ahead</span>
                        </div>
                    </div>

                    {/* Forecast Chart */}
                    <div className="glass-card p-5 animate-slide-up">
                        <h3 className="section-title mb-1">Predicted vs Baseline</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Shaded area shows 85–115% confidence bounds
                        </p>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.predictions} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="boundGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                                        tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} interval={3} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#F1F5F9', fontSize: 11 }}
                                        formatter={(v: number, name: string) => [
                                            `${v.toFixed(1)} ${resource === 'energy' ? 'kWh' : 'kL'}`,
                                            name === 'predicted' ? '🔮 Predicted' : name === 'baseline' ? '📊 Baseline' : name === 'upperBound' ? '📈 Upper' : '📉 Lower',
                                        ]}
                                    />
                                    <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#boundGrad)" />
                                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="transparent" />
                                    <Area type="monotone" dataKey="baseline" stroke="#94A3B8" strokeWidth={2} strokeDasharray="6 3" fill="none" dot={false} />
                                    <Area type="monotone" dataKey="predicted" stroke="#6366F1" strokeWidth={2.5} fill="url(#predGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="glass-card overflow-hidden animate-slide-up">
                        <div className="p-5 pb-2">
                            <h3 className="section-title">Prediction Details</h3>
                        </div>
                        <div className="overflow-x-auto max-h-64">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-white dark:bg-surface-dark-card">
                                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                                        <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase text-gray-400">Time</th>
                                        <th className="text-right px-3 py-2 text-[10px] font-semibold uppercase text-gray-400">Predicted</th>
                                        <th className="text-right px-3 py-2 text-[10px] font-semibold uppercase text-gray-400">Baseline</th>
                                        <th className="text-right px-3 py-2 text-[10px] font-semibold uppercase text-gray-400">Range</th>
                                        <th className="text-right px-5 py-2 text-[10px] font-semibold uppercase text-gray-400">Delta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.predictions.slice(0, 24).map((p, i) => {
                                        const delta = ((p.predicted - p.baseline) / p.baseline) * 100;
                                        return (
                                            <tr key={i} className="border-b border-gray-100/50 dark:border-gray-800/30 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors">
                                                <td className="px-5 py-2 font-mono text-gray-600 dark:text-gray-400">{String(p.hour).padStart(2, '0')}:00</td>
                                                <td className="px-3 py-2 text-right font-mono font-semibold text-gray-800 dark:text-gray-200">{p.predicted.toFixed(1)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-gray-500">{p.baseline.toFixed(1)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-gray-400">{p.lowerBound.toFixed(1)}–{p.upperBound.toFixed(1)}</td>
                                                <td className={`px-5 py-2 text-right font-mono font-semibold ${delta > 0 ? 'text-rag-red' : 'text-rag-green'}`}>
                                                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
