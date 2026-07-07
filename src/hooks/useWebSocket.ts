import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  userId?: string;
}

interface UseWebSocketProps {
  userId?: string;
  url?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}

export function useWebSocket({
  userId,
  url = `${typeof window !== 'undefined' ? window.location.protocol === 'https:' ? 'wss:' : 'ws:' : 'ws:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/ws`,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoConnect = true,
}: UseWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayRef = useRef(1000);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = 1000;

        // Subscribe to user notifications if userId is provided
        if (userId) {
          wsRef.current?.send(
            JSON.stringify({
              type: 'subscribe',
              userId,
            })
          );
        }

        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (event) => {
        const errorMsg = 'WebSocket error occurred';
        setError(errorMsg);
        onError?.(event);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            reconnectDelayRef.current * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000
          ); // Max 30s delay
          setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMsg);
      setIsConnecting(false);
    }
  }, [url, userId, onConnect, onDisconnect, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const send = useCallback(
    (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket is not connected');
      }
    },
    []
  );

  const ping = useCallback(() => {
    send({ type: 'ping' });
  }, [send]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    send,
    ping,
    connect,
    disconnect,
  };
}
