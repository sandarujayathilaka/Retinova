import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import cv2

# Define the custom focal loss function
from tensorflow.keras.utils import register_keras_serializable
@register_keras_serializable()
def focal_loss(gamma=2., alpha=0.25):
    def focal_loss_fixed(y_true, y_pred):
        y_true = tf.cast(y_true, dtype='float32')
        alpha_t = y_true * alpha + (1 - y_true) * (1 - alpha)
        p_t = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        fl = -alpha_t * tf.pow((1 - p_t), gamma) * tf.math.log(p_t + tf.keras.backend.epsilon())
        return tf.reduce_mean(fl)
    return focal_loss_fixed


MODEL_PATH = r"F:\Y4 S1\RESEARCH\Research\Research-Project\Backend\app\services\model\rvo_model_tt.keras"



def get_model():
    try:
        # Load the model with the custom loss function registered
        model = load_model(MODEL_PATH, custom_objects={'focal_loss_fixed': focal_loss(gamma=2., alpha=0.25)})
        print("RVO Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading RVO model: {e}")
        return None
