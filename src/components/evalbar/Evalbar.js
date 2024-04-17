/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import "./EvalBar.css";
import blunderSound from "../../assets/blunder-sound.mp3";

function EvalBar({
  evaluation,
  whitePlayer,
  blackPlayer,
  result,
  layout,
  customStyles,
  alert,
  onBlunder,
  lastFEN,
}) {
  const prevEvaluationRef = useRef(null);
  const prevResultRef = useRef(undefined);
  const blunderSoundRef = useRef(null);

  const [displayBlunder, setDisplayBlunder] = React.useState(false);

  const onBlunderFunction = () => {
    onBlunder();
    setDisplayBlunder(true);
    setTimeout(() => {
      setDisplayBlunder(false);
    }, 60000);
  };

  useEffect(() => {
    if (prevEvaluationRef.current !== null) {
      const prevEval = prevEvaluationRef.current;
      const currentEval = evaluation;

      const isBlunder = (prevEval, currentEval) => {
        if (prevEval >= -4 && prevEval <= 4) {
          if (Math.abs(currentEval - prevEval) >= 0.6) {
            return true;
          }
        }
        return false;
      };

      if (isBlunder(prevEval, currentEval)) {
        onBlunderFunction();
      }
    }
    prevEvaluationRef.current = evaluation;
  }, [evaluation, onBlunder]);

  useEffect(() => {
    if (
      prevResultRef.current !== undefined &&
      prevResultRef.current !== result &&
      result !== null
    ) {
      blunderSoundRef.current.volume = 0.8; // Set volume to 60%
      blunderSoundRef.current.play();
      onBlunder();
    }
    prevResultRef.current = result;
  }, [result, onBlunder]);

  const getBarSegment = (evalValue) => {
    return Math.min(Math.max(Math.round(evalValue), -5), +5);
  };

  const getWhiteBarWidth = () => {
    if (evaluation >= 99) return "100%";
    if (evaluation >= 4) return "90%";
    if (evaluation <= -4) return "10%";
    return `${50 + getBarSegment(evaluation) * 7.5}%`;
  };

  const formatName = (name) => {
    // Remove commas and other unwanted characters
    const cleanedName = name.replace(/[,.;]/g, "").trim();
    const parts = cleanedName.split(" ").filter((part) => part.length > 0); // Filter empty parts

    // Special cases:
    if (parts.includes("Praggnanandhaa")) {
      return "Pragg";
    }
    if (parts.includes("Nepomniachtchi")) {
      return "Nepo";
    }
    if (parts.includes("Goryachkina")) {
      return "Gorya";
    }
    if (parts.includes("Gukesh")) {
      return "Gukesh";
    }

    // Find the shortest name
    let shortestName = parts[0] || ""; // Initialize with empty string
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].length < shortestName.length) {
        shortestName = parts[i];
      }
    }

    return shortestName;
  };

  const formatEvaluation = (evalValue) => {
    if (evalValue < -1000 || evalValue > 1000) {
      return "Checkmate";
    }
    return evalValue;
  };

  const displayResult =
    result !== null ? formatEvaluation(result) : formatEvaluation(evaluation);
  const evalDisplayClass = result !== null ? "result" : "evaluation-value";

  return (
    <Box
      className={`eval-container ${layout} ${alert ? "blink-border" : ""}`}
      style={{
        background: customStyles.evalContainerBg,
        border: `1px solid ${customStyles.evalContainerBorderColor}`,
        // rounded corners
        borderRadius: "6px",
      }}
    >
      <Box
        className="player-names"
        display="flex"
        justifyContent="space-between"
      >
        <Typography
          variant="h6"
          className="white-player"
          style={{
            background: customStyles.whitePlayerColor,
            color: customStyles.whitePlayerNameColor,
            fontSize: "1.3rem",
            padding: "6px 13px",
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
            fontSize: "1.3rem",
            padding: "6px 13px",
          }}
        >
          <b>{formatName(blackPlayer)}</b>
        </Typography>
      </Box>
      <div
        style={{
          textAlign: "center",
          position: "absolute",
          color: "white",
          top: "0px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "1rem",
        }}
      >
        {lastFEN && " #" + getLastMove(lastFEN)}
      </div>

      <Typography
        variant="h7"
        className={evalDisplayClass}
        style={{
          marginTop: result !== null ? "7px" : "7px",
          marginBottom: "5px",
          fontSize: "23px",
          color: result !== null ? "white" : "black",
          fontWeight: "bold",
          position: "absolute",
          zIndex: 1,
          left: "50%",
          transform:
            result !== null
              ? "translateX(calc(-50% + 0px))"
              : "translateX(-50%)",
        }}
      >
        {displayResult}
      </Typography>

      {!result && (
        <Box
          className="eval-bars"
          style={{
            height: "30px",
            borderRadius: "15px",
            background: customStyles.blackBarColor,
            overflow: "hidden",
            margin: "5px 0",
            position: "relative",
            zIndex: 0,
          }}
        >
          <Box
            className="white-bar"
            style={{
              width: getWhiteBarWidth(),
              background: customStyles.whiteBarColor,
            }}
          ></Box>
          <Box className="zero-marker"></Box>
        </Box>
      )}
      <audio ref={blunderSoundRef} src={blunderSound} />

      {displayBlunder && (
        <div
          style={{
            borderRadius: "50%",
            padding: "2px",
            background: "red",
            position: "absolute",
            top: "0px",
            right: "0px",
            // bouncing animation for 10 seconds
            animation: "pulse 1.5s infinite",
            fontSize: "12px",
          }}
        >
          ??
        </div>
      )}
    </Box>
  );
}

// get the last move from FEN

function getLastMove(fen) {
  const parts = fen.split(" ");
  if (parts.length < 4) return null;
  return parts[parts.length - 1];
}

export default EvalBar;
