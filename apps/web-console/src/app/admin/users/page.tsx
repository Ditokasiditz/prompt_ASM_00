'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ProtectedRoute, useAuth, User } from '@/providers/auth-provider';
import { LayoutDashboard, ShieldCheck, ShieldAlert, Activity, Users as UsersIcon, Settings, Trash2, UserPlus, MoreVertical, ChevronDown, Plus, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New user form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit user form state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('USER');
  const [isUpdating, setIsUpdating] = useState(false);

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/users', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Could not load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
        credentials: 'include',
      });
      
      const data = await res.json();
      if (res.ok) {
        setUsers([...users, data]);
        setUsername('');
        setPassword('');
        setRole('USER');
        setIsModalOpen(false);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: editUsername, 
          role: editRole, 
          password: editPassword.trim() !== '' ? editPassword : undefined 
        }),
        credentials: 'include',
      });
      
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? data : u));
        setIsEditModalOpen(false);
        setEditingUser(null);
        setEditPassword('');
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred updating user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  const navigations = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Score Factor", href: "/score-factor", icon: ShieldCheck },
    { title: "Issues portfolio", href: "/issues", icon: ShieldAlert },
    { title: "Digital Footprint", href: "/digital-footprint", icon: Activity },
    { title: "User Management", href: "/admin/users", icon: UsersIcon, isActive: true },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const userCount = users.length - adminCount;

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar navigations={navigations} />

        <main className="flex-1 overflow-y-auto p-8 bg-white text-gray-900 relative">
          <div className="mx-auto max-w-6xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
              <UsersIcon className="w-7 h-7 text-gray-800" strokeWidth={2.5} />
              <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {/* Top Cards & Add Button */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between mb-8">
              <div className="flex gap-4 flex-1">
                {/* Admin Card */}
                <div className="flex-1 border border-gray-300 rounded-xl p-5 flex flex-col justify-between max-w-[320px]">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-extrabold text-gray-900">Admin</h2>
                    <div className="flex items-center font-bold text-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mr-2"></span>
                      {adminCount}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-medium mt-3 leading-tight">
                    <p>Account manager</p>
                    <p>Full access</p>
                  </div>
                </div>

                {/* User Card */}
                <div className="flex-1 border border-gray-300 rounded-xl p-5 flex flex-col justify-between max-w-[320px]">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-extrabold text-gray-900">User</h2>
                    <div className="flex items-center font-bold text-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mr-2"></span>
                      {userCount}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-medium mt-3 leading-tight">
                    <p>Standard member</p>
                    <p>Full access</p>
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex items-center pl-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#1e2a9b] hover:bg-[#162082] shadow-md shadow-blue-900/20 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 h-fit"
                >
                  <Plus className="w-5 h-5 font-bold" strokeWidth={3} />
                  Add New
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="rounded-md border border-[#d4d4d8] bg-card overflow-hidden mt-4">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-[#f9f9fb] border-b-[#d4d4d8] hover:bg-[#f9f9fb]">
                    <TableHead className="font-semibold w-[250px]">User</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Create Date</TableHead>
                    <TableHead className="font-semibold text-center w-[120px]">Delete Account</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground animate-pulse font-medium">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30 group border-b-[#d4d4d8]">
                        <TableCell className="py-4 font-medium">
                          {user.username.charAt(0).toUpperCase() + user.username.slice(1)} {currentUser?.id === user.id && "(You)"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 flex w-fit items-center text-xs font-bold uppercase tracking-wider rounded-full border ${
                            user.role === 'ADMIN' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'User'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-[14px] font-medium text-gray-700">
                            <span>{new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <span className="text-gray-500 text-[12px]">{new Date(user.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={currentUser?.id === user.id}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5 mx-auto" strokeWidth={2} />
                          </button>
                        </TableCell>
                        <TableCell className="text-center pr-4">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditUsername(user.username);
                              setEditRole(user.role);
                              setEditPassword('');
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                            title="Edit User"
                          >
                            <MoreVertical className="w-5 h-5 mx-auto" strokeWidth={2} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>

        {/* Add User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050B35]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Add New User
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="modal-username" className="text-sm font-semibold text-gray-700 block">Username</label>
                  <input
                    id="modal-username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    required
                    autoFocus
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="modal-password" className="text-sm font-semibold text-gray-700 block">Password</label>
                  <input
                    id="modal-password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="modal-role" className="text-sm font-semibold text-gray-700 block">Role</label>
                  <div className="relative">
                    <select
                      id="modal-role"
                      value={role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                      className="flex h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 cursor-pointer"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="h-11 px-6 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isCreating} 
                    className="h-11 px-6 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                  >
                    {isCreating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050B35]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Edit User
                </h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditUser} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="edit-username" className="text-sm font-semibold text-gray-700 block">Username</label>
                  <input
                    id="edit-username"
                    value={editUsername}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditUsername(e.target.value)}
                    required
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-password" className="text-sm font-semibold text-gray-700 block">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                  <input
                    id="edit-password"
                    type="password"
                    value={editPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-role" className="text-sm font-semibold text-gray-700 block">Role</label>
                  <div className="relative">
                    <select
                      id="edit-role"
                      value={editRole}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditRole(e.target.value)}
                      disabled={currentUser?.id === editingUser.id}
                      className="flex h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                  {currentUser?.id === editingUser.id && (
                    <p className="text-xs text-orange-500 mt-1">You cannot change your own role.</p>
                  )}
                </div>
                <div className="pt-2 flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-11 px-6 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating} 
                    className="h-11 px-6 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
