import React from 'react';
import { Trophy, Flame, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';

interface Props {
    data: LeaderboardEntry[];
    compact?: boolean;
}

const rankColors = ['', 'text-yellow-500', 'text-gray-400', 'text-amber-700'];
const rankBg = ['', 'bg-yellow-50 dark:bg-yellow-900/20', 'bg-gray-50 dark:bg-gray-800/30', 'bg-amber-50 dark:bg-amber-900/20'];

export default function LeaderboardTable({ data, compact = false }: Props) {
    const rows = compact ? data.slice(0, 5) : data;

    return (
        <div className="glass-card overflow-hidden animate-slide-up">
            <div className="p-5 pb-0">
                <h3 className="section-title flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Sustainability Leaderboard
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
                    This month's rankings
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                            <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Rank
                            </th>
                            <th className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Zone
                            </th>
                            <th className="text-center px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Score
                            </th>
                            <th className="text-center px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Streak
                            </th>
                            <th className="text-center px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Badges
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((entry) => (
                            <tr
                                key={entry.rank}
                                className={`border-b border-gray-100/50 dark:border-gray-800/50 transition-colors
                  hover:bg-brand-50/50 dark:hover:bg-brand-900/10
                  ${rankBg[entry.rank] || ''}`}
                            >
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        {entry.rank <= 3 ? (
                                            <Medal className={`w-5 h-5 ${rankColors[entry.rank]}`} />
                                        ) : (
                                            <span className="w-5 text-center font-mono text-gray-400 text-xs">
                                                {entry.rank}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                            style={{ backgroundColor: entry.avatarColor }}
                                        >
                                            {entry.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                                                {entry.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400">{entry.zone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <ScoreRingSmall score={entry.score} />
                                </td>
                                <td className="px-3 py-3 text-center">
                                    {entry.streak > 0 ? (
                                        <div className="inline-flex items-center gap-1 flame-glow cursor-default">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                {entry.streak}d
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-center text-base">
                                    {entry.badges.length > 0
                                        ? entry.badges.join(' ')
                                        : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ScoreRingSmall({ score }: { score: number }) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

    return (
        <div className="inline-flex items-center justify-center relative" title={`Score: ${score}/100`}>
            <svg width="40" height="40" className="-rotate-90">
                <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor"
                    className="text-gray-200 dark:text-gray-700" strokeWidth="3" />
                <circle cx="20" cy="20" r={radius} fill="none" stroke={color}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="score-ring-anim" />
            </svg>
            <span className="absolute text-[10px] font-bold text-gray-700 dark:text-gray-300">
                {score}
            </span>
        </div>
    );
}
