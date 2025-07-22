import { BalanceUpdate, WalletAddress, TokenUpdateEvent } from '../types';
import { getErrorHandler, ErrorCategory, ErrorSeverity } from './ErrorHandler';

// Unified subscription message
interface UnifiedSubscriptionMessage {
  action: 'subscribeLive';
  subscriptions: {
    balance?: {
      wallets: WalletAddress[];
    };
    tokens?: {
      type: 'all';
    };
  };
}

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

interface LiveWebSocketConfig {
  url: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

interface WebSocketEvents {
  connected: () => void;
  disconnected: (reason?: string) => void;
  error: (error: Error) => void;
  balanceUpdate: (data: BalanceUpdate) => void;
  tokenUpdate: (data: TokenUpdateEvent) => void;
  message: (data: any) => void;
}

export class LiveWebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<LiveWebSocketConfig>;
  private reconnectAttempts = 0;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private connectionTimer: number | null = null;
  private isConnecting = false;
  private shouldReconnect = true;
  private currentWallet: string | null = null; // Track single wallet subscription
  private isSubscribedToTokens = false; // Track token subscription state

  constructor(config: LiveWebSocketConfig) {
    super();

    // Validate WebSocket URL
    if (!config.url || config.url.trim() === '') {
      throw new Error('LiveWebSocketManager: WebSocket URL is required');
    }

    if (!config.url.startsWith('ws://') && !config.url.startsWith('wss://')) {
      throw new Error('LiveWebSocketManager: WebSocket URL must start with ws:// or wss://');
    }

    this.config = {
      url: config.url,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 2000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      connectionTimeout: config.connectionTimeout ?? 10000,
    };
  }

  public connect(): void {
    if (this.isConnecting || this.isConnected()) {
      console.log('LiveWebSocket already connected or connecting');
      return;
    }

    this.shouldReconnect = true;
    this.performConnect();
  }

  // Watch pattern similar to PriceSocket - auto-connects when needed
  public watch(wallet: string): void {
    // Ensure connection exists
    if (!this.isConnecting && !this.isConnected()) {
      this.connect();
    }

    // Subscribe to wallet
    this.subscribeToBalance(wallet);
  }

  private performConnect(): void {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.cleanup();

    try {
      console.log(`LiveWebSocket: Attempting to connect to ${this.config.url}`);
      // Simple connection without authentication
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
      this.startConnectionTimeout();
    } catch (error) {
      console.error('LiveWebSocket: Failed to create WebSocket instance:', error);
      this.handleError(error as Error);
      this.isConnecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('LiveWebSocket: Connected successfully');
      this.clearConnectionTimeout();
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.startHeartbeat();

      // Resubscribe to all active subscriptions with a small delay to ensure connection is ready
      setTimeout(() => {
        this.resubscribeToAll();
      }, 100);
    };

    this.ws.onclose = event => {
      console.log(
        `LiveWebSocket: Connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`
      );
      this.handleDisconnect(event.reason || 'Connection closed');
    };

    this.ws.onerror = error => {
      console.error('LiveWebSocket: Error event received:', error);
      // In React Native, the error event doesn't provide much detail
      // The actual error details usually come through the onclose event
      this.handleError(new Error('WebSocket connection error'));
    };

    this.ws.onmessage = event => {
      this.handleMessage(event.data);
    };
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle different message types
      switch (message.type) {
        case 'BALANCE_UPDATE':
          this.emit('balanceUpdate', message as BalanceUpdate);
          break;
        case 'TOKEN_CREATED':
        case 'TOKEN_UPDATED':
          this.emit('tokenUpdate', message);
          break;
        case 'SUBSCRIPTION_CONFIRMED':
          console.log('LiveWebSocket: Subscription confirmed:', message.subscriptions);
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
    } else if (this.shouldReconnect && this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      // Report critical error when max reconnects reached
      getErrorHandler().handleError(
        new Error('WebSocket connection failed after maximum retry attempts'),
        ErrorCategory.WEBSOCKET,
        ErrorSeverity.HIGH,
        {
          metadata: {
            reason,
            maxAttempts: this.config.maxReconnectAttempts,
            url: this.config.url,
          },
        }
      );
    }
  }

  private handleError(error: Error): void {
    console.error('WebSocket error:', error);

    // Report to error handler
    getErrorHandler().handleError(error, ErrorCategory.WEBSOCKET, ErrorSeverity.MEDIUM, {
      metadata: {
        isConnected: this.ws?.readyState === WebSocket.OPEN,
        reconnectAttempts: this.reconnectAttempts,
        url: this.config.url,
      },
    });

    this.emit('error', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.performConnect();
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

  private resubscribeToAll(): void {
    const subscriptions: UnifiedSubscriptionMessage['subscriptions'] = {};

    // Add wallet subscription if exists
    if (this.currentWallet) {
      console.log(`LiveWebSocket: Resubscribing to wallet ${this.currentWallet}`);
      subscriptions.balance = {
        wallets: [this.currentWallet],
      };
    }

    // Add token subscription if was subscribed
    if (this.isSubscribedToTokens) {
      console.log('LiveWebSocket: Resubscribing to token updates');
      subscriptions.tokens = {
        type: 'all',
      };
    }

    // Only send if there are subscriptions to restore
    if (Object.keys(subscriptions).length > 0) {
      const message: UnifiedSubscriptionMessage = {
        action: 'subscribeLive',
        subscriptions,
      };
      this.send(message);
    }
  }

  public subscribeToBalance(wallet: string): void {
    // If already subscribed to this wallet, do nothing
    if (this.currentWallet === wallet) {
      console.log(`LiveWebSocket: Already subscribed to wallet ${wallet}`);
      return;
    }

    // Track the new wallet subscription
    this.currentWallet = wallet;

    // Only send subscription if connected
    if (this.isConnected()) {
      const subscriptions: UnifiedSubscriptionMessage['subscriptions'] = {
        balance: {
          wallets: [wallet],
        },
      };

      // Include token subscription if active
      if (this.isSubscribedToTokens) {
        subscriptions.tokens = {
          type: 'all',
        };
      }

      const message: UnifiedSubscriptionMessage = {
        action: 'subscribeLive',
        subscriptions,
      };
      this.send(message);
    }
  }

  public unsubscribeFromBalance(wallet: string): void {
    // Remove from tracked wallets
    this.currentWallet = null;

    // In the new unified system, we resubscribe with only active subscriptions
    if (this.isConnected()) {
      const subscriptions: UnifiedSubscriptionMessage['subscriptions'] = {};

      // Only include token subscription if still active
      if (this.isSubscribedToTokens) {
        subscriptions.tokens = {
          type: 'all',
        };
      }

      // Send subscription update (empty balance means unsubscribe from balance)
      if (Object.keys(subscriptions).length > 0) {
        const message: UnifiedSubscriptionMessage = {
          action: 'subscribeLive',
          subscriptions,
        };
        this.send(message);
      }
    }
  }

  public subscribeToTokens(): void {
    // If already subscribed, do nothing
    if (this.isSubscribedToTokens) {
      console.log('LiveWebSocket: Already subscribed to token updates');
      return;
    }

    // Track token subscription
    this.isSubscribedToTokens = true;

    // Only send subscription if connected
    if (this.isConnected()) {
      const subscriptions: UnifiedSubscriptionMessage['subscriptions'] = {
        tokens: {
          type: 'all',
        },
      };

      // Include balance subscription if active
      if (this.currentWallet) {
        subscriptions.balance = {
          wallets: [this.currentWallet],
        };
      }

      const message: UnifiedSubscriptionMessage = {
        action: 'subscribeLive',
        subscriptions,
      };
      this.send(message);
    }
  }

  public unsubscribeFromTokens(): void {
    // Remove token subscription
    this.isSubscribedToTokens = false;

    // In the new unified system, we resubscribe with only active subscriptions
    if (this.isConnected()) {
      const subscriptions: UnifiedSubscriptionMessage['subscriptions'] = {};

      // Only include balance subscription if still active
      if (this.currentWallet) {
        subscriptions.balance = {
          wallets: [this.currentWallet],
        };
      }

      // Send subscription update (no tokens means unsubscribe from tokens)
      if (Object.keys(subscriptions).length > 0) {
        const message: UnifiedSubscriptionMessage = {
          action: 'subscribeLive',
          subscriptions,
        };
        this.send(message);
      }
    }
  }

  public send(data: any): void {
    if (!this.isConnected()) {
      console.log('LiveWebSocket: Cannot send message - not connected');
      return;
    }

    try {
      const message = JSON.stringify(data);
      this.ws!.send(message);
    } catch (error) {
      console.error('LiveWebSocket: Error sending message:', error);
      console.error('Message that failed to send:', data);

      // Create a more descriptive error
      const enhancedError = new Error(
        `Failed to send WebSocket message: ${(error as Error).message || 'Unknown error'}`
      );
      this.handleError(enhancedError);
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
  public on<K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]): this {
    return super.on(event, listener);
  }

  public off<K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]): this {
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
let instance: LiveWebSocketManager | null = null;

export const getLiveWebSocketManager = (config?: LiveWebSocketConfig): LiveWebSocketManager => {
  if (!instance && config) {
    instance = new LiveWebSocketManager(config);
  } else if (!instance) {
    throw new Error('LiveWebSocketManager not initialized. Please provide config.');
  }

  return instance;
};
