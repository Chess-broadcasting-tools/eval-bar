import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import './EvalBar.css';

function EvalBar({ evaluation, whitePlayer = 'White', blackPlayer = 'Black', result, layout }) {
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
    
        const pragPart = parts.find(part => part === "Praggnanandhaa");
        if (pragPart) {
            return "Pragg";
        }

        return parts.sort((a, b) => a.length - b.length)[0] || cleanedName.split(' ')[0];
    };

    const formatEvaluation = (evalValue) => {
        if (evalValue < -1000 || evalValue > 1000) {
            return "Checkmate";
        }
        return evalValue;
    };

    return (
        <Box className={`eval-container ${layout}`}>
            <Box className="player-names" display="flex" justifyContent="space-between">
                <Typography variant="h6" className="white-player"><b>{formatName(whitePlayer)}</b></Typography>
                <Typography variant="h6" className="black-player"><b>{formatName(blackPlayer)}</b></Typography>
            </Box>
            <Typography variant="subtitle1" color="white" className="evaluation-value">
                {result || formatEvaluation(evaluation)}
            </Typography>
            {!result && (
                <Box className="eval-bars">
                    <Box className="white-bar" style={{ width: getWhiteBarWidth() }}></Box>
                </Box>
            )}
        </Box>
    );
}

export default EvalBar;
