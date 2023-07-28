Chessbase India Evaluation Bars


<img width="1182" alt="Screenshot 2023-07-28 at 4 02 45 PM" src="https://github.com/Bot-Rakshit/eval-bar/assets/89170079/8b84631a-d6a3-41bf-b921-83a116a8d2c5">


**Overview**
Chessbase India Evaluation Bars is a web application that provides a brief overview of chess games with multiple evaluation bars. Users can input Lichess broadcast IDs, and the application fetches evaluations for each position in the games using a Flask backend with Stockfish as the engine. The frontend is built using React and Material-UI for a responsive and visually appealing user interface.

To get the **Broadcast link** 
<img width="1157" alt="Screenshot 2023-07-28 at 5 39 15 PM" src="https://github.com/Bot-Rakshit/eval-bar/assets/89170079/c7b4748f-9c7d-4721-b6f6-44c95f359a05">

 If you were to clone the probject make sure to change the path of stockfish in "chess_api.py"


**Features**
*Input Lichess broadcast IDs and fetch evaluations for each position in the games.
*Smooth transitions for evaluation bars when the evaluations are updated.
*Visual representation of the evaluation bars with different colors and widths based on the evaluation values.
*Error handling for invalid input and network errors during evaluation fetching.
