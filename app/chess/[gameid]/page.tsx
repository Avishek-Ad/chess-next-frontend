"use client";

import React, { useEffect, useRef, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import useWebsocket from "@/app/hooks/useWebsocket";
import apiService from "@/app/services/apiService";
import { useRouter } from "next/navigation";
import useShowMessage from "@/app/hooks/useShowMessage";

type ShortMove = string; // for example, "e2e4"

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

  const onSquareClick = (square: string) => {
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
  const makeAMove = (move: ShortMove) => {
    const result: Move | null = game.move(move);

    if (result !== null) {
      setPosition(game.fen()); // only update position if move is valid
    }

    return result;
  };

  const { sendMove } = useWebsocket(gameid, (data) => {
    // console.log("Move received from server:", data);

    if (data.status == "finished" && data.winner) {
      // handle id winner or looser
      // console.log("OVER : ", data);
      setTimeout(() => {
        router.push(`result/${gameid}`);
      }, 4000);
    }
    if (!data.move) return;

    // getting the latest
    const currentOrientation = orientationRef.current;
    // donot try to reapply my own move
    if (data.move.player === currentOrientation) {
      // console.log("NOT APPLYING MY OWN MOVE", currentOrientation, turn);
      return;
    }

    // Update your chessboard state here
    const moveInfo: any = {
      from: data.move.from,
      to: data.move.to,
    };

    // Only promote if the pawn reaches the last rank
    if (
      data.move.piece === "p" &&
      (data.move.to.endsWith("8") || data.move.to.endsWith("1"))
    ) {
      moveInfo.promotion = "q";
    }
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
  const onDrop = (sourceSquare: string, targetSquare: string) => {
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

    if (!move) return false; // illegal move

    // Sends move to the server (((in later version also send promotion to which piece)))
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
    // console.log("WHOSE TURN IS IT", nextTurn);
    setTurn(nextTurn);

    // console.log("Move made:", move);
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Participants & Turn Indicator */}
      <div className="w-full max-w-xl flex justify-between items-center mb-4 px-4">
        {/* White Player Indicator */}
        <div
          className={`font-bold text-white px-4 py-2 rounded-xl ${
            turn === "white" ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          White: {players.white}
          {turn === "white" && orientation === "white" && (
            <span className="ml-1 text-sm">← Your turn</span>
          )}
        </div>

        {/* Black Player Indicator */}
        <div
          className={`font-bold text-white px-4 py-2 rounded-xl ${
            turn === "black" ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          Black: {players.black}
          {turn === "black" && orientation === "black" && (
            <span className="ml-1 text-sm">← Your turn</span>
          )}
        </div>
      </div>

      {/* Chessboard */}
      <div className="w-full max-w-xl flex justify-center bg-white rounded-lg shadow-lg">
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick} // <-- ADD THIS
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
