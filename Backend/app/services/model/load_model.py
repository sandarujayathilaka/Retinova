from tensorflow.keras.models import load_model
import os

MODEL_PATH = r"C:\Users\Asus\Desktop\RP Backend\Research-Project\Backend\app\services\model\trained_model.keras"

def get_model():
    try:
        model = load_model(MODEL_PATH)
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None
