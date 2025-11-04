import { createUserTable } from '../models/userModel.js'
import { createFarmTable } from '../models/farmModel.js';
import { createProductCategoryTable } from '../models/productCategoryModel.js';
import { createProductsTable } from '../models/productModel.js';
import { createOrdersTable } from '../models/orderModel.js';
import { createOrderItemsTable } from '../models/orderItemModel.js';
import { createReviewsTable } from '../models/reviewModel.js';
import {createPaymentsTable,createPaymentTransactionsTable } from '../models/paymentModel.js'
import { createTransactionsTable } from '../models/transactionModel.js';
import { createMessagesTable } from '../models/messageModel.js';
import { createNotificationsTable } from '../models/notificationModel.js';

export const createAllTables = async () => {
  try {
    console.log('🔄 Creating database tables...');
    
    // Create tables in correct order to respect foreign key dependencies
    await createUserTable();
    await createFarmTable();
    await createProductCategoryTable();
    await createProductsTable();
    await createOrdersTable();
    await createOrderItemsTable();
    await createPaymentsTable();
    await createPaymentTransactionsTable();
    await createReviewsTable();
    await createTransactionsTable();
    await createMessagesTable();
    await createNotificationsTable();
    
    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};