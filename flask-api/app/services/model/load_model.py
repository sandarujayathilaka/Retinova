from tensorflow.keras.models import load_model
import os
from tensorflow.keras import backend as K
# from tensorflow import keras
from tensorflow.keras.utils import register_keras_serializable
import tensorflow as tf
from tensorflow.keras import layers
import keras

# MODEL_PATH = "app\services\model\my_final_model_corect_04.keras"

# MODEL_PATH = r"C:\Users\Asus\Desktop\RP Backend\Research-Project\Backend\app\services\model\trained_model.keras"

# def get_model():
#     try:
#         model = load_model(MODEL_PATH)
#         print("Model loaded successfully!")
#         return model
#     except Exception as e:
#         print(f"Error loading model: {e}")
#         return None


keras.config.enable_unsafe_deserialization()

AMD_MODEL_PATH = r"D:\Rp baackend final with frontend\Backend\app\services\model\modelfinalnewapproch91,91,15.keras"

@register_keras_serializable(package="Custom", name="CustomLambda")
class CustomLambda(layers.Lambda):
    def __init__(self, **kwargs):
        super(CustomLambda, self).__init__(
            function=lambda x: tf.expand_dims(x, axis=1),
            output_shape=lambda input_shape: (input_shape[0], 1, input_shape[1]),
            **kwargs
        )

@register_keras_serializable(package="Custom", name="GraphConstruction")
class GraphConstruction(layers.Layer):
    def __init__(self, num_nodes, **kwargs):
        super(GraphConstruction, self).__init__(**kwargs)
        self.num_nodes = num_nodes

    def call(self, inputs):
        similarity = tf.matmul(inputs, inputs, transpose_b=True)
        adjacency = tf.nn.softmax(similarity, axis=-1)
        return adjacency

    def get_config(self):
        config = super(GraphConstruction, self).get_config()
        config.update({"num_nodes": self.num_nodes})
        return config

@register_keras_serializable(package="Custom", name="GraphConvolution")
class GraphConvolution(layers.Layer):
    def __init__(self, units, **kwargs):
        super(GraphConvolution, self).__init__(**kwargs)
        self.units = units

    def build(self, input_shape):
        self.weight = self.add_weight(
            shape=(input_shape[-1], self.units),
            initializer="glorot_uniform",
            trainable=True,
        )

    def call(self, inputs, adjacency):
        aggregated = tf.matmul(adjacency, inputs)
        output = tf.matmul(aggregated, self.weight)
        return tf.nn.relu(output)

    def get_config(self):
        config = super(GraphConvolution, self).get_config()
        config.update({"units": self.units})
        return config

# Define SE Block function
@register_keras_serializable(package="Custom", name="SEBlock")
def se_block(input_tensor, reduction=16):
    filters = input_tensor.shape[-1]
    if len(input_tensor.shape) == 2:
        se = layers.Dense(filters // reduction, activation='relu')(input_tensor)
        se = layers.Dense(filters, activation='sigmoid')(se)
        return layers.Multiply()([input_tensor, se])
    else:
        se = layers.GlobalAveragePooling2D()(input_tensor)
        se = layers.Reshape((1, 1, filters))(se)
        se = layers.Dense(filters // reduction, activation='relu')(se)
        se = layers.Dense(filters, activation='sigmoid')(se)
        return layers.Multiply()([input_tensor, se])

# Lambda function
def custom_lambda_function(x):
    return tf.expand_dims(x, axis=1)


# Load AMD model function
def get_amd_model():
    try:
        custom_objects = {
            'GraphConstruction': GraphConstruction,
            'GraphConvolution': GraphConvolution,
            'se_block': se_block,
            'Lambda': CustomLambda,
            'lambda': custom_lambda_function,  # Custom Lambda function for deserialization
        }
        model = load_model(AMD_MODEL_PATH, custom_objects=custom_objects, safe_mode=False)
        print("AMD Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None