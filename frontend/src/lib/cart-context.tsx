'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary } from '../types';
import { apiRequest } from './api';

interface CartContextType {
  cart: CartSummary | null;
  itemsCount: number;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<{ success: boolean; message: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; data: CartSummary }>('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (variantId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; message: string; data: CartSummary }>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId, quantity }),
      });

      if (res.success && res.data) {
        setCart(res.data);
        openCart();
        return { success: true, message: res.message || 'تمت الإضافة للسلة' };
      }
      return { success: false, message: 'فشل إضافة المنتج' };
    } catch (err: any) {
      return { success: false, message: err.message || 'فشل إضافة المنتج' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; data: CartSummary }>(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'فشل تعديل الكمية');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; data: CartSummary }>(`/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      console.error('Failed to remove item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyDiscount = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; message: string; data: CartSummary }>('/cart/discount', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      if (res.success && res.data) {
        setCart(res.data);
        return { success: true, message: res.message };
      }
      return { success: false, message: 'فشل تطبيق كود الخصم' };
    } catch (err: any) {
      return { success: false, message: err.message || 'كود الخصم غير صالح' };
    } finally {
      setIsLoading(false);
    }
  };

  const itemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemsCount,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        applyDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

