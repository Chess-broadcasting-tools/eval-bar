import React from 'react';
import { Box, Typography } from '@mui/material';
import './EvalBar.css';

function EvalBar({ evaluation, whitePlayer = 'White', blackPlayer = 'Black' }) {

  const getBarSegment = (evalValue) => {
    return Math.min(Math.max(Math.round(evalValue), -4), 4);
  };

  const getWhiteBarWidth = () => {
    if (evaluation >= 99) return '100%';
    if (evaluation >= 4) return '90%';
    if (evaluation <= -4) return '10%';
    return `${50 + getBarSegment(evaluation) * 7.5}%`;
  };

  return (
    <Box className="eval-container">
      <Box className="player-names">
        <Typography variant="subtitle1" className="white-player">{whitePlayer}</Typography>
        <Typography variant="subtitle1" className="black-player">{blackPlayer}</Typography>
      </Box>
      <Box className="eval-bars">
        <Box className="white-bar" style={{ width: getWhiteBarWidth() }}></Box>
      </Box>
      <Typography variant="h6" color="textSecondary" className="evaluation-value">{evaluation}</Typography>
    </Box>
  );
}

export default EvalBar;
