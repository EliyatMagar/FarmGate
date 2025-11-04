// components/farm/MyFarmsList.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFarm } from '../../hooks/useFarm';
import { useAuth } from '../../hooks/useAuth';

const MyFarmsList: React.FC = () => {
  const { farms, getMyFarms, loading } = useFarm();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'farmer') {
      getMyFarms();
    }
  }, [getMyFarms, user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { class: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { class: 'bg-red-100 text-red-800', text: 'Rejected' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>{config.text}</span>;
  };

  if (user?.role !== 'farmer') {
    return (
      <div className="alert alert-error">
        Only farmers can view farms.
      </div>
    );
  }

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Farms</h2>
        <Link
          to="/dashboard/farms/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Farm
        </Link>
      </div>
      
      {farms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Farms Yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first farm.</p>
          <Link
            to="/dashboard/farms/create"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Your First Farm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
                  {getStatusBadge(farm.verification_status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{farm.location}</p>
                {farm.description && (
                  <p className="text-gray-700 mb-4 line-clamp-2">{farm.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <strong>Total Area:</strong> {farm.total_area} acres
                  </div>
                  <div>
                    <strong>Cultivated:</strong> {farm.cultivated_area || 0} acres
                  </div>
                  {farm.soil_type && (
                    <div>
                      <strong>Soil:</strong> {farm.soil_type}
                    </div>
                  )}
                </div>

                {farm.verification_status === 'rejected' && farm.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-red-700 text-sm">
                      <strong>Rejection Reason:</strong> {farm.rejection_reason}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/farms/${farm.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded text-sm"
                  >
                    View Details
                  </Link>
                  {(farm.verification_status === 'pending' || farm.verification_status === 'rejected') && (
                    <Link
                      to={`/dashboard/farms/${farm.id}/edit`}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-2 rounded text-sm"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFarmsList;