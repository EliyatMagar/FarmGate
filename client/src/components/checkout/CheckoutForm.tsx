// components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import type { User } from '../../types/user';
import type { CheckoutFormData } from '../../types/checkout';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  initialData: CheckoutFormData;
  user: User | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, initialData, user }) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    ...initialData,
    currency: 'USD' // Default currency
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate minimum delivery date (tomorrow)
  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 1);
  const minDateString = minDeliveryDate.toISOString().split('T')[0];

  // Calculate maximum delivery date (7 days from now)
  const maxDeliveryDate = new Date();
  maxDeliveryDate.setDate(maxDeliveryDate.getDate() + 7);
  const maxDateString = maxDeliveryDate.toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
      
      <form onSubmit={handleSubmit}>
        {/* User Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6">
          <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Address *
          </label>
          <textarea
            id="delivery_address"
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Enter your complete delivery address including street, city, state, and ZIP code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Delivery Date */}
        <div className="mb-6">
          <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Delivery Date
          </label>
          <input
            type="date"
            id="delivery_date"
            name="delivery_date"
            value={formData.delivery_date}
            onChange={handleChange}
            min={minDateString}
            max={maxDateString}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Delivery available from {minDeliveryDate.toLocaleDateString()} to {maxDeliveryDate.toLocaleDateString()}
          </p>
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            id="special_instructions"
            name="special_instructions"
            value={formData.special_instructions}
            onChange={handleChange}
            rows={3}
            placeholder="Any special delivery instructions, gate codes, or contact information..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency || 'USD'}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="AUD">Australian Dollar (AUD)</option>
          </select>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Payment Method
          </label>
          <select
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="stripe">Credit/Debit Card (Stripe)</option>
            <option value="cod">Cash on Delivery (COD)</option>
          </select>
          {formData.payment_method === 'cod' && (
            <p className="text-sm text-green-600 mt-2">
              💰 Pay with cash when your order is delivered. No online payment required.
            </p>
          )}
          {formData.payment_method === 'stripe' && (
            <p className="text-sm text-blue-600 mt-2">
              💳 Secure online payment via Stripe. Supports all major credit/debit cards.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.delivery_address.trim()}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Review →
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-blue-500">🔒</span>
          <p className="text-sm text-blue-700">
            Your personal and payment information is secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;