// hooks/useCart.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useCallback } from 'react';
import { 
  addToCart as addToCartAction,
  updateCartItemQuantity,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  loadCart as loadCartAction,
  syncCartWithProducts,
  clearError,
  incrementQuantity,
  decrementQuantity,
} from '../store/slices/cart/cartSlice';
import type { Product } from '../types/product';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, loading, error } = useAppSelector((state) => state.cart);

  const addToCart = useCallback((product: Product, quantity: number) => {
    dispatch(addToCartAction({ product, quantity }));
  }, [dispatch]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ itemId, quantity }));
  }, [dispatch]);

  const removeFromCart = useCallback((itemId: string) => {
    dispatch(removeFromCartAction(itemId));
  }, [dispatch]);

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  const loadCart = useCallback(() => {
    dispatch(loadCartAction());
  }, [dispatch]);

  const syncWithProducts = useCallback((products: Product[]) => {
    dispatch(syncCartWithProducts(products));
  }, [dispatch]);

  const incrementItemQuantity = useCallback((itemId: string) => {
    dispatch(incrementQuantity(itemId));
  }, [dispatch]);

  const decrementItemQuantity = useCallback((itemId: string) => {
    dispatch(decrementQuantity(itemId));
  }, [dispatch]);

  const clearCartError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getCartItemCount = useCallback(() => {
    return cart.total_items;
  }, [cart.total_items]);

  const getCartTotalPrice = useCallback(() => {
    return cart.total_price;
  }, [cart.total_price]);

  // ADD THIS FUNCTION - Calculate cart total with shipping and tax
  const getCartTotal = useCallback((currency: string = 'USD') => {
    const subtotal = cart.total_price;
    const shippingFee = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingFee + tax;
    
    return {
      subtotal,
      shipping: shippingFee,
      tax,
      total,
      currency
    };
  }, [cart.total_price]);

  const isProductInCart = useCallback((productId: string) => {
    return cart.items.some(item => item.product_id === productId);
  }, [cart.items]);

  const getCartItemByProductId = useCallback((productId: string) => {
    return cart.items.find(item => item.product_id === productId) || null;
  }, [cart.items]);

  return {
    // State
    cart,
    loading,
    error,
    
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    syncWithProducts,
    incrementItemQuantity,
    decrementItemQuantity,
    clearCartError,
    
    // Getters
    getCartItemCount,
    getCartTotalPrice,
    getCartTotal, // ← ADD THIS
    isProductInCart,
    getCartItemByProductId,
    
    // Computed values
    cartItems: cart.items,
    cartCount: cart.total_items,
    cartTotal: cart.total_price,
    isEmpty: cart.items.length === 0,
  };
};