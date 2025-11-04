// components/dashboard/Profile.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account information and preferences
          </p>
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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;