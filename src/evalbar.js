import React from 'react';
import { Box, Typography } from '@mui/material';

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

  const getBlackBarWidth = () => {
    if (evaluation <= -99) return '100%';
    if (evaluation <= -4) return '90%';
    if (evaluation >= 4) return '10%';
    return `${50 - getBarSegment(evaluation) * 7.5}%`;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      bgcolor: 'rgba(28, 28, 28, 0.5)',  
      borderRadius: 2,
      p: 2, 
      width: '40%',  
      mb: 2
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
        <Typography variant="subtitle1" color="textPrimary">{whitePlayer}</Typography>
        <Typography variant="subtitle1" color="textPrimary">{blackPlayer}</Typography>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', height: '30px', bgcolor: '#f0f0f0', borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ 
          height: '100%', 
          bgcolor: 'white', 
          width: getWhiteBarWidth(),
          transition: 'width 0.8s' // Added transition here
        }}></Box>
        <Box sx={{ 
          height: '100%', 
          bgcolor: 'black', 
          width: getBlackBarWidth(),
          transition: 'width 0.8s' // And here
        }}></Box>
      </Box>
      <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>{evaluation}</Typography>
    </Box>
  );
}

export default EvalBar;
