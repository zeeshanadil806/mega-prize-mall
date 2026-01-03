// components/checkout/steps/CheckoutStep1.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Address, CheckoutState, CheckoutUser } from '@/types';

interface CheckoutStep1Props {
  user: CheckoutUser;
  checkoutData: CheckoutState;
    addresses: Address[]; // Add this
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutState>>;
}

export default function CheckoutStep1({ user, checkoutData, setCheckoutData, addresses }: CheckoutStep1Props) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
  });
  
  
  const savedAddresses = addresses || [];
  
  const handleSelectAddress = (address: Address) => {
    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      shippingAddress: address,
    }));
  };
  console.log(savedAddresses)
  const handleSaveAddress = async () => {
    // Validate required fields
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
    const missing = required.filter(field => !newAddress[field as keyof typeof newAddress]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return;
    }
    
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      
      if (!response.ok) throw new Error('Failed to save address');
      
      const savedAddress = await response.json();
      
      // Add to local list and select it
      setCheckoutData((prev: CheckoutState) => ({
        ...prev,
        shippingAddress: savedAddress,
      }));
      
      setShowAddressForm(false);
      setNewAddress({
        fullName: user?.name || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
        isDefault: false,
      });
      
      toast.success('Address saved successfully');
      
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Shipping Address
      </h2>
      
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4">
            Select a saved address
          </h3>
          <div className="grid gap-4">
            {savedAddresses.map((address: Address, index: number) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <label className="block cursor-pointer">
                  <input
                    type="radio"
                    name="shippingAddress"
                    checked={checkoutData.shippingAddress?._id === address._id}
                    onChange={() => handleSelectAddress(address)}
                    className="sr-only"
                  />
                  <div className={`
                    p-4 border-2 rounded-xl transition-all
                    ${checkoutData.shippingAddress?._id === address._id
                      ? 'border-[#7C2C78] bg-[#7C2C78]/5'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}>
                    <div className="flex items-start gap-3">
                      <div className={`
                        h-6 w-6 rounded-full border-2 flex items-center justify-center
                        ${checkoutData.shippingAddress?._id === address._id
                          ? 'border-[#7C2C78] bg-[#7C2C78]'
                          : 'border-gray-300'}
                      `}>
                        {checkoutData.shippingAddress?._id === address._id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {address.fullName}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.country}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              📞 {address.phone}
                            </p>
                          </div>
                          {address.isDefault && (
                            <span className="px-2 py-1 text-gray-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add New Address */}
      {!showAddressForm ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowAddressForm(true)}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#7C2C78] hover:bg-[#7C2C78]/5 transition-all group"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-[#7C2C78]/10">
              <Plus className="h-6 w-6 text-gray-600 group-hover:text-[#7C2C78]" />
            </div>
            <p className="font-medium text-gray-900">
              Add New Address
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Save for faster checkout next time
            </p>
          </div>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border border-gray-200 rounded-xl p-6"
        >
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#7C2C78]" />
            Add New Address
          </h3>
          
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                placeholder="House #123, Street #45"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                placeholder="Apartment, Suite, etc."
              />
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  placeholder="Karachi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  placeholder="Sindh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  placeholder="75500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="setDefault"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 text-[#7C2C78] focus:ring-[#7C2C78] border-gray-300 rounded"
              />
              <label htmlFor="setDefault" className="text-sm text-gray-700">
                Set as default shipping address
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAddressForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="flex-1 px-6 py-3 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all"
              >
                Save & Use Address
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Same as Billing Address */}
      {checkoutData.shippingAddress && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sameAsBilling"
              checked={checkoutData.useSameAddress}
              onChange={(e) => setCheckoutData((prev: CheckoutState) => ({ ...prev, useSameAddress: e.target.checked }))}
              className="h-5 w-5 text-[#7C2C78] focus:ring-[#7C2C78] border-gray-300 rounded"
            />
            <label htmlFor="sameAsBilling" className="text-gray-700">
              Use same address for billing
            </label>
          </div>
        </div>
      )}
    </div>
  );
}