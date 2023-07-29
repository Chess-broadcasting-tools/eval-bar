from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from stockfish import Stockfish
import os

app = Flask(__name__, static_folder='./build')
CORS(app)

current_os = os.name
if current_os == 'nt':
    stockfish_path = os.path.join(os.path.dirname(__file__), "stockfish_binaries", "stockfish-windows-x86-64-avx2.exe")
elif current_os == 'posix':
    stockfish_path = "//opt/homebrew/bin/stockfish"
else:
    raise Exception("Unsupported OS")

stockfish = Stockfish(stockfish_path)
stockfish.set_depth(10)

@app.route('/evaluate', methods=['GET'])
def evaluate():
    fen = request.args.get('fen')
    
    if not fen:
        return jsonify(error="FEN string not provided"), 400

    stockfish.set_fen_position(fen)
    evaluation = stockfish.get_evaluation()

    if evaluation["type"] == "cp":
        score = evaluation["value"] / 100.0
    elif evaluation["type"] == "mate":
        score = 9999 * evaluation["value"] / abs(evaluation["value"])
    
    score = score * 1.2
    score = round(score, 1)

    return jsonify(evaluation=score)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("./build/" + path):
        return send_from_directory("./build", path)
    else:
        return send_from_directory("./build", 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
