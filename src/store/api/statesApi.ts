import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { State } from "../../types/State";
import { mapStateFromApi } from "../../mappers/stateMapper";


export const statesApi = createApi({
    reducerPath: "statesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["States"],
    endpoints: (builder) => ({
        // ------------------------------
        // 🔹 Obtener provincias/estados
        // ------------------------------
        getStates: builder.query<State[], void>({
            query: () => "/states",
            transformResponse: (response: any[]) => response.map(mapStateFromApi),
            providesTags: ["States"],
        }),
    }),
});

export const { useGetStatesQuery } = statesApi;
