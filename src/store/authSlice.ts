import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserDataExtended } from "../types";

interface AuthState {
    user: (User & { user_data?: UserDataExtended[] }) | null;
    token: string | null;
    isAuthenticated: boolean;
}

// 🔹 Inicializamos desde localStorage
const storedUser = JSON.parse(localStorage.getItem("user") || "null");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (
            state,
            action: PayloadAction<{
                user: User;
                token: string;
                user_data?: UserDataExtended[];
            }>
        ) => {
            state.user = {
                ...action.payload.user,
                user_data: action.payload.user_data || [],
            };
            state.token = action.payload.token;
            state.isAuthenticated = true;

            // ✅ Guardamos en localStorage
            localStorage.setItem("user", JSON.stringify(state.user));
            localStorage.setItem("token", state.token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            // 🚪 Borramos persistencia
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
