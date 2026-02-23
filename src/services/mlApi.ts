/**
 * ML API service — connects React frontend to the Flask ML backend.
 *
 * Security:
 *  - Uses environment variable for API base URL
 *  - Request timeout (10s) to prevent hanging
 *  - Response size validation
 *  - Input sanitization on parameters
 *  - Graceful fallback when backend is unavailable
 */

const ML_API_BASE = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 10_000; // 10 seconds
const MAX_RESPONSE_SIZE = 1_048_576; // 1MB

/** Sanitize user-provided string inputs */
function sanitize(input: string): string {
    return input.replace(/[<>"'`;(){}]/g, '').trim().slice(0, 100);
}

/** Validate numeric range */
function clampInt(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.floor(val)));
}

async function fetchML<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${ML_API_BASE}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(sanitize(k), sanitize(v)));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const res = await fetch(url.toString(), {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`ML API error: ${res.status}`);
        }

        // Security: check content-type
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Invalid response content type');
        }

        // Security: check response size via Content-Length (if available)
        const contentLength = res.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
            throw new Error('Response too large');
        }

        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof DOMException && err.name === 'AbortError') {
            console.warn(`ML API timeout (${endpoint}), using fallback data`);
        } else {
            console.warn(`ML API unavailable (${endpoint}), using fallback data`);
        }

        return getFallbackData(endpoint) as T;
    }
}

// ─── API Functions ───

export async function getAnomalies(zone = 'all', hours = 72) {
    return fetchML<AnomalyResponse>('/anomalies', {
        zone: sanitize(zone),
        hours: String(clampInt(hours, 1, 168)),
    });
}

export async function getForecast(zone = 'campus', hours = 48, type = 'energy') {
    return fetchML<ForecastResponse>('/forecast', {
        zone: sanitize(zone),
        hours: String(clampInt(hours, 1, 168)),
        type: sanitize(type),
    });
}

export async function getPatterns() {
    return fetchML<PatternResponse>('/patterns');
}

export async function getRecommendations(zone = 'all') {
    return fetchML<RecommendationResponse>('/recommendations', { zone: sanitize(zone) });
}

export async function getSavingsPotential() {
    return fetchML<SavingsResponse>('/savings-potential');
}

// ─── Types ───

export interface AnomalyItem {
    zone: string;
    hour: number;
    timestamp: string;
    actual: number;
    expected: number;
    deviation: number;
    severity: 'high' | 'medium' | 'low';
    confidence: number;
    estimatedWaste: number;
    type: 'spike' | 'drop';
}

export interface AnomalyResponse {
    totalDataPoints: number;
    anomalyCount: number;
    anomalyRate: number;
    anomalies: AnomalyItem[];
    summary: {
        highCount: number;
        mediumCount: number;
        lowCount: number;
        totalEstimatedWaste: number;
    };
}

export interface ForecastPoint {
    hour: number;
    timestamp: string;
    predicted: number;
    baseline: number;
    lowerBound: number;
    upperBound: number;
}

export interface ForecastResponse {
    zone: string;
    resourceType: string;
    hoursAhead: number;
    predictions: ForecastPoint[];
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercent: number;
    confidence: number;
    modelType: string;
}

export interface PatternItem {
    zone: string;
    classification: 'efficient' | 'normal' | 'wasteful' | 'erratic';
    color: string;
    icon: string;
    description: string;
    avgConsumption: number;
    peakTroughRatio: number;
    offPeakRatio: number;
    variabilityScore: number;
    weekendReduction: number;
    confidence: number;
}

export interface PatternResponse {
    patterns: PatternItem[];
    clusterSummary: Record<string, number>;
}

export interface Recommendation {
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    confidence: number;
    estimatedSaving: number;
}

export interface RecommendationResponse {
    recommendations: Recommendation[];
}

export interface ZoneSavings {
    zone: string;
    currentProjected: number;
    optimalTarget: number;
    savingsPotential: number;
    co2Reduction: number;
    confidence: number;
}

export interface SavingsResponse {
    zones: ZoneSavings[];
    totalSavings: number;
    totalCO2Reduction: number;
}

// ─── Fallback data when ML backend is unavailable ───

function getFallbackData(endpoint: string): unknown {
    const fallbacks: Record<string, unknown> = {
        '/anomalies': {
            totalDataPoints: 504,
            anomalyCount: 7,
            anomalyRate: 1.4,
            anomalies: [
                { zone: 'Lab - Computer Sci', hour: 3, timestamp: '2026-02-23T03:00', actual: 48.5, expected: 12.2, deviation: 297.5, severity: 'high', confidence: 0.94, estimatedWaste: 290, type: 'spike' },
                { zone: 'Hostel B - Floor 1', hour: 14, timestamp: '2026-02-23T14:00', actual: 28.3, expected: 11.8, deviation: 139.8, severity: 'high', confidence: 0.89, estimatedWaste: 132, type: 'spike' },
                { zone: 'Main Building', hour: 2, timestamp: '2026-02-22T02:00', actual: 35.1, expected: 8.4, deviation: 317.9, severity: 'high', confidence: 0.92, estimatedWaste: 214, type: 'spike' },
                { zone: 'Lab - Electronics', hour: 22, timestamp: '2026-02-22T22:00', actual: 19.6, expected: 8.0, deviation: 145.0, severity: 'medium', confidence: 0.76, estimatedWaste: 93, type: 'spike' },
                { zone: 'Gym', hour: 1, timestamp: '2026-02-23T01:00', actual: 9.8, expected: 2.1, deviation: 366.7, severity: 'medium', confidence: 0.81, estimatedWaste: 62, type: 'spike' },
            ],
            summary: { highCount: 3, mediumCount: 2, lowCount: 2, totalEstimatedWaste: 791 },
        },
        '/forecast': {
            zone: 'campus', resourceType: 'energy', hoursAhead: 48,
            predictions: Array.from({ length: 48 }, (_, i) => {
                const hour = (new Date().getHours() + i) % 24;
                const base = 60 + Math.sin((hour - 6) * Math.PI / 12) * 40;
                const pred = base * (0.9 + Math.random() * 0.2);
                return {
                    hour, timestamp: `2026-02-23T${String(hour).padStart(2, '0')}:00`,
                    predicted: Math.round(pred * 100) / 100,
                    baseline: Math.round(base * 100) / 100,
                    lowerBound: Math.round(pred * 0.85 * 100) / 100,
                    upperBound: Math.round(pred * 1.15 * 100) / 100,
                };
            }),
            trend: 'increasing', trendPercent: 4.2, confidence: 0.82, modelType: 'Ridge Regression (Poly-3)',
        },
        '/patterns': {
            patterns: [
                { zone: 'Hostel A - Floor 2', classification: 'efficient', color: '#10B981', icon: '🌱', description: 'Consistently below baseline', avgConsumption: 4.8, peakTroughRatio: 3.2, offPeakRatio: 18.5, variabilityScore: 12.3, weekendReduction: 8.2, confidence: 0.91 },
                { zone: 'Main Building', classification: 'normal', color: '#6366F1', icon: '📊', description: 'Follows expected patterns', avgConsumption: 18.4, peakTroughRatio: 4.1, offPeakRatio: 24.3, variabilityScore: 15.8, weekendReduction: 45.2, confidence: 0.87 },
                { zone: 'Lab - Computer Sci', classification: 'wasteful', color: '#F59E0B', icon: '⚠️', description: 'High off-peak usage', avgConsumption: 15.2, peakTroughRatio: 2.1, offPeakRatio: 42.5, variabilityScore: 28.9, weekendReduction: 12.1, confidence: 0.83 },
                { zone: 'Hostel B - Floor 1', classification: 'erratic', color: '#EF4444', icon: '🔴', description: 'Unpredictable consumption', avgConsumption: 8.9, peakTroughRatio: 5.8, offPeakRatio: 31.2, variabilityScore: 42.1, weekendReduction: -5.3, confidence: 0.78 },
                { zone: 'Lab - Electronics', classification: 'normal', color: '#6366F1', icon: '📊', description: 'Follows expected patterns', avgConsumption: 9.2, peakTroughRatio: 3.6, offPeakRatio: 22.1, variabilityScore: 14.5, weekendReduction: 55.8, confidence: 0.85 },
                { zone: 'Hostel A - Floor 1', classification: 'wasteful', color: '#F59E0B', icon: '⚠️', description: 'High off-peak usage', avgConsumption: 7.1, peakTroughRatio: 2.4, offPeakRatio: 38.9, variabilityScore: 22.3, weekendReduction: -2.1, confidence: 0.79 },
                { zone: 'Gym', classification: 'efficient', color: '#10B981', icon: '🌱', description: 'Consistently below baseline', avgConsumption: 5.1, peakTroughRatio: 4.5, offPeakRatio: 15.2, variabilityScore: 18.7, weekendReduction: 22.0, confidence: 0.88 },
            ],
            clusterSummary: { efficient: 2, normal: 2, wasteful: 2, erratic: 1 },
        },
        '/recommendations': {
            recommendations: [
                { type: 'anomaly', priority: 'high', title: 'Unusual spike in Lab - Computer Sci', description: 'Detected 298% above normal at 03:00. Estimated waste: ₹290', action: 'Investigate Lab-CS equipment immediately', confidence: 0.94, estimatedSaving: 290 },
                { type: 'pattern', priority: 'medium', title: 'Hostel A-F1 shows wasteful pattern', description: 'Off-peak usage is 39% of peak, suggesting equipment left running', action: 'Implement automated shutdown schedules', confidence: 0.79, estimatedSaving: 195 },
                { type: 'forecast', priority: 'medium', title: 'Rising consumption trend detected', description: 'Campus energy use projected to increase 4.2% over next 48 hours', action: 'Pre-emptively send conservation reminders', confidence: 0.82, estimatedSaving: 500 },
                { type: 'optimization', priority: 'low', title: 'HVAC scheduling optimization available', description: 'ML analysis suggests shifting cooling cycles by 30 min could save 12% energy', action: 'Apply recommended HVAC schedule', confidence: 0.81, estimatedSaving: 340 },
            ],
        },
        '/savings-potential': {
            zones: [
                { zone: 'Hostel A - Floor 1', currentProjected: 142, optimalTarget: 118, savingsPotential: 192, co2Reduction: 19.7, confidence: 0.84 },
                { zone: 'Hostel A - Floor 2', currentProjected: 98, optimalTarget: 105, savingsPotential: 0, co2Reduction: 0, confidence: 0.91 },
                { zone: 'Hostel B - Floor 1', currentProjected: 165, optimalTarget: 128, savingsPotential: 296, co2Reduction: 30.3, confidence: 0.79 },
                { zone: 'Lab - Electronics', currentProjected: 210, optimalTarget: 195, savingsPotential: 120, co2Reduction: 12.3, confidence: 0.86 },
                { zone: 'Lab - Computer Sci', currentProjected: 310, optimalTarget: 245, savingsPotential: 520, co2Reduction: 53.3, confidence: 0.77 },
                { zone: 'Main Building', currentProjected: 480, optimalTarget: 490, savingsPotential: 0, co2Reduction: 0, confidence: 0.88 },
                { zone: 'Gym', currentProjected: 68, optimalTarget: 55, savingsPotential: 104, co2Reduction: 10.7, confidence: 0.82 },
            ],
            totalSavings: 1232, totalCO2Reduction: 126.3,
        },
    };
    return fallbacks[endpoint] ?? {};
}
