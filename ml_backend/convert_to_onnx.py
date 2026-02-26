
import os
import numpy as np
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnx
import onnxruntime as ort
from sklearn.pipeline import Pipeline

# Import models from the local directory
from models.anomaly_detector import AnomalyDetector
from models.forecaster import ConsumptionForecaster
from models.pattern_classifier import PatternClassifier
from data_generator import generate_historical_data

def convert_anomaly_detector(detector, output_path):
    print("Converting AnomalyDetector...")
    # AnomalyDetector uses scaler + model separately. Let's wrap them in a Pipeline for ONNX export.
    pipeline = Pipeline([
        ('scaler', detector.scaler),
        ('model', detector.model)
    ])
    
    # Input has 4 features: hour_sin, hour_cos, is_weekend, energy_kwh
    initial_type = [('float_input', FloatTensorType([None, 4]))]
    onx = convert_sklearn(pipeline, initial_types=initial_type, target_opset={'': 12, 'ai.onnx.ml': 3})
    
    with open(output_path, "wb") as f:
        f.write(onx.SerializeToString())
    print(f"  ✅ Saved to {output_path}")

def convert_forecaster(forecaster, output_path_prefix):
    print("Converting ConsumptionForecaster...")
    # Each zone has its own model. We'll convert one representative model (e.g., 'Main Building')
    # or loop through all. The requirement says "convert every supported model".
    # Since they are the same architecture, I'll convert each trained zone model.
    
    for zone, pipeline in forecaster._models.items():
        zone_slug = zone.replace(' ', '_').replace('-', '_').lower()
        output_path = f"{output_path_prefix}/forecaster_{zone_slug}.onnx"
        
        # Input has 5 features: sin_hour, cos_hour, sin_dow, cos_dow, is_weekend
        initial_type = [('float_input', FloatTensorType([None, 5]))]
        onx = convert_sklearn(pipeline, initial_types=initial_type, target_opset={'': 12, 'ai.onnx.ml': 3})
        
        with open(output_path, "wb") as f:
            f.write(onx.SerializeToString())
        print(f"  ✅ Saved to {output_path}")

def convert_pattern_classifier(classifier, output_path):
    print("Converting PatternClassifier...")
    # PatternClassifier uses scaler + model (KMeans).
    pipeline = Pipeline([
        ('scaler', classifier.scaler),
        ('model', classifier.model)
    ])
    
    # Input has 8 features from _extract_zone_features
    initial_type = [('float_input', FloatTensorType([None, 8]))]
    onx = convert_sklearn(pipeline, initial_types=initial_type, target_opset={'': 12, 'ai.onnx.ml': 3})
    
    with open(output_path, "wb") as f:
        f.write(onx.SerializeToString())
    print(f"  ✅ Saved to {output_path}")

def validate_onnx(model_path, input_shape):
    print(f"Validating {model_path}...")
    # 1. onnx.checker
    model = onnx.load(model_path)
    onnx.checker.check_model(model)
    
    # 2. onnxruntime inference
    sess = ort.InferenceSession(model_path)
    input_name = sess.get_inputs()[0].name
    dummy_input = np.random.randn(1, input_shape).astype(np.float32)
    
    outputs = sess.run(None, {input_name: dummy_input})
    print(f"  ✅ Validation successful. Output shapes: {[o.shape for o in outputs]}")

if __name__ == "__main__":
    # Create output directory
    os.makedirs("onnx_models", exist_ok=True)
    
    # 1. Train models
    print("Step 1: Training models on synthetic data...")
    historical = generate_historical_data(days=90)
    
    detector = AnomalyDetector()
    detector.fit(historical)
    
    forecaster = ConsumptionForecaster()
    forecaster.fit(historical)
    
    classifier = PatternClassifier()
    classifier.fit(historical)
    
    # 2. Convert to ONNX
    print("\nStep 2: Converting to ONNX...")
    convert_anomaly_detector(detector, "onnx_models/anomaly_detector.onnx")
    convert_forecaster(forecaster, "onnx_models")
    convert_pattern_classifier(classifier, "onnx_models/pattern_classifier.onnx")
    
    # 3. Validate
    print("\nStep 3: Validating ONNX models...")
    validate_onnx("onnx_models/anomaly_detector.onnx", 4)
    # Validate one forecaster
    validate_onnx("onnx_models/forecaster_main_building.onnx", 5)
    validate_onnx("onnx_models/pattern_classifier.onnx", 8)
    
    print("\n🚀 All models converted and validated successfully!")
