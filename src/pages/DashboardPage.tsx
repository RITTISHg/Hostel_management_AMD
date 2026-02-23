import React from 'react';
import UsageCard from '../components/cards/UsageCard';
import CostCO2Card from '../components/cards/CostCO2Card';
import BaselineChart from '../components/charts/BaselineChart';
import HeatmapGrid from '../components/charts/HeatmapGrid';
import NudgeCard from '../components/nudges/NudgeCard';
import LeaderboardTable from '../components/gamification/LeaderboardTable';
import ScoreRing from '../components/gamification/ScoreRing';
import StreakBadge from '../components/gamification/StreakBadge';
import { useRole } from '../context/RoleContext';
import { useRealtimeData } from '../data/wsSimulator';
import {
    energyUsageData, waterUsageData,
    energyBaselineChart, waterBaselineChart,
    heatmapData, nudgesData, costCO2Summary,
    leaderboardData, getStudentZones, getLabZones,
} from '../data/mockData';

export default function DashboardPage() {
    const { role } = useRole();
    const energyData = useRealtimeData(energyUsageData, 'energy');
    const waterData = useRealtimeData(waterUsageData, 'water');

    // Role-based filtering
    const filterByRole = <T extends { zone?: string }>(items: T[], zoneKey: keyof T = 'zone' as keyof T): T[] => {
        if (role === 'facilityManager') return items;
        const zones = role === 'student' ? getStudentZones() : getLabZones();
        return items.filter((item) => {
            const val = item[zoneKey];
            return typeof val === 'string' && zones.some((z) => val.includes(z.split(' — ')[0]) || val.includes(z));
        });
    };

    const filteredEnergy = filterByRole(energyData);
    const filteredWater = filterByRole(waterData);
    const filteredNudges = role === 'facilityManager'
        ? nudgesData
        : nudgesData.filter((n) => {
            const zones = role === 'student' ? getStudentZones() : getLabZones();
            return zones.some((z) => n.zone.includes(z.split(' — ')[0]));
        });

    const roleTitle = {
        student: '🎓 Your Hostel',
        labInCharge: '🔬 Lab Overview',
        facilityManager: '🏢 Campus Overview',
    };

    // Pick a score for the current role
    const myScore = role === 'student' ? 72 : role === 'labInCharge' ? 85 : 81;
    const myStreak = role === 'student' ? 5 : role === 'labInCharge' ? 8 : 12;

    return (
        <div className="space-y-6">
            {/* Section: Summary bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {roleTitle[role]}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Real-time energy & water monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <StreakBadge streak={myStreak} />
                    <div className="glass-card px-3 py-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                        <span className="w-2 h-2 bg-rag-green rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Cost / CO₂ */}
            {(role === 'facilityManager' || role === 'labInCharge') && (
                <CostCO2Card data={costCO2Summary} />
            )}

            {/* Energy Cards */}
            <section>
                <h2 className="section-title mb-3">⚡ Energy Consumption</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEnergy.map((d, i) => (
                        <UsageCard key={d.id} data={d} index={i} />
                    ))}
                </div>
            </section>

            {/* Water Cards */}
            <section>
                <h2 className="section-title mb-3">💧 Water Consumption</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWater.map((d, i) => (
                        <UsageCard key={d.id} data={d} index={i} />
                    ))}
                </div>
            </section>

            {/* Charts — Baseline vs Current */}
            {role !== 'student' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <BaselineChart data={energyBaselineChart} title="Energy — Baseline vs Current" unit="kWh" />
                    <BaselineChart data={waterBaselineChart} title="Water — Baseline vs Current" unit="kL" />
                </div>
            )}

            {/* Eco Score + Top Nudges side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <ScoreRing score={myScore} label={role === 'student' ? 'Your Eco Score' : 'Campus Eco Score'} />
                </div>
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="section-title">🔔 Top Nudges</h2>
                    {filteredNudges.slice(0, 3).map((n, i) => (
                        <NudgeCard key={n.id} nudge={n} index={i} />
                    ))}
                </div>
            </div>

            {/* Leaderboard (compact) — only for facility manager and student */}
            {role !== 'labInCharge' && (
                <LeaderboardTable data={leaderboardData} compact />
            )}
        </div>
    );
}
