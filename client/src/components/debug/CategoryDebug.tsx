// components/debug/CategoryDebug.tsx
import React from 'react';
import { useAppSelector } from '../../hooks/redux';

const CategoryDebug: React.FC = () => {
  const categoryState = useAppSelector((state) => state.category);
  
  console.log('🔍 CategoryDebug - Full state:', categoryState);
  
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-md">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Category Debug</h3>
      <div className="text-sm space-y-1">
        <p><strong>Loading:</strong> {categoryState.loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {categoryState.error || 'None'}</p>
        <p><strong>Categories Count:</strong> {categoryState.categories.length}</p>
        <p><strong>Category Options Count:</strong> {categoryState.categoryOptions.length}</p>
        
        {categoryState.categoryOptions.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Category Options:</p>
            {categoryState.categoryOptions.map((cat, index) => (
              <p key={index} className="text-xs">
                {index + 1}. {cat.name} - ID: {cat.id}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDebug;