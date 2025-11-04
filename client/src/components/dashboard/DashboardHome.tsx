// components/dashboard/DashboardHome.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import WelcomeSection from './WelcomeSection';
import ProfileInfo from './ProfileInfo';
import QuickActions from './QuickActions';
import VerificationNotice from './VerificationNotice';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection user={user} />
      
      {/* Profile Information */}
      <ProfileInfo user={user} />

      {/* Quick Actions */}
      {user.is_verified && <QuickActions user={user} />}

      {/* Verification Notice */}
      {!user.is_verified && <VerificationNotice />}
    </div>
  );
};

export default DashboardHome;