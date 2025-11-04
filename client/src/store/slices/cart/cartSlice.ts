import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Cart} from '../../../types/cart';
import type { Product } from '../../../types/product';
import { cartService } from '../../../services/cartService';

interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
}

// Initialize with cart from localStorage
const initialCart = cartService.getCart();

const initialState: CartState = {
  cart: initialCart,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      
      // Validate quantity
      if (quantity < product.min_order_quantity) {
        state.error = `Minimum order quantity is ${product.min_order_quantity}`;
        return;
      }

      if (quantity > product.available_quantity) {
        state.error = `Only ${product.available_quantity} units available`;
        return;
      }

      try {
        const updatedCart = cartService.addToCart(product, quantity);
        state.cart = updatedCart;
        state.error = null;
      } catch (error: any) {
        state.error = error.message || 'Failed to add item to cart';
      }
    },

    // Update cart item quantity
    updateCartItemQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      
      const cartItem = state.cart.items.find(item => item.id === itemId);
      if (!cartItem) {
        state.error = 'Cart item not found';
        return;
      }

      // Validate quantity
      if (quantity < cartItem.min_order_quantity) {
        state.error = `Minimum order quantity is ${cartItem.min_order_quantity}`;
        return;
      }

      if (quantity > cartItem.available_quantity) {
        state.error = `Only ${cartItem.available_quantity} units available`;
        return;
      }

      try {
        const updatedCart = cartService.updateCartItem(itemId, quantity);
        state.cart = updatedCart;
        state.error = null;
      } catch (error: any) {
        state.error = error.message || 'Failed to update cart item';
      }
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      try {
        const updatedCart = cartService.removeFromCart(action.payload);
        state.cart = updatedCart;
        state.error = null;
      } catch (error: any) {
        state.error = error.message || 'Failed to remove item from cart';
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      try {
        const updatedCart = cartService.clearCart();
        state.cart = updatedCart;
        state.error = null;
      } catch (error: any) {
        state.error = error.message || 'Failed to clear cart';
      }
    },

    // Load cart from storage
    loadCart: (state) => {
      try {
        const cart = cartService.getCart();
        state.cart = cart;
        state.error = null;
      } catch (error: any) {
        state.error = error.message || 'Failed to load cart';
      }
    },

    // Sync cart with latest product data
    syncCartWithProducts: (state, action: PayloadAction<Product[]>) => {
      const products = action.payload;
      let hasChanges = false;

      const updatedItems = state.cart.items.filter(cartItem => {
        const product = products.find(p => p.id === cartItem.product_id);
        
        if (!product) {
          // Product no longer exists
          hasChanges = true;
          return false;
        }

        if (!product.is_available) {
          // Product is no longer available
          hasChanges = true;
          return false;
        }

        if (cartItem.quantity > product.available_quantity) {
          // Adjust quantity to available quantity
          cartItem.quantity = product.available_quantity;
          hasChanges = true;
        }

        // Update product data
        cartItem.available_quantity = product.available_quantity;
        cartItem.is_available = product.is_available;
        cartItem.price_per_unit = product.price_per_unit;
        
        return true;
      });

      if (hasChanges) {
        state.cart.items = updatedItems;
        cartService.updateCartTotals(state.cart);
        cartService.saveCart(state.cart);
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Increment item quantity
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.cart.items.find(item => item.id === itemId);
      
      if (item) {
        const newQuantity = item.quantity + 1;
        if (newQuantity <= item.available_quantity) {
          const updatedCart = cartService.updateCartItem(itemId, newQuantity);
          state.cart = updatedCart;
          state.error = null;
        } else {
          state.error = `Only ${item.available_quantity} units available`;
        }
      }
    },

    // Decrement item quantity
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.cart.items.find(item => item.id === itemId);
      
      if (item) {
        const newQuantity = item.quantity - 1;
        if (newQuantity >= item.min_order_quantity) {
          const updatedCart = cartService.updateCartItem(itemId, newQuantity);
          state.cart = updatedCart;
          state.error = null;
        } else if (newQuantity === 0) {
          // Remove item if quantity becomes 0
          const updatedCart = cartService.removeFromCart(itemId);
          state.cart = updatedCart;
          state.error = null;
        } else {
          state.error = `Minimum order quantity is ${item.min_order_quantity}`;
        }
      }
    },
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  loadCart,
  syncCartWithProducts,
  clearError,
  incrementQuantity,
  decrementQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;