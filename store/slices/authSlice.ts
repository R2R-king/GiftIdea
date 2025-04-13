import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    bio?: string;
  } | null;
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.isAuthenticated = !!action.payload;
      state.user = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<ProfileUpdateData>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { setUser, logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;