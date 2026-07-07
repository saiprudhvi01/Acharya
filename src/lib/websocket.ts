import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'notification' | 'ping';
  userId?: string;
  data?: any;
}

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

let wss: WebSocketServer | null = null;
const clients = new Map<WebSocket, ClientConnection>();
const userConnections = new Map<string, Set<WebSocket>>();

export function initializeWebSocketServer(server: any) {
  if (wss) return wss;

  wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const connection: ClientConnection = {
      ws,
      subscriptions: new Set(),
    };

    clients.set(ws, connection);

    ws.on('message', (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        handleMessage(ws, message, connection);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      const connection = clients.get(ws);
      if (connection?.userId) {
        const userSockets = userConnections.get(connection.userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (userSockets.size === 0) {
            userConnections.delete(connection.userId);
          }
        }
      }
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to notification server' }));
  });

  return wss;
}

function handleMessage(ws: WebSocket, message: WebSocketMessage, connection: ClientConnection) {
  switch (message.type) {
    case 'subscribe':
      if (message.userId) {
        connection.userId = message.userId;

        if (!userConnections.has(message.userId)) {
          userConnections.set(message.userId, new Set());
        }
        userConnections.get(message.userId)!.add(ws);

        ws.send(
          JSON.stringify({
            type: 'subscribed',
            userId: message.userId,
            message: `Subscribed to notifications for user ${message.userId}`,
          })
        );
      }
      break;

    case 'unsubscribe':
      if (connection.userId) {
        const userSockets = userConnections.get(connection.userId);
        if (userSockets) {
          userSockets.delete(ws);
        }
        connection.userId = undefined;
      }
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

export function broadcastToUser(userId: string, notification: any) {
  const userSockets = userConnections.get(userId);
  if (userSockets) {
    const message = JSON.stringify({
      type: 'notification',
      data: notification,
    });

    userSockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    });
  }
}

export function broadcastToAll(notification: any) {
  const message = JSON.stringify({
    type: 'notification',
    data: notification,
  });

  clients.forEach((connection) => {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(message);
    }
  });
}

export function getConnectedUsers(): string[] {
  return Array.from(userConnections.keys());
}

export function getUserConnectionCount(userId: string): number {
  return userConnections.get(userId)?.size || 0;
}

export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}
