import React, { useState, useRef, useEffect } from 'react';
import { Toolbar, TextField, Button, Container, Box, Select, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Chess } from 'chess.js';
import EvalBar from './evalbar';
import css from './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'transparent',
    },
    primary: {
      main: '#fcbcd5',
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
},
);

function App() {
  const [broadcastID, setBroadcastID] = useState('');
  const [isBroadcastLoaded, setIsBroadcastLoaded] = useState(false);
  const [links, setLinks] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  const allGames = useRef("");
  const abortController = useRef(null);

  const fetchEvaluation = async (fen) => {
    const endpoint = `http://"IP(of the flask server)"/evaluate?fen=${encodeURIComponent(fen)}`;
    const response = await fetch(endpoint, { method: 'GET', mode: 'cors' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  };

  const startStreaming = async () => {
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    const streamURL = `https://lichess.org/api/stream/broadcast/round/${broadcastID.split('/').pop()}.pgn`;
    const response = await fetch(streamURL, { signal: abortController.current.signal });

    const reader = response.body.getReader();

    const processStream = async () => {
      const { done, value } = await reader.read();
      if (done) return;

      allGames.current += new TextDecoder().decode(value);
      updateEvaluations();
      fetchAvailableGames();
      setTimeout(processStream, 1000); // Re-check for updates every second
    };
    processStream();
  };

  const handleCloseConnection = () => {
    if (abortController.current) abortController.current.abort();
    setIsBroadcastLoaded(false);
    setBroadcastID('');
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

  const handleGameSelection = (event) => {
    setSelectedGame(event.target.value);
  };

  const addSelectedGame = () => {
    if (selectedGame) {
      const [whitePlayer, blackPlayer] = selectedGame.split(' - ');
      if (!links.some(link => link.whitePlayer === whitePlayer && link.blackPlayer === blackPlayer)) {
        setLinks([...links, { evaluation: null, whitePlayer, blackPlayer, error: null, lastFEN: '' }]);
        updateEvaluationsForLink({ whitePlayer, blackPlayer });
      }
    }
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






  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
          <Toolbar>
            <img src="https://i.imgur.com/z2fbMtT.png" alt="ChessBase India Logo" style={{ height: '100px' }} />
          </Toolbar>

        <Box mt={4} px={3}
          sx={{
            backgroundColor: 'rgba(1, 1, 1, 0.6)',
            padding: 2,
            borderRadius: 2,
            marginBottom: 2
          }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Broadcast ID"
            value={broadcastID}
            disabled={isBroadcastLoaded}
            onChange={(e) => setBroadcastID(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '10px' }}
            disabled={isBroadcastLoaded}
            onClick={() => {
              setIsBroadcastLoaded(true);
              startStreaming();
            }}
          >
            Load Broadcast
          </Button>
          <Button
            variant="contained"
            color="secondary"
            style={{ marginTop: '10px' }}
            onClick={handleCloseConnection}
          >
            Close Connection
          </Button>
          <Select
            fullWidth
            value={selectedGame}
            onChange={handleGameSelection}
            sx={{ marginTop: 2 }}
          >
            {availableGames.map((game, index) => (
              <MenuItem key={index} value={game}>
                {game}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '10px' }}
            onClick={addSelectedGame}
          >
            Add Selected Game Bar
          </Button>
        </Box>
        <Box mt={4} px={3} display="flex" flexDirection="column" alignItems="center">
          {links.map((link, index) => (
            <EvalBar
            key={`${link.whitePlayer}-${link.blackPlayer}-${link.result}`} // Changing the key when the result changes
            evaluation={link.evaluation}
            whitePlayer={link.whitePlayer}
            blackPlayer={link.blackPlayer}
            result={link.result}
          />
          ))}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
