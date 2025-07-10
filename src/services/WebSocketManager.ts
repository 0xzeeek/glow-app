import { 
  WSConnectParams, 
  WSMessage, 
  PriceUpdate, 
  BalanceUpdate 
} from '../types/solana-trading-backend';

// btoa polyfill for React Native
const btoa = (str: string): string => {
  // Simple base64 encoding for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
};

// Custom EventEmitter for React Native compatibility
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: Function): this {
    if (!this.events[event]) return this;
    
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    return true;
  }

  once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    return this.on(event, onceWrapper);
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

interface WebSocketConfig {
  url: string;
  useCloudflare?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

interface WebSocketEvents {
  connected: () => void;
  disconnected: (reason?: string) => void;
  error: (error: Error) => void;
  priceUpdate: (data: PriceUpdate) => void;
  balanceUpdate: (data: BalanceUpdate) => void;
  message: (data: any) => void;
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private reconnectAttempts = 0;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private connectionTimer: number | null = null;
  private isConnecting = false;
  private shouldReconnect = true;
  private subscriptions = new Set<string>();
  private connectParams: WSConnectParams | null = null;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      url: config.url,
      useCloudflare: config.useCloudflare ?? false,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 2000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      connectionTimeout: config.connectionTimeout ?? 10000,
    };
  }

  public connect(params: WSConnectParams): void {
    if (this.isConnecting || this.isConnected()) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.connectParams = params;
    this.shouldReconnect = true;
    this.performConnect();
  }

  private performConnect(): void {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    this.cleanup();

    try {
      let wsUrl: string;
      
      if (this.config.useCloudflare && this.connectParams) {
        // Cloudflare: wss://broadcast.domain.com/ws/TOKEN
        // Token is wallet:signature:nonce base64 encoded
        const token = btoa(`${this.connectParams.wallet}:${this.connectParams.signature}:${this.connectParams.nonce}`);
        wsUrl = `${this.config.url}/ws/${token}`;
      } else {
        // AWS: Add auth params as query string
        const url = new URL(this.config.url);
        if (this.connectParams) {
          url.searchParams.append('wallet', this.connectParams.wallet);
          url.searchParams.append('signature', this.connectParams.signature);
          url.searchParams.append('nonce', this.connectParams.nonce);
        }
        wsUrl = url.toString();
      }

      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
      this.startConnectionTimeout();
    } catch (error) {
      this.handleError(error as Error);
      this.isConnecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.clearConnectionTimeout();
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.startHeartbeat();
      
      // Resubscribe to previous subscriptions
      this.resubscribe();
    };

    this.ws.onclose = (event) => {
      this.handleDisconnect(event.reason || 'Connection closed');
    };

    this.ws.onerror = (error) => {
      this.handleError(new Error('WebSocket error'));
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      // Handle different message types
      switch (message.type) {
        case 'PRICE_UPDATE':
          this.emit('priceUpdate', message as PriceUpdate);
          break;
        case 'BALANCE_UPDATE':
          this.emit('balanceUpdate', message as BalanceUpdate);
          break;
        case 'PONG':
          // Heartbeat response
          break;
        default:
          this.emit('message', message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleDisconnect(reason: string): void {
    this.cleanup();
    this.emit('disconnected', reason);
    
    if (this.shouldReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Error): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.connectParams) {
        this.performConnect();
      }
    }, delay) as any;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'PING' });
      }
    }, this.config.heartbeatInterval) as any;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private startConnectionTimeout(): void {
    this.connectionTimer = setTimeout(() => {
      if (this.isConnecting) {
        this.handleError(new Error('Connection timeout'));
        this.ws?.close();
      }
    }, this.config.connectionTimeout) as any;
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private resubscribe(): void {
    // Resubscribe to all previous subscriptions
    this.subscriptions.forEach(subscription => {
      const [type, identifier] = subscription.split(':');
      if (type === 'price') {
        this.subscribeToPrice(identifier);
      } else if (type === 'balance') {
        this.subscribeToBalance(identifier);
      }
    });
  }

  public subscribeToPrice(token: string): void {
    const message: WSMessage = {
      action: 'subscribePrice',
      token,
    };
    this.send(message);
    this.subscriptions.add(`price:${token}`);
  }

  public unsubscribeFromPrice(token: string): void {
    const message: WSMessage = {
      action: 'unsubscribePrice',
      token,
    };
    this.send(message);
    this.subscriptions.delete(`price:${token}`);
  }

  public subscribeToBalance(wallet: string): void {
    const message: WSMessage = {
      action: 'subscribeBalance',
      wallet,
    };
    this.send(message);
    this.subscriptions.add(`balance:${wallet}`);
  }

  public unsubscribeFromBalance(wallet: string): void {
    const message: WSMessage = {
      action: 'unsubscribeBalance',
      wallet,
    };
    this.send(message);
    this.subscriptions.delete(`balance:${wallet}`);
  }

  public send(data: any): void {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, queuing message');
      return;
    }

    try {
      this.ws!.send(JSON.stringify(data));
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
    this.emit('disconnected', 'Manual disconnect');
  }

  private cleanup(): void {
    this.isConnecting = false;
    this.stopHeartbeat();
    this.clearConnectionTimeout();
    
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

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  // Type-safe event emitter methods
  public on<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K]
  ): this {
    return super.on(event, listener);
  }

  public off<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K]
  ): this {
    return super.off(event, listener);
  }

  public emit<K extends keyof WebSocketEvents>(
    event: K,
    ...args: Parameters<WebSocketEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}

// Singleton instance
let instance: WebSocketManager | null = null;

export const getWebSocketManager = (config?: WebSocketConfig): WebSocketManager => {
  if (!instance && config) {
    instance = new WebSocketManager(config);
  } else if (!instance) {
    throw new Error('WebSocketManager not initialized. Please provide config.');
  }
  
  return instance;
}; 