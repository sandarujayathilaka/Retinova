from ..services.model.load_model import get_model
from ..utils.preprocess import preprocess_image
import numpy as np

model = get_model()

def predict_image(file):
    if model is None:
        raise Exception("Model could not be loaded. Please check the model path or file.")

    try:
        img_array = preprocess_image(file)
    except Exception as e:
        raise Exception(f"Error preprocessing image: {e}")

    try:
        predictions = model.predict(img_array)
        if predictions.shape[1] != 3: 
            raise ValueError(f"Unexpected model output shape: {predictions.shape}")
    except Exception as e:
        raise Exception(f"Error during model prediction: {e}")

    predicted_class = np.argmax(predictions, axis=1)[0]
    class_labels = ["CRVO", "BRVO", "Healthy"]
    predicted_label = class_labels[predicted_class]

    return {
        "label": predicted_label,
        "confidence": predictions[0].tolist()
    }
