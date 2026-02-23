import React, { useState } from 'react';
import BaselineChart from '../components/charts/BaselineChart';
import HeatmapGrid from '../components/charts/HeatmapGrid';
import {
    energyBaselineChart, waterBaselineChart, heatmapData,
} from '../data/mockData';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Generate 7-day trend data
const dailyTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    energy: Math.round(800 + Math.random() * 400),
    water: Math.round(15 + Math.random() * 10),
}));

export default function AnalyticsPage() {
    const [tab, setTab] = useState<'energy' | 'water'>('energy');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detailed trends, comparisons, and heatmap analysis
                </p>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-surface-dark-hover rounded-xl p-1 w-fit">
                <button
                    onClick={() => setTab('energy')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${tab === 'energy' ? 'bg-white dark:bg-surface-dark-card shadow-sm text-brand-600' : 'text-gray-500'}`}
                >
                    ⚡ Energy
                </button>
                <button
                    onClick={() => setTab('water')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${tab === 'water' ? 'bg-white dark:bg-surface-dark-card shadow-sm text-brand-600' : 'text-gray-500'}`}
                >
                    💧 Water
                </button>
            </div>

            {/* Charts */}
            <BaselineChart
                data={tab === 'energy' ? energyBaselineChart : waterBaselineChart}
                title={tab === 'energy' ? 'Energy — Baseline vs Current' : 'Water — Baseline vs Current'}
                unit={tab === 'energy' ? 'kWh' : 'kL'}
            />

            {/* 7-day Trend */}
            <div className="glass-card p-5 animate-slide-up">
                <h3 className="section-title mb-1">Weekly Trend</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Last 7 days — {tab === 'energy' ? 'Energy (kWh)' : 'Water (kL)'}
                </p>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12,
                                    color: '#F1F5F9', fontSize: 12,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey={tab}
                                stroke="#6366F1"
                                strokeWidth={2}
                                fill="url(#trendFill)"
                                dot={{ fill: '#6366F1', r: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Heatmap */}
            <HeatmapGrid data={heatmapData} />
        </div>
    );
}
