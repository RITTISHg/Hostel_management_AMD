import React from 'react';
import LeaderboardTable from '../components/gamification/LeaderboardTable';
import ScoreRing from '../components/gamification/ScoreRing';
import StreakBadge from '../components/gamification/StreakBadge';
import { leaderboardData } from '../data/mockData';
import { useRole } from '../context/RoleContext';

export default function LeaderboardPage() {
    const { role } = useRole();

    // Simulate "your" position
    const myEntry = role === 'student'
        ? leaderboardData.find((e) => e.name.includes('Hostel A — Floor 1'))
        : role === 'labInCharge'
            ? leaderboardData.find((e) => e.name.includes('Lab'))
            : leaderboardData[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Leaderboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sustainability rankings across all zones
                </p>
            </div>

            {/* Your stats */}
            {myEntry && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ScoreRing score={myEntry.score} label="Your Score" size={100} />
                    <div className="glass-card p-5 flex flex-col items-center justify-center animate-slide-up">
                        <StreakBadge streak={myEntry.streak} />
                        <p className="text-xs text-gray-400 mt-2">Conservation streak</p>
                    </div>
                    <div className="glass-card p-5 flex flex-col items-center justify-center animate-slide-up">
                        <div className="text-4xl font-bold text-gray-900 dark:text-white font-mono">
                            #{myEntry.rank}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Your Rank</p>
                        <div className="flex gap-1 mt-2 text-xl">
                            {myEntry.badges.map((b, i) => (
                                <span key={i}>{b}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Full table */}
            <LeaderboardTable data={leaderboardData} />
        </div>
    );
}
