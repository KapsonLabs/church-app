import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Key, 
  Loader2,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type OrganizationUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPermissionsModal } from '@/components/modals/UserPermissionsModal';

export default function Profile() {
  const { permissions: globalPermissions, updatePermissions } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<OrganizationUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const fetchProfile = async (forceRefresh: boolean = false) => {
    // If we already have profile data and this isn't a forced refresh, use existing data
    if (profile && !forceRefresh) {
      return;
    }

    try {
      setError(null);
      const response = await apiService.fetchCurrentUserProfile();
      setProfile(response.data);
      
      // Update global permissions if they changed
      const newPermissions = response.data.permissions || [];
      const currentPermissionsString = JSON.stringify(globalPermissions);
      const newPermissionsString = JSON.stringify(newPermissions);
      
      if (currentPermissionsString !== newPermissionsString) {
        updatePermissions(newPermissions);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      toast({
        title: 'Error',
        description: 'Failed to load profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile(true);
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalPermissions = () => {
    if (!profile?.permissions) return 0;
    return profile.permissions.length;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || 'Profile not found'}</p>
              <Button onClick={() => handleRefresh()}>Try Again</Button>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and view your permissions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        @{profile.username} • {profile.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-sm">{profile.email}</p>
                    </div>

                    {profile.phone_number && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">Phone</span>
                        </div>
                        <p className="text-sm">{profile.phone_number}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {profile.is_active ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">Account Status</span>
                      </div>
                      {profile.is_active ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-500 text-white">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role & Account Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role & Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Role</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{profile.role?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{profile.role?.slug || ''}</p>
                        {profile.role?.description && (
                          <p className="text-xs text-muted-foreground mt-1">{profile.role.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Account Type</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {profile.is_staff && (
                          <Badge variant="default" className="bg-blue-600">Staff</Badge>
                        )}
                        {profile.is_superuser && (
                          <Badge variant="default" className="bg-purple-600">Superuser</Badge>
                        )}
                        {!profile.is_staff && !profile.is_superuser && (
                          <Badge variant="secondary">Regular User</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Account Created</span>
                      </div>
                      <p className="text-sm">{formatDate(profile.created_at)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Last Updated</span>
                      </div>
                      <p className="text-sm">{formatDate(profile.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions Summary Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Permissions Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <Key className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{getTotalPermissions()}</p>
                    <p className="text-sm text-muted-foreground">Total Permissions</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {profile.permissions?.length || 0} permissions assigned:
                    </p>
                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                      {profile.permissions?.slice(0, 10).map((permission, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 rounded-md bg-accent/50"
                        >
                          <span className="text-xs font-mono">{permission}</span>
                        </div>
                      ))}
                      {profile.permissions && profile.permissions.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          + {profile.permissions.length - 10} more permissions
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsPermissionsModalOpen(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    View All Permissions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Permissions Modal */}
        <UserPermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          userName={`${profile.first_name} ${profile.last_name}`}
          userEmail={profile.email}
          roleName={profile.role?.name || 'N/A'}
          permissions={profile.permissions || []}
        />
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

