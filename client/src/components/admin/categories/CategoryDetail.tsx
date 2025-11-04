// components/admin/categories/CategoryDetail.tsx
import React from 'react';
import type { ProductCategory } from '../../../types/product';

interface CategoryDetailProps {
  category: ProductCategory;
  onClose: () => void;
  onEdit: (category: ProductCategory) => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ category, onClose, onEdit }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Category Details</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => onEdit(category)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <p className="mt-1 text-sm text-gray-900">{category.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">
                {category.description || 'No description provided'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span
                className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                  category.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {category.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <img
                  src={category.image}
                  alt={category.name}
                  className="mt-2 h-32 w-32 object-cover rounded-md"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <p className="mt-1 text-sm text-gray-900">
                {category.parent_name || 'Root Category (No Parent)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Created Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(category.created_at).toLocaleDateString()} at{' '}
                {new Date(category.created_at).toLocaleTimeString()}
              </p>
            </div>

            {category.product_count !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Count</label>
                <p className="mt-1 text-sm text-gray-900">{category.product_count}</p>
              </div>
            )}
          </div>
        </div>

        {category.children && category.children.length > 0 && (
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">Subcategories</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.children.map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {child.image && (
                      <img
                        src={child.image}
                        alt={child.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{child.name}</p>
                      <p className="text-sm text-gray-500">
                        {child.product_count || 0} products
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;