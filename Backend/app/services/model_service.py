from ..services.model.load_model import get_model
from ..utils.preprocess import preprocess_image
import numpy as np

model = get_model()  

def predict_image(file):
 
    img_array = preprocess_image(file)

    predictions = model.predict(img_array)

    predicted_class = np.argmax(predictions[0])

    print(predictions)
    print(predicted_class)

    class_labels = ["NPDR", "No_DR", "PDR"]

    print(class_labels[predicted_class])

    predicted_label = class_labels[predicted_class]

    return {
        "label": predicted_label,
        "confidence": predictions[0].tolist()
    }
