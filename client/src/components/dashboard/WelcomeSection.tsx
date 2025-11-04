// components/dashboard/WelcomeSection.tsx
import React from 'react';
import type { User } from '../../types/user';

interface WelcomeSectionProps {
  user: User;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {user.profile_image ? (
              <img
                className="h-16 w-16 rounded-full"
                src={user.profile_image}
                alt={user.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-600">
              {user.is_verified 
                ? 'Your account is verified and ready to use.' 
                : 'Your account is pending verification by admin.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;