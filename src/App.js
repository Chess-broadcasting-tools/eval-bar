import React, { useState, useRef, useEffect } from 'react';
import { Toolbar, Button, Container, Box, ButtonGroup} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Chess } from 'chess.js';
import EvalBar from './evalbar';
import css from './App.css';
import TournamentsList from './TournamentsList';
import { WidthFull } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'transparent',
    },
    primary: {
      main: '#ADD8E6',
    },
    secondary: {
      main: '#b9bbce',
    },
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

const GameCard = ({ game, onClick, isSelected }) => (
  <Button 
      variant={isSelected ? "contained" : "outlined"} 
      color={isSelected ? "primary" : "secondary"} 
      style={{
          margin: '2px',
          padding: '6px',
          fontSize: '0.8em',
          fontWeight: 'bold',
          boxShadow: isSelected ? '0px 0px 12px 2px rgba(252,188,213,0.6)' : 'none'
      }}
      onClick={onClick}
  >
      {game}
  </Button>
);
function App() {
  const [broadcastIDs, setBroadcastIDs] = useState([]);
  const [isBroadcastLoaded, setIsBroadcastLoaded] = useState(false);
  const [links, setLinks] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [background, setBackground] = useState('chroma');
  const [isChromaBackground, setIsChromaBackground] = useState(true);
  const [prevEvals, setPrevEvals] = useState({});
  const [layout, setLayout] = useState('grid'); // default layout is 'row'

  const allGames = useRef("");
  const abortControllers = useRef({});

  const fetchEvaluation = async (fen) => {
    const endpoint = `http://139.59.79.118:5000/evaluate?fen=${encodeURIComponent(fen)}`;
    const response = await fetch(endpoint, { method: 'GET', mode: 'cors' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  };
 // default to dark background
 const handleRemoveLink = (index) => {
  setLinks(prevLinks => prevLinks.filter((link, i) => i !== index));
};

const toggleBackground = () => {
  if (background === 'chroma') {
    document.body.classList.remove('chroma-background');
    document.body.classList.add('dark-background');
    setBackground('dark');
  } else {
    document.body.classList.remove('dark-background');
    document.body.classList.add('chroma-background');
    setBackground('chroma');
  }
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

    const processStream = async () => {
      const { done, value } = await reader.read();
      if (done) return;

      allGames.current += new TextDecoder().decode(value);
      updateEvaluations();
      fetchAvailableGames();
      setTimeout(processStream, 10);
    };
    processStream();
  };

  const handleCloseConnection = () => {
    Object.values(abortControllers.current).forEach(controller => controller.abort());
    abortControllers.current = {};
    setIsBroadcastLoaded(false);
    setBroadcastIDs([]);
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
    setSelectedGames([]); // Clear selected games after adding
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
        .filter(line => {
            return !line.startsWith('[') && !line.includes('[Event');
        })
        .join(' ')
        .replace(/ {.*?}/g, '')
        .trim();
        const formatName = (name) => {
          const cleanedName = name.replace(/\(.*?\)/g, '').trim();
          const parts = cleanedName.split(' ').filter(part => part.length > 3);
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
    const prevEval = prevEvals[link.whitePlayer + link.blackPlayer];


              try {
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
              } catch (e) {
                  setLinks(prevLinks => {
                      const updatedLinks = [...prevLinks];
                      const idx = updatedLinks.findIndex(l => l.whitePlayer === link.whitePlayer && l.blackPlayer === link.blackPlayer);
                      if (idx !== -1) {
                          updatedLinks[idx] = {
                              ...link,
                              error: e.message,
                              lastFEN: currentFEN,
                          };
                      }
                      return updatedLinks;
                  });
              }
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
  
  useEffect(() => {
    if (links.length) {
      const interval = setInterval(() => {
        updateEvaluations();
      }, 2000); // Check every 2 seconds
      return () => clearInterval(interval);  // Cleanup on component unmount or if links change
    }
  }, [links]);
  useEffect(() => {
    if (isChromaBackground) {
      document.body.classList.add('chroma-background');
      document.body.classList.remove('dark-background');
    } else {
      document.body.classList.remove('chroma-background');
      document.body.classList.add('dark-background');
    }
  }, [isChromaBackground]);







  return (
    <ThemeProvider theme={theme}>
        <Container maxWidth="md" className={isChromaBackground ? 'chroma-background' : 'dark-background'}>
        <Toolbar>
    <Box style={{ display: 'flex', justifyContent: 'center', flexGrow: 1.5 }}>
        <img src="https://i.imgur.com/z2fbMtT.png" alt="ChessBase India Logo" style={{ height: '100px', marginTop: '20px' }} />
    </Box>
    <Button 
        variant="contained" 
        onClick={toggleBackground}
    >
        BG
    </Button>
</Toolbar>
            
            {isBroadcastLoaded ? (
                <Box mt={4} px={3}
                    sx={{
                        backgroundColor: 'rgba(1, 1, 1, 0.6)',
                        padding: 2,
                        borderRadius: 2,
                        marginBottom: 2
                    }}>
                    {availableGames.map((game, index) => (
                        <GameCard 
                            key={index} 
                            game={game} 
                            onClick={() => handleGameSelection(game)}
                            isSelected={selectedGames.includes(game)}
                        />
                    ))}
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '10px' }}
                        onClick={addSelectedGames}
                    >
                        Add Selected Games Bar
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        style={{ marginTop: '10px' }}
                        onClick={handleCloseConnection}
                    >
                        Close Connection
                    </Button>
                </Box>
            ) : (
                <TournamentsList onSelect={handleTournamentSelection} />
            )}
            
            <Box mt={4} px={3} className="eval-bars-container">
    {links.map((link, index) => (
      <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center" style={{ marginBottom: '0px' }}>
            <Button className="close-button" onClick={() => handleRemoveLink(index)}>Close</Button>
            <EvalBar
                key={`${link.whitePlayer}-${link.blackPlayer}-${link.result}`} 
                evaluation={link.evaluation}
                whitePlayer={link.whitePlayer}
                blackPlayer={link.blackPlayer}
                result={link.result}
                layout={layout}
            />
        </Box>
    ))}
</Box>
        </Container>
    </ThemeProvider>
);
                }
export default App;
