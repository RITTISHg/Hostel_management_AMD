import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { RoleProvider } from './context/RoleContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NudgesPage from './pages/NudgesPage';
import SettingsPage from './pages/SettingsPage';
import ForecastPage from './pages/ForecastPage';
import AnomaliesPage from './pages/AnomaliesPage';
import InsightsPage from './pages/InsightsPage';
import PatternsPage from './pages/PatternsPage';

export default function App() {
    return (
        <ThemeProvider>
            <RoleProvider>
                <BrowserRouter>
                    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
                        <Sidebar />
                        <div className="flex-1 flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-6 overflow-x-hidden">
                                <Routes>
                                    <Route path="/" element={<DashboardPage />} />
                                    <Route path="/analytics" element={<AnalyticsPage />} />
                                    <Route path="/forecast" element={<ForecastPage />} />
                                    <Route path="/anomalies" element={<AnomaliesPage />} />
                                    <Route path="/patterns" element={<PatternsPage />} />
                                    <Route path="/insights" element={<InsightsPage />} />
                                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                                    <Route path="/nudges" element={<NudgesPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                </Routes>
                            </main>
                        </div>
                    </div>
                </BrowserRouter>
            </RoleProvider>
        </ThemeProvider>
    );
}
