from tensorflow.keras.models import load_model
import os

MODEL_PATH = "app\services\model\my_final_model_corect_04.keras"

def get_model():
    try:
        model = load_model(MODEL_PATH)
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None
