// components/dashboard/QuickActions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types/user';

interface QuickActionsProps {
  user: User;
}

const QuickActions: React.FC<QuickActionsProps> = ({ user }) => {
  const farmerActions = [
    {
      title: 'Manage Products',
      description: 'Add and manage your farm products',
      buttonText: 'View Products',
      link: '/dashboard/farmer/products',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'My Farms',
      description: 'Manage your farm information',
      buttonText: 'Manage Farms',
      link: '/dashboard/farms',
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const buyerActions = [
    {
      title: 'Browse Products',
      description: 'Discover fresh farm products',
      buttonText: 'Shop Now',
      link: '/dashboard/buyer/marketplace',
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const commonActions = [
    {
      title: 'Orders',
      description: 'View your order history',
      buttonText: 'View Orders',
      link: '/dashboard/orders',
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const actions = [
    ...(user.role === 'farmer' ? farmerActions : []),
    ...(user.role === 'buyer' ? buyerActions : []),
    ...commonActions
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <div key={index} className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{action.title}</h3>
          <p className="text-gray-600 mb-4">{action.description}</p>
          <Link
            to={action.link}
            className={`${action.color} text-white px-4 py-2 rounded-md text-sm font-medium inline-block`}
          >
            {action.buttonText}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;