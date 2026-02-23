import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import type { BaselineChartDatum } from '../../types';

interface Props {
    data: BaselineChartDatum[];
    title: string;
    unit: string;
}

export default function BaselineChart({ data, title, unit }: Props) {
    const [activeBar, setActiveBar] = useState<string | null>(null);

    return (
        <div className="glass-card p-5 animate-slide-up">
            <h3 className="section-title mb-1">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Current vs Baseline ({unit})
            </p>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <XAxis
                            dataKey="zone"
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.9)',
                                border: 'none',
                                borderRadius: 12,
                                color: '#F1F5F9',
                                fontSize: 12,
                                backdropFilter: 'blur(8px)',
                            }}
                            formatter={(value: number, name: string) => [
                                `${value} ${unit}`,
                                name === 'current' ? 'Current' : 'Baseline',
                            ]}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 12 }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="current"
                            fill="#6366F1"
                            radius={[6, 6, 0, 0]}
                            name="Current"
                            opacity={0.85}
                        />
                        <Bar
                            dataKey="baseline"
                            fill="#94A3B8"
                            radius={[6, 6, 0, 0]}
                            name="Baseline"
                            opacity={0.5}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
