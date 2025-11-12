from flask import Flask, request, jsonify, send_file
from llm import gemini, gpt
from notes import note_extract
import os

app = Flask(__name__)

@app.route('/gemini', methods=['POST'])
def query_gemini():   
    """
    Endpoint to receive a query via JSON and return a response from the LLM function.
    Expected JSON format: {"query": "your text query here"}
    """
    if not request.is_json:
        return jsonify({"error": "Invalid input, JSON expected"}), 400  
    data = request.get_json()
    if 'query' not in data: 
        return jsonify({"error": "Missing 'query' field in JSON"}), 400
    query = data['query']
    response = gemini(query)
    # return jsonify({"response": response})
    return response

@app.route('/gpt', methods=['POST'])
def query_gpt():   
    """
    Endpoint to receive a query via JSON and return a response from the LLM function.
    Expected JSON format: {"query": "your text query here"}
    """
    if not request.is_json:
        return jsonify({"error": "Invalid input, JSON expected"}), 400  
    data = request.get_json()
    if 'query' not in data: 
        return jsonify({"error": "Missing 'query' field in JSON"}), 400
    query = data['query']
    response = gpt(query)
    # return jsonify({"response": response})
    return response

@app.route('/notes/<file_name>', methods=['GET'])
def notes(file_name):
    """
    Endpoint to retrieve the content of a note file.
    URL format: /notes/<file_name>
    """
    content = note_extract(file_name)
    if content is None:
        return jsonify({"error": "File not found"}), 404
    return (content)

@app.route('/stdcpp', methods=['GET'])
def download_stdcpp():
    file_path = './stdc++.h'
    return send_file(
        file_path,
        as_attachment=True,         
        download_name='file.txt'     
    )

@app.route('/download_notes/<filename>', methods=['GET'])
def download(filename):
    file_path = './Notes/' + filename + '.txt'
    return send_file(
        file_path,
        as_attachment=True,         
        download_name='file.txt'     
    )

UPLOAD_FOLDER = './Notes'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save the uploaded file
    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    return jsonify({'message': f'File {file.filename} uploaded successfully to {save_path}'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
