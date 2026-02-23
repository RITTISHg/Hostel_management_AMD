"""
Synthetic data generator for training ML models.
Simulates realistic campus energy & water patterns.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

ZONES = [
    'Hostel A - Floor 1', 'Hostel A - Floor 2', 'Hostel B - Floor 1',
    'Lab - Electronics', 'Lab - Computer Sci', 'Main Building', 'Gym',
]

# Base consumption profiles (kWh per hour) — varies by time of day
ZONE_PROFILES = {
    'Hostel A - Floor 1': {'base': 5.5, 'peak_mult': 2.2, 'peak_hours': (18, 23), 'noise': 0.15},
    'Hostel A - Floor 2': {'base': 5.0, 'peak_mult': 2.0, 'peak_hours': (18, 23), 'noise': 0.12},
    'Hostel B - Floor 1': {'base': 6.0, 'peak_mult': 2.5, 'peak_hours': (18, 23), 'noise': 0.18},
    'Lab - Electronics':  {'base': 8.0, 'peak_mult': 3.0, 'peak_hours': (9, 17),  'noise': 0.10},
    'Lab - Computer Sci': {'base': 12.0, 'peak_mult': 2.8, 'peak_hours': (9, 21), 'noise': 0.12},
    'Main Building':      {'base': 18.0, 'peak_mult': 2.0, 'peak_hours': (8, 18), 'noise': 0.08},
    'Gym':                {'base': 4.0, 'peak_mult': 2.5, 'peak_hours': (6, 21),  'noise': 0.20},
}


def _hourly_consumption(zone: str, hour: int, day_of_week: int) -> float:
    """Generate realistic consumption for a given zone/hour/day."""
    profile = ZONE_PROFILES.get(zone, {'base': 5.0, 'peak_mult': 2.0, 'peak_hours': (8, 18), 'noise': 0.15})
    base = profile['base']
    peak_start, peak_end = profile['peak_hours']

    # Peak hours multiplier
    if peak_start <= hour <= peak_end:
        value = base * profile['peak_mult']
        # Bell curve within peak hours
        mid = (peak_start + peak_end) / 2
        spread = (peak_end - peak_start) / 2
        bell = np.exp(-0.5 * ((hour - mid) / spread) ** 2)
        value = base + (value - base) * bell
    else:
        value = base * (0.3 + 0.2 * np.random.random())

    # Weekend reduction for labs and main building
    if day_of_week >= 5 and zone in ('Lab - Electronics', 'Lab - Computer Sci', 'Main Building'):
        value *= 0.35

    # Weekend increase for hostels
    if day_of_week >= 5 and 'Hostel' in zone:
        value *= 1.15

    # Add noise
    noise = np.random.normal(0, profile['noise'] * value)
    return max(0.1, value + noise)


def generate_historical_data(days: int = 90) -> pd.DataFrame:
    """Generate historical consumption data for all zones."""
    rows = []
    start = datetime.now() - timedelta(days=days)

    for day_offset in range(days):
        current_date = start + timedelta(days=day_offset)
        day_of_week = current_date.weekday()

        for hour in range(24):
            for zone in ZONES:
                energy = _hourly_consumption(zone, hour, day_of_week)
                water = energy * 0.02 * (1 + 0.3 * np.random.random())  # roughly correlated

                rows.append({
                    'timestamp': current_date.replace(hour=hour, minute=0),
                    'zone': zone,
                    'hour': hour,
                    'day_of_week': day_of_week,
                    'energy_kwh': round(energy, 2),
                    'water_kl': round(water, 3),
                    'is_weekend': day_of_week >= 5,
                    'month': current_date.month,
                })

    # Inject some anomalies (~2% of data points)
    df = pd.DataFrame(rows)
    anomaly_mask = np.random.random(len(df)) < 0.02
    df.loc[anomaly_mask, 'energy_kwh'] *= np.random.uniform(2.0, 4.0, anomaly_mask.sum())
    df['is_anomaly'] = anomaly_mask

    return df


def generate_realtime_stream(hours: int = 72) -> pd.DataFrame:
    """Generate recent realtime data for anomaly detection."""
    rows = []
    start = datetime.now() - timedelta(hours=hours)

    for h in range(hours):
        ts = start + timedelta(hours=h)
        day_of_week = ts.weekday()

        for zone in ZONES:
            energy = _hourly_consumption(zone, ts.hour, day_of_week)
            water = energy * 0.02 * (1 + 0.3 * np.random.random())

            rows.append({
                'timestamp': ts,
                'zone': zone,
                'hour': ts.hour,
                'day_of_week': day_of_week,
                'energy_kwh': round(energy, 2),
                'water_kl': round(water, 3),
            })

    df = pd.DataFrame(rows)

    # Inject 3-5 anomalies
    n_anomalies = np.random.randint(3, 6)
    anomaly_indices = np.random.choice(len(df), n_anomalies, replace=False)
    df.loc[anomaly_indices, 'energy_kwh'] *= np.random.uniform(2.5, 5.0, n_anomalies)

    return df
