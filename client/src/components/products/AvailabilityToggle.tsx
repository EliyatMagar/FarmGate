import React, { useState } from 'react';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: (isAvailable: boolean) => void;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isAvailable,
  onToggle
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggle(!isAvailable);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`w-full py-2 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors ${
        isAvailable
          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isUpdating ? 'Updating...' : isAvailable ? '✅ Available' : '❌ Unavailable'}
    </button>
  );
};

export default AvailabilityToggle;