import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GoogleAuthState, GoogleUser } from '../types/googleAuthType';

const initialState: GoogleAuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

const googleAuthSlice = createSlice({
    name: 'googleAuth',
    initialState,
    reducers: {
        googleLoginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        googleLoginSuccess: (state, action: PayloadAction<{ user: GoogleUser; token: string }>) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        googleLoginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        googleLogout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
        },
    },
});

export const { googleLoginStart, googleLoginSuccess, googleLoginFailure, googleLogout } = googleAuthSlice.actions;
export default googleAuthSlice.reducer;
