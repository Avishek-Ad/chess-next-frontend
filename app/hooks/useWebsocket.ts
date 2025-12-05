"use client";

import { useEffect, useRef } from "react";
import { getAccessToken } from "../lib/actions";

export default function useWebsocket(
  url: string,
  onMessage: (data: any) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    let ws: WebSocket | null = null;

    const setupWebsocket = async () => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        console.warn("Could not get access token. Aborting connection.");
        return;
      }
      // ws connection
      ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}${url}?token=${accessToken}`
      );
      wsRef.current = ws;

      // on ws connects
      ws.onopen = () => {
        console.log("websocket connected:", url);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      // on ws disconnects
      ws.onclose = () => {
        console.log("Websocket disconnected", url);
      };

      // on ws errors
      ws.onerror = (error) => {
        console.log("Websocket error :", error);
      };
    };

    setupWebsocket();

    // closes the connection when the component unmounts
    return () => {
      if (ws) {
        console.log("Closing websocket.....");
        ws.close();
      }
    };
  }, [url]);

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
