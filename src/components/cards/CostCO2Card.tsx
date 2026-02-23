import React from 'react';
import { IndianRupee, Cloud, TrendingUp, TrendingDown } from 'lucide-react';
import StatNumber from '../ui/StatNumber';
import type { CostCO2Summary } from '../../types';

interface Props {
    data: CostCO2Summary;
}

export default function CostCO2Card({ data }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cost Card */}
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Today's Cost
                        </p>
                    </div>
                </div>
                <StatNumber
                    value={data.totalCostToday}
                    prefix={data.currency}
                    className="text-3xl text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-1 mt-2">
                    {data.costDelta > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-rag-red" />
                    ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-rag-green" />
                    )}
                    <span className={`text-xs font-semibold ${data.costDelta > 0 ? 'text-rag-red' : 'text-rag-green'}`}>
                        {data.costDelta > 0 ? '+' : ''}{data.costDelta}% vs baseline
                    </span>
                </div>
            </div>

            {/* CO₂ Card */}
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/30">
                        <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Today's CO₂
                        </p>
                    </div>
                </div>
                <StatNumber
                    value={data.totalCO2Today}
                    suffix=" kg"
                    className="text-3xl text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-1 mt-2">
                    {data.co2Delta > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-rag-red" />
                    ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-rag-green" />
                    )}
                    <span className={`text-xs font-semibold ${data.co2Delta > 0 ? 'text-rag-red' : 'text-rag-green'}`}>
                        {data.co2Delta > 0 ? '+' : ''}{data.co2Delta}% vs baseline
                    </span>
                </div>
            </div>
        </div>
    );
}
