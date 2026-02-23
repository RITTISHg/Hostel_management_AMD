import type {
    UsageSnapshot,
    HeatmapCell,
    LeaderboardEntry,
    Nudge,
    BaselineChartDatum,
    CostCO2Summary,
} from '../types';

// ─── Helper ───
const rand = (min: number, max: number) =>
    Math.round((Math.random() * (max - min) + min) * 100) / 100;

const sparkline = (base: number, len = 24): number[] =>
    Array.from({ length: len }, () => base * (0.7 + Math.random() * 0.6));

// ─── Energy Usage Snapshots ───
export const energyUsageData: UsageSnapshot[] = [
    {
        id: 'e1', zone: 'Hostel A — Floor 1', type: 'energy',
        current: 142, baseline: 120, unit: 'kWh',
        trend: sparkline(130), costPerUnit: 8, co2PerUnit: 0.82,
    },
    {
        id: 'e2', zone: 'Hostel A — Floor 2', type: 'energy',
        current: 98, baseline: 110, unit: 'kWh',
        trend: sparkline(100), costPerUnit: 8, co2PerUnit: 0.82,
    },
    {
        id: 'e3', zone: 'Hostel B — Floor 1', type: 'energy',
        current: 165, baseline: 130, unit: 'kWh',
        trend: sparkline(140), costPerUnit: 8, co2PerUnit: 0.82,
    },
    {
        id: 'e4', zone: 'Lab — Electronics', type: 'energy',
        current: 210, baseline: 200, unit: 'kWh',
        trend: sparkline(200), costPerUnit: 9.5, co2PerUnit: 0.82,
    },
    {
        id: 'e5', zone: 'Lab — Computer Sci', type: 'energy',
        current: 310, baseline: 250, unit: 'kWh',
        trend: sparkline(270), costPerUnit: 9.5, co2PerUnit: 0.82,
    },
    {
        id: 'e6', zone: 'Main Building', type: 'energy',
        current: 480, baseline: 500, unit: 'kWh',
        trend: sparkline(490), costPerUnit: 8, co2PerUnit: 0.82,
    },
];

// ─── Water Usage Snapshots ───
export const waterUsageData: UsageSnapshot[] = [
    {
        id: 'w1', zone: 'Hostel A — Floor 1', type: 'water',
        current: 3.2, baseline: 2.8, unit: 'kL',
        trend: sparkline(3.0, 24), costPerUnit: 45, co2PerUnit: 0.34,
    },
    {
        id: 'w2', zone: 'Hostel A — Floor 2', type: 'water',
        current: 2.5, baseline: 2.8, unit: 'kL',
        trend: sparkline(2.6, 24), costPerUnit: 45, co2PerUnit: 0.34,
    },
    {
        id: 'w3', zone: 'Hostel B — Floor 1', type: 'water',
        current: 4.1, baseline: 3.3, unit: 'kL',
        trend: sparkline(3.5, 24), costPerUnit: 45, co2PerUnit: 0.34,
    },
    {
        id: 'w4', zone: 'Lab — Electronics', type: 'water',
        current: 0.8, baseline: 1.0, unit: 'kL',
        trend: sparkline(0.9, 24), costPerUnit: 45, co2PerUnit: 0.34,
    },
    {
        id: 'w5', zone: 'Main Building', type: 'water',
        current: 6.5, baseline: 7.0, unit: 'kL',
        trend: sparkline(6.8, 24), costPerUnit: 45, co2PerUnit: 0.34,
    },
];

// ─── Baseline Chart ───
export const energyBaselineChart: BaselineChartDatum[] = [
    { zone: 'Hostel A-F1', current: 142, baseline: 120 },
    { zone: 'Hostel A-F2', current: 98, baseline: 110 },
    { zone: 'Hostel B-F1', current: 165, baseline: 130 },
    { zone: 'Lab-Elec', current: 210, baseline: 200 },
    { zone: 'Lab-CS', current: 310, baseline: 250 },
    { zone: 'Main Bldg', current: 480, baseline: 500 },
];

export const waterBaselineChart: BaselineChartDatum[] = [
    { zone: 'Hostel A-F1', current: 3.2, baseline: 2.8 },
    { zone: 'Hostel A-F2', current: 2.5, baseline: 2.8 },
    { zone: 'Hostel B-F1', current: 4.1, baseline: 3.3 },
    { zone: 'Lab-Elec', current: 0.8, baseline: 1.0 },
    { zone: 'Main Bldg', current: 6.5, baseline: 7.0 },
];

// ─── Heatmap Data (24h × 7 zones) ───
const zones = ['Hostel A-F1', 'Hostel A-F2', 'Hostel B-F1', 'Lab-Elec', 'Lab-CS', 'Main Bldg', 'Gym'];
export const heatmapData: HeatmapCell[] = zones.flatMap((zone) =>
    Array.from({ length: 24 }, (_, hour) => ({
        zone,
        hour,
        value: rand(hour >= 6 && hour <= 22 ? 30 : 5, hour >= 6 && hour <= 22 ? 100 : 30),
    })),
);

// ─── Leaderboard ───
export const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: 'Hostel A — Floor 2', zone: 'Hostel A', score: 94, streak: 12, badges: ['🌱', '⚡', '💧'], avatarColor: '#10B981' },
    { rank: 2, name: 'Main Building', zone: 'Campus', score: 89, streak: 8, badges: ['🌱', '⚡'], avatarColor: '#6366F1' },
    { rank: 3, name: 'Lab — Electronics', zone: 'Labs', score: 85, streak: 5, badges: ['⚡'], avatarColor: '#F59E0B' },
    { rank: 4, name: 'Hostel B — Floor 1', zone: 'Hostel B', score: 72, streak: 3, badges: ['💧'], avatarColor: '#EF4444' },
    { rank: 5, name: 'Lab — Computer Sci', zone: 'Labs', score: 68, streak: 1, badges: [], avatarColor: '#8B5CF6' },
    { rank: 6, name: 'Hostel A — Floor 1', zone: 'Hostel A', score: 62, streak: 0, badges: [], avatarColor: '#EC4899' },
    { rank: 7, name: 'Gym', zone: 'Campus', score: 58, streak: 2, badges: ['🌱'], avatarColor: '#14B8A6' },
    { rank: 8, name: 'Library', zone: 'Campus', score: 55, streak: 0, badges: [], avatarColor: '#F97316' },
];

// ─── Nudges ───
export const nudgesData: Nudge[] = [
    {
        id: 'n1', priority: 'high',
        problem: 'AC units running in empty Lab-CS for 4 hours',
        impact: '₹380 wasted  ·  19 kg CO₂ emitted',
        action: 'Send remote shutdown request',
        zone: 'Lab — Computer Sci', timestamp: '10 min ago',
    },
    {
        id: 'n2', priority: 'high',
        problem: 'Water leak detected in Hostel B — Floor 1 bathroom',
        impact: '~120 L wasted  ·  ₹54 extra cost',
        action: 'Dispatch maintenance crew',
        zone: 'Hostel B', timestamp: '25 min ago',
    },
    {
        id: 'n3', priority: 'medium',
        problem: 'Hostel A — Floor 1 consumption 18% above baseline',
        impact: '₹176 additional  ·  14.4 kg CO₂',
        action: 'Send conservation reminder to residents',
        zone: 'Hostel A', timestamp: '1 hr ago',
    },
    {
        id: 'n4', priority: 'medium',
        problem: 'Lab-Electronics lights left on after hours',
        impact: '₹65 estimated overnight  ·  5.3 kg CO₂',
        action: 'Auto-schedule lights off at 10 PM',
        zone: 'Lab — Electronics', timestamp: '2 hr ago',
    },
    {
        id: 'n5', priority: 'low',
        problem: 'Gym HVAC running at full capacity during off-peak',
        impact: '₹45 per hour  ·  3.6 kg CO₂',
        action: 'Switch to eco mode during off-peak',
        zone: 'Gym', timestamp: '3 hr ago',
    },
];

// ─── Cost & CO₂ Summary ───
export const costCO2Summary: CostCO2Summary = {
    totalCostToday: 11240,
    totalCO2Today: 1148,
    costDelta: 8.5,
    co2Delta: 6.2,
    currency: '₹',
};

// ─── Role-filtered helpers ───
export const getStudentZones = () => ['Hostel A — Floor 1', 'Hostel A — Floor 2'];
export const getLabZones = () => ['Lab — Electronics', 'Lab — Computer Sci'];
export const getAllZones = () => [
    ...getStudentZones(),
    'Hostel B — Floor 1',
    ...getLabZones(),
    'Main Building',
    'Gym',
    'Library',
];
