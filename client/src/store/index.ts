// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import adminReducer from './slices/auth/adminSlice';
import farmReducer from './slices/farm/farmSlice';
import productReducer from './slices/product/productSlice';
import categoryReducer from './slices/category/categorySlice';
import orderReducer from './slices/order/orderSlice';
import cartReducer from './slices/cart/cartSlice';
import paymentReducer from './slices/payment/paymentSlice'; // Add this line

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    farm: farmReducer,
    product: productReducer,
    category: categoryReducer,
    order: orderReducer,
    cart: cartReducer,
    payment: paymentReducer, // Add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;