import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserData } from "../../types/UserData";


export const usersDataApi = createApi({
    reducerPath: "usersDataApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["UsersData"],
    endpoints: (builder) => ({
        getUsersData: builder.query<UserData[], void>({
            query: () => "/users/data",
            providesTags: ["UsersData"],
        }),
    }),
});

export const { useGetUsersDataQuery } = usersDataApi;
