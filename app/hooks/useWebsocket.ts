"use client";

import { useEffect, useRef } from "react";

export default function useWebsocket(
  socketid: string,
  onMessage: (data: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!socketid) return;

    // ws connection
    const ws = new WebSocket(`${process.env.NEXT_WEBSOCKET_URL}/ws/chess/${socketid}/`);
    wsRef.current = ws;

    // on ws connects
    ws.onopen = () => {
      console.log("websocket connected: ", socketid);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    // on ws disconnects
    ws.onclose = () => {
      console.log("Websocket disconnected");
    };

    // on ws errors
    ws.onerror = (error) => {
      console.log("Websocket error :", error);
    };

    // closes the connection when the component unmounts
    return () => {
      console.log("Closing websocket.....");
      ws.close();
    };
  }, [socketid]);

  // this function sends data to the server
  const sendMove = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not open. Cannot send message");
    }
  };

  return { ws: wsRef.current, sendMove };
}
