import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useRole } from '../context/RoleContext';
import type { Role } from '../types';
import { Moon, Sun, User, Shield, Monitor } from 'lucide-react';

const roleLabels: { key: Role; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'student', label: 'Student', desc: 'View your hostel floor data', icon: <User className="w-5 h-5" /> },
    { key: 'labInCharge', label: 'Lab In-Charge', desc: 'Monitor lab equipment & usage', icon: <Monitor className="w-5 h-5" /> },
    { key: 'facilityManager', label: 'Facility Manager', desc: 'Full campus-wide overview', icon: <Shield className="w-5 h-5" /> },
];

export default function SettingsPage() {
    const { dark, toggle } = useTheme();
    const { role, setRole } = useRole();

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize your dashboard experience
                </p>
            </div>

            {/* Theme */}
            <div className="glass-card p-5">
                <h3 className="section-title mb-3">Appearance</h3>
                <button
                    onClick={toggle}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-dark-hover transition-all"
                >
                    {dark ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {dark ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-xs text-gray-400">
                            Click to switch to {dark ? 'light' : 'dark'} mode
                        </p>
                    </div>
                </button>
            </div>

            {/* Role selector */}
            <div className="glass-card p-5">
                <h3 className="section-title mb-3">Role</h3>
                <div className="space-y-2">
                    {roleLabels.map(({ key, label, desc, icon }) => (
                        <button
                            key={key}
                            onClick={() => setRole(key)}
                            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left
                ${role === key
                                    ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700/50'
                                    : 'hover:bg-gray-50 dark:hover:bg-surface-dark-hover border border-transparent'
                                }`}
                        >
                            <div className={`p-2 rounded-xl ${role === key ? 'bg-brand-100 dark:bg-brand-800/30 text-brand-600' : 'bg-gray-100 dark:bg-surface-dark-hover text-gray-500'}`}>
                                {icon}
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${role === key ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {label}
                                </p>
                                <p className="text-xs text-gray-400">{desc}</p>
                            </div>
                            {role === key && (
                                <div className="ml-auto w-3 h-3 rounded-full bg-brand-500 shadow-md shadow-brand-500/30" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* About */}
            <div className="glass-card p-5">
                <h3 className="section-title mb-2">About</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    <strong>EcoWatch v1.0</strong> — Energy & Water Monitoring Dashboard for campus sustainability.
                    Built with React, TypeScript, Tailwind CSS, and Recharts.
                    All data is simulated via local WebSocket-style intervals for demonstration.
                </p>
            </div>
        </div>
    );
}
