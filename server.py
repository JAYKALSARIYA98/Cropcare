import transformers
import torch
from flask import Flask, request, jsonify
import os
from flask_cors import CORS



app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Ensure your environment variable for API key is set if needed
# os.environ["API_KEY"] = "your_api_key_here"

model_id = "./Lexi-Llama-3-8B-Uncensored_F16.gguf"
pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
)

@app.route('/chat', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('message', '')

    if not prompt:
        return jsonify({'error': 'No message provided'}), 400

    outputs = pipeline(prompt, max_new_tokens=256)
    result = outputs[0]['generated_text']

    return jsonify({'response': result})

if __name__ == '__main__':
    app.run(port=5000)
