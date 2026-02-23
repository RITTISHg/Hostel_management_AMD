import React from 'react';
import { Moon, Sun, Bell, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useRole } from '../../context/RoleContext';
import type { Role } from '../../types';

const roleLabels: Record<Role, string> = {
    student: '🎓 Student',
    labInCharge: '🔬 Lab In-Charge',
    facilityManager: '🏢 Facility Manager',
};

export default function Header() {
    const { dark, toggle } = useTheme();
    const { role, setRole } = useRole();

    return (
        <header
            className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-3
        bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl
        border-b border-gray-200/50 dark:border-gray-700/50"
        >
            {/* Left — Page title or mobile brand */}
            <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">E</span>
                </div>
                <span className="font-bold text-brand-600 dark:text-brand-400">EcoWatch</span>
            </div>

            {/* Title — only on desktop */}
            <div className="hidden md:block">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Welcome back 👋
                </h2>
                <p className="text-xs text-gray-400">Campus sustainability at a glance</p>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
                {/* Role Switcher */}
                <div className="relative">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="appearance-none bg-gray-100 dark:bg-surface-dark-hover text-gray-700 dark:text-gray-300
              text-xs font-medium rounded-xl px-3 py-2 pr-7 cursor-pointer
              border border-gray-200/50 dark:border-gray-600/50
              focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
                        aria-label="Switch role"
                    >
                        {Object.entries(roleLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>

                {/* Dark mode toggle */}
                <button
                    onClick={toggle}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-surface-dark-hover text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notification bell */}
                <button
                    className="p-2 rounded-xl bg-gray-100 dark:bg-surface-dark-hover text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600 transition-all relative"
                    aria-label="Notifications"
                >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rag-red rounded-full animate-pulse" />
                </button>

                {/* Avatar */}
                <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600
            flex items-center justify-center text-white text-xs font-bold shadow-md"
                >
                    R
                </div>
            </div>
        </header>
    );
}
