import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  price: string;
  image: string;
  category: string;
};

export type Wishlist = {
  id: string;
  name: string;
  description: string;
  items: WishlistItem[];
  createdAt: string;
  isPublic: boolean;
};

export function useWishlists() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlists on component mount
  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setIsLoading(true);
      const storedWishlists = await AsyncStorage.getItem('user_wishlists');
      
      if (storedWishlists) {
        setWishlists(JSON.parse(storedWishlists));
      } else {
        // Initialize with a default wishlist if none exists
        const defaultWishlist: Wishlist = {
          id: Date.now().toString(),
          name: 'Мой вишлист',
          description: 'Мои желания на День рождения',
          items: [],
          createdAt: new Date().toISOString(),
          isPublic: false
        };
        setWishlists([defaultWishlist]);
        await AsyncStorage.setItem('user_wishlists', JSON.stringify([defaultWishlist]));
      }
    } catch (error) {
      console.error('Failed to load wishlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWishlists = async (updatedWishlists: Wishlist[]) => {
    try {
      await AsyncStorage.setItem('user_wishlists', JSON.stringify(updatedWishlists));
      setWishlists(updatedWishlists);
    } catch (error) {
      console.error('Failed to save wishlists:', error);
    }
  };

  const createWishlist = (name: string, description: string = '') => {
    const newWishlist: Wishlist = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      items: [],
      createdAt: new Date().toISOString(),
      isPublic: false
    };

    const updatedWishlists = [...wishlists, newWishlist];
    saveWishlists(updatedWishlists);
    return newWishlist;
  };

  const updateWishlist = (wishlistId: string, updates: Partial<Wishlist>) => {
    const updatedWishlists = wishlists.map(wishlist => 
      wishlist.id === wishlistId 
        ? { ...wishlist, ...updates }
        : wishlist
    );

    saveWishlists(updatedWishlists);
  };

  const deleteWishlist = (wishlistId: string) => {
    const updatedWishlists = wishlists.filter(wishlist => wishlist.id !== wishlistId);
    saveWishlists(updatedWishlists);
  };

  const addItemToWishlist = (wishlistId: string, item: WishlistItem) => {
    const updatedWishlists = wishlists.map(wishlist => {
      if (wishlist.id === wishlistId) {
        // Check if item already exists
        const itemExists = wishlist.items.some(existing => existing.productId === item.productId);
        
        if (itemExists) {
          return wishlist; // Item already exists, don't add it again
        }
        
        // Add the new item
        return {
          ...wishlist,
          items: [...wishlist.items, item]
        };
      }
      return wishlist;
    });
    
    saveWishlists(updatedWishlists);
  };

  const removeItemFromWishlist = (wishlistId: string, itemId: string) => {
    const updatedWishlists = wishlists.map(wishlist => {
      if (wishlist.id === wishlistId) {
        return {
          ...wishlist,
          items: wishlist.items.filter(item => item.id !== itemId)
        };
      }
      return wishlist;
    });
    
    saveWishlists(updatedWishlists);
  };

  const isItemInAnyWishlist = (productId: string): boolean => {
    return wishlists.some(wishlist => 
      wishlist.items.some(item => item.productId === productId)
    );
  };

  const getWishlistsForItem = (productId: string): Wishlist[] => {
    return wishlists.filter(wishlist => 
      wishlist.items.some(item => item.productId === productId)
    );
  };

  return {
    wishlists,
    isLoading,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    isItemInAnyWishlist,
    getWishlistsForItem,
    loadWishlists
  };
} 