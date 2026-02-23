import React from 'react';
import { Zap, Droplets, TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import RAGIndicator, { getRAGStatus } from '../ui/RAGIndicator';
import StatNumber from '../ui/StatNumber';
import type { UsageSnapshot } from '../../types';

interface Props {
    data: UsageSnapshot;
    index?: number;
}

export default function UsageCard({ data, index = 0 }: Props) {
    const { zone, type, current, baseline, unit, trend } = data;
    const status = getRAGStatus(current, baseline);
    const delta = ((current - baseline) / baseline) * 100;
    const isOver = delta > 0;

    const chartData = trend.map((v, i) => ({ i, v }));

    const statusColors = {
        green: { border: 'border-rag-green/30', spark: '#10B981' },
        amber: { border: 'border-rag-amber/30', spark: '#F59E0B' },
        red: { border: 'border-rag-red/30', spark: '#EF4444' },
    };

    return (
        <div
            className={`glass-card p-5 animate-slide-up ${statusColors[status].border} border-l-4`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {type === 'energy' ? (
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    ) : (
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {type === 'energy' ? 'Energy' : 'Water'}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
                            {zone}
                        </p>
                    </div>
                </div>
                <RAGIndicator status={status} size="lg" />
            </div>

            {/* Value */}
            <div className="mb-1">
                <StatNumber
                    value={current}
                    suffix={` ${unit}`}
                    decimals={type === 'water' ? 1 : 0}
                    className="text-2xl text-gray-900 dark:text-white"
                />
            </div>

            {/* Delta */}
            <div className="flex items-center gap-1 mb-3">
                {isOver ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rag-red" />
                ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rag-green" />
                )}
                <span className={`text-xs font-semibold ${isOver ? 'text-rag-red' : 'text-rag-green'}`}>
                    {isOver ? '+' : ''}{delta.toFixed(1)}% vs baseline
                </span>
            </div>

            {/* Sparkline */}
            <div className="h-12 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`spark-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={statusColors[status].spark} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={statusColors[status].spark} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={statusColors[status].spark}
                            strokeWidth={2}
                            fill={`url(#spark-${data.id})`}
                            dot={false}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
