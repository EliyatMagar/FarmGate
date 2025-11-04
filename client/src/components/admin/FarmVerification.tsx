// components/admin/FarmVerification.tsx
import React, { useEffect, useState } from 'react';
import { useFarm } from '../../hooks/useFarm';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  Ruler,
  Search,
  Filter,
  Mail
} from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  description?: string;
  farmer_name?: string;
  farmer_email?: string;
  location: string;
  total_area: number;
  created_at: string;
}

interface FarmCardProps {
  farm: Farm;
  rejectionReasons: { [key: string]: string };
  onRejectionReasonChange: (farmId: string, reason: string) => void;
  onVerify: (farmId: string) => void;
  onReject: (farmId: string) => void;
}

const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  rejectionReasons,
  onRejectionReasonChange,
  onVerify,
  onReject
}) => {
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 p-6 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Farm Information */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800">{farm.name}</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Clock className="w-4 h-4 mr-1" />
              Pending
            </span>
          </div>
          
          {farm.description && (
            <p className="text-gray-600 mb-4 leading-relaxed">{farm.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-gray-700">
              <User className="w-4 h-4 mr-2 text-blue-500" />
              <div>
                <div className="font-medium">{farm.farmer_name || 'Unknown Farmer'}</div>
                {farm.farmer_email && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {farm.farmer_email}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              <span>{farm.location}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Ruler className="w-4 h-4 mr-2 text-purple-500" />
              <span>{farm.total_area} acres</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
              <span>{new Date(farm.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <button
            onClick={() => onVerify(farm.id)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Farm
          </button>
          
          {!showRejectionInput ? (
            <button
              onClick={() => setShowRejectionInput(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
            >
              <XCircle className="w-4 h-4" />
              Reject Farm
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReasons[farm.id] || ''}
                onChange={(e) => onRejectionReasonChange(farm.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onReject(farm.id)}
                  disabled={!rejectionReasons[farm.id]?.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <XCircle className="w-4 h-4" />
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectionInput(false)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FarmVerification: React.FC = () => {
  const { pendingFarms, getPendingFarms, verifyFarm, rejectFarm, loading } = useFarm();
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  useEffect(() => {
    getPendingFarms();
  }, [getPendingFarms]);

  const handleVerify = async (farmId: string) => {
    if (window.confirm('Are you sure you want to approve this farm?')) {
      await verifyFarm(farmId);
    }
  };

  const handleReject = async (farmId: string) => {
    const reason = rejectionReasons[farmId];
    if (!reason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (window.confirm('Are you sure you want to reject this farm?')) {
      await rejectFarm(farmId, reason);
      setRejectionReasons(prev => ({ ...prev, [farmId]: '' }));
    }
  };

  const handleRejectionReasonChange = (farmId: string, reason: string) => {
    setRejectionReasons(prev => ({
      ...prev,
      [farmId]: reason
    }));
  };

  // Filter farms based on search and filter criteria
  const filteredFarms = pendingFarms.filter(farm => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      farm.name.toLowerCase().includes(searchLower) ||
      (farm.farmer_name && farm.farmer_name.toLowerCase().includes(searchLower)) ||
      (farm.farmer_email && farm.farmer_email.toLowerCase().includes(searchLower));
    
    const matchesLocation = !filterLocation || 
      farm.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(pendingFarms.map(farm => farm.location).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Verification</h1>
          <p className="text-gray-600 mt-1">Review and manage farm verification requests</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-4 py-3 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>{pendingFarms.length} pending verification{pendingFarms.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search Farms
            </label>
            <input
              type="text"
              placeholder="Search by farm name, farmer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Farm Cards */}
      {pendingFarms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="max-w-md mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">There are no pending farm verification requests at the moment.</p>
          </div>
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="max-w-md mx-auto">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Farms Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFarms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              rejectionReasons={rejectionReasons}
              onRejectionReasonChange={handleRejectionReasonChange}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmVerification;