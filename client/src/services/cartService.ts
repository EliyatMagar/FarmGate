import type { Cart, CartItem } from '../types/cart';
import type { Product } from '../types/product';

const CART_STORAGE_KEY = 'farmers_cart';

export const cartService = {
  // Get cart from localStorage
  getCart: (): Cart => {
    if (typeof window === 'undefined') {
      return {
        id: 'guest',
        items: [],
        total_items: 0,
        total_price: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      return JSON.parse(storedCart);
    }

    // Initialize new cart
    const newCart: Cart = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      items: [],
      total_items: 0,
      total_price: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    return newCart;
  },

  // Save cart to localStorage
  saveCart: (cart: Cart): void => {
    if (typeof window !== 'undefined') {
      cart.updated_at = new Date().toISOString();
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  },

  // Add item to cart - FIXED: Added farmer_id
  addToCart: (product: Product, quantity: number): Cart => {
    const cart = cartService.getCart();
    const existingItemIndex = cart.items.findIndex(
      item => item.product_id === product.id
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item - CRITICAL: Include farmer_id
      const newItem: CartItem = {
        id: `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product_id: product.id,
        product_name: product.name,
        price_per_unit: product.price_per_unit,
        quantity: quantity,
        unit_type: product.unit_type,
        available_quantity: product.available_quantity,
        min_order_quantity: product.min_order_quantity,
        images: product.images,
        farmer_id: product.farmer_id, // ← THIS WAS MISSING
        farm_name: product.farm_name,
        farmer_name: product.farmer_name,
        is_available: product.is_available,
      };
      cart.items.push(newItem);
    }

    // Update totals
    cartService.updateCartTotals(cart);
    cartService.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateCartItem: (itemId: string, quantity: number): Cart => {
    const cart = cartService.getCart();
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity - ensure it's a whole number
        cart.items[itemIndex].quantity = Math.floor(quantity);
      }

      cartService.updateCartTotals(cart);
      cartService.saveCart(cart);
    }

    return cart;
  },

  // Remove item from cart
  removeFromCart: (itemId: string): Cart => {
    const cart = cartService.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    cartService.updateCartTotals(cart);
    cartService.saveCart(cart);
    return cart;
  },

  // Clear entire cart
  clearCart: (): Cart => {
    const cart = cartService.getCart();
    cart.items = [];
    cartService.updateCartTotals(cart);
    cartService.saveCart(cart);
    return cart;
  },

  // Get cart item count
  getCartCount: (): number => {
    const cart = cartService.getCart();
    return cart.total_items;
  },

  // Update cart totals
  updateCartTotals: (cart: Cart): void => {
    // Calculate total items as sum of quantities (ensure whole numbers)
    cart.total_items = cart.items.reduce((total, item) => {
      return total + Math.floor(item.quantity);
    }, 0);
    
    // Calculate total price with proper decimal handling
    cart.total_price = parseFloat(cart.items.reduce((total, item) => {
      return total + (item.price_per_unit * Math.floor(item.quantity));
    }, 0).toFixed(2));
    
    cart.updated_at = new Date().toISOString();
  },

  // Check if product is in cart
  isProductInCart: (productId: string): boolean => {
    const cart = cartService.getCart();
    return cart.items.some(item => item.product_id === productId);
  },

  // Get cart item by product ID
  getCartItemByProductId: (productId: string): CartItem | null => {
    const cart = cartService.getCart();
    return cart.items.find(item => item.product_id === productId) || null;
  },
};