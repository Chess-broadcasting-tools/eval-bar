import React, { useState, useRef, useEffect } from 'react';
import { Toolbar, Button, Container, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Chess } from 'chess.js';
import EvalBar from './evalbar';
import TournamentsList from './TournamentsList';
import CustomizeEvalBar from './CustomizeEvalBar';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'transparent',
    },
    primary: {
      main: '#00008b',
    },
    secondary: {
      main: '#b9bbce',
    },
    tertiary: {
      main: '#ADD8E6'
    }
  },
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
   ].join(','),
});

const GameCard = ({ game, onClick, isSelected }) => {
  const variant = isSelected ? "contained" : "outlined";
  const color = isSelected ? "tertiary" : "secondary";
  const boxShadow = isSelected ? '0px  0px  12px  2px rgba(252,188,213,0.6)' : 'none';

  const buttonStyle = {
    margin: '2px',
    padding: '6px',
    fontSize: '0.8em',
    fontWeight: 'bold',
    boxShadow
  };

  return (
    <Button  
      variant={variant}  
      color={color}  
      style={buttonStyle}
      onClick={onClick}
    >
      {game}
    </Button>
  );
};

function App() {
  // Existing state variables
  const [broadcastIDs, setBroadcastIDs] = useState([]);
  const [isBroadcastLoaded, setIsBroadcastLoaded] = useState(false);
  const [links, setLinks] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [customStyles, setCustomStyles] = useState({
    evalContainerBg: '#7c7979',
    blackBarColor: '#000000',
    whiteBarColor: '#ffffff',
    whitePlayerColor: '#ecdab9',
    blackPlayerColor: '#ae8a69',
    whitePlayerNameColor: '#000000',
    blackPlayerNameColor: '#FFFFFF',
    evalContainerBorderColor: '#000000',   
  });

  // New state variables for layout and isChromaBackground
  const [layout, setLayout] = useState('grid'); // Default layout is 'grid'
  const [isChromaBackground, setIsChromaBackground] = useState(false);

  const allGames = useRef("");
  const abortControllers = useRef({});

  const fetchEvaluation = async (fen) => {
    // Construct the query parameters
    const depth =  13; // You can adjust the depth as needed
    const mode = 'eval'; // The mode for evaluation
  
    // Construct the full URL with the FEN, depth, and mode parameters
    const endpoint = `https://stockfish.online/api/stockfish.php?fen=${encodeURIComponent(fen)}&depth=${depth}&mode=${mode}`;
  
    try {
      const response = await fetch(endpoint, { method: 'GET', mode: 'cors' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        // Extract the evaluation value from the response
        const evaluation = data.data.match(/Total evaluation: (-?\d+\.\d+)/)[1];
        return { evaluation }; // Return the evaluation as a number
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  };
  const handleRemoveLink = (index) => {
    setLinks(prevLinks => prevLinks.filter((link, i) => i !== index));
  };

  const handleTournamentSelection = async (tournamentIds) => {
    console.log("Received Tournament IDs:", tournamentIds);  
    setIsBroadcastLoaded(true);
    tournamentIds.forEach(tournamentId => startStreaming(tournamentId));
  };

  const startStreaming = async (tournamentId) => {
    if (abortControllers.current[tournamentId]) abortControllers.current[tournamentId].abort();
    abortControllers.current[tournamentId] = new AbortController();
   
    const streamURL = `https://lichess.org/api/stream/broadcast/round/${tournamentId}.pgn`;
    const response = await fetch(streamURL, { signal: abortControllers.current[tournamentId].signal });
    console.log("Stream URL:", streamURL);
    const reader = response.body.getReader();
    document.body.classList.add('chroma-background');

    const processStream = async () => {
      const { done, value } = await reader.read();
      if (done) return;

      allGames.current += new TextDecoder().decode(value);
      updateEvaluations();
      fetchAvailableGames();
      setTimeout(processStream,  10);
    };
    processStream();
  };

  const fetchAvailableGames = () => {
    const games = allGames.current.split("\n\n\n");
    const gameOptions = games.map(game => {
      const whiteMatch = game.match(/\[White "(.*?)"\]/);
      const blackMatch = game.match(/\[Black "(.*?)"\]/);
      return whiteMatch && blackMatch ? `${whiteMatch[1]} - ${blackMatch[1]}` : null;
    }).filter(Boolean);
    setAvailableGames(Array.from(new Set(gameOptions)));
  };

  const handleGameSelection = (game) => {
    if (selectedGames.includes(game)) {
        setSelectedGames(prevGames => prevGames.filter(g => g !== game));
    } else {
        setSelectedGames(prevGames => [...prevGames, game]);
    }
  };

  const addSelectedGames = () => {
    for (let game of selectedGames) {
      const [whitePlayer, blackPlayer] = game.split(' - ');
      if (!links.some(link => link.whitePlayer === whitePlayer && link.blackPlayer === blackPlayer)) {
        setLinks(prevLinks => [...prevLinks, { evaluation: null, whitePlayer, blackPlayer, error: null, lastFEN: '' }]);
        updateEvaluationsForLink({ whitePlayer, blackPlayer });
      }
    }
    setSelectedGames([]);
  };

  const updateEvaluationsForLink = async (link) => {
    const games = allGames.current.split("\n\n\n");
    const specificGamePgn = games.reverse().find(game => {
      const whiteNameMatch = game.match(/\[White "(.*?)"\]/);
      const blackNameMatch = game.match(/\[Black "(.*?)"\]/);
      return whiteNameMatch && blackNameMatch && `${whiteNameMatch[1]} - ${blackNameMatch[1]}` === `${link.whitePlayer} - ${link.blackPlayer}`;
    });

    if (specificGamePgn) {
      const cleanedPgn = specificGamePgn
        .split('\n')
        .filter(line => !line.startsWith('[') && !line.includes('[Event'))
        .join(' ')
        .replace(/ {.*?}/g, '')
        .trim();
      const formatName = (name) => {
        const cleanedName = name.replace(/\(.*?\)/g, '').trim();
        const parts = cleanedName.split(' ').filter(part => part.length >  3);
        return parts.sort((a, b) => a.length - b.length)[0] || cleanedName.split(' ')[0];
      };

      let gameResult = null;  
      const resultMatch = cleanedPgn.match(/(1-0|0-1|1\/2-1\/2)$/);
      if (resultMatch) {
        const result = resultMatch[1];
        if (result === "1-0") gameResult = `Bravo!! ${formatName(link.whitePlayer)}!`;
        else if (result === "0-1") gameResult = `Bravo!! ${formatName(link.blackPlayer)}!`;
        else if (result === "1/2-1/2") gameResult = "It's a draw! 🤝";
      }

      const chess = new Chess();
      try {
        chess.loadPgn(cleanedPgn);
        const currentFEN = chess.fen();

        if (currentFEN !== link.lastFEN || gameResult !== link.result) {
          const evalData = await fetchEvaluation(currentFEN);
          setLinks(prevLinks => {
            const updatedLinks = [...prevLinks];
            const idx = updatedLinks.findIndex(l => l.whitePlayer === link.whitePlayer && l.blackPlayer === link.blackPlayer);
            if (idx !== -1) {
              updatedLinks[idx] = {
                ...link,
                evaluation: evalData.evaluation,
                lastFEN: currentFEN,
                result: gameResult,
              };
            }
            return updatedLinks;
          });
        }
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
    }
  };

  const updateEvaluations = async () => {
    for (let link of links) {
      await updateEvaluationsForLink(link);
    }
  };

  const handleGenerateLink = () => {
    const stateData = {
      broadcastIDs,
      selectedGames,
      customStyles
    };

    const serializedData = encodeURIComponent(JSON.stringify(stateData));
    navigator.clipboard.writeText(`${window.location.origin}/broadcast/${serializedData}`)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Failed to copy link:', err));
  };
  useEffect(() => {
    if (links.length) {
      const interval = setInterval(() => {
        updateEvaluations();
      },  2000); // Check every  2 seconds
      return () => clearInterval(interval);  // Cleanup on component unmount or if links change
    }
  }, [links]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const stateParam = queryParams.get('state');

    if (stateParam) {
      try {
        const { broadcastIDs, selectedGames, customStyles } = JSON.parse(decodeURIComponent(stateParam));
        setBroadcastIDs(broadcastIDs);
        setSelectedGames(selectedGames);
        setCustomStyles(customStyles);
      } catch (error) {
        console.error("Error parsing state from URL", error);
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" className={isChromaBackground ? 'chroma-background' : 'dark-background'}>
        <Toolbar>
          <Box style={{ display: 'flex', justifyContent: 'center', flexGrow:  1.5 }}>
            <img src="https://i.imgur.com/z2fbMtT.png" alt="ChessBase India Logo" style={{ height: '100px', marginTop: '20px' }} />
          </Box>
        </Toolbar>
        {isBroadcastLoaded ? (
          <Box mt={4} px={3} sx={{ backgroundColor: 'rgba(50,  67,  100,  1)', padding:  2, borderRadius:  2, marginBottom:  2 }}>
            {availableGames.map((game, index) => (
              <GameCard key={index} game={game} onClick={() => handleGameSelection(game)} isSelected={selectedGames.includes(game)} />
            ))}
            <Button variant="contained" color="primary" style={{ marginTop: '10px' }} onClick={addSelectedGames}>
              Add Selected Games Bar
            </Button>
            <CustomizeEvalBar customStyles={customStyles} setCustomStyles={setCustomStyles} />
          </Box>
        ) : (
          <div className="full-width">
            <TournamentsList onSelect={handleTournamentSelection} />
          </div>
        )}
        <Box mt={4} px={3} className="eval-bars-container">
          {links.map((link, index) => (
            <Box key={index} display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center" style={{ marginBottom: '0px' }}>
              <Button className="close-button" onClick={() => handleRemoveLink(index)}>Close</Button>
              <EvalBar
                evaluation={link.evaluation}
                whitePlayer={link.whitePlayer}
                blackPlayer={link.blackPlayer}
                result={link.result}
                layout={layout}
                customStyles={customStyles}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

