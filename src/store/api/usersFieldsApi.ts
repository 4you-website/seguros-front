import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserField } from "../../types/UserField";


export const usersFieldsApi = createApi({
    reducerPath: "usersFieldsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["UsersFields"],
    endpoints: (builder) => ({
        getUsersFields: builder.query<UserField[], void>({
            query: () => "/users/fields",
            providesTags: ["UsersFields"],
        }),
    }),
});

export const { useGetUsersFieldsQuery } = usersFieldsApi;
