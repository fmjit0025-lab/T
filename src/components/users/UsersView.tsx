import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  UserCheck, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onAddNewUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onAddNewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (u: User) => {
    if (u.id === currentUser.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${u.fullName}" (@${u.username})?`)) {
      await onDeleteUser(u.id);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'purple';
      case 'Manager': return 'info';
      case 'Warehouse Operator': return 'success';
      case 'Viewer': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">User & Permission Administration</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {users.length} Users Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage warehouse staff accounts, assign operational roles and customize granular feature permissions
          </p>
        </div>

        <button
          onClick={onAddNewUser}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Users</span>
            <span className="text-lg font-bold text-slate-800">{users.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Active Accounts</span>
            <span className="text-lg font-bold text-emerald-700">
              {users.filter(u => u.isActive).length} of {users.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Administrators</span>
            <span className="text-lg font-bold text-purple-700">
              {users.filter(u => u.role === 'Admin').length} Admins
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Username or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-blue-500 font-medium"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="Admin">Admins</option>
            <option value="Manager">Managers</option>
            <option value="Warehouse Operator">Warehouse Operators</option>
            <option value="Viewer">Viewers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Permissions Granted</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No users found matching search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center uppercase text-xs">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        @{u.username}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(u.role) as any} size="sm">
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                          {u.permissions?.length || 0} permissions
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {u.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(u.lastLogin).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Never</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {u.isActive ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Suspended</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditUser(u)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            title="Edit User & Permissions"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isSelf}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-30 disabled:hover:text-slate-400"
                            title={isSelf ? 'Cannot delete self' : 'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
