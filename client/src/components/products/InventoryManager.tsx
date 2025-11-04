import React, { useState } from 'react';

interface InventoryManagerProps {
  currentQuantity: number;
  unitType: string;
  onUpdate: (quantity: number) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
  currentQuantity,
  unitType,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [operation, setOperation] = useState<'set' | 'add' | 'subtract'>('set');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalQuantity = currentQuantity;
    
    switch (operation) {
      case 'set':
        finalQuantity = newQuantity;
        break;
      case 'add':
        finalQuantity = currentQuantity + newQuantity;
        break;
      case 'subtract':
        finalQuantity = Math.max(0, currentQuantity - newQuantity);
        break;
    }

    onUpdate(finalQuantity);
    setIsEditing(false);
    setNewQuantity(0);
  };

  const getQuantityText = () => {
    if (currentQuantity === 0) {
      return <span className="text-red-600 font-medium">Out of Stock</span>;
    } else if (currentQuantity < 10) {
      return <span className="text-orange-600 font-medium">Low Stock</span>;
    } else {
      return <span className="text-green-600 font-medium">In Stock</span>;
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
        <div className="flex justify-between items-center mb-1 md:mb-2">
          <span className="text-xs md:text-sm font-medium text-gray-700">Inventory:</span>
          {getQuantityText()}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs md:text-sm text-gray-600">
            {currentQuantity} {unitType}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs md:text-sm bg-blue-600 text-white px-2 md:px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-2 md:p-3 rounded-lg space-y-2 md:space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs md:text-sm font-medium text-gray-700">Update Inventory</span>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-xs md:text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-1 md:space-y-2">
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as 'set' | 'add' | 'subtract')}
          className="w-full text-xs md:text-sm border border-gray-300 rounded px-2 py-1 md:py-1.5"
        >
          <option value="set">Set to</option>
          <option value="add">Add</option>
          <option value="subtract">Subtract</option>
        </select>

        <input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
          min="0"
          className="w-full text-xs md:text-sm border border-gray-300 rounded px-2 py-1 md:py-1.5"
          placeholder="Quantity"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white text-xs md:text-sm py-1 md:py-1.5 rounded hover:bg-green-700 transition-colors"
      >
        Update
      </button>
    </form>
  );
};

export default InventoryManager;