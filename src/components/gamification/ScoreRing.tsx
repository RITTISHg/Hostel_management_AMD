import React from 'react';

interface Props {
    score: number;
    size?: number;
    label?: string;
}

export default function ScoreRing({ score, size = 120, label = 'Eco Score' }: Props) {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    const bgGradient = score >= 80
        ? 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10'
        : score >= 60
            ? 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10'
            : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10';

    return (
        <div className={`glass-card p-5 flex flex-col items-center animate-slide-up`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background ring */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth={strokeWidth}
                    />
                    {/* Score ring */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="score-ring-anim"
                        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                        {score}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                        / 100
                    </span>
                </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">
                {score >= 80 ? '🌟 Excellent!' : score >= 60 ? '👍 Good progress' : '⚠️ Needs attention'}
            </p>
        </div>
    );
}
