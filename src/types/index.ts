// ─── Role Types ───
export type Role = 'student' | 'labInCharge' | 'facilityManager';

export interface RoleInfo {
    key: Role;
    label: string;
    icon: string;
}

// ─── Usage Data ───
export interface UsageSnapshot {
    id: string;
    zone: string;
    type: 'energy' | 'water';
    current: number;
    baseline: number;
    unit: string;
    trend: number[];          // last 24h hourly values
    costPerUnit: number;      // ₹ per kWh or kL
    co2PerUnit: number;       // kg CO₂ per kWh or kL
}

export type RAGStatus = 'green' | 'amber' | 'red';

// ─── Heatmap ───
export interface HeatmapCell {
    zone: string;
    hour: number;
    value: number;
}

// ─── Leaderboard ───
export interface LeaderboardEntry {
    rank: number;
    name: string;
    zone: string;
    score: number;
    streak: number;
    badges: string[];
    avatarColor: string;
}

// ─── Nudge ───
export type NudgePriority = 'high' | 'medium' | 'low';

export interface Nudge {
    id: string;
    problem: string;
    impact: string;
    action: string;
    priority: NudgePriority;
    zone: string;
    timestamp: string;
    dismissed?: boolean;
}

// ─── Chart Data ───
export interface BaselineChartDatum {
    zone: string;
    current: number;
    baseline: number;
}

// ─── Cost / CO₂ Summary ───
export interface CostCO2Summary {
    totalCostToday: number;
    totalCO2Today: number;
    costDelta: number;       // % vs baseline
    co2Delta: number;        // % vs baseline
    currency: string;
}
