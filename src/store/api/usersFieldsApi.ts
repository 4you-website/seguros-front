import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UserField } from "../../types";

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

        // ✅ PUT /users/data/{field_id}
        updateUserDataField: builder.mutation<
            UserField,
            { field_id: number; value: string }
        >({
            query: ({ field_id, value }) => ({
                url: `/users/data/${field_id}`,
                method: "PUT",
                body: { value }, // ✅ en el body va el nuevo dato
            }),
        }),
    }),
});

export const {
    useGetUsersFieldsQuery,
    useUpdateUserDataFieldMutation,
} = usersFieldsApi;
