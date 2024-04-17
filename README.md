# ChessBase India Broadcast Feature

This is a React-based application that allows broadcasters to display multiple evaluation bars for different chess games happening simultaneously. The project was created using \`create-react-app\`.

## Features

- **Multiple Game Displays**: The broadcaster can display evaluation bars for multiple chess games at the same time, allowing viewers to keep track of the progress and positions of multiple games.
- **Real-time Updates**: The evaluation bars update in real-time, providing viewers with a dynamic and up-to-date view of the games.
- **Customizable Layouts**: The broadcaster can customize the layout of the evaluation bars, adjusting their size, position, and arrangement to suit their preferences.
- **Responsive Design**: The application is designed to be responsive, ensuring a great user experience on various devices and screen sizes.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Chess-broadcasting-tools/eval-bar.git
   ```

2. **Install Dependencies**:
   ```bash
   cd eval-bar
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```

   This will start the development server and open the application in your default web browser.

## Usage

1. **Use the deployed Backend or serve your own stockfish**: As of when this readme was written the backend(stockfish served via flask) is "https://stockfish.broadcastsofcbi.live/evaluate?fen={fen}" example usage below . To use this backend you don't have to do anything , the API call is being made through App.js , and the endpoint is mentioned. 
  ```bash
https://stockfish.broadcastsofcbi.live/evaluate?fen=2r2r1k/pp4pp/8/1N1p1PR1/P1Bp4/3P3q/1PP2P1N/3R3K%20w%20-%20-%200%2022
 ```
2.**Deploy to Production**: When you're ready to deploy the application to production, use the following command:
   ```bash
   npm run build
   ```
This will create an optimized production build that you can deploy to your hosting platform.

3. **Select Tournament**: To display the games , use the /evalbars route, you should be able to see ongoing tournaments, if you see no tournaments that means no tournaments are going on . To still use and test it, you can use a old lichess broadcast link in the custom url input box. You can select the desired tournament/tournaments and then click on Confirm button , and select the required bars and then click "Add selected games bar" 

4. **Customize Layout**: Adjust the layout of the evaluation bars by modifying the customize the bars button. 


   This will create an optimized production build that you can deploy to your hosting platform.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request. Contributions are always welcome!

## License

This project is licensed under the [MIT License](LICENSE).
