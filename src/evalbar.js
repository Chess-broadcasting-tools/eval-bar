import React from 'react';
import { Box, Typography } from '@mui/material';
import './EvalBar.css';

function EvalBar({ evaluation, whitePlayer = 'White', blackPlayer = 'Black', result }) {
    
    const getBarSegment = (evalValue) => {
        return Math.min(Math.max(Math.round(evalValue), -5), +5);
    };

    const getWhiteBarWidth = () => {
        if (evaluation >= 99) return '100%';
        if (evaluation >= 4) return '90%';
        if (evaluation <= -4) return '10%';
        return `${50 + getBarSegment(evaluation) * 7.5}%`;
    };

    const formatName = (name) => {
        const cleanedName = name.replace(/\(.*?\)/g, '').trim();
        const parts = cleanedName.split(' ').filter(part => part.length > 3);
        return parts.sort((a, b) => a.length - b.length)[0] || cleanedName.split(' ')[0];
    };

    const formatEvaluation = (evalValue) => {
        if (evalValue < -1000 || evalValue > 1000) {
            return "Mate coming soon";
        }
        return evalValue;
    };

    if (result) {
        return (
            <Box className="eval-container">
                <Box className="player-names" display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1" className="white-player"><b>{formatName(whitePlayer)}</b></Typography>
                    <Typography variant="subtitle1" className="black-player"><b>{formatName(blackPlayer)}</b></Typography>
                </Box>
                <Typography variant="h6" color="white" className="evaluation-value">
                    {result}
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="eval-container">
            <Box className="player-names" display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" className="white-player"><b>{formatName(whitePlayer)}</b></Typography>
                <Typography variant="subtitle1" className="black-player"><b>{formatName(blackPlayer)}</b></Typography>
            </Box>
            <Typography variant="subtitle1" color="white" className="evaluation-value">
                {formatEvaluation(evaluation)}
            </Typography>
            <Box className="eval-bars">
                <Box className="white-bar" style={{ width: getWhiteBarWidth() }}></Box>
            </Box>
        </Box>
    );
}

export default EvalBar;
