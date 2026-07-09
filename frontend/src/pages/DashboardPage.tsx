import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import { api } from '../lib/axios';

import Sidebar from '../components/dashboard/Sidebar';
import type { IAMTab } from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import DashboardHome from '../components/dashboard/DashboardHome';
import UsersView from '../components/dashboard/UsersView';
import GroupsView from '../components/dashboard/GroupsView';
import PoliciesView from '../components/dashboard/PoliciesView';

import CredentialReportView from '../components/dashboard/CredentialReportView';
import SettingsView from '../components/dashboard/SettingsView';
import UserDetails from '../components/dashboard/UserDetails';
import PolicySimulator from '../components/dashboard/PolicySimulator';
import AuditLogs from '../components/dashboard/AuditLogs';
import CreateUserWizard from '../components/dashboard/CreateUserWizard';
import ResourceAccess from '../components/dashboard/ResourceAccess';
import GroupDetails from '../components/dashboard/GroupDetails';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<IAMTab>('dashboard');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoot, setIsRoot] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    // Add dark class to body if theme is dark
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('citadel_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userStr = localStorage.getItem('citadel_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserEmail(u.email);
        setUserName(u.name || '');
        setIsAdmin(!!u.isRoot);
        setIsRoot(!!u.isRoot);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, [navigate]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('citadel_refresh_token');
    if (refreshToken) {
      // Fire-and-forget — revoke the session in the database
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.clear();
    queryClient.clear();
    navigate('/login');
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('user-details');
  };

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab('group-details');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'resource-access':
        return <ResourceAccess />;
      case 'dashboard':
        return <DashboardHome isAdmin={isAdmin} setActiveTab={setActiveTab} />;
      case 'users':
        return <UsersView setActiveTab={setActiveTab} onUserClick={handleUserClick} isRoot={isRoot} />;
      case 'groups':
        return <GroupsView setActiveTab={setActiveTab} onGroupClick={handleGroupClick} isRoot={isRoot} />;

      case 'policies':
        return <PoliciesView isRoot={isRoot} />;
      case 'settings':
        return <SettingsView userEmail={userEmail} isRoot={isRoot} />;
      case 'boundaries':
        return <div className="p-8 text-sm text-zinc-500 flex flex-col gap-2">
          <h1 className="text-xl font-bold">Permission Boundaries</h1>
          <p>To view permission boundaries, go to the Identities section, click on a User, and view their Details page.</p>
        </div>;
      case 'simulator':
        return <PolicySimulator isRoot={isRoot} />;
      case 'audit':
        return <AuditLogs isRoot={isRoot} />;
      case 'credentials':
        return <CredentialReportView isRoot={isRoot} />;
      case 'user-details':
        return <UserDetails setActiveTab={setActiveTab} userId={selectedUserId || undefined} />;
      case 'group-details':
        return <GroupDetails setActiveTab={setActiveTab} groupId={selectedGroupId || undefined} />;
      case 'create-user':
        return <CreateUserWizard setActiveTab={setActiveTab} />;
      default:
        return <DashboardHome isAdmin={isAdmin} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        isAdmin={isAdmin}
        isRoot={isRoot}
        userEmail={userEmail}
        onLogout={handleLogout}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar 
          activeTab={activeTab} 
          userEmail={userEmail} 
          userName={userName}
          isRoot={isRoot}
          onLogout={handleLogout} 
          onMenuClick={() => setIsSidebarOpen(prev => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#050505] min-h-0">
          <div className="min-h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
