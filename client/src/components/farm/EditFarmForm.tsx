// components/farm/EditFarmForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFarm } from '../../hooks/useFarm';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const EditFarmForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentFarm, getFarmById, updateFarm, loading, error } = useFarm();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    total_area: '',
    cultivated_area: '',
    soil_type: '',
    certification: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    console.log('EditFarmForm - Farm ID:', id);
    if (id) {
      getFarmById(id);
    }
  }, [id, getFarmById]);

  useEffect(() => {
    console.log('EditFarmForm - Current Farm:', currentFarm);
    if (currentFarm) {
      // Safe coordinates parsing
      let latitude = '';
      let longitude = '';
      
      if (currentFarm.coordinates) {
        try {
          const coords = currentFarm.coordinates.replace(/[()]/g, '').split(',');
          if (coords.length === 2) {
            latitude = coords[0].trim();
            longitude = coords[1].trim();
          }
        } catch (error) {
          console.warn('Error parsing coordinates:', error);
        }
      }

      setFormData({
        name: currentFarm.name || '',
        description: currentFarm.description || '',
        location: currentFarm.location || '',
        latitude: latitude,
        longitude: longitude,
        total_area: currentFarm.total_area?.toString() || '',
        cultivated_area: currentFarm.cultivated_area?.toString() || '',
        soil_type: currentFarm.soil_type || '',
        certification: currentFarm.certification || '',
      });
      setExistingImages(currentFarm.images || []);
    }
  }, [currentFarm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      console.error('Farm ID is missing');
      return;
    }

    try {
      // Prepare form data with safe number conversions
      const submitData = {
        ...formData,
        total_area: formData.total_area ? parseFloat(formData.total_area) : undefined,
        cultivated_area: formData.cultivated_area ? parseFloat(formData.cultivated_area) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        images: images.length > 0 ? images : undefined,
      };

      console.log('Submitting farm update:', submitData);
      await updateFarm(id, submitData);
      
      // Redirect to farm details on success
      navigate(`/dashboard/farms/${id}`);
    } catch (error) {
      console.error('Error updating farm:', error);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  if (loading) {
    return <LoadingSpinner text="Loading farm data..." />;
  }

  if (!currentFarm) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="alert alert-error">
          Farm not found or still loading...
        </div>
        <button
          onClick={() => navigate('/dashboard/farms')}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Farms
        </button>
      </div>
    );
  }

  // FIX: Safe UUID comparison
  const isFarmOwner = user?.role === 'farmer' && currentFarm.farmer_id === user.id?.toString();
  
  if (!isFarmOwner) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="alert alert-error">
          You can only edit your own farms.
        </div>
        <button
          onClick={() => navigate('/dashboard/farms')}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Farms
        </button>
      </div>
    );
  }

  if (currentFarm.verification_status === 'approved') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="alert alert-error">
          Cannot edit approved farm. Please contact admin for modifications.
        </div>
        <button
          onClick={() => navigate(`/dashboard/farms/${id}`)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Farm Details
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Farm</h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your farm information. After editing, the farm will need to be verified again.
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your farm, crops, farming practices, etc."
                />
              </div>
            </div>

            {/* Farm Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Farm Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="total_area" className="block text-sm font-medium text-gray-700">
                    Total Area (acres) *
                  </label>
                  <input
                    type="number"
                    id="total_area"
                    name="total_area"
                    step="0.01"
                    min="0"
                    value={formData.total_area}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cultivated_area" className="block text-sm font-medium text-gray-700">
                    Cultivated Area (acres)
                  </label>
                  <input
                    type="number"
                    id="cultivated_area"
                    name="cultivated_area"
                    step="0.01"
                    min="0"
                    value={formData.cultivated_area}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700">
                    Soil Type
                  </label>
                  <select
                    id="soil_type"
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Soil Type</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="silty">Silty</option>
                    <option value="peaty">Peaty</option>
                    <option value="chalky">Chalky</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Coordinates (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    step="any"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 40.7128"
                  />
                </div>
                
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    step="any"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Certification */}
            <div>
              <label htmlFor="certification" className="block text-sm font-medium text-gray-700">
                Certification
              </label>
              <input
                type="text"
                id="certification"
                name="certification"
                value={formData.certification}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Organic, Fair Trade, Rainforest Alliance"
              />
            </div>

            {/* Images */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Add More Farm Images
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload additional images of your farm.
              </p>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Farm image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Add:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`New image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/farms/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Updating Farm...' : 'Update Farm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFarmForm;