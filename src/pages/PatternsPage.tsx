import React, { useEffect, useState } from 'react';
import { Layers, Loader2 } from 'lucide-react';
import { getPatterns, type PatternResponse, type PatternItem } from '../services/mlApi';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

export default function PatternsPage() {
    const [data, setData] = useState<PatternResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<PatternItem | null>(null);

    useEffect(() => {
        getPatterns().then((d) => {
            setData(d);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm text-gray-500">Classifying consumption patterns...</p>
            </div>
        );
    }

    if (!data) return null;

    const classColors: Record<string, string> = {
        efficient: 'bg-emerald-100 dark:bg-emerald-900/30 border-rag-green text-emerald-700 dark:text-emerald-400',
        normal: 'bg-brand-50 dark:bg-brand-900/30 border-brand-400 text-brand-700 dark:text-brand-400',
        wasteful: 'bg-amber-100 dark:bg-amber-900/30 border-rag-amber text-amber-700 dark:text-amber-400',
        erratic: 'bg-red-100 dark:bg-red-900/30 border-rag-red text-red-700 dark:text-red-400',
    };

    const classIcons: Record<string, string> = {
        efficient: '🌱', normal: '📊', wasteful: '⚠️', erratic: '🔴',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-7 h-7 text-brand-500" />
                    Pattern Analysis
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    K-Means clustering of consumption behavior
                </p>
            </div>

            {/* Cluster Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(data.clusterSummary).map(([key, count], i) => (
                    <div key={key} className={`glass-card p-4 animate-slide-up border-l-4 ${classColors[key]?.split(' ').find(c => c.startsWith('border-')) || ''}`} style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold">{classIcons[key]}</p>
                                <p className="text-xs font-semibold capitalize mt-1 text-gray-700 dark:text-gray-300">{key}</p>
                            </div>
                            <span className="text-3xl font-bold font-mono text-gray-800 dark:text-gray-200">{count}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pattern Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.patterns.map((p, i) => (
                    <button
                        key={p.zone}
                        onClick={() => setSelected(selected?.zone === p.zone ? null : p)}
                        className={`glass-card p-5 text-left animate-slide-up transition-all border-l-4 ${classColors[p.classification]?.split(' ').find(c => c.startsWith('border-')) || ''
                            } ${selected?.zone === p.zone ? 'ring-2 ring-brand-500 scale-[1.02]' : ''}`}
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{p.icon}</span>
                            <span className={`badge ${classColors[p.classification]}`}>
                                {p.classification}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{p.zone}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">{p.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                                <p className="text-gray-400 uppercase">Avg Usage</p>
                                <p className="font-bold font-mono text-gray-700 dark:text-gray-300">{p.avgConsumption} kWh</p>
                            </div>
                            <div>
                                <p className="text-gray-400 uppercase">Variability</p>
                                <p className="font-bold font-mono text-gray-700 dark:text-gray-300">{p.variabilityScore}%</p>
                            </div>
                            <div>
                                <p className="text-gray-400 uppercase">Off-Peak %</p>
                                <p className="font-bold font-mono text-gray-700 dark:text-gray-300">{p.offPeakRatio}%</p>
                            </div>
                            <div>
                                <p className="text-gray-400 uppercase">Confidence</p>
                                <p className="font-bold font-mono text-gray-700 dark:text-gray-300">{(p.confidence * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Radar Chart for selected zone */}
            {selected && (
                <div className="glass-card p-5 animate-slide-up">
                    <h3 className="section-title mb-1">
                        {selected.icon} {selected.zone} — Behavior Profile
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{selected.description}</p>
                    <div className="h-72 max-w-md mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={[
                                { metric: 'Avg Usage', value: Math.min(100, (selected.avgConsumption / 20) * 100), fullMark: 100 },
                                { metric: 'Peak/Trough', value: Math.min(100, (selected.peakTroughRatio / 6) * 100), fullMark: 100 },
                                { metric: 'Off-Peak', value: selected.offPeakRatio, fullMark: 100 },
                                { metric: 'Variability', value: selected.variabilityScore, fullMark: 100 },
                                { metric: 'Wknd Reduction', value: Math.max(0, selected.weekendReduction), fullMark: 100 },
                                { metric: 'Confidence', value: selected.confidence * 100, fullMark: 100 },
                            ]}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                <PolarRadiusAxis angle={30} tick={{ fontSize: 9, fill: '#6B7280' }} domain={[0, 100]} />
                                <Radar name={selected.zone} dataKey="value"
                                    stroke={selected.color} fill={selected.color} fillOpacity={0.25} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
