import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService, type WebSocketMessage } from '@/lib/websocket';
import { apiService } from '@/lib/api';
import type { TicketComment } from '@/lib/api';

export interface TicketCommentsWebSocketMessage {
  type: 'pong' | 'recent_comments' | 'new_comment' | 'error';
  comments?: TicketComment[];
  comment?: TicketComment;
  count?: number;
  message?: string;
}

export interface TicketCommentsWebSocketCommand {
  command: 'ping' | 'get_recent_comments';
}

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useTicketCommentsWebSocket(
  ticketId: number | null,
  sessionId: string | null,
  onNewComment?: (comment: TicketComment) => void,
  onRecentComments?: (comments: TicketComment[]) => void
) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const onNewCommentRef = useRef(onNewComment);
  const onRecentCommentsRef = useRef(onRecentComments);

  // Update refs when callbacks change
  useEffect(() => {
    onNewCommentRef.current = onNewComment;
    onRecentCommentsRef.current = onRecentComments;
  }, [onNewComment, onRecentComments]);

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    // Get API base URL and construct WebSocket URL
    const apiBaseUrl = apiService.getBaseOrigin();
    // Convert http/https to ws/wss
    const wsProtocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = apiBaseUrl.replace(/^https?/, wsProtocol);
    const wsUrl = `${wsBaseUrl}/ws/crm/tickets/${ticketId}/comments/`;

    // Create WebSocket service
    const wsService = new WebSocketService(wsUrl, sessionId);
    wsServiceRef.current = wsService;

    // Handle WebSocket messages
    const unsubscribeMessage = wsService.onMessage((message: WebSocketMessage) => {
      try {
        // Cast to ticket comments message type
        const wsMessage = message as unknown as TicketCommentsWebSocketMessage;

        switch (wsMessage.type) {
          case 'pong':
            // Keep-alive response, no action needed
            break;

          case 'recent_comments':
            if (wsMessage.comments && onRecentCommentsRef.current) {
              onRecentCommentsRef.current(wsMessage.comments);
            }
            break;

          case 'new_comment':
            if (wsMessage.comment && onNewCommentRef.current) {
              onNewCommentRef.current(wsMessage.comment);
            }
            break;

          case 'error':
            console.error('WebSocket error:', wsMessage.message);
            break;

          default:
            console.warn('Unknown WebSocket message type:', wsMessage.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    // Handle status changes
    const unsubscribeStatus = wsService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Connect to WebSocket
    wsService
      .connect()
      .then(() => {
        console.log('Ticket comments WebSocket connected');
        // Request recent comments after connection
        setTimeout(() => {
          if (wsService.isConnected()) {
            wsService.sendCommand({ command: 'get_recent_comments' } as any);
          }
        }, 500);
      })
      .catch((error) => {
        console.error('Failed to connect ticket comments WebSocket:', error);
        setStatus('error');
      });

    // Cleanup on unmount or ticketId change
    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [ticketId, sessionId]);

  const sendCommand = useCallback((command: TicketCommentsWebSocketCommand) => {
    if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
      wsServiceRef.current.sendCommand(command as any);
    }
  }, []);

  const getRecentComments = useCallback(() => {
    sendCommand({ command: 'get_recent_comments' });
  }, [sendCommand]);

  return {
    status,
    isConnected: status === 'connected',
    getRecentComments,
  };
}

