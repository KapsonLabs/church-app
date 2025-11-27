import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiService, type UpdateTicketRequest, type OrganizationUser, type TicketDetails } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, X, Paperclip } from 'lucide-react';

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketDetails | null;
  onTicketUpdated: () => void;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onTicketUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [branchUsers, setBranchUsers] = useState<OrganizationUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    assigned_to_ids: [] as string[],
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const categoryOptions = [
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Issue' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'account', label: 'Account Issue' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'other', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const allowedFileTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/pdf',
  ];

  const allowedFileExtensions = ['.jpeg', '.jpg', '.png', '.docx', '.pdf'];

  // Initialize form data when ticket changes
  useEffect(() => {
    if (ticket && isOpen) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        assigned_to_ids: ticket.assigned_to.map(user => user.id),
      });
      setAttachments([]);
    }
  }, [ticket, isOpen]);

  // Fetch branch users when modal opens
  useEffect(() => {
    if (isOpen && user?.branch?.organization_id && branchUsers.length === 0) {
      fetchBranchUsers();
    }
  }, [isOpen, user?.branch?.organization_id]);

  const fetchBranchUsers = async () => {
    if (!user?.branch?.organization_id) return;

    try {
      setUsersLoading(true);
      const response = await apiService.fetchBranchUsers(user.branch.organization_id);
      if (response.status === 200 && response.data) {
        setBranchUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching branch users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch branch users.",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleUserAssignment = (userId: string) => {
    setFormData(prev => {
      const currentIds = prev.assigned_to_ids;
      if (currentIds.includes(userId)) {
        return {
          ...prev,
          assigned_to_ids: currentIds.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          assigned_to_ids: [...currentIds, userId]
        };
      }
    });
  };

  const removeAssignedUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_to_ids: prev.assigned_to_ids.filter(id => id !== userId)
    }));
  };

  const getSelectedUsers = () => {
    return branchUsers.filter(u => formData.assigned_to_ids.includes(u.id));
  };

  const validateFile = (file: File): string | null => {
    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
      return `File type not supported. Please select a JPEG, JPG, PNG, DOCX, or PDF file.`;
    }

    // Check MIME type
    if (!allowedFileTypes.includes(file.type)) {
      // Some browsers may not detect .docx MIME type correctly, so check extension
      if (fileExtension !== '.docx' || !file.name.toLowerCase().endsWith('.docx')) {
        return `File type not supported. Please select a JPEG, JPG, PNG, DOCX, or PDF file.`;
      }
    }

    // Check file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size too large. Please select a file smaller than 10MB.`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "File Validation Error",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a ticket title.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a description.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.priority) {
      toast({
        title: "Validation Error",
        description: "Please select a priority level.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!ticket) {
      toast({
        title: "Error",
        description: "Ticket information not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const ticketData: UpdateTicketRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        assigned_to_ids: formData.assigned_to_ids,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await apiService.updateTicket(ticket.id, ticketData);

      toast({
        title: "Success",
        description: `Ticket ${ticket.ticket_number} updated successfully!`,
      });

      onClose();
      onTicketUpdated();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getFileIcon = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (['.jpeg', '.jpg', '.png'].includes(extension)) {
      return '🖼️';
    } else if (extension === '.pdf') {
      return '📄';
    } else if (extension === '.docx') {
      return '📝';
    }
    return '📎';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the issue"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the issue or request"
              rows={6}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assign To Users */}
          <div className="space-y-2">
            <Label>Assign To (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={usersLoading}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {usersLoading ? (
                    <span>Loading users...</span>
                  ) : formData.assigned_to_ids.length === 0 ? (
                    <span className="text-muted-foreground">Select users to assign</span>
                  ) : (
                    <span>{formData.assigned_to_ids.length} user{formData.assigned_to_ids.length !== 1 ? 's' : ''} selected</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-4 border-b">
                  <h4 className="font-medium text-sm">Assign Users</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select one or more users to assign this ticket to
                  </p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {branchUsers.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    branchUsers.map((branchUser) => (
                      <div
                        key={branchUser.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                        onClick={() => toggleUserAssignment(branchUser.id)}
                      >
                        <Checkbox
                          checked={formData.assigned_to_ids.includes(branchUser.id)}
                          onCheckedChange={() => toggleUserAssignment(branchUser.id)}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{branchUser.first_name} {branchUser.last_name}</div>
                          <div className="text-xs text-muted-foreground">{branchUser.email}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Selected Users Display */}
            {getSelectedUsers().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {getSelectedUsers().map((branchUser) => (
                  <Badge
                    key={branchUser.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span>{branchUser.first_name} {branchUser.last_name}</span>
                    <button
                      type="button"
                      onClick={() => removeAssignedUser(branchUser.id)}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpeg,.jpg,.png,.docx,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Add Attachments
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Supported formats: JPEG, JPG, PNG, DOCX, PDF (max 10MB each)
              </p>
            </div>

            {/* Selected Files Display */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{getFileIcon(file)}</span>
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

