import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Trophy,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    Brain,
    ShieldAlert,
    Sparkles,
    Layers,
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/forecast', icon: Brain, label: 'ML Forecast', badge: 'AI' },
    { to: '/anomalies', icon: ShieldAlert, label: 'Anomalies', badge: 'AI' },
    { to: '/patterns', icon: Layers, label: 'Patterns', badge: 'AI' },
    { to: '/insights', icon: Sparkles, label: 'Insights', badge: 'AI' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/nudges', icon: Bell, label: 'Nudges' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col h-screen sticky top-0 z-30
          ${collapsed ? 'w-20' : 'w-64'}
          bg-white/90 dark:bg-surface-dark-card/90 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-700/50
          transition-all duration-300 ease-in-out`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="animate-fade-in">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                                EcoWatch
                            </h1>
                            <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wider uppercase">
                                AI-Powered Monitor
                            </p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
                    {/* Main section */}
                    {!collapsed && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-2 pb-1">Overview</p>}
                    {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                            }
                            title={label}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    ))}

                    {/* ML section */}
                    {!collapsed && (
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-1 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> ML Models
                        </p>
                    )}
                    {navItems.slice(2, 6).map(({ to, icon: Icon, label, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                            }
                            title={label}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                                <>
                                    <span className="flex-1">{label}</span>
                                    {badge && (
                                        <span className="text-[8px] font-bold bg-gradient-to-r from-brand-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">
                                            {badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Community section */}
                    {!collapsed && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-1">Community</p>}
                    {navItems.slice(6).map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                            }
                            title={label}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center py-4 border-t border-gray-200/50 dark:border-gray-700/50
            text-gray-400 hover:text-brand-500 transition-colors"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-40
          bg-white/90 dark:bg-surface-dark-card/90 backdrop-blur-xl
          border-t border-gray-200/50 dark:border-gray-700/50
          flex justify-around py-2 px-1 safe-bottom"
            >
                {[navItems[0], navItems[2], navItems[3], navItems[5], navItems[6]].map(({ to, icon: Icon, label, badge }) => {
                    const isActive = location.pathname === to;
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all text-[10px] relative
                ${isActive
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-gray-400 dark:text-gray-500'}`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                            <span className="font-medium">{label.split(' ')[0]}</span>
                            {badge && (
                                <span className="absolute -top-1 -right-1 text-[6px] font-bold bg-gradient-to-r from-brand-500 to-purple-500 text-white px-1 py-0.5 rounded-full leading-none">
                                    AI
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );
}
