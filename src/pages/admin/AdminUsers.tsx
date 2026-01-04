import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MoreHorizontal, 
  Shield, 
  User, 
  Loader2, 
  Search, 
  Eye, 
  UserCog,
  Mail,
  Calendar,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user';
  avatar_url?: string | null;
}

interface UserDetails {
  resumeCount: number;
  analysisCount: number;
  skillGapCount: number;
  interviewCount: number;
  lastActive: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, email, full_name, created_at, avatar_url')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

    const usersWithRoles: UserWithRole[] = profiles.map(profile => ({
      ...profile,
      role: (roleMap.get(profile.user_id) as 'admin' | 'moderator' | 'user') || 'user',
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `User role updated to ${newRole}` });
      fetchUsers();
    }
  };

  const viewUserDetails = async (user: UserWithRole) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
    setLoadingDetails(true);
    
    try {
      const [resumesRes, analysesRes, skillGapsRes, interviewsRes] = await Promise.all([
        supabase.from('resumes').select('id', { count: 'exact' }).eq('user_id', user.user_id),
        supabase.from('resume_analyses').select('id', { count: 'exact' }).eq('user_id', user.user_id),
        supabase.from('skill_gaps').select('id', { count: 'exact' }).eq('user_id', user.user_id),
        supabase.from('interview_attempts').select('id, created_at', { count: 'exact' }).eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(1),
      ]);

      setUserDetails({
        resumeCount: resumesRes.count || 0,
        analysisCount: analysesRes.count || 0,
        skillGapCount: skillGapsRes.count || 0,
        interviewCount: interviewsRes.count || 0,
        lastActive: interviewsRes.data?.[0]?.created_at || null,
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Shield className="w-3 h-3" /> Admin</Badge>;
      case 'moderator':
        return <Badge className="gap-1 bg-orange-500/20 text-orange-500 border-orange-500/30"><UserCog className="w-3 h-3" /> Mod</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><User className="w-3 h-3" /> User</Badge>;
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    moderators: users.filter(u => u.role === 'moderator').length,
    regularUsers: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage users, roles, and view user data</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="gap-2 w-full sm:w-auto">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="glass-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{userStats.total}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{userStats.admins}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <UserCog className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{userStats.moderators}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Moderators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{userStats.regularUsers}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Regular Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users or roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-medium text-primary">
                                    {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium truncate max-w-[150px]">{user.full_name || 'No name'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground truncate max-w-[200px]">
                            {user.email || 'No email'}
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'admin')}>
                                  <Shield className="w-4 h-4 mr-2 text-red-500" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'moderator')}>
                                  <UserCog className="w-4 h-4 mr-2 text-orange-500" />
                                  Make Moderator
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'user')}>
                                  <User className="w-4 h-4 mr-2" />
                                  Make User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3 pr-2">
                    {filteredUsers.map((user) => (
                      <Card key={user.id} className="border border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-lg font-bold text-primary">
                                    {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user.full_name || 'No name'}</p>
                                <p className="text-sm text-muted-foreground truncate">{user.email || 'No email'}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'admin')}>
                                  <Shield className="w-4 h-4 mr-2 text-red-500" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'moderator')}>
                                  <UserCog className="w-4 h-4 mr-2 text-orange-500" />
                                  Make Moderator
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'user')}>
                                  <User className="w-4 h-4 mr-2" />
                                  Make User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                              {getRoleBadge(user.role)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Complete user profile and activity data
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl md:text-2xl font-bold text-primary">
                      {selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{selectedUser.full_name || 'No name'}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {selectedUser.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getRoleBadge(selectedUser.role)}
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Activity Data</h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : userDetails ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Resumes</span>
                      </div>
                      <p className="text-2xl font-bold">{userDetails.resumeCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-muted-foreground">Analyses</span>
                      </div>
                      <p className="text-2xl font-bold">{userDetails.analysisCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Skill Checks</span>
                      </div>
                      <p className="text-2xl font-bold">{userDetails.skillGapCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-muted-foreground">Interviews</span>
                      </div>
                      <p className="text-2xl font-bold">{userDetails.interviewCount}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No data available</p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Last Activity</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {userDetails?.lastActive 
                    ? new Date(userDetails.lastActive).toLocaleDateString()
                    : 'No activity yet'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}