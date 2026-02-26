
import os
import numpy as np
import onnxruntime as ort

def run_test():
    model_dir = "onnx_models"
    models = {
        "anomaly_detector.onnx": 4,
        "forecaster_main_building.onnx": 5,
        "pattern_classifier.onnx": 8
    }
    
    print("Running Inference Tests on ONNX Models...")
    
    for model_name, input_size in models.items():
        path = os.path.join(model_dir, model_name)
        if not os.path.exists(path):
            print(f"  ❌ Model not found: {path}")
            continue
            
        try:
            sess = ort.InferenceSession(path)
            input_name = sess.get_inputs()[0].name
            dummy_input = np.random.randn(1, input_size).astype(np.float32)
            
            outputs = sess.run(None, {input_name: dummy_input})
            print(f"  ✅ {model_name}: PASSED")
            print(f"     Inputs: {input_name} (shape {dummy_input.shape})")
            print(f"     Outputs: {[o.shape for o in outputs]}")
        except Exception as e:
            print(f"  ❌ {model_name}: FAILED with error: {str(e)}")

if __name__ == "__main__":
    run_test()
