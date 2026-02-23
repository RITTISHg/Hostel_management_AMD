import { useState, useEffect } from 'react';
import type { UsageSnapshot } from '../types';

type Listener = (data: UsageSnapshot[]) => void;

class WSSimulator {
    private listeners: Set<Listener> = new Set();
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private data: UsageSnapshot[] = [];

    start(initialData: UsageSnapshot[]) {
        this.data = initialData.map((d) => ({ ...d }));
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            this.data = this.data.map((item) => {
                const variance = 0.95 + Math.random() * 0.1;
                const newCurrent = Math.round(item.current * variance * 100) / 100;
                const newTrend = [...item.trend.slice(1), newCurrent];
                return { ...item, current: newCurrent, trend: newTrend };
            });
            this.listeners.forEach((fn) => fn([...this.data]));
        }, 3000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    subscribe(fn: Listener) {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
            if (this.listeners.size === 0) this.stop();
        };
    }
}

const energySim = new WSSimulator();
const waterSim = new WSSimulator();

export function useRealtimeData(
    initialData: UsageSnapshot[],
    type: 'energy' | 'water',
): UsageSnapshot[] {
    const [data, setData] = useState<UsageSnapshot[]>(initialData);

    useEffect(() => {
        const sim = type === 'energy' ? energySim : waterSim;
        sim.start(initialData);
        const unsub = sim.subscribe(setData);
        return unsub;
    }, [type]);

    return data;
}
