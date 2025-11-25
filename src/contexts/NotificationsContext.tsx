import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService, type Notification } from '@/lib/api';
import { useAuth } from './AuthContext';
import { WebSocketService, type WebSocketMessage } from '@/lib/websocket';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const defaultNotificationUser: Notification['user'] = {
  id: '',
  email: '',
  full_name: '',
  first_name: '',
  last_name: '',
};

const normalizeNotification = (incoming: any): Notification => {
  const parsedId = typeof incoming.id === 'string' ? parseInt(incoming.id, 10) : incoming.id;
  return {
    id: Number.isFinite(parsedId) ? parsedId : Date.now(),
    user: incoming.user ?? defaultNotificationUser,
    notification_type: incoming.notification_type ?? incoming.type ?? '',
    title: incoming.title ?? '',
    message: incoming.message ?? '',
    related_ticket: incoming.related_ticket ?? null,
    related_message: incoming.related_message ?? null,
    action_url: incoming.action_url ?? null,
    is_read: typeof incoming.is_read === 'boolean' ? incoming.is_read : false,
    read_at: incoming.read_at ?? null,
    created_at: incoming.created_at ?? incoming.timestamp ?? new Date().toISOString(),
    metadata: incoming.metadata ?? {},
  };
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, sessionId, websocketEndpoints } = useAuth();
  const previousNotificationIds = useRef<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const initialFetchPerformedRef = useRef(false);

  // Initialize audio element on mount
  useEffect(() => {
    const initializeAudio = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio('/notification.wav');
        audioRef.current.preload = 'auto';
        audioRef.current.volume = 0.5;
      }
    };

    const unlockAudio = () => {
      if (!audioRef.current || audioUnlockedRef.current) {
        return;
      }

      audioRef.current.volume = 0;
      audioRef.current.play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          audioRef.current!.volume = 0.8;
          audioUnlockedRef.current = true;
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
        })
        .catch(() => {
          // If unlocking fails, keep listener active for next interaction
        });
    };

    if (isAuthenticated) {
      initializeAudio();
      if (!audioUnlockedRef.current) {
        window.addEventListener('click', unlockAudio, { once: false });
        window.addEventListener('keydown', unlockAudio, { once: false });
      }
    }

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (!isAuthenticated) {
        audioUnlockedRef.current = false;
      }
      if (audioRef.current && !isAuthenticated) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(err => {
          // If audio file fails, fallback to Web Audio API
          console.warn('Audio file playback failed, using fallback sound:', err);
          playFallbackSound();
        });
      } else {
        // Fallback if audio element not initialized
        playFallbackSound();
      }
    } catch (err) {
      console.error('Error playing notification sound:', err);
      playFallbackSound();
    }
  }, []);

  // Fallback sound using Web Audio API
  const playFallbackSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.error('Error playing fallback sound:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.fetchNotifications();
      const newNotifications = response.data.map(normalizeNotification);
      
      // Check for new notifications (only after initial load)
      if (previousNotificationIds.current.size > 0) {
        const newIds = newNotifications
          .filter(n => !previousNotificationIds.current.has(n.id))
          .map(n => n.id);
        
        // If there are new notifications, play sound
        if (newIds.length > 0) {
          playNotificationSound();
        }
      }
      
      // Update previous notification IDs
      previousNotificationIds.current = new Set(newNotifications.map(n => n.id));
      setNotifications(newNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, playNotificationSound]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiService.fetchUnreadNotificationCount();
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // Try WebSocket first if available
      if (wsServiceRef.current?.isConnected()) {
        wsServiceRef.current.markAsRead(notificationId);
        // Optimistically update local state
        setNotifications(prev => prev.map(notif => {
          if (notif.id === notificationId && !notif.is_read) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
            return { ...notif, is_read: true, read_at: new Date().toISOString() };
          }
          return notif;
        }));
      } else {
        // Fallback to HTTP API
        const response = await apiService.markNotificationAsRead(notificationId);
        if (response.data) {
          const normalizedResponse = normalizeNotification(response.data);
          let shouldDecrement = false;
          setNotifications(prev => prev.map(notif => {
            if (notif.id === notificationId) {
              if (!notif.is_read) {
                shouldDecrement = true;
              }
              return normalizedResponse;
            }
            return notif;
          }));
          if (shouldDecrement) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      // Update local state optimistically
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      // If endpoint doesn't exist (404), still update local state
      if (err.status === 404) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      } else {
        throw err;
      }
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up WebSocket if not authenticated
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
      return;
    }

    if (!websocketEndpoints?.notifications) {
      console.warn('WebSocket endpoint not available, falling back to HTTP polling');
      if (!initialFetchPerformedRef.current) {
        initialFetchPerformedRef.current = true;
        refreshNotifications();
      }
      return;
    }

    if (!sessionId) {
      console.warn('Session ID not available for WebSocket connection');
      // Try to get from localStorage as fallback
      const storedSessionId = localStorage.getItem('sessionid');
      if (!storedSessionId) {
        console.warn('No session ID found, WebSocket connection may fail');
      }
    }

    const effectiveSessionId = sessionId || localStorage.getItem('sessionid');
    console.log('Initializing WebSocket:', {
      url: websocketEndpoints.notifications,
      hasSessionId: !!effectiveSessionId,
    });

    // Create WebSocket service
    const wsService = new WebSocketService(websocketEndpoints.notifications, effectiveSessionId);
    wsServiceRef.current = wsService;

    // Handle WebSocket messages
    const unsubscribeMessage = wsService.onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case 'pong':
          // Keep-alive response, no action needed
          break;
        
        case 'unread_count':
          if (typeof message.count === 'number') {
            setUnreadCount(message.count);
          }
          break;
        
        case 'mark_as_read_response':
          if (message.success && message.notification_id) {
            setNotifications(prev => prev.map(notif => {
              if (notif.id === message.notification_id && !notif.is_read) {
                setUnreadCount(prevCount => Math.max(0, prevCount - 1));
                return { ...notif, is_read: true, read_at: new Date().toISOString() };
              }
              return notif;
            }));
          }
          break;
        
        case 'notification':
          // New notification received
          const notificationData = message.notification || message.data;
          if (notificationData) {
            const newNotification = normalizeNotification(notificationData);
            setNotifications(prev => {
              // Check if notification already exists
              const exists = prev.some(n => n.id === newNotification.id);
              if (exists) {
                return prev.map(n => n.id === newNotification.id ? newNotification : n);
              }
              // Add new notification at the beginning
              playNotificationSound();
              return [newNotification, ...prev];
            });
            // Increment unread count if notification is unread
            if (!newNotification.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          }
          break;
        
        case 'error':
          console.error('WebSocket error:', message.message);
          setError(message.message || 'WebSocket error occurred');
          break;
      }
    });

    // Connect WebSocket
    wsService.connect()
      .then(() => {
        console.log('WebSocket connected for notifications');
        // Request initial unread count
        wsService.getUnreadCount();
        // Fetch initial notifications via HTTP
        if (!initialFetchPerformedRef.current) {
          initialFetchPerformedRef.current = true;
          fetchNotifications();
        }
      })
      .catch((error) => {
        console.error('Failed to connect WebSocket:', error);
        console.error('Error details:', {
          url: websocketEndpoints.notifications,
          sessionId: effectiveSessionId ? 'present' : 'missing',
        });
        setError('Failed to connect to notifications service');
        // Fallback to HTTP polling if WebSocket fails
        if (!initialFetchPerformedRef.current) {
          initialFetchPerformedRef.current = true;
          refreshNotifications();
        }
      });

    // Add status change handler for debugging
    const unsubscribeStatus = wsService.onStatusChange((status) => {
      console.log('WebSocket status changed:', status);
    });

    // Cleanup on unmount or when dependencies change
    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      wsService.disconnect();
      wsServiceRef.current = null;
    };
  }, [isAuthenticated, websocketEndpoints?.notifications, sessionId, fetchNotifications, refreshNotifications, playNotificationSound]);

  // Initial fetch when authenticated (fallback if WebSocket not available)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      initialFetchPerformedRef.current = false;
      return;
    }

    // If WebSocket is not available, use HTTP polling as fallback
    if (!websocketEndpoints?.notifications && !initialFetchPerformedRef.current) {
      initialFetchPerformedRef.current = true;
      refreshNotifications();
    }
  }, [isAuthenticated, websocketEndpoints, refreshNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
