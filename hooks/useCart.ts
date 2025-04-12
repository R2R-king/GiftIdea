import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  incrementQuantity, 
  decrementQuantity,
  clearCart,
  CartItem
} from '@/store/slices/cartSlice';
import { useCallback } from 'react';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  // Функция для получения общего количества товаров в корзине
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);
  
  // Функция для получения общей стоимости корзины
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);
  
  // Проверка, есть ли товар в корзине
  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);
  
  // Добавление товара в корзину
  const addItem = useCallback((item: CartItem) => {
    dispatch(addToCart(item));
  }, [dispatch]);
  
  // Удаление товара из корзины
  const removeItem = useCallback((productId: string) => {
    dispatch(removeFromCart(productId));
  }, [dispatch]);
  
  // Обновление количества товара
  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    dispatch(updateQuantity({ id: productId, quantity }));
  }, [dispatch]);
  
  // Увеличение количества товара на 1
  const increaseQuantity = useCallback((productId: string) => {
    dispatch(incrementQuantity(productId));
  }, [dispatch]);
  
  // Уменьшение количества товара на 1
  const decreaseQuantity = useCallback((productId: string) => {
    dispatch(decrementQuantity(productId));
  }, [dispatch]);
  
  // Очистка корзины
  const clearAllItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);
  
  return {
    cartItems,
    getTotalItems,
    getTotalPrice,
    isInCart,
    addItem,
    removeItem,
    updateItemQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearAllItems
  };
}; 