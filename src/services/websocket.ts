import { ActivityItem } from '../types';

export interface WSEvent {
  type: 'NOTIFICATION' | 'DATA_UPDATE' | 'PING' | 'PONG';
  entity?: string;
  data?: any;
  message?: string;
  timestamp: string;
}

type EventListener = (event: WSEvent) => void;
type NotificationListener = (activity: ActivityItem) => void;
type DataUpdateListener = (entity?: string, data?: any) => void;

class TurniaWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private eventListeners: Set<EventListener> = new Set();
  private notificationListeners: Set<NotificationListener> = new Set();
  private dataUpdateListeners: Set<DataUpdateListener> = new Set();
  private isExplicitlyClosed = false;

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // When using Vite proxy, port 3001 or window.location.hostname:3001
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:3001/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('⚡ [Turnia WebSockets] Conectado en tiempo real al servidor.');
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const payload: WSEvent = JSON.parse(event.data);
          this.handleIncomingMessage(payload);
        } catch (e) {
          console.warn('Error parsing incoming WS frame:', e);
        }
      };

      this.socket.onclose = () => {
        this.stopHeartbeat();
        if (!this.isExplicitlyClosed) {
          console.log('🔌 [Turnia WebSockets] Conexión cerrada. Reconectando en 3s...');
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (err) => {
        console.warn('⚠️ [Turnia WebSockets] Error en la conexión socket:', err);
      };
    } catch (e) {
      console.error('Failed to initialize WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  private handleIncomingMessage(payload: WSEvent): void {
    // Notify generic listeners
    this.eventListeners.forEach((listener) => listener(payload));

    // Handle notifications
    if (payload.type === 'NOTIFICATION' && payload.data) {
      this.notificationListeners.forEach((listener) => listener(payload.data));
    }

    // Handle data refresh events
    if (payload.type === 'DATA_UPDATE') {
      this.dataUpdateListeners.forEach((listener) => listener(payload.entity, payload.data));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  public subscribe(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  public onDataUpdate(listener: DataUpdateListener): () => void {
    this.dataUpdateListeners.add(listener);
    return () => this.dataUpdateListeners.delete(listener);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new TurniaWebSocketService();
