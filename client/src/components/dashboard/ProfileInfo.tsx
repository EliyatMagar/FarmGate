// components/dashboard/ProfileInfo.tsx
import React from 'react';
import type { User } from '../../types/user';

interface ProfileInfoProps {
  user: User;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">{user.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold capitalize">{user.role}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className={`mt-1 text-lg font-semibold ${
              user.is_verified ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {user.is_verified ? 'Verified' : 'Pending Verification'}
            </p>
          </div>
          
          {user.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-lg text-gray-900 font-semibold">{user.phone}</p>
            </div>
          )}
          
          {user.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <p className="mt-1 text-lg text-gray-900 font-semibold">{user.location}</p>
            </div>
          )}
        </div>
        
        {user.profile_image && (
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <img
              src={user.profile_image}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;