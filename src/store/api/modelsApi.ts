import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Model } from "../../types/Model";
import { mapModelFromApi, mapModelToApi } from "../../mappers/modelMapper";

export const modelsApi = createApi({
    reducerPath: "modelsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Model"],
    endpoints: (builder) => ({
        // ------------------------------
        // 🔹 Listar modelos (opcionalmente por brand_id)
        // ------------------------------
        getModels: builder.query<Model[], string | void>({
            query: (brandId) => {
                if (brandId) return `/models?brand_id=${brandId}`;
                return `/models`;
            },
            transformResponse: (response: any[]) => response.map(mapModelFromApi),
            providesTags: ["Model"],
        }),
    }),
});

export const { useGetModelsQuery } = modelsApi;
