import React, { useState } from 'react';
import NudgeCard from '../components/nudges/NudgeCard';
import { nudgesData } from '../data/mockData';
import { useRole } from '../context/RoleContext';
import { getStudentZones, getLabZones } from '../data/mockData';
import type { NudgePriority } from '../types';

export default function NudgesPage() {
    const { role } = useRole();
    const [filter, setFilter] = useState<NudgePriority | 'all'>('all');

    const roleNudges = role === 'facilityManager'
        ? nudgesData
        : nudgesData.filter((n) => {
            const zones = role === 'student' ? getStudentZones() : getLabZones();
            return zones.some((z) => n.zone.includes(z.split(' — ')[0]));
        });

    const filtered = filter === 'all' ? roleNudges : roleNudges.filter((n) => n.priority === filter);

    const filters: { key: NudgePriority | 'all'; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'high', label: '🔴 High' },
        { key: 'medium', label: '🟡 Medium' },
        { key: 'low', label: '🟢 Low' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔔 Nudges</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Actionable alerts to reduce waste and save resources
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {filters.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all
              ${filter === key
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                                : 'bg-gray-100 dark:bg-surface-dark-hover text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Nudge cards */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <p className="text-2xl mb-2">🎉</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No nudges for this category — great job!
                        </p>
                    </div>
                ) : (
                    filtered.map((n, i) => (
                        <NudgeCard key={n.id} nudge={n} index={i} />
                    ))
                )}
            </div>
        </div>
    );
}
