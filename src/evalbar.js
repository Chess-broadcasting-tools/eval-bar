import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import './EvalBar.css';

function EvalBar({ evaluation, whitePlayer, blackPlayer, result, layout, customStyles }) {
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
    
     const displayResult = formatEvaluation(result || evaluation);
     return (
    
        <Box className={`eval-container ${layout}`} style={{ background: customStyles.evalContainerBg, border: `5px solid ${customStyles.evalContainerBorderColor}` }}>

<Box className="player-names" display="flex" justifyContent="space-between">
    <Typography 
        variant="h6" 
        className="white-player" 
        style={{ 
            background: customStyles.whitePlayerColor, 
            color: customStyles.whitePlayerNameColor, 
            fontSize: '1.2rem', // Adjust the font size as needed
            padding: '2px 8px'
        }}
    >
        <b>{formatName(whitePlayer)}</b>
    </Typography>
    <Typography 
        variant="h6" 
        className="black-player" 
        style={{ 
            background: customStyles.blackPlayerColor, 
            color: customStyles.blackPlayerNameColor, 
            fontSize: '1.2rem', // Adjust the font size as needed
            padding: '2px 8px'
        }}
    >
        <b>{formatName(blackPlayer)}</b>
    </Typography>
</Box>

            <Typography variant="h7" color="white" className="evaluation-value" style={{ marginTop: '5px', marginBottom: '5px', fontSize: '18px', fontWeight: 'bold' }}>
                {result || evaluation}
            </Typography>
            {!result && (
                <Box className="eval-bars" style={{ height: '30px', borderRadius: '15px', background: customStyles.blackBarColor, overflow: 'hidden', margin: '5px 0' }}>
                    <Box className="white-bar" style={{ width: getWhiteBarWidth(), background: customStyles.whiteBarColor }}></Box>
                    <Box className="zero-marker"></Box>
                </Box>
            )}
        </Box>
    );
}

export default EvalBar;