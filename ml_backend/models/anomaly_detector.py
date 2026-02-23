"""
Anomaly Detection using Isolation Forest.
Detects unusual spikes/drops in energy & water consumption.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


class AnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(
            contamination=contamination,
            n_estimators=200,
            random_state=42,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self._zone_stats: dict = {}

    def fit(self, df: pd.DataFrame):
        """Train on historical data to learn normal consumption patterns."""
        features = self._extract_features(df)
        scaled = self.scaler.fit_transform(features)
        self.model.fit(scaled)

        # Store per-zone statistics for deviation calculation
        for zone in df['zone'].unique():
            zone_data = df[df['zone'] == zone]
            self._zone_stats[zone] = {
                'mean': zone_data['energy_kwh'].mean(),
                'std': zone_data['energy_kwh'].std(),
                'hourly_means': zone_data.groupby('hour')['energy_kwh'].mean().to_dict(),
            }

        print(f"  ✅ AnomalyDetector trained on {len(df)} data points")

    def detect(self, df: pd.DataFrame, zone: str = 'all') -> dict:
        """Detect anomalies in recent data."""
        if zone != 'all':
            df = df[df['zone'].str.contains(zone, case=False)]

        features = self._extract_features(df)
        scaled = self.scaler.transform(features)

        predictions = self.model.predict(scaled)
        scores = self.model.decision_function(scaled)

        anomalies = []
        for i, (pred, score) in enumerate(zip(predictions, scores)):
            if pred == -1:  # anomaly
                row = df.iloc[i]
                zone_name = row['zone']
                stats = self._zone_stats.get(zone_name, {})
                expected = stats.get('hourly_means', {}).get(int(row['hour']), stats.get('mean', row['energy_kwh']))

                deviation = ((row['energy_kwh'] - expected) / max(expected, 0.1)) * 100
                severity = 'high' if abs(deviation) > 100 else 'medium' if abs(deviation) > 50 else 'low'

                anomalies.append({
                    'zone': zone_name,
                    'hour': int(row['hour']),
                    'timestamp': str(row['timestamp']),
                    'actual': round(float(row['energy_kwh']), 2),
                    'expected': round(float(expected), 2),
                    'deviation': round(float(deviation), 1),
                    'severity': severity,
                    'confidence': round(float(min(1.0, abs(score) * 2)), 2),
                    'anomalyScore': round(float(score), 4),
                    'estimatedWaste': round(max(0, float(row['energy_kwh'] - expected)) * 8, 0),
                    'type': 'spike' if deviation > 0 else 'drop',
                })

        # Sort by severity and deviation
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        anomalies.sort(key=lambda x: (severity_order[x['severity']], -abs(x['deviation'])))

        return {
            'totalDataPoints': len(df),
            'anomalyCount': len(anomalies),
            'anomalyRate': round(len(anomalies) / max(len(df), 1) * 100, 1),
            'anomalies': anomalies[:20],  # top 20
            'summary': {
                'highCount': sum(1 for a in anomalies if a['severity'] == 'high'),
                'mediumCount': sum(1 for a in anomalies if a['severity'] == 'medium'),
                'lowCount': sum(1 for a in anomalies if a['severity'] == 'low'),
                'totalEstimatedWaste': round(sum(a['estimatedWaste'] for a in anomalies), 0),
            }
        }

    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract features for the model."""
        features = df[['hour', 'day_of_week', 'energy_kwh']].copy()
        features['hour_sin'] = np.sin(2 * np.pi * features['hour'] / 24)
        features['hour_cos'] = np.cos(2 * np.pi * features['hour'] / 24)
        features['is_weekend'] = (features['day_of_week'] >= 5).astype(int)

        return features[['hour_sin', 'hour_cos', 'is_weekend', 'energy_kwh']].values
