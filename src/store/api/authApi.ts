import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { loginSuccess, logout } from "../authSlice";
import { User, UserDataExtended } from "../../types";


// -----------------------------
// Tipos
// -----------------------------
interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: User;
    user_data: UserDataExtended[];
}

// -----------------------------
// API
// -----------------------------
export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // 🔐 LOGIN
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        loginSuccess({
                            user: data.user,
                            token: data.token,
                            user_data: data.user_data, // ✅ lo pasamos acá
                        })
                    );
                } catch (err) {
                    console.error("❌ Error en login:", err);
                }
            },
        }),

        getUser: builder.query<User, number>({
            query: (userId) => `/users/${userId}`,
        }),


        // 🚪 Logout remoto (opcional)
        logout: builder.mutation<void, void>({
            queryFn: async (_, { dispatch }) => {
                dispatch(logout());
                return { data: undefined };
            },
        }),
    }),
});

export const { useLoginMutation, useGetUserQuery, useLogoutMutation } = authApi;
