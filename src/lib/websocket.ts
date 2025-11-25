/**
 * WebSocket Service for real-time notifications and messages
 * 
 * This service handles WebSocket connections with automatic reconnection,
 * keep-alive pings, and command/response handling.
 */

export type WebSocketMessageType = 
  | 'pong'
  | 'unread_count'
  | 'mark_as_read_response'
  | 'notification'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  count?: number;
  success?: boolean;
  notification_id?: number;
  data?: any;
  notification?: any;
  message?: string;
}

export interface WebSocketCommand {
  command: 'ping' | 'get_unread_count' | 'mark_as_read';
  notification_id?: number;
}

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type MessageHandler = (message: WebSocketMessage) => void;
type StatusChangeHandler = (status: WebSocketStatus) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private sessionId: string | null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private keepAliveInterval: number | null = null;
  private keepAliveIntervalMs = 30000; // 30 seconds
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusChangeHandlers: Set<StatusChangeHandler> = new Set();
  private status: WebSocketStatus = 'disconnected';
  private shouldReconnect = true;

  constructor(url: string, sessionId: string | null = null) {
    this.url = url;
    this.sessionId = sessionId;
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Update session ID
   */
  setSessionId(sessionId: string | null) {
    this.sessionId = sessionId;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        resolve();
        return;
      }

      try {
        // Build WebSocket URL
        // Convert http/https to ws/wss if needed
        let wsUrl = this.url;
        if (wsUrl.startsWith('http://') && !wsUrl.startsWith('ws://')) {
          wsUrl = wsUrl.replace('http://', 'ws://');
        } else if (wsUrl.startsWith('https://') && !wsUrl.startsWith('wss://')) {
          wsUrl = wsUrl.replace('https://', 'wss://');
        }

        // Note: WebSocket API doesn't support custom headers in browsers
        // The sessionid cookie should be sent automatically if it's set as a cookie
        // However, some servers require it as a query parameter
        if (this.sessionId) {
          // Add sessionid as query parameter
          const separator = wsUrl.includes('?') ? '&' : '?';
          wsUrl = `${wsUrl}${separator}sessionid=${encodeURIComponent(this.sessionId)}`;
        }

        console.log('Connecting to WebSocket:', wsUrl);
        console.log('Session ID available:', this.sessionId ? 'yes' : 'no');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.notifyStatusChange('connected');
          this.startKeepAlive();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          console.error('WebSocket URL:', wsUrl);
          console.error('Session ID:', this.sessionId ? 'present' : 'missing');
          this.status = 'error';
          this.notifyStatusChange('error');
          // Don't reject on error - let onclose handle reconnection
          // reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          this.status = 'disconnected';
          this.notifyStatusChange('disconnected');
          this.stopKeepAlive();

          // Attempt to reconnect if not a normal closure
          if (this.shouldReconnect && event.code !== 1000) {
            console.log('Attempting to reconnect...');
            this.attemptReconnect();
          } else if (event.code === 1000) {
            console.log('WebSocket closed normally');
          }
        };

        this.status = 'connecting';
        this.notifyStatusChange('connecting');
      } catch (error) {
        this.status = 'error';
        this.notifyStatusChange('error');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.shouldReconnect = false;
    this.stopKeepAlive();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.status = 'disconnected';
    this.notifyStatusChange('disconnected');
  }

  /**
   * Send a command to the WebSocket server
   */
  sendCommand(command: WebSocketCommand): void {
    if (!this.isConnected() || !this.ws) {
      console.warn('WebSocket is not connected. Cannot send command:', command);
      return;
    }

    try {
      this.ws.send(JSON.stringify(command));
    } catch (error) {
      console.error('Error sending WebSocket command:', error);
    }
  }

  /**
   * Send ping command (keep alive)
   */
  ping(): void {
    this.sendCommand({ command: 'ping' });
  }

  /**
   * Request unread count
   */
  getUnreadCount(): void {
    this.sendCommand({ command: 'get_unread_count' });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): void {
    this.sendCommand({ 
      command: 'mark_as_read',
      notification_id: notificationId 
    });
  }

  /**
   * Subscribe to WebSocket messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusChangeHandlers.add(handler);
    return () => {
      this.statusChangeHandlers.delete(handler);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Notify all message handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Notify all status change handlers
   */
  private notifyStatusChange(status: WebSocketStatus): void {
    this.statusChangeHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in status change handler:', error);
      }
    });
  }

  /**
   * Start keep-alive ping interval
   */
  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveInterval = window.setInterval(() => {
      if (this.isConnected()) {
        this.ping();
      }
    }, this.keepAliveIntervalMs);
  }

  /**
   * Stop keep-alive ping interval
   */
  private stopKeepAlive(): void {
    if (this.keepAliveInterval !== null) {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    setTimeout(() => {
      if (this.shouldReconnect && !this.isConnected()) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }
}

