import { useEffect, useRef, useState } from 'react';
import { WebSocketService, type WebSocketMessage } from '@/lib/websocket';
import { apiService } from '@/lib/api';
import type { Ticket } from '@/lib/api';

export interface TicketActivityWebSocketMessage {
  type: 'ticket_created' | 'ticket_updated' | 'ticket_removed' | 'pong' | 'error';
  ticket?: {
    id: string | number;
    ticket_number: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    branch: {
      id: string;
      name: string;
    } | number;
    created_by: {
      id: string;
      full_name: string;
      email: string;
    };
    assigned_to: Array<{
      id: string;
      full_name: string;
      email: string;
    }>;
    created_at: string;
    updated_at: string;
    comment_count: number;
  };
  triggered_by?: {
    id: string;
    full_name: string;
    email: string;
  };
  timestamp?: string;
  metadata?: Record<string, any>;
  message?: string;
}

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Transform WebSocket ticket to Ticket interface
function transformWebSocketTicket(wsTicket: TicketActivityWebSocketMessage['ticket']): Ticket | null {
  if (!wsTicket) return null;

  return {
    id: typeof wsTicket.id === 'string' ? parseInt(wsTicket.id, 10) : wsTicket.id,
    ticket_number: wsTicket.ticket_number,
    title: wsTicket.title,
    category: wsTicket.category,
    priority: wsTicket.priority,
    status: wsTicket.status,
    created_by: {
      id: wsTicket.created_by.id,
      email: wsTicket.created_by.email,
      full_name: wsTicket.created_by.full_name,
      first_name: wsTicket.created_by.full_name.split(' ')[0] || '',
      last_name: wsTicket.created_by.full_name.split(' ').slice(1).join(' ') || '',
    },
    assigned_to: wsTicket.assigned_to.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.full_name.split(' ')[0] || '',
      last_name: user.full_name.split(' ').slice(1).join(' ') || '',
    })),
    branch: typeof wsTicket.branch === 'object' ? parseInt(wsTicket.branch.id, 10) : wsTicket.branch,
    created_at: wsTicket.created_at,
    updated_at: wsTicket.updated_at,
    comment_count: wsTicket.comment_count,
  };
}

export interface TicketRemovedData {
  ticket: Ticket;
  triggered_by: {
    id: string;
    full_name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export function useTicketActivitiesWebSocket(
  sessionId: string | null,
  onTicketCreated?: (ticket: Ticket) => void,
  onTicketUpdated?: (ticket: Ticket) => void,
  onTicketRemoved?: (data: TicketRemovedData) => void
) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const onTicketCreatedRef = useRef(onTicketCreated);
  const onTicketUpdatedRef = useRef(onTicketUpdated);
  const onTicketRemovedRef = useRef(onTicketRemoved);

  // Update refs when callbacks change
  useEffect(() => {
    onTicketCreatedRef.current = onTicketCreated;
    onTicketUpdatedRef.current = onTicketUpdated;
    onTicketRemovedRef.current = onTicketRemoved;
  }, [onTicketCreated, onTicketUpdated, onTicketRemoved]);

  useEffect(() => {
    // Get API base URL and construct WebSocket URL
    const apiBaseUrl = apiService.getBaseOrigin();
    // Convert http/https to ws/wss
    const wsProtocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = apiBaseUrl.replace(/^https?/, wsProtocol);
    const wsUrl = `${wsBaseUrl}/ws/crm/tickets/activity/`;

    // Create WebSocket service
    const wsService = new WebSocketService(wsUrl, sessionId);
    wsServiceRef.current = wsService;

    // Handle WebSocket messages
    const unsubscribeMessage = wsService.onMessage((message: WebSocketMessage) => {
      try {
        // Cast to ticket activity message type
        const wsMessage = message as unknown as TicketActivityWebSocketMessage;

        switch (wsMessage.type) {
          case 'pong':
            // Keep-alive response, no action needed
            break;

          case 'ticket_created':
            if (wsMessage.ticket) {
              const transformedTicket = transformWebSocketTicket(wsMessage.ticket);
              if (transformedTicket && onTicketCreatedRef.current) {
                onTicketCreatedRef.current(transformedTicket);
              }
            }
            break;

          case 'ticket_updated':
            if (wsMessage.ticket) {
              const transformedTicket = transformWebSocketTicket(wsMessage.ticket);
              if (transformedTicket && onTicketUpdatedRef.current) {
                onTicketUpdatedRef.current(transformedTicket);
              }
            }
            break;

          case 'ticket_removed':
            if (wsMessage.ticket && wsMessage.triggered_by) {
              const transformedTicket = transformWebSocketTicket(wsMessage.ticket);
              if (transformedTicket && onTicketRemovedRef.current) {
                onTicketRemovedRef.current({
                  ticket: transformedTicket,
                  triggered_by: wsMessage.triggered_by,
                  metadata: wsMessage.metadata,
                });
              }
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
        console.log('Ticket activities WebSocket connected');
      })
      .catch((error) => {
        console.error('Failed to connect ticket activities WebSocket:', error);
        setStatus('error');
      });

    // Cleanup on unmount
    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [sessionId]);

  return {
    status,
    isConnected: status === 'connected',
  };
}

