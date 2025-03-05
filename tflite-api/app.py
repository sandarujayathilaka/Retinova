import numpy as np
import tensorflow.lite as tflite
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the TensorFlow Lite model globally
MODEL_PATH = "last.tflite"
IMG_SIZE = (224, 224)
class_labels = ["NPDR", "No_DR", "PDR"]

def load_model():
    """Loads the TensorFlow Lite model."""
    try:
        interpreter = tflite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        print("✅ Model loaded successfully Now!")
        return interpreter
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

model = load_model()

def preprocess_image(file_stream):
    """Preprocesses the input image."""
    img = Image.open(file_stream).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 224, 224, 3)
    return img_array

def predict_image(img_array):
    """Runs inference on the preprocessed image."""
    if model is None:
        return {"error": "Model not loaded"}, 500
    
    input_details = model.get_input_details()
    output_details = model.get_output_details()

    model.set_tensor(input_details[0]['index'], img_array)
    model.invoke()
    output_data = model.get_tensor(output_details[0]['index'])

    predicted_class = np.argmax(output_data[0])
    predicted_label = class_labels[predicted_class]

    return {
        "label": predicted_label,
        "confidence": output_data[0].tolist()
    }

@app.route('/predict', methods=['POST'])
def predict_single():
    """Handles API requests for single image classification."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file_stream = request.files["file"]
        img_array = preprocess_image(file_stream)
        result = predict_image(img_array)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict-multiple', methods=['POST'])
def predict_multiple():
    """Handles API requests for multiple image classification."""
    try:
        if "files" not in request.files:
            return jsonify({"error": "No files provided"}), 400
        
        files = request.files.getlist("files")  # Get list of uploaded files
        results = []

        for file in files:
            img_array = preprocess_image(file)
            result = predict_image(img_array)
            results.append({
                "filename": file.filename,
                "prediction": result
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health')
def health():
    print("Health check passed")
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)