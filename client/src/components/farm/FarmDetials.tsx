// components/farm/FarmDetails.tsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFarm } from '../../hooks/useFarm';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const FarmDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentFarm, getFarmById, loading, error } = useFarm();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 FarmDetails - Component mounted');
    console.log('📌 Farm ID from URL:', id);
    console.log('👤 Current User:', user);
    console.log('🏠 Current Farm:', currentFarm);
    
    if (id) {
      console.log('🚀 Fetching farm details for ID:', id);
      getFarmById(id);
    } else {
      console.log('❌ No farm ID provided in URL');
    }
  }, [id, getFarmById]);

  useEffect(() => {
    console.log('📊 FarmDetails - Data updated:', {
      currentFarm,
      loading,
      error,
      user
    });
  }, [currentFarm, loading, error, user]);

  console.log('🎨 FarmDetails - Rendering component');

  if (loading) {
    console.log('⏳ FarmDetails - Showing loading state');
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <LoadingSpinner text="Loading farm details..." />
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">Loading farm ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ FarmDetails - Showing error state:', error);
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="alert alert-error mb-4">
          Error loading farm: {error}
        </div>
        <div className="p-4 bg-gray-100 rounded mb-4">
          <h4 className="font-bold">Debug Info:</h4>
          <p>Farm ID: {id}</p>
          <p>User Role: {user?.role}</p>
          <p>User ID: {user?.id}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/farms')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Back to Farms
        </button>
      </div>
    );
  }

  if (!currentFarm) {
    console.log('❌ FarmDetails - No farm data');
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="alert alert-error">
          Farm not found
        </div>
        <div className="p-4 bg-gray-100 rounded mb-4">
          <h4 className="font-bold">Debug Info:</h4>
          <p>Farm ID: {id}</p>
          <p>User Role: {user?.role}</p>
          <p>Current Farm: {currentFarm ? 'Exists' : 'Null'}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/farms')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Back to Farms
        </button>
      </div>
    );
  }

  // Check farm ownership with detailed logging
  const isFarmOwner = user?.role === 'farmer' && currentFarm.farmer_id === user.id?.toString();
  
  console.log('🔐 Farm ownership check:', {
    userRole: user?.role,
    farmFarmerId: currentFarm.farmer_id,
    userId: user?.id,
    userIdString: user?.id?.toString(),
    isFarmOwner
  });

  if (!isFarmOwner) {
    console.log('⛔ FarmDetails - Access denied');
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="alert alert-error">
          Access denied. You can only view your own farms.
        </div>
        <div className="p-4 bg-gray-100 rounded mb-4">
          <h4 className="font-bold">Ownership Debug:</h4>
          <p>Farm Farmer ID: {currentFarm.farmer_id}</p>
          <p>Your User ID: {user?.id}</p>
          <p>Your User ID (string): {user?.id?.toString()}</p>
          <p>Match: {currentFarm.farmer_id === user?.id?.toString() ? 'YES' : 'NO'}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/farms')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Back to Farms
        </button>
      </div>
    );
  }

  console.log('✅ FarmDetails - Rendering farm details');
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentFarm.name}</h2>
              <p className="text-gray-600 mt-1">{currentFarm.location}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                currentFarm.verification_status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : currentFarm.verification_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentFarm.verification_status}
              </span>
              <Link
                to="/dashboard/farms"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Debug info */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-bold text-green-800">Farm Loaded Successfully!</h4>
            <p className="text-sm">Farm ID: {currentFarm.id}</p>
            <p className="text-sm">Status: {currentFarm.verification_status}</p>
          </div>

          {/* Rest of your farm details content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Farm Name</dt>
                  <dd className="text-sm text-gray-900">{currentFarm.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{currentFarm.location}</dd>
                </div>
                {currentFarm.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{currentFarm.description}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Farm Specifications</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Area</dt>
                  <dd className="text-sm text-gray-900">{currentFarm.total_area} acres</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cultivated Area</dt>
                  <dd className="text-sm text-gray-900">{currentFarm.cultivated_area || 0} acres</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetails;