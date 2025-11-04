// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import adminReducer from './slices/auth/adminSlice';
import farmReducer from './slices/farm/farmSlice'
import productReducer from './slices/product/productSlice'
import categoryReducer from './slices/category/categorySlice'
import orderReducer from './slices/order/orderSlice';
import paymentReducer from './slices/payment/paymentSlice'
import cartReducer from './slices/cart/cartSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    farm: farmReducer,
    product: productReducer,
    category: categoryReducer,
    order: orderReducer,
    payment: paymentReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;