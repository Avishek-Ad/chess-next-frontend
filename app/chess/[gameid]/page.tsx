"use client";

import React, { useEffect, useRef, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import useWebsocket from "@/app/hooks/useWebsocket";
import apiService from "@/app/services/apiService";
import { useRouter } from "next/navigation";
import useShowMessage from "@/app/hooks/useShowMessage";
import { ChessQueen } from "lucide-react";

function findKingSquare(game: Chess, color: "w" | "b") {
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === "k" && piece.color === color) {
        return "abcdefgh"[c] + (8 - r);
      }
    }
  }
  return null;
}

export default function ChessGame({
  params,
}: {
  params: Promise<{ gameid: string }>;
}) {
  const router = useRouter();
  const { setMessage } = useShowMessage();
  const { gameid } = React.use(params);
  const [game] = useState(new Chess()); // keep a single Chess instance
  const [position, setPosition] = useState(game.fen());
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [players, setPlayers] = useState<{ white: string; black: string }>({
    white: "",
    black: "",
  });
  const [turn, setTurn] = useState<"white" | "black">("white");
  // checking if king is in check
  const [checkSquare, setCheckSquare] = useState<string | null>(null);
  // for highlighting the possible moves
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightSquares, setHighlightSquares] = useState<string[]>([]);

  const orientationRef = useRef(orientation);
  useEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);

  useEffect(() => {
    const fetchOrientation = async () => {
      const response = await apiService.get(`/api/chess/player-side/${gameid}`);
      if (response.orientation) {
        setOrientation(response.orientation);
        setPlayers({ white: response.white, black: response.black });
      }
    };
    fetchOrientation();
  }, [gameid]);

  function checkForChecks() {
    if (game.isCheck()) {
      const kingColor = game.turn(); // side in check
      const sq = findKingSquare(game, kingColor);
      setCheckSquare(sq);
    } else {
      setCheckSquare(null);
    }
  }

  const onSquareClick = (square: Square) => {
    const piece = game.get(square);

    // Clear previous highlights
    setSelectedSquare(null);
    setHighlightSquares([]);

    // No piece on clicked square
    if (!piece) return;

    // Block selecting opponent’s pieces
    if (
      (orientation === "white" && piece.color !== "w") ||
      (orientation === "black" && piece.color !== "b")
    ) {
      return;
    }

    // Select the square
    setSelectedSquare(square);

    // Get all legal moves starting from this square
    const moves = game.moves({ square, verbose: true });

    // Extract all target squares
    const targets = moves.map((move) => move.to);

    setHighlightSquares(targets);
  };

  // Try to make a move; returns the move object if valid, otherwise null
  const makeAMove = (move: string): Move | null => {
    let result: Move | null = null;
    try {
      result = game.move(move);
    } catch (error) {
      // console.warn("Illegal move attempted (caught by makeAMove):", error);
      return null;
    }
    if (result !== null) {
      setPosition(game.fen());
    }

    return result;
  };

  const { sendMove } = useWebsocket(`/ws/chess/${gameid}/`, (data) => {
    // console.log("Move received from server:", data);
    if (!game) {
      // console.warn("Game not ready yet, buffering move:", data);
      return;
    }

    if (data.status == "finished" && data.winner) {
      // close all active websocket for this user
      // handle id winner or looser
      // console.log("OVER : ", data);
      router.push(`/chess/result/${gameid}`);
    }

    if (data.fen && position !== data.fen) {
      // console.log("GAME FEN RECEIVED and its different: ", data.fen);
      game.load(data.fen);
      setPosition(data.fen);
      const nextTurn = game.turn() === "w" ? "white" : "black";
      setTurn(nextTurn);
      checkForChecks();
    }

    if (!data.move) return;

    // only applying the correct moves
    const receivedMovePlayer = data.move.player; // Assuming "white" or "black"
    const currentOrientation = orientationRef.current; // Your assigned color ("white" or "black")
    const expectedTurn = game.turn() === "w" ? "white" : "black"; // The player chess.js expects to move next

    // Donot reapply my own move
    if (receivedMovePlayer === currentOrientation) {
      // console.log("NOT APPLYING MY OWN MOVE", currentOrientation, expectedTurn);
      return;
    }

    // The move received *must* belong to the player whose turn it is
    if (receivedMovePlayer !== expectedTurn) {
      // console.warn(
      //   `Turn Mismatch: Received a move from ${receivedMovePlayer} but chess.js expects ${expectedTurn}. The client state is likely out of sync.`
      // );
      // LATER
      // may need to request the FEN from the server here to resync the game.
      return;
    }

    // Update your chessboard state here
    const moveInfo: any = {
      from: data.move.from,
      to: data.move.to,
    };

    // Only promotes if the pawn reaches the last rank
    if (
      data.move.piece === "p" &&
      (data.move.to.endsWith("8") || data.move.to.endsWith("1"))
    ) {
      moveInfo.promotion = "q";
    }
    // console.log("WHY INVALID: ", moveInfo);
    game.move(moveInfo);
    setPosition(game.fen());

    // checking got any checks to king
    checkForChecks();

    // turn of other player
    const nextTurn = game.turn() === "w" ? "white" : "black";
    // console.log("WHOSE TURN IS IT", nextTurn);
    setTurn(nextTurn);
  });

  // Called when a piece is dropped on the board
  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    const piece = game.get(sourceSquare); // returns { type: 'p', color: 'w' } or null
    if (!piece) return false; // no piece to move

    // checking if its the current players turn
    const currentTurn = game.turn() === "w" ? "white" : "black";
    if (orientation !== currentTurn) {
      setMessage(true, "It's not your turn!");
      return false;
    }

    // BLOCK moves for opponent pieces
    if (
      (orientation === "white" && piece.color !== "w") ||
      (orientation === "black" && piece.color !== "b")
    ) {
      setMessage(true, "Cannot move opponent piece");
      return false; // can't move opponent's pieces
    }

    const moveInfo: any = {
      from: sourceSquare,
      to: targetSquare,
    };

    // Only promote if a pawn reaches the last rank
    if (
      piece.type === "p" &&
      ((piece.color === "w" && targetSquare.endsWith("8")) ||
        (piece.color === "b" && targetSquare.endsWith("1")))
    ) {
      moveInfo.promotion = "q"; // promote to queen
    }
    const move = makeAMove(moveInfo);

    // if (!move) return false; // illegal move
    if (!move) {
      // This handles the illegal move case
      setMessage(
        true,
        `(${sourceSquare} -> ${targetSquare}) That is an illegal move!`
      );
      return false; // illegal move
    }

    // Sending move to the server (((in later version also will send promotion to which piece)))
    sendMove({
      from: sourceSquare,
      to: targetSquare,
      player: orientation,
    });

    // clearing the highlighted squares
    setSelectedSquare(null);
    setHighlightSquares([]);

    // checking got any checks to king
    checkForChecks();

    // whose turn is next
    const nextTurn = game.turn() === "w" ? "white" : "black";
    // console.log("WHOSE TURN IS IT, LOCAL CHECK", nextTurn);
    setTurn(nextTurn);

    // console.log("Move made, LOCAL CHECK:", move);
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Participants & Turn Indicator */}
      <div className="w-full max-w-xl flex justify-between items-center mb-3 px-2 sm:px-4">
        {/* --- White Player --- */}
        <div
          className={`
            relative flex items-center gap-2 sm:gap-3
            px-3 sm:px-6 py-2 sm:py-3
            rounded-xl sm:rounded-2xl
            transition-all duration-300 ease-in-out border-2
            ${
              turn === "white"
                ? "bg-white text-gray-900 scale-105 sm:scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)] sm:shadow-[0_0_20px_rgba(255,255,255,0.4)] border-green-500 z-10"
                : "bg-gray-800 text-gray-400 opacity-50 border-transparent scale-100 grayscale"
            }
          `}
        >
          {/* White Icon */}
          <div
            className={`p-1.5 sm:p-2 rounded-full ${
              turn === "white" ? "bg-gray-100" : "bg-gray-700"
            }`}
          >
            <ChessQueen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs tracking-wider font-semibold opacity-70">
              White
            </span>
            <span className="font-bold text-sm sm:text-lg leading-none">
              {players.white}
            </span>
          </div>

          {/* Turn Indicator */}
          {turn === "white" && (
            <span className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-green-500"></span>
            </span>
          )}
        </div>

        {/* --- VS --- */}
        <div className="text-gray-500 font-bold text-xs sm:text-sm italic opacity-30">
          VS
        </div>

        {/* --- Black Player --- */}
        <div
          className={`
            relative flex items-center gap-2 sm:gap-3
            px-3 sm:px-6 py-2 sm:py-3
            rounded-xl sm:rounded-2xl
            transition-all duration-300 ease-in-out border-2
            ${
              turn === "black"
                ? "bg-gray-900 text-white scale-105 sm:scale-110 shadow-[0_0_12px_rgba(0,0,0,0.5)] sm:shadow-[0_0_20px_rgba(0,0,0,0.5)] border-green-500 z-10"
                : "bg-gray-800 text-gray-400 opacity-50 border-transparent scale-100 grayscale"
            }
          `}
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-xs tracking-wider font-semibold opacity-70">
              Black
            </span>
            <span className="font-bold text-sm sm:text-lg leading-none">
              {players.black}
            </span>
          </div>

          {/* Black Icon */}
          <div
            className={`p-1.5 sm:p-2 rounded-full ${
              turn === "black"
                ? "bg-gray-800 border border-gray-700"
                : "bg-gray-700"
            }`}
          >
            <ChessQueen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Turn Indicator */}
          {turn === "black" && (
            <span className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-green-500"></span>
            </span>
          )}
        </div>
      </div>


      {/* Orientation/User Feedback whose turn is it */}
      <div className="text-center text-green-400 font-bold h-7 flex items-center justify-center">
        {orientation === turn && (
          <span className="animate-pulse">It is your turn!</span>
        )}
      </div>


      {/* Chessboard */}
      <div className="w-full max-w-xl flex justify-center bg-white rounded-lg shadow-lg">
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          boardOrientation={orientation}
          animationDuration={200}
          customSquareStyles={{
            ...(checkSquare
              ? { [checkSquare]: { backgroundColor: "rgba(255, 0, 0, 0.5)" } }
              : {}),
            ...highlightSquares.reduce((acc, sq) => {
              acc[sq] = { backgroundColor: "rgba(0, 255, 0, 0.4)" };
              return acc;
            }, {} as any),
            ...(selectedSquare
              ? {
                  [selectedSquare]: {
                    backgroundColor: "rgba(0, 150, 255, 0.4)",
                  },
                }
              : {}),
          }}
        />
      </div>
    </div>
  );
}
