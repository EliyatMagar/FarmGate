// components/app/CartInitializer.tsx
import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { loadCartFromStorage } from '../../store/slices/cart/cartSlice';

/**
 * Component that initializes the cart state from localStorage when the app starts
 * This should be placed at the root level of your app to ensure cart state is loaded on initial render
 */
const CartInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load cart from localStorage when component mounts
    console.log('🛒 CartInitializer - Loading cart from localStorage');
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default CartInitializer;