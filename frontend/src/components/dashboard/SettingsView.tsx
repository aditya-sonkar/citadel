import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { AccessDeniedState } from '../ui/AccessDeniedState';

interface SettingsViewProps {
  userEmail?: string;
  isRoot?: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userEmail, isRoot }) => {
  const [isDenied, setIsDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState({
    minimumLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    enableExpiration: false,
    preventReuse: 5,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Edit Modal form state
  const [editForm, setEditForm] = useState({ ...policy });

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // General alert messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const testAccess = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.success && data.data) {
          setPolicy(data.data.passwordPolicy);
          setEditForm(data.data.passwordPolicy);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setIsDenied(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    testAccess();
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/settings', { passwordPolicy: editForm });
      if (data.success && data.data) {
        setPolicy(data.data.passwordPolicy);
        setEditForm(data.data.passwordPolicy);
        setIsEditModalOpen(false);
        setMessage({ type: 'success', text: 'Password policy updated successfully!' });
      }
    } catch (err: any) {
      console.error('Failed to save policy', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save password policy.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsPasswordLoading(true);
    try {
      const { data } = await api.put('/users/me/password', {
        currentPassword,
        newPassword,
      });
      if (data.success) {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          setPasswordSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to change password', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isDenied) {
    return <AccessDeniedState />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-[13px] text-zinc-500 font-medium">{isRoot ? 'Fetching data...' : 'Verifying access...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10 pb-20">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            Configure account alias, password policies, and security credentials.
          </p>
        </div>
        <button
          onClick={() => setIsChangePasswordOpen(true)}
          className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-sm"
        >
          Change Password
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded text-xs font-medium flex justify-between items-center ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-70 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Account Details */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">
            Account Details
          </h3>
          <button className="text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Edit
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 w-[200px]">Account ID</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">1234-5678-9012</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Account Alias</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">citadel-prod-global</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Root Email</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">{userEmail || 'root@org.local'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Canonical User ID</td>
                <td className="py-3 px-6 text-[12px] text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-xs">
                  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col mt-2">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">
              Password Policy
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Rules applied when IAM users change their own passwords</p>
          </div>
          <button
            onClick={() => { setEditForm({ ...policy }); setIsEditModalOpen(true); }}
            className="text-[12px] font-medium px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Edit Policy
          </button>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 w-2/3">Minimum password length</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-semibold">{policy.minimumLength} characters</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one uppercase letter</td>
                <td className={`py-3 px-6 text-[13px] font-semibold ${policy.requireUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                  {policy.requireUppercase ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one lowercase letter</td>
                <td className={`py-3 px-6 text-[13px] font-semibold ${policy.requireLowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                  {policy.requireLowercase ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one number</td>
                <td className={`py-3 px-6 text-[13px] font-semibold ${policy.requireNumbers ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                  {policy.requireNumbers ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one non-alphanumeric character (!@#$%^&*)</td>
                <td className={`py-3 px-6 text-[13px] font-semibold ${policy.requireSymbols ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                  {policy.requireSymbols ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Enable password expiration</td>
                <td className={`py-3 px-6 text-[13px] font-semibold ${policy.enableExpiration ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                  {policy.enableExpiration ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Prevent password reuse</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-semibold">Remember last {policy.preventReuse} passwords</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Password Policy Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Edit Password Policy</h3>
            </div>
            <form onSubmit={handleSavePolicy} className="p-6 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Minimum Password Length</label>
                <input
                  type="number"
                  min={6}
                  max={128}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={editForm.minimumLength}
                  onChange={e => setEditForm(prev => ({ ...prev, minimumLength: parseInt(e.target.value) || 12 }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Require Uppercase Letters</label>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700"
                  checked={editForm.requireUppercase}
                  onChange={e => setEditForm(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Require Lowercase Letters</label>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700"
                  checked={editForm.requireLowercase}
                  onChange={e => setEditForm(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Require Numbers</label>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700"
                  checked={editForm.requireNumbers}
                  onChange={e => setEditForm(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Require Special Characters</label>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700"
                  checked={editForm.requireSymbols}
                  onChange={e => setEditForm(prev => ({ ...prev, requireSymbols: e.target.checked }))}
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Prevent Password Reuse (Last N passwords)</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={editForm.preventReuse}
                  onChange={e => setEditForm(prev => ({ ...prev, preventReuse: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditForm({ ...policy }); }}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 flex flex-col gap-4 text-xs">
              {passwordError && (
                <div className="p-3 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-medium">
                  {passwordSuccess}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Current Password</label>
                <input
                  type="password"
                  required
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">New Password</label>
                <input
                  type="password"
                  required
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-500 dark:text-zinc-450 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isPasswordLoading}
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                >
                  {isPasswordLoading ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsView;
