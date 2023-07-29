//working on a feature for later use

import React from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js'; 
import EvalBar from './evalbar';

function ChessBoardComponent({ fen, evaluation }) {
    const game = new Chess(fen);
    const handleDrop = ({ sourceSquare, targetSquare }) => {
        // Check if the move is legal
        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' /
    
''    });

       
        if (move !== null) {
           
        }
    };

    return (
        <div className="chessboard-container">
            <Chessboard 
                position={fen}
                onDrop={handleDrop}
                width={400} // Adjust width as needed
            />
            <EvalBar evaluation={evaluation} />
        </div>
    );
}

export default ChessBoardComponent;
