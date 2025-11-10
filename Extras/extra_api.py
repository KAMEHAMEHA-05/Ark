from flask import Flask, request, jsonify
from llm import gemini, gpt

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
