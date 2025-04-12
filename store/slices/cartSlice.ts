import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Интерфейс для товара в корзине
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  // Дополнительные поля, если нужно
  subtitle?: string;
  location?: string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Добавить товар в корзину или увеличить количество, если уже есть
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existingItemIndex = state.items.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть, увеличиваем количество
        state.items[existingItemIndex].quantity += item.quantity || 1;
      } else {
        // Добавляем новый товар, убедившись, что количество есть
        state.items.push({
          ...item,
          quantity: item.quantity || 1
        });
      }
    },
    
    // Удалить товар из корзины
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    // Изменить количество товара
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex >= 0 && quantity > 0) {
        state.items[itemIndex].quantity = quantity;
      }
    },
    
    // Увеличить количество товара на 1
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity += 1;
      }
    },
    
    // Уменьшить количество товара на 1 (но не ниже 1)
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex >= 0 && state.items[itemIndex].quantity > 1) {
        state.items[itemIndex].quantity -= 1;
      }
    },
    
    // Очистить корзину
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  incrementQuantity, 
  decrementQuantity,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer; 