import React from 'react';
import { Flame } from 'lucide-react';

interface Props {
    streak: number;
    label?: string;
}

export default function StreakBadge({ streak, label = 'Day Streak' }: Props) {
    if (streak === 0) return null;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
      bg-orange-50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-700/30
      flame-glow cursor-default transition-all"
        >
            <Flame className="w-5 h-5 text-orange-500 animate-pulse-slow" />
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {streak}
                </span>
                <span className="text-[9px] text-orange-500/70 uppercase tracking-wider font-medium">
                    {label}
                </span>
            </div>
        </div>
    );
}
