from PIL import Image
import numpy as np

IMG_SIZE = (224, 224)  # ResNet50 and DenseNet121 input size

def preprocess_image(file):
    # Open the image and ensure it's in RGB format
    img = Image.open(file.stream).convert("RGB")

    # Resize the image to the required input size
    img = img.resize(IMG_SIZE)

    # Convert the image to a numpy array
    img_array = np.array(img) / 255.0  # Normalize pixel values

    # Add a batch dimension (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array
