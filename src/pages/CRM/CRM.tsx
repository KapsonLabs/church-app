import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, HelpCircle } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type Ticket } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateTicketModal } from '@/components/modals/CreateTicketModal';

const CRM = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTickets = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await apiService.fetchTickets();
      setTickets(response.data);
      setFilteredTickets(response.data);

      if (showRefreshToast) {
        toast({
          title: "Data Refreshed",
          description: "Tickets have been updated with the latest data.",
        });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter tickets
  useEffect(() => {
    let filtered = tickets;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  }, [searchQuery, statusFilter, priorityFilter, tickets]);

  const handleRefresh = () => {
    fetchTickets(true);
  };

  const handleTicketCreated = () => {
    fetchTickets(true);
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

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      technical: 'Technical Support',
      billing: 'Billing Issue',
      feature_request: 'Feature Request',
      bug: 'Bug Report',
      account: 'Account Issue',
      general: 'General Inquiry',
      question: 'Question',
      feedback: 'Feedback',
      other: 'Other',
    };
    return categoryMap[category] || category;
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
      urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800' },
    };
    const config = priorityMap[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="w-full p-4 md:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading tickets...</p>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="w-full p-4 md:p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Customer Support Tickets</h2>
                <p className="text-muted-foreground">
                  Manage and track customer support requests
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
                <CreateTicketModal onTicketCreated={handleTicketCreated} />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tickets.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tickets</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {tickets.filter(t => t.status === 'open').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Open</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {tickets.filter(t => t.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {tickets.filter(t => t.status === 'resolved').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Resolved</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by title or ticket number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                          Ticket
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                          Title
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                          Created By
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                          Assigned To
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 hidden xl:table-cell">
                          Comments
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2">No tickets found</p>
                            <p className="text-sm">Create your first support ticket to get started</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onClick={() => navigate({ to: `/crm/tickets/${ticket.id}` })}
                          >
                            <td className="py-3 px-4">
                              <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                {ticket.ticket_number}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {ticket.title}
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                                  {getCategoryLabel(ticket.category)}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {getCategoryLabel(ticket.category)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {getPriorityBadge(ticket.priority)}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(ticket.status)}
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {ticket.created_by.full_name}
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {ticket.created_by.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              {ticket.assigned_to.length > 0 ? (
                                <div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {ticket.assigned_to[0].full_name}
                                  </span>
                                  {ticket.assigned_to.length > 1 && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      +{ticket.assigned_to.length - 1}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4 hidden xl:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {ticket.comment_count} comment{ticket.comment_count !== 1 ? 's' : ''}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(ticket.created_at)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            {filteredTickets.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Showing {filteredTickets.length} of {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};

export default CRM;

