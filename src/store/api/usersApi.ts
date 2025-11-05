import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "../../types/User";

export const usersApi = createApi({
    reducerPath: "usersApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Users"],
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => "/users",
            providesTags: ["Users"],
        }),
    }),
});

export const { useGetUsersQuery } = usersApi;
