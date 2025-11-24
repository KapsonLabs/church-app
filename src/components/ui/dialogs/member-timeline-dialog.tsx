import React from 'react';
import { type ApiMember } from '@/types/members';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TimelineItem {
  status: 'active' | 'inactive';
  date: Date;
  description: string;
}

interface MemberTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: ApiMember | null;
}

export function MemberTimelineDialog({
  open,
  onOpenChange,
  member,
}: MemberTimelineDialogProps) {
  if (!member) return null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate timeline based on member data
  const getStatusTimeline = (member: ApiMember): TimelineItem[] => {
    const createdDate = new Date(member.created_at);
    const timeline: TimelineItem[] = [
      {
        status: 'inactive',
        date: createdDate,
        description: 'Member Created',
      },
    ];

    if (member.is_active) {
      timeline.push({
        status: 'active',
        date: new Date(member.updated_at),
        description: 'Member Activated',
      });
    }

    return timeline;
  };

  const timeline = getStatusTimeline(member);

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const statusIcons = {
    active: '✅',
    inactive: '🔴',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Member Timeline - {member.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index === timeline.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                  {index < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className={`${statusColors[item.status]} border-0`}>
                      <span className="mr-1">{statusIcons[item.status]}</span>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm text-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Member Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-3">Member Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium">{member.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-medium">{member.phone_number}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ID Type</p>
                <p className="font-medium">{member.id_type_display}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Accounts</p>
                <p className="font-medium">{member.account_count}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

