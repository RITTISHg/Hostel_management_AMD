import React, { useEffect, useState } from 'react';
import { Lightbulb, Sparkles, TrendingDown, Loader2, IndianRupee, Leaf } from 'lucide-react';
import {
    getRecommendations, getSavingsPotential,
    type RecommendationResponse, type SavingsResponse,
} from '../services/mlApi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Legend,
} from 'recharts';
import StatNumber from '../components/ui/StatNumber';

export default function InsightsPage() {
    const [recs, setRecs] = useState<RecommendationResponse | null>(null);
    const [savings, setSavings] = useState<SavingsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getRecommendations(), getSavingsPotential()]).then(([r, s]) => {
            setRecs(r);
            setSavings(s);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm text-gray-500">Generating ML insights...</p>
            </div>
        );
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-7 h-7 text-amber-500" />
                    ML Insights & Savings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-driven recommendations and savings potential analysis
                </p>
            </div>

            {/* Savings Summary */}
            {savings && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="glass-card p-5 animate-slide-up bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/20 dark:to-transparent border-l-4 border-rag-green">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-800/30">
                                    <IndianRupee className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Savings Potential
                                </p>
                            </div>
                            <StatNumber value={savings.totalSavings} prefix="₹" suffix="/day" className="text-4xl text-emerald-600 dark:text-emerald-400" />
                            <p className="text-xs text-gray-400 mt-1">Achievable with ML-optimized schedules</p>
                        </div>
                        <div className="glass-card p-5 animate-slide-up bg-gradient-to-br from-sky-50 to-transparent dark:from-sky-900/20 dark:to-transparent border-l-4 border-sky-500" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-800/30">
                                    <Leaf className="w-6 h-6 text-sky-600" />
                                </div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    CO₂ Reduction Potential
                                </p>
                            </div>
                            <StatNumber value={savings.totalCO2Reduction} suffix=" kg/day" decimals={1} className="text-4xl text-sky-600 dark:text-sky-400" />
                            <p className="text-xs text-gray-400 mt-1">Equivalent to planting ~6 trees</p>
                        </div>
                    </div>

                    {/* Per-Zone Savings Chart */}
                    <div className="glass-card p-5 animate-slide-up">
                        <h3 className="section-title mb-1">Savings Breakdown by Zone</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Current projected vs optimal target</p>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={savings.zones.map((z) => ({
                                    zone: z.zone.replace('Hostel ', 'H-').replace(' - Floor ', 'F').replace('Lab - ', 'Lab-').replace('Main Building', 'Main'),
                                    current: z.currentProjected,
                                    optimal: z.optimalTarget,
                                    savings: z.savingsPotential,
                                }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                                    <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: '#F1F5F9', fontSize: 11 }} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                                    <Bar dataKey="current" name="Current Projected" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.7} />
                                    <Bar dataKey="optimal" name="Optimal Target" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.7} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Zone Detail Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savings.zones.filter((z) => z.savingsPotential > 0).map((z, i) => (
                            <div key={z.zone} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{z.zone}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Projected</span>
                                        <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">{z.currentProjected} kWh</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Optimal</span>
                                        <span className="font-mono font-semibold text-rag-green">{z.optimalTarget} kWh</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Save</span>
                                        <span className="font-mono font-bold text-emerald-600">₹{z.savingsPotential}/day</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-rag-green to-emerald-400 rounded-full" style={{ width: `${z.confidence * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right">{(z.confidence * 100).toFixed(0)}% confidence</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Recommendations */}
            {recs && (
                <div className="space-y-3">
                    <h3 className="section-title flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        AI Recommendations
                    </h3>
                    {recs.recommendations
                        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                        .map((rec, i) => (
                            <div key={i} className={`glass-card p-4 animate-slide-up border-l-4 ${rec.priority === 'high' ? 'border-rag-red' : rec.priority === 'medium' ? 'border-rag-amber' : 'border-rag-green'
                                }`} style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge badge-${rec.priority}`}>{rec.priority}</span>
                                            <span className="text-[10px] font-mono text-gray-400 uppercase">{rec.type}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rec.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rec.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-emerald-600">₹{rec.estimatedSaving}</p>
                                            <p className="text-[10px] text-gray-400">est. saving</p>
                                        </div>
                                        <button className="btn-primary text-xs whitespace-nowrap">{rec.action.length > 25 ? rec.action.substring(0, 25) + '...' : rec.action}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
