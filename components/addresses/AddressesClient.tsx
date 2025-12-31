// components/addresses/AddressesClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  MapPin, 
  Home, 
  Briefcase, 
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Address } from '@/types';

interface AddressesClientProps {
  addresses: Address[];
  userId: string;
}

export default function AddressesClient({ addresses, userId }: AddressesClientProps) {
  const [addressList, setAddressList] = useState(addresses);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
    label: 'home' as string,
  });
  
  const labelIcons = {
    home: Home,
    work: Briefcase,
    other: MapPin,
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingAddress 
        ? `/api/user/addresses?id=${editingAddress._id}`
        : '/api/user/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save address');
      }
      
      // Update local state
      if (editingAddress) {
        setAddressList(prev => prev.map(addr => 
          addr._id === editingAddress._id ? data.data : addr
        ));
      } else {
        setAddressList(prev => [data.data, ...prev]);
      }
      
      toast.success(data.message || 'Address saved successfully');
      
      // Reset form
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
        isDefault: false,
        label: 'home',
      });
      
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save address'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const response = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete address');
      }
      
      setAddressList(prev => prev.filter(addr => addr._id !== addressId));
      toast.success('Address deleted successfully');
      
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };
  
  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set default address');
      }
      
      // Update local state
      setAddressList(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      })));
      
      toast.success('Default address updated');
      
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };
  
  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'Pakistan',
      isDefault: address.isDefault,
      label: address.label || 'home',
    });
    setShowForm(true);
  };
  
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Addresses
          </h1>
          <p className="text-gray-600">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        
        {/* Address List */}
        <div className="grid gap-4 mb-8">
          {addressList.map((address) => {
            const LabelIcon = labelIcons[address.label as keyof typeof labelIcons] || MapPin;
            
            return (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        address.label === 'home' ? 'bg-blue-100 text-blue-600' :
                        address.label === 'work' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <LabelIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {address.fullName}
                          </h3>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-[#7C2C78] text-white text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.label && address.label.charAt(0).toUpperCase() + address.label.slice(1)} Address
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-gray-700 space-y-1">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                      <p className="mt-2">📞 {address.phone}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!address.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(address._id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEdit(address)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(address._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Add New Address Form */}
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  setFormData({
                    fullName: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'Pakistan',
                    isDefault: false,
                    label: 'home',
                  });
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                />
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <select
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      label: e.target.value as 'home' | 'work' | 'other' 
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-5 w-5 text-[#7C2C78] focus:ring-[#7C2C78] border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="text-gray-700">
                  Set as default shipping address
                </label>
              </div>
              
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                  }}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white hover:from-[#6A2566] hover:to-[#8D2F6A]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-[#7C2C78] bg-transparent hover:bg-[#7C2C78]/5 text-gray-700 hover:text-[#7C2C78]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Address
          </Button>
        )}
      </div>
    </div>
  );
}