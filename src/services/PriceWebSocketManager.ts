import { getErrorHandler, ErrorCategory, ErrorSeverity } from './ErrorHandler';

type PriceHandler = (price: number, timestamp: number) => void;

interface PriceMessage {
  type?: string;
  token: string;
  price: number;
  timestamp: number;
}

export class PriceSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private subs = new Set<string>();
  private handlers = new Map<string, PriceHandler>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectDelay = 1000;
  private maxReconnectionDelay = 30000;
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;
  private isConnecting = false;

  constructor(url: string) {
    this.url = url;
  }

  private ensure(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    this.cleanup();

    try {
      console.log(`PriceSocket: Attempting to connect to ${this.url}`);
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('PriceSocket: Failed to create WebSocket instance:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('PriceSocket: Connected successfully');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Resubscribe to all tokens
      this.subs.forEach((token) => {
        this.ws!.send(JSON.stringify({ op: "SUB", token }));
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as PriceMessage;
        
        // Handle both formats: with and without type field
        if (data.type === 'PRICE_UPDATE' || (data.token && data.price !== undefined)) {
          const handler = this.handlers.get(data.token);
          if (handler) {
            handler(data.price, data.timestamp);
          }
        }
      } catch (error) {
        console.error('PriceSocket: Failed to parse message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`PriceSocket: Connection closed. Code: ${event.code}`);
      this.isConnecting = false;
      
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('PriceSocket: Error:', error);
      getErrorHandler().handleError(
        new Error('PriceSocket connection error'),
        ErrorCategory.WEBSOCKET,
        ErrorSeverity.MEDIUM
      );
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.maxReconnectionDelay
    );

    console.log(`PriceSocket: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.ensure();
      }
    }, delay) as any;
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }

      this.ws = null;
    }
  }

  public watch(token: string, cb: PriceHandler): void {
    this.handlers.set(token, cb);
    
    if (!this.subs.has(token)) {
      this.subs.add(token);
      
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: "SUB", token }));
      }
    }
    
    this.ensure();
  }

  public unwatch(token: string): void {
    this.handlers.delete(token);
    
    if (this.subs.delete(token) && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ op: "UNSUB", token }));
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
    this.handlers.clear();
    this.subs.clear();
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let priceSocketInstance: PriceSocket | null = null;

export const getPriceSocket = (url?: string): PriceSocket => {
  if (!priceSocketInstance && url) {
    priceSocketInstance = new PriceSocket(url);
  } else if (!priceSocketInstance) {
    throw new Error('PriceSocket not initialized. Please provide URL.');
  }
  
  return priceSocketInstance;
}; 