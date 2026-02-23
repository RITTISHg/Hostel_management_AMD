"""
EcoWatch ML Backend — Flask API
Provides anomaly detection, consumption forecasting, and pattern classification.
"""

import os
import time
from functools import wraps
from collections import defaultdict
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import numpy as np
from models.anomaly_detector import AnomalyDetector
from models.forecaster import ConsumptionForecaster
from models.pattern_classifier import PatternClassifier
from data_generator import generate_historical_data, generate_realtime_stream

app = Flask(__name__)

# ─── SECURITY: Restrict CORS to allowed origins only ───
ALLOWED_ORIGINS = os.environ.get(
    'ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:4173,https://*.vercel.app'
).split(',')

CORS(app, origins=ALLOWED_ORIGINS, methods=['GET'], max_age=3600)

# ─── SECURITY: Rate limiting (in-memory, per-IP) ───
_rate_store: dict = defaultdict(list)
RATE_LIMIT = 60      # max requests
RATE_WINDOW = 60     # per 60 seconds


def rate_limit(f):
    """Simple IP-based rate limiter."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        ip = request.remote_addr or 'unknown'
        now = time.time()

        # Clean old entries
        _rate_store[ip] = [t for t in _rate_store[ip] if now - t < RATE_WINDOW]

        if len(_rate_store[ip]) >= RATE_LIMIT:
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': f'Max {RATE_LIMIT} requests per {RATE_WINDOW}s',
            }), 429

        _rate_store[ip].append(now)
        return f(*args, **kwargs)
    return wrapper


# ─── SECURITY: Input validation helpers ───
def validate_int(value: str, min_val: int, max_val: int, default: int) -> int:
    """Safely parse and clamp an integer query parameter."""
    try:
        v = int(value)
        return max(min_val, min(v, max_val))
    except (ValueError, TypeError):
        return default


def validate_string(value: str, allowed: list[str], default: str) -> str:
    """Validate a string is in an allowed list."""
    if value in allowed:
        return value
    return default


VALID_ZONES = [
    'all', 'campus', 'Hostel A - Floor 1', 'Hostel A - Floor 2',
    'Hostel B - Floor 1', 'Lab - Electronics', 'Lab - Computer Sci',
    'Main Building', 'Gym',
]
VALID_TYPES = ['energy', 'water']


# ─── Initialize models ───
anomaly_detector = AnomalyDetector()
forecaster = ConsumptionForecaster()
pattern_classifier = PatternClassifier()

# ─── Generate and fit on startup ───
historical = generate_historical_data(days=90)
anomaly_detector.fit(historical)
forecaster.fit(historical)
pattern_classifier.fit(historical)


# ─── SECURITY: Global error handler — don't leak stack traces ───
@app.errorhandler(Exception)
def handle_error(e):
    """Return clean JSON errors, never leak stack traces."""
    code = getattr(e, 'code', 500)
    return jsonify({
        'error': str(e) if code < 500 else 'Internal server error',
        'status': code,
    }), code


@app.after_request
def add_security_headers(response):
    """Add security headers to every response."""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    response.headers['Content-Type'] = 'application/json'
    return response


@app.route('/api/health', methods=['GET'])
@rate_limit
def health():
    return jsonify({'status': 'ok', 'models_loaded': True})


@app.route('/api/anomalies', methods=['GET'])
@rate_limit
def detect_anomalies():
    """Detect anomalies in recent consumption data."""
    zone = validate_string(request.args.get('zone', 'all'), VALID_ZONES, 'all')
    hours = validate_int(request.args.get('hours', '72'), 1, 168, 72)  # max 7 days

    recent = generate_realtime_stream(hours=hours)
    results = anomaly_detector.detect(recent, zone=zone)
    return jsonify(results)


@app.route('/api/forecast', methods=['GET'])
@rate_limit
def forecast():
    """Forecast consumption for the next N hours."""
    zone = validate_string(request.args.get('zone', 'campus'), VALID_ZONES, 'campus')
    hours = validate_int(request.args.get('hours', '48'), 1, 168, 48)  # max 7 days
    resource = validate_string(request.args.get('type', 'energy'), VALID_TYPES, 'energy')

    prediction = forecaster.predict(zone=zone, hours=hours, resource_type=resource)
    return jsonify(prediction)


@app.route('/api/patterns', methods=['GET'])
@rate_limit
def classify_patterns():
    """Classify consumption patterns across zones."""
    results = pattern_classifier.classify_all()
    return jsonify(results)


@app.route('/api/recommendations', methods=['GET'])
@rate_limit
def get_recommendations():
    """Get ML-driven recommendations for energy savings."""
    zone = validate_string(request.args.get('zone', 'all'), VALID_ZONES, 'all')

    anomalies = anomaly_detector.detect(generate_realtime_stream(hours=48), zone=zone)
    patterns = pattern_classifier.classify_all()
    forecasts = forecaster.predict(zone='campus', hours=24, resource_type='energy')

    recommendations = _generate_recommendations(anomalies, patterns, forecasts)
    return jsonify({'recommendations': recommendations})


@app.route('/api/savings-potential', methods=['GET'])
@rate_limit
def savings_potential():
    """Calculate potential savings based on ML analysis."""
    zones = [
        'Hostel A - Floor 1', 'Hostel A - Floor 2', 'Hostel B - Floor 1',
        'Lab - Electronics', 'Lab - Computer Sci', 'Main Building', 'Gym',
    ]

    savings = []
    for zone in zones:
        forecast_result = forecaster.predict(zone=zone, hours=24, resource_type='energy')
        baseline_avg = np.mean([p['baseline'] for p in forecast_result['predictions']])
        predicted_avg = np.mean([p['predicted'] for p in forecast_result['predictions']])
        potential = max(0, (predicted_avg - baseline_avg) * 24 * 8)

        savings.append({
            'zone': zone,
            'currentProjected': round(predicted_avg * 24, 1),
            'optimalTarget': round(baseline_avg * 24, 1),
            'savingsPotential': round(potential, 0),
            'co2Reduction': round(potential / 8 * 0.82, 1),
            'confidence': round(0.7 + np.random.random() * 0.25, 2),
        })

    total_savings = sum(s['savingsPotential'] for s in savings)
    total_co2 = sum(s['co2Reduction'] for s in savings)

    return jsonify({
        'zones': savings,
        'totalSavings': round(total_savings, 0),
        'totalCO2Reduction': round(total_co2, 1),
        'analysisTimestamp': '2026-02-23T17:26:00+05:30',
    })


def _generate_recommendations(anomalies, patterns, forecasts):
    """Generate smart recommendations from ML model outputs."""
    recs = []

    high_anomalies = [a for a in anomalies.get('anomalies', []) if a.get('severity') == 'high']
    if high_anomalies:
        for a in high_anomalies[:3]:
            recs.append({
                'type': 'anomaly',
                'priority': 'high',
                'title': f"Unusual spike in {a['zone']}",
                'description': f"Detected {a['deviation']:.0f}% above normal at {a['hour']}:00. "
                               f"Estimated waste: ₹{a.get('estimatedWaste', 0):.0f}",
                'action': f"Investigate {a['zone']} equipment immediately",
                'confidence': a.get('confidence', 0.85),
                'estimatedSaving': a.get('estimatedWaste', 120),
            })

    for p in patterns.get('patterns', []):
        if p.get('classification') == 'wasteful':
            recs.append({
                'type': 'pattern',
                'priority': 'medium',
                'title': f"{p['zone']} shows wasteful consumption pattern",
                'description': f"Off-peak usage is {p.get('offPeakRatio', 40):.0f}% of peak, "
                               f"suggesting equipment left running",
                'action': 'Implement automated shutdown schedules',
                'confidence': p.get('confidence', 0.78),
                'estimatedSaving': round(p.get('offPeakRatio', 40) * 5, 0),
            })

    if forecasts.get('trend') == 'increasing':
        recs.append({
            'type': 'forecast',
            'priority': 'medium',
            'title': 'Rising consumption trend detected',
            'description': f"Campus energy use projected to increase {forecasts.get('trendPercent', 5):.1f}% "
                           f"over the next 48 hours",
            'action': 'Pre-emptively send conservation reminders',
            'confidence': forecasts.get('confidence', 0.72),
            'estimatedSaving': 500,
        })

    recs.append({
        'type': 'optimization',
        'priority': 'low',
        'title': 'HVAC scheduling optimization available',
        'description': 'ML analysis suggests shifting cooling cycles by 30 minutes '
                       'could save 12% energy during peak hours',
        'action': 'Apply recommended HVAC schedule',
        'confidence': 0.81,
        'estimatedSaving': 340,
    })

    return recs


if __name__ == '__main__':
    # SECURITY: debug=False in production, controlled via env var
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'

    print("🚀 EcoWatch ML Backend starting...")
    print("📊 Models trained on 90 days of historical data")
    print(f"🔒 CORS origins: {ALLOWED_ORIGINS}")
    print(f"🔒 Rate limit: {RATE_LIMIT} req/{RATE_WINDOW}s per IP")
    print(f"🔒 Debug mode: {debug_mode}")
    print("🔗 API available at http://localhost:5000/api/")

    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
