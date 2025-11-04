// components/admin/categories/CategoriesManagement.tsx
import React, { useState } from 'react';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import CategoryDetail from './CategoryDetail';
import type { ProductCategory } from '../../../types/product';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const CategoriesManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCurrentView('create');
  };

  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCurrentView('edit');
  };

  const handleViewCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCurrentView('detail');
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedCategory(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Category Management
        </h2>
        
        {currentView === 'list' && (
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create Category
          </button>
        )}
      </div>

      {currentView === 'list' && (
        <CategoryList
          onEditCategory={handleEditCategory}
          onViewCategory={handleViewCategory}
        />
      )}

      {currentView === 'create' && (
        <CategoryForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {currentView === 'edit' && selectedCategory && (
        <CategoryForm
          category={selectedCategory}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {currentView === 'detail' && selectedCategory && (
        <CategoryDetail
          category={selectedCategory}
          onClose={handleCancel}
          onEdit={handleEditCategory}
        />
      )}
    </div>
  );
};

export default CategoriesManagement;