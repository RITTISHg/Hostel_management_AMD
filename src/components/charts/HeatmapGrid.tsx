import React, { useState } from 'react';
import type { HeatmapCell } from '../../types';

interface Props {
    data: HeatmapCell[];
}

function getHeatColor(value: number): string {
    // 0-100 range → blue(cool) → green → yellow → orange → red(hot)
    if (value < 20) return 'bg-blue-200 dark:bg-blue-900/60';
    if (value < 40) return 'bg-emerald-200 dark:bg-emerald-800/60';
    if (value < 60) return 'bg-yellow-200 dark:bg-yellow-700/60';
    if (value < 80) return 'bg-orange-300 dark:bg-orange-700/60';
    return 'bg-red-400 dark:bg-red-700/70';
}

function getHeatOpacity(value: number): number {
    return 0.4 + (value / 100) * 0.6;
}

export default function HeatmapGrid({ data }: Props) {
    const [tooltip, setTooltip] = useState<{ zone: string; hour: number; value: number } | null>(null);

    const zones = [...new Set(data.map((d) => d.zone))];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="glass-card p-5 animate-slide-up overflow-x-auto">
            <h3 className="section-title mb-1">Consumption Heatmap</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Hourly usage intensity by zone (24h)
            </p>

            {/* Legend */}
            <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-500 dark:text-gray-400">
                <span>Low</span>
                <div className="flex gap-0.5">
                    <span className="w-4 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/60" />
                    <span className="w-4 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-800/60" />
                    <span className="w-4 h-3 rounded-sm bg-yellow-200 dark:bg-yellow-700/60" />
                    <span className="w-4 h-3 rounded-sm bg-orange-300 dark:bg-orange-700/60" />
                    <span className="w-4 h-3 rounded-sm bg-red-400 dark:bg-red-700/70" />
                </div>
                <span>High</span>
            </div>

            <div className="min-w-[640px]">
                {/* Hour labels */}
                <div className="flex">
                    <div className="w-24 flex-shrink-0" />
                    {hours.map((h) => (
                        <div
                            key={h}
                            className="flex-1 text-center text-[9px] text-gray-400 font-mono pb-1"
                        >
                            {h.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>

                {/* Grid rows */}
                {zones.map((zone) => (
                    <div key={zone} className="flex items-center gap-0.5 mb-0.5">
                        <div className="w-24 flex-shrink-0 text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate pr-1">
                            {zone}
                        </div>
                        {hours.map((hour) => {
                            const cell = data.find((d) => d.zone === zone && d.hour === hour);
                            const value = cell?.value ?? 0;
                            return (
                                <div
                                    key={`${zone}-${hour}`}
                                    className={`heat-cell flex-1 ${getHeatColor(value)}`}
                                    style={{ opacity: getHeatOpacity(value) }}
                                    onMouseEnter={() => setTooltip({ zone, hour, value })}
                                    onMouseLeave={() => setTooltip(null)}
                                    aria-label={`${zone} at ${hour}:00 — ${value.toFixed(0)}% capacity`}
                                    role="gridcell"
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-surface-dark-hover rounded-lg px-3 py-1.5 inline-block">
                    <strong>{tooltip.zone}</strong> at <strong>{tooltip.hour}:00</strong> — {tooltip.value.toFixed(0)}% capacity
                </div>
            )}
        </div>
    );
}
