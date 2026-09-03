import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface WSEvent {
  type: 'NOTIFICATION' | 'DATA_UPDATE' | 'PING' | 'PONG';
  entity?: string;
  data?: any;
  message?: string;
  timestamp: string;
}

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocketServer(httpServer: HttpServer): WebSocketServer {
  wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    clients.add(ws);
    console.log(`🔌 [WebSocket] Nuevo cliente conectado desde ${req.socket.remoteAddress}. Clientes activos: ${clients.size}`);

    // Send initial welcome/ready handshake
    const welcomePayload: WSEvent = {
      type: 'NOTIFICATION',
      message: 'Conexión WebSocket en tiempo real establecida con Turnia.',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(welcomePayload));

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (e) {
        // Ignore unparseable frames
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`🔌 [WebSocket] Cliente desconectado. Clientes activos restantes: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.warn('⚠️ [WebSocket] Error en cliente socket:', err.message);
      clients.delete(ws);
    });
  });

  console.log('⚡ Servidor WebSocket inicializado en ruta /ws');
  return wss;
}

export function broadcastEvent(event: Omit<WSEvent, 'timestamp'>): void {
  const fullPayload: WSEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const payloadStr = JSON.stringify(fullPayload);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payloadStr);
      } catch (err) {
        console.warn('Error broadcasting to WS client:', err);
      }
    }
  });
}

export function broadcastNotification(activity: any): void {
  broadcastEvent({
    type: 'NOTIFICATION',
    entity: 'activities',
    data: activity,
    message: activity.title,
  });
}
