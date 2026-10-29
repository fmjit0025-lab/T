import React, { useState, useEffect } from 'react';
import { User, UserRole, PermissionKey, ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../../types';
import { Modal } from '../common/Modal';
import { Check, Shield, ShieldCheck, User as UserIcon } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => Promise<void>;
  existingUsers: User[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  existingUsers,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Warehouse Operator');
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setUsername(user.username);
      setEmail(user.email);
      setPassword('');
      setRole(user.role);
      setPermissions(user.permissions || []);
      setIsActive(user.isActive);
    } else {
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('password123');
      setRole('Warehouse Operator');
      setPermissions(ROLE_DEFAULT_PERMISSIONS['Warehouse Operator']);
      setIsActive(true);
    }
  }, [user, isOpen]);

  // When changing role, set recommended permissions preset
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setPermissions(ROLE_DEFAULT_PERMISSIONS[newRole]);
  };

  const togglePermission = (key: PermissionKey) => {
    setPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setPermissions(ALL_PERMISSIONS.map(p => p.key));
  };

  const handleClearAll = () => {
    setPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !cleanUsername || !cleanEmail) {
      alert('Please fill in Full Name, Username, and Email.');
      return;
    }

    if (!user && existingUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      alert('Username already taken. Please choose another.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedUser: User = {
        id: user ? user.id : `usr-${Date.now()}`,
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: password ? password : user?.password || 'password123',
        role,
        permissions,
        isActive,
        createdAt: user ? user.createdAt : new Date().toISOString(),
        lastLogin: user ? user.lastLogin : undefined,
      };

      await onSave(savedUser);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group permissions for organized matrix
  const groups = Array.from(new Set(ALL_PERMISSIONS.map(p => p.group)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Edit User & Permissions: ${user.fullName}` : 'Register New System User'}
      subtitle="Configure profile, access role and granular module permissions"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sconnor"
              className="w-full text-xs font-mono bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sconnor@company.com"
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {user ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!user}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={user ? '••••••••' : 'Enter initial password'}
              className="w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">System Role *</label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full text-xs font-semibold bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500"
            >
              <option value="Admin">Admin (Full Access & User Admin)</option>
              <option value="Manager">Manager (Operations, Stock & Reports)</option>
              <option value="Warehouse Operator">Warehouse Operator (Inward GRN & Outward TOG)</option>
              <option value="Viewer">Viewer (Read-Only Reports & Stock)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Account Active</span>
              <span className="text-[10px] text-slate-500">Allow user to sign in</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Assigned Permissions ({permissions.length} of {ALL_PERMISSIONS.length})</span>
              </h4>
              <p className="text-[11px] text-slate-500">Fine-tune individual capabilities beyond the default role</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 bg-white">
            {groups.map((group) => {
              const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
              const allChecked = groupPerms.every(p => permissions.includes(p.key));

              return (
                <div key={group} className="p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {group}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (allChecked) {
                          setPermissions(prev => prev.filter(k => !groupPerms.some(p => p.key === k)));
                        } else {
                          const toAdd = groupPerms.map(p => p.key).filter(k => !permissions.includes(k));
                          setPermissions(prev => [...prev, ...toAdd]);
                        }
                      }}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      {allChecked ? 'Deselect Group' : 'Select Group'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupPerms.map((perm) => {
                      const isChecked = permissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-blue-50/60 border-blue-300 text-slate-900' 
                              : 'bg-slate-50/40 border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.key)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-xs font-semibold block leading-tight">{perm.label}</span>
                            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">{perm.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving User...' : user ? 'Save Changes' : 'Register User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
