from flask import Flask, request, jsonify
from flask_cors import CORS
from stockfish import Stockfish

app = Flask(__name__)
CORS(app)

stockfish_path = "//opt/homebrew/bin/stockfish"  
stockfish = Stockfish(stockfish_path)
stockfish.set_depth(10)


@app.route('/evaluate', methods=['GET'])
def evaluate():
    fen = request.args.get('fen')
    
    if not fen:
        return jsonify(error="FEN string not provided"), 400

    stockfish.set_fen_position(fen)
    evaluation = stockfish.get_evaluation()

    # sometimes this responds in mate in xyz , so it is important to do this :) , man i am tired of debu
    if evaluation["type"] == "cp":
        score = evaluation["value"] / 100.0
    elif evaluation["type"] == "mate":
        score = 9999 * evaluation["value"] / abs(evaluation["value"]) 
    
    score = score * 1.2  # to match with lichess evaluation
    score = round(score,1)  # rounding off for better look!


    return jsonify(evaluation=score)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
