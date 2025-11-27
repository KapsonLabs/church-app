import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, type TicketDetails, type TicketComment, type Ticket } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTicketCommentsWebSocket } from '@/hooks/use-ticket-comments-websocket';
import { useTicketActivitiesWebSocket, type TicketRemovedData } from '@/hooks/use-ticket-activities-websocket';
import { 
  ArrowLeft, 
  RefreshCw, 
  Loader2, 
  Send, 
  Calendar,
  MessageSquare,
  AlertCircle,
  X,
  Wifi,
  WifiOff,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditTicketModal } from '@/components/modals/EditTicketModal';

const TicketDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams({ strict: false });
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closingComment, setClosingComment] = useState('');
  const [closingTicket, setClosingTicket] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [ticketRemoved, setTicketRemoved] = useState<{ triggered_by: { full_name: string } } | null>(null);

  // Handle new comment from WebSocket
  const handleNewComment = (comment: TicketComment) => {
    if (!ticket) return;

    // Check if comment already exists to avoid duplicates
    const commentExists = ticket.comments.some(c => c.id === comment.id);
    if (commentExists) return;

    // Add new comment to the ticket
    setTicket({
      ...ticket,
      comments: [...ticket.comments, comment],
      comment_count: ticket.comment_count + 1,
    });

    // Scroll to bottom to show new comment
    setTimeout(() => scrollToBottom(), 100);
  };

  // Handle recent comments from WebSocket (optional, for syncing)
  const handleRecentComments = (comments: TicketComment[]) => {
    if (!ticket) return;

    // Merge recent comments with existing ones, avoiding duplicates
    const existingCommentIds = new Set(ticket.comments.map(c => c.id));
    const newComments = comments.filter(c => !existingCommentIds.has(c.id));
    
    if (newComments.length > 0) {
      setTicket({
        ...ticket,
        comments: [...ticket.comments, ...newComments],
        comment_count: ticket.comments.length + newComments.length,
      });
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // Handle ticket update from WebSocket
  const handleTicketUpdated = (updatedTicket: Ticket) => {
    if (!ticket || !id) return;
    
    // Only update if this is the current ticket
    if (updatedTicket.id !== parseInt(id, 10)) return;

    // Update ticket details while preserving fields not in the WebSocket response
    setTicket(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        id: updatedTicket.id,
        ticket_number: updatedTicket.ticket_number,
        title: updatedTicket.title,
        category: updatedTicket.category,
        priority: updatedTicket.priority,
        status: updatedTicket.status,
        created_by: updatedTicket.created_by,
        assigned_to: updatedTicket.assigned_to,
        branch: updatedTicket.branch,
        updated_at: updatedTicket.updated_at,
        comment_count: updatedTicket.comment_count,
      };
    });
  };

  // Handle ticket removal from WebSocket
  const handleTicketRemoved = (data: TicketRemovedData) => {
    if (!ticket || !id) return;
    
    // Only handle if this is the current ticket
    const ticketId = typeof data.ticket.id === 'string' ? parseInt(data.ticket.id, 10) : data.ticket.id;
    if (ticketId !== parseInt(id, 10)) return;

    // Set ticket as removed
    setTicketRemoved({
      triggered_by: data.triggered_by,
    });
  };

  // Initialize WebSocket connection for comments
  const { isConnected: wsConnected } = useTicketCommentsWebSocket(
    id ? parseInt(id) : null,
    sessionId,
    handleNewComment,
    handleRecentComments
  );

  // Initialize WebSocket connection for ticket activities
  useTicketActivitiesWebSocket(
    sessionId,
    undefined, // We don't need to handle ticket_created on details page
    handleTicketUpdated,
    handleTicketRemoved
  );

  const fetchTicketDetails = async (showRefreshToast = false) => {
    if (!id) {
      console.error('No ticket ID available');
      setLoading(false);
      return;
    }

    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.fetchTicketDetails(parseInt(id));
      setTicket(response.data);

      if (showRefreshToast) {
        toast({
          title: "Data Refreshed",
          description: "Ticket details have been updated.",
        });
      }

      // Scroll to bottom after loading comments
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchTicketDetails(true);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    try {
      setSendingComment(true);

      await apiService.createTicketComment({
        ticket: parseInt(id),
        comment: newComment.trim(),
      });

      setNewComment('');
      
      // Don't refresh manually - WebSocket will handle the new comment
      // Only refresh if WebSocket is not connected
      if (!wsConnected) {
        await fetchTicketDetails();
      }

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingComment(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!id) return;

    if (!closingComment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a closing comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setClosingTicket(true);

      await apiService.closeTicket(parseInt(id), {
        closing_comment: closingComment.trim(),
      });

      setShowCloseDialog(false);
      setClosingComment('');
      
      // Refresh ticket to get updated status
      await fetchTicketDetails();

      toast({
        title: "Ticket Closed",
        description: "The ticket has been closed successfully.",
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to close ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClosingTicket(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      open: { label: 'Open', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      low: { label: 'Low', className: 'bg-green-100 text-green-800' },
      medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Critical', className: 'bg-red-100 text-red-800' },
    };
    const config = priorityMap[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      technical: 'Technical Support',
      billing: 'Billing Issue',
      feature_request: 'Feature Request',
      bug: 'Bug Report',
      account: 'Account Issue',
      general: 'General Inquiry',
      other: 'Other',
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="w-full p-4 md:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading ticket...</p>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="w-full p-4 md:p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The ticket you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="w-full h-full p-4 md:p-6">
          <div className="h-full flex flex-col space-y-4">
            {/* Ticket Removed Banner */}
            {ticketRemoved && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ticket Access Removed</AlertTitle>
                <AlertDescription>
                  You have been removed from this ticket by {ticketRemoved.triggered_by.full_name}. Please navigate back to the main page.
                </AlertDescription>
              </Alert>
            )}

            {/* Header */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.history.back()}
                    disabled={!!ticketRemoved}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold">{ticket.ticket_number}</h2>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      {getCategoryLabel(ticket.category)} • Created {formatDate(ticket.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* WebSocket Connection Status */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground" title={wsConnected ? 'Real-time updates connected' : 'Real-time updates disconnected'}>
                    {wsConnected ? (
                      <Wifi className="h-3 w-3 text-green-600" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                  {ticket.status !== 'closed' && !ticketRemoved && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditModal(true)}
                        disabled={!!ticketRemoved}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowCloseDialog(true)}
                        disabled={!!ticketRemoved}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Close Ticket
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing || !!ticketRemoved}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
              {/* Main Content - Chat Area */}
              <div className="lg:col-span-2 flex flex-col h-full min-h-[400px] md:min-h-[500px]">
                <Card className="flex flex-col h-full overflow-hidden">
                  {/* Ticket Description */}
                  <CardHeader className="flex-shrink-0 border-b">
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {ticket.description}
                    </p>
                  </CardHeader>

                  {/* Comments */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {ticket.comments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No comments yet. Be the first to comment!</p>
                      </div>
                    ) : (
                      ticket.comments.map((comment) => {
                        const isOwnComment = comment.user.id === user?.id;
                        return (
                          <div
                            key={comment.id}
                            className={cn(
                              "flex gap-3",
                              isOwnComment && "flex-row-reverse"
                            )}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                                {getInitials(comment.user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "flex flex-col max-w-[80%]",
                              isOwnComment && "items-end"
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.user.full_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatShortDate(comment.created_at)}
                                </span>
                                {comment.is_internal && (
                                  <Badge variant="secondary" className="text-xs">Internal</Badge>
                                )}
                              </div>
                              <div className={cn(
                                "rounded-lg p-3 text-sm",
                                isOwnComment 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              )}>
                                {comment.comment}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={commentsEndRef} />
                  </CardContent>

                  {/* Comment Input */}
                  <div className="flex-shrink-0 border-t p-4">
                    <form onSubmit={handleSendComment} className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={ticketRemoved ? "You have been removed from this ticket" : "Type your comment..."}
                        rows={2}
                        className="resize-none"
                        disabled={!!ticketRemoved}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !ticketRemoved) {
                            e.preventDefault();
                            handleSendComment(e);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        disabled={sendingComment || !newComment.trim() || !!ticketRemoved}
                        className="h-auto"
                      >
                        {sendingComment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                    {!ticketRemoved && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar - Ticket Info */}
              <div className="space-y-4 h-full min-h-[400px] md:min-h-[500px] overflow-y-auto">
                {/* Ticket Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Priority</p>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="text-sm">{getCategoryLabel(ticket.category)}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Created By</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(ticket.created_by.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{ticket.created_by.full_name}</p>
                          <p className="text-xs text-muted-foreground">{ticket.created_by.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Assigned To</p>
                      {ticket.assigned_to.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Unassigned</p>
                      ) : (
                        <div className="space-y-2">
                          {ticket.assigned_to.map((assignee) => (
                            <div key={assignee.id} className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(assignee.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{assignee.full_name}</p>
                                <p className="text-xs text-muted-foreground">{assignee.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Created</p>
                        <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                      </div>
                    </div>
                    {ticket.updated_at !== ticket.created_at && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p className="text-xs text-muted-foreground">{formatDate(ticket.updated_at)}</p>
                        </div>
                      </div>
                    )}
                    {ticket.resolved_at && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Resolved</p>
                          <p className="text-xs text-muted-foreground">{formatDate(ticket.resolved_at)}</p>
                        </div>
                      </div>
                    )}
                    {ticket.closed_at && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Closed</p>
                          <p className="text-xs text-muted-foreground">{formatDate(ticket.closed_at)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Ticket Modal */}
        <EditTicketModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          ticket={ticket}
          onTicketUpdated={() => {
            fetchTicketDetails();
            setShowEditModal(false);
          }}
        />

        {/* Close Ticket Confirmation Dialog */}
        <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Ticket</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to close this ticket? Please provide a closing comment explaining why this ticket is being closed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Textarea
                value={closingComment}
                onChange={(e) => setClosingComment(e.target.value)}
                placeholder="Enter closing comment..."
                rows={4}
                className="resize-none"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={closingTicket}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCloseTicket}
                disabled={closingTicket || !closingComment.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {closingTicket ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Closing...
                  </>
                ) : (
                  'Close Ticket'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};

export default TicketDetailsPage;

