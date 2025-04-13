import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import axios from '@/api/axios';
import { Product } from '@/types/product';

interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/wishlist');
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch wishlist');
  }
});

export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', async (productId: number, { rejectWithValue }) => {
  try {
    await axios.post(`/api/wishlist/${productId}`);
    return productId;
  } catch (error) {
    return rejectWithValue('Failed to add to wishlist');
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (productId: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/wishlist/${productId}`);
    return productId;
  } catch (error) {
    return rejectWithValue('Failed to remove from wishlist');
  }
});

export const checkInWishlist = createAsyncThunk('wishlist/checkInWishlist', async (productId: number, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/wishlist/check/${productId}`);
    return { productId, isInWishlist: response.data };
  } catch (error) {
    return rejectWithValue('Failed to check wishlist status');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add to Wishlist - optimistic update
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Remove from Wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;
export const selectWishlistError = (state: RootState) => state.wishlist.error;

export default wishlistSlice.reducer; 